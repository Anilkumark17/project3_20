/**
 * RAG orchestration:
 *   analyze query → hybrid retrieve → rerank → build cited context → generate (Groq)
 * Exposes a streaming entry point that emits typed events, plus a blocking one.
 */
const groq = require("../config/groq");
const { env } = require("../config/env");
const { analyzeQuery } = require("./queryAnalyzer");
const { retrieve } = require("./retriever");
const { buildContext, systemPrompt } = require("./prompts");

// Cross-encoder logits below this mean "nothing in the index is about this".
const MIN_RELEVANCE = -6;

async function prepare(question, { history = [], student = null } = {}) {
  const t0 = Date.now();
  const analysis = await analyzeQuery(question, history);
  const analyzeMs = Date.now() - t0;

  const { chunks, timings } = await retrieve(analysis);
  const relevant = chunks.filter((c) => c.pinned || c.rerankScore === undefined || c.rerankScore >= MIN_RELEVANCE);
  const { contextText, citations } = buildContext(relevant);

  const messages = [
    { role: "system", content: systemPrompt({ contextText, student }) },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: question },
  ];

  return {
    analysis,
    messages,
    citations,
    topScore: chunks[0]?.rerankScore ?? (chunks[0] ? Number(chunks[0].rrf) : null),
    retrievedChunkIds: chunks.map((c) => c.id),
    timings: { analyzeMs, ...timings },
  };
}

/** Only keep citations the model actually referenced, preserving their numbers. */
function usedCitations(answer, citations) {
  const used = new Set([...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  return citations.filter((c) => used.has(c.n));
}

/**
 * @param {(event: string, data: object) => void} emit
 */
async function streamAnswer(question, { history, student, signal, emit }) {
  const started = Date.now();
  const prep = await prepare(question, { history, student });
  emit("sources", { citations: prep.citations, searchQuery: prep.analysis.searchQuery });

  const t = Date.now();
  let answer = "";
  let usage = null;
  let firstTokenMs = null;
  const stream = await groq.chatStream(prep.messages, { signal, maxTokens: 1500 });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      if (firstTokenMs === null) firstTokenMs = Date.now() - t;
      answer += delta;
      emit("token", { t: delta });
    }
    if (chunk.x_groq?.usage) usage = chunk.x_groq.usage;
  }

  return finalize(prep, answer, usage, { ...prep.timings, firstTokenMs, generateMs: Date.now() - t, totalMs: Date.now() - started });
}

async function answer(question, { history, student } = {}) {
  const started = Date.now();
  const prep = await prepare(question, { history, student });
  const t = Date.now();
  const res = await groq.chat(prep.messages, { maxTokens: 1500 });
  return finalize(prep, res.content, res.usage, { ...prep.timings, generateMs: Date.now() - t, totalMs: Date.now() - started });
}

function finalize(prep, answerText, usage, timings) {
  return {
    answer: answerText,
    citations: usedCitations(answerText, prep.citations),
    allCitations: prep.citations,
    searchQuery: prep.analysis.searchQuery,
    retrievedChunkIds: prep.retrievedChunkIds,
    topScore: prep.topScore,
    status: prep.citations.length ? "ok" : "no_context",
    model: env.GROQ_CHAT_MODEL,
    usage,
    timings,
  };
}

module.exports = { streamAnswer, answer, prepare, usedCitations };
