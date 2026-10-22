/**
 * Recommendations = retrieval-augmented ranking.
 *  1. Candidate generation: hybrid-retrieve syllabus chunks for a query built from the
 *     student's goal + program, aggregate chunk scores per course, drop completed courses,
 *     and top up with same-program catalog courses (fast, no LLM: the "rule-based" phase).
 *  2. LLM ranking: Groq picks the best 5 and explains each pick, grounded in the
 *     syllabus evidence for that course (JSON mode, zod-validated).
 */
const { z } = require("zod");
const userRepository = require("../auth/repository");
const profileRepository = require("../profile/repository");
const completedCoursesRepository = require("../courses/repositories/completed");
const courseCache = require("../../config/courseCache");
const groq = require("../../config/groq");
const recommendationRepository = require("./repository");
const { retrieve } = require("../../rag/retriever");
const { buildLexicalQuery } = require("../../rag/queryAnalyzer");

const CANDIDATES = 12;
const TOP_N = 5;

const GOAL_QUERIES = {
  Placement: "industry-relevant practical skills, software engineering, systems, projects valued by employers",
  Research: "research methods, theory, advanced topics, reading papers, research projects",
  Skills: "hands-on technical skills, tools, programming, building systems",
};

const SEASON_BY_SEMESTER = { 1: "monsoon", 2: "spring" };

async function loadStudent(clerkId) {
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) return null;
  const [profile, completed] = await Promise.all([
    profileRepository.findByUserId(user.id),
    completedCoursesRepository.findByUserId(user.id),
  ]);
  return { user, profile, completed, completedIds: new Set(completed.map((c) => c.courseId)) };
}

function interestQuery(student) {
  const { profile, completed } = student;
  const goal = GOAL_QUERIES[profile?.goal] || "well-rounded courses";
  const recent = completed.slice(-4).map((c) => c.courseTitle).join(", ");
  return `${profile?.program || ""} MTech courses for ${goal}${recent ? `, building on ${recent}` : ""}`.trim();
}

/** Retrieval-based candidates with per-course evidence snippets. */
async function generateCandidates(student) {
  const query = interestQuery(student);
  const { chunks } = await retrieve(
    { searchQuery: query, lexicalQuery: buildLexicalQuery(query), courseCodes: [], season: null },
    { topK: 40, rerank: true }
  );

  const byCourse = new Map();
  chunks.forEach((chunk, rank) => {
    const course = chunk.course_code && courseCache.getByCode(chunk.course_code);
    if (!course || student.completedIds.has(course.id)) return;
    const entry = byCourse.get(course.code) || { course, score: 0, evidence: [] };
    entry.score += 1 / (rank + 1);
    if (entry.evidence.length < 2) entry.evidence.push(`${chunk.section}: ${chunk.content.slice(0, 220)}`);
    byCourse.set(course.code, entry);
  });

  let ranked = [...byCourse.values()].sort((a, b) => b.score - a.score);

  // Top up with same-program courses so the list is never empty.
  if (ranked.length < CANDIDATES) {
    const pool = student.profile?.program ? courseCache.getByProgram(student.profile.program) : courseCache.getAll();
    for (const course of pool) {
      if (ranked.length >= CANDIDATES) break;
      if (student.completedIds.has(course.id) || byCourse.has(course.code)) continue;
      ranked.push({ course, score: 0, evidence: [course.description || ""] });
    }
  }

  ranked = ranked.slice(0, CANDIDATES);
  const max = ranked[0]?.score || 1;
  return ranked.map((r) => ({ ...r, match: r.score ? Math.max(0.35, r.score / max) : 0.3 }));
}

const rankingSchema = z.object({
  recommendations: z
    .array(z.object({ code: z.string(), reason: z.string(), match: z.number().min(0).max(1).optional() }))
    .max(10),
});

async function rankWithLLM(student, candidates) {
  const { profile, completed } = student;
  const prompt = `You are an academic advisor for IIIT Hyderabad MTech students. Pick the ${TOP_N} best courses for this student from the candidates and explain each pick in 1-2 sentences, referring to concrete syllabus content and to the student's goal. Prefer a balanced workload (mix of difficulties) and courses offered in the student's upcoming season when known. Only use codes from the candidate list.

STUDENT
Program: ${profile?.program || "unknown"} | Semester: ${profile?.semester || "unknown"} | Goal: ${profile?.goal || "unspecified"}
Completed: ${completed.map((c) => c.courseCode).join(", ") || "none"}

CANDIDATES
${candidates
  .map(
    ({ course, evidence }) =>
      `- ${course.code} | ${course.title} | ${course.program} | ${course.credits} cr | difficulty ${course.difficulty}/5 | ${SEASON_BY_SEMESTER[course.semester] || "?"}\n  evidence: ${evidence.join(" / ").replace(/\s+/g, " ")}`
  )
  .join("\n")}

Respond as JSON: {"recommendations":[{"code":"...","reason":"...","match":0.0-1.0}]}`;

  const { data } = await groq.chatJSON([{ role: "user", content: prompt }], rankingSchema, { maxTokens: 1500 });
  const allowed = new Map(candidates.map((c) => [c.course.code, c]));
  const seen = new Set();
  return data.recommendations
    .filter((r) => allowed.has(r.code) && !seen.has(r.code) && seen.add(r.code))
    .slice(0, TOP_N)
    .map((r, i) => ({ ...allowed.get(r.code).course, reason: r.reason, priority: i + 1, score: r.match ?? allowed.get(r.code).match }));
}

async function persist(userId, recs) {
  await recommendationRepository.replaceForUser(
    userId,
    recs.map((r) => ({ userId, courseId: r.id, reason: r.reason, priority: r.priority, generatedAt: new Date() }))
  );
}

const getRecommendations = async (clerkId, { forceRefresh = false } = {}) => {
  const student = await loadStudent(clerkId);
  if (!student) return { recommendations: [], generatedAt: null };

  if (!forceRefresh) {
    const cached = await recommendationRepository.findByUserId(student.user.id);
    return { recommendations: cached, generatedAt: cached[0]?.generatedAt || null };
  }

  const candidates = await generateCandidates(student);
  if (!candidates.length) return { recommendations: [], generatedAt: null };
  const recs = await rankWithLLM(student, candidates);
  await persist(student.user.id, recs);
  const saved = await recommendationRepository.findByUserId(student.user.id);
  return { recommendations: saved, generatedAt: saved[0]?.generatedAt || new Date() };
};

/** Streaming flow used by the SSE endpoint. Emits rule-based candidates first, then AI picks. */
const streamRecommendations = async (clerkId, emit) => {
  const student = await loadStudent(clerkId);
  if (!student) {
    emit("complete", { recommendations: [], generatedAt: null });
    return;
  }

  emit("phase", { phase: "retrieval", message: "Searching syllabi for courses that match your goals…" });
  const candidates = await generateCandidates(student);
  emit("candidates", {
    recommendations: candidates.slice(0, 8).map(({ course, match }, i) => ({
      ...course,
      reason: `Matches your ${student.profile?.program || "program"} interests`,
      priority: i + 1,
      score: match,
    })),
  });
  if (!candidates.length) {
    emit("complete", { recommendations: [], generatedAt: null });
    return;
  }

  emit("phase", { phase: "ranking", message: "Ranking and explaining picks with AI…" });
  const recs = await rankWithLLM(student, candidates);
  await persist(student.user.id, recs);
  emit("complete", { recommendations: recs, generatedAt: new Date().toISOString() });
};

module.exports = { getRecommendations, streamRecommendations };
