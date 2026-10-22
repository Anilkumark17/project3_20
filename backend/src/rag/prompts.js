const MAX_CONTEXT_CHARS = 9000;

const SEASON_LABEL = { spring: "Spring", monsoon: "Monsoon" };

/** Number the retrieved chunks as sources and trim to a character budget. */
function buildContext(chunks) {
  const sources = [];
  let used = 0;
  for (const c of chunks) {
    const header = [
      c.course_title ? `${c.course_title} (${c.course_code})` : c.heading_path,
      c.section,
      SEASON_LABEL[c.season],
    ].filter(Boolean).join(" · ");
    const block = `${header}\n${c.content}`;
    if (used + block.length > MAX_CONTEXT_CHARS && sources.length) break;
    used += block.length;
    sources.push({ n: sources.length + 1, chunk: c, block });
  }

  return {
    contextText: sources.map((s) => `[${s.n}] ${s.block}`).join("\n\n---\n\n"),
    citations: sources.map(({ n, chunk: c }) => ({
      n,
      chunkId: c.id,
      courseCode: c.course_code,
      courseTitle: c.course_title,
      section: c.section,
      season: c.season,
      snippet: c.content.slice(0, 280),
      score: c.rerankScore ?? Number(c.rrf),
    })),
  };
}

function studentBlock(student) {
  if (!student) return "No profile on file.";
  const lines = [
    `Program: ${student.program || "unknown"}`,
    `Current semester: ${student.semester || "unknown"}`,
    `Goal: ${student.goal || "unspecified"}`,
    `Credits completed: ${student.creditsCompleted ?? 0}`,
    `Completed courses: ${student.completed?.length ? student.completed.join(", ") : "none recorded"}`,
  ];
  return lines.join("\n");
}

function systemPrompt({ contextText, student }) {
  return `You are ICA, the academic course advisor for IIIT Hyderabad MTech students (CSE, CSIS, PDM programs).

Answer using ONLY the numbered course sources below. Rules:
- Cite every factual claim with its source number in square brackets, e.g. "Compilers is worth 4 credits [2]." Cite multiple as [1][3]. In lists and tables, end each bullet or row with its citation(s). An answer without citations is not acceptable unless you are saying the sources lack the answer.
- Difficulty ratings (1-5) appear in "Catalog entry" and "Overview" sources; use them for workload or difficulty comparisons.
- If the sources do not contain the answer, say so plainly and suggest what the student could ask instead. Never invent courses, codes, instructors, credits or grading weights.
- Always give the course code alongside a course name, and mention the season (Spring/Monsoon) when it matters.
- Personalise advice with the student profile: avoid recommending courses they already completed, and relate suggestions to their goal.
- Be concise and well-structured: short paragraphs, bullet lists or a compact markdown table for comparisons. No preamble.

STUDENT PROFILE
${studentBlock(student)}

COURSE SOURCES
${contextText || "(no relevant sources were found)"}`;
}

module.exports = { buildContext, systemPrompt, studentBlock };
