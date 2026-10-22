/**
 * Query understanding:
 *  - condenses follow-up questions into standalone search queries (needs history)
 *  - links course codes / titles mentioned in the query to catalog entries
 *  - extracts a season filter ("spring", "monsoon")
 *  - builds an OR-style tsquery for the lexical leg of hybrid search
 */
const { z } = require("zod");
const groq = require("../config/groq");
const { env } = require("../config/env");
const courseCache = require("../config/courseCache");
const { COURSE_CODE_RE } = require("./chunker");

const CODE_RE_GLOBAL = new RegExp(COURSE_CODE_RE.source, "g");

// Postgres' english config drops real stopwords; these are domain-generic words
// that otherwise match nearly every chunk and drown the lexical signal.
const LEXICAL_NOISE = new Set([
  "course", "courses", "class", "classes", "subject", "subjects", "semester", "about",
  "which", "what", "tell", "give", "show", "list", "should", "take", "recommend", "best",
  "good", "does", "teach", "taught", "offered", "available", "there", "know",
]);

function extractSeason(text) {
  const t = text.toLowerCase();
  const spring = /\bspring\b/.test(t);
  const monsoon = /\b(monsoon|fall|autumn)\b/.test(t);
  if (spring && !monsoon) return "spring";
  if (monsoon && !spring) return "monsoon";
  return null;
}

/** Course codes written explicitly, plus catalog titles mentioned verbatim. */
function linkCourses(text) {
  const codes = new Set((text.toUpperCase().match(CODE_RE_GLOBAL) || []));
  const lower = text.toLowerCase();
  for (const c of courseCache.getAll()) {
    if (c.title.length >= 6 && lower.includes(c.title.toLowerCase())) codes.add(c.code);
  }
  return [...codes];
}

/** Build `word1 | word2 | ...` for to_tsquery; input is sanitised to [a-z0-9]. */
function buildLexicalQuery(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 && !LEXICAL_NOISE.has(w));
  return [...new Set(words)].slice(0, 16).join(" | ");
}

const condenseSchema = z.object({ query: z.string().min(1) });

async function condenseQuestion(question, history) {
  if (!history.length) return question;
  const transcript = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Student" : "Advisor"}: ${m.content.slice(0, 600)}`)
    .join("\n");
  try {
    const { data } = await groq.chatJSON(
      [
        {
          role: "system",
          content:
            'Rewrite the student\'s latest message into a standalone search query for a university course-syllabus search engine. Resolve pronouns and references ("it", "that course", "the second one") using the conversation. Keep course names and codes verbatim. If the message is already standalone, return it unchanged. Respond as JSON: {"query": "..."}',
        },
        { role: "user", content: `Conversation:\n${transcript}\n\nLatest message: ${question}` },
      ],
      condenseSchema,
      { model: env.GROQ_FAST_MODEL, temperature: 0, maxTokens: 300 }
    );
    return data.query;
  } catch (err) {
    console.warn("Query condensation failed, using raw question:", err.message);
    return question;
  }
}

async function analyzeQuery(question, history = []) {
  const searchQuery = await condenseQuestion(question, history);
  return {
    searchQuery,
    lexicalQuery: buildLexicalQuery(searchQuery),
    courseCodes: linkCourses(searchQuery),
    season: extractSeason(searchQuery),
  };
}

module.exports = { analyzeQuery, buildLexicalQuery, extractSeason, linkCourses };
