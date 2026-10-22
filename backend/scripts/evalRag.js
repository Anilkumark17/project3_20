/**
 * Retrieval evaluation against a labelled question set (eval/golden.json).
 * Reports Hit@1, Hit@3, Hit@5 and MRR for the expected course code, comparing
 * dense-only, hybrid, and hybrid + rerank configurations.
 *
 *   npm run rag:eval
 */
const path = require("path");
const courseCache = require("../src/config/courseCache");
const { analyzeQuery } = require("../src/rag/queryAnalyzer");
const { retrieve } = require("../src/rag/retriever");

const golden = require(path.join(__dirname, "..", "eval", "golden.json"));

function score(rankedCodes, expected) {
  const rank = rankedCodes.findIndex((c) => expected.includes(c));
  return { rank, hit1: rank === 0, hit3: rank >= 0 && rank < 3, hit5: rank >= 0 && rank < 5, rr: rank >= 0 ? 1 / (rank + 1) : 0 };
}

const uniqueCodes = (chunks) => [...new Set(chunks.map((c) => c.course_code).filter(Boolean))];

async function run(label, configure) {
  const rows = [];
  for (const item of golden) {
    const analysis = configure(await analyzeQuery(item.question));
    const { chunks } = await retrieve(analysis, { topK: 10, rerank: label.includes("rerank") });
    rows.push({ ...score(uniqueCodes(chunks), item.expected), question: item.question });
  }
  const n = rows.length;
  const pct = (k) => `${((rows.filter((r) => r[k]).length / n) * 100).toFixed(0)}%`;
  const mrr = (rows.reduce((s, r) => s + r.rr, 0) / n).toFixed(3);
  console.log(`${label.padEnd(22)} Hit@1 ${pct("hit1").padStart(4)}  Hit@3 ${pct("hit3").padStart(4)}  Hit@5 ${pct("hit5").padStart(4)}  MRR ${mrr}`);
  return rows;
}

async function main() {
  await courseCache.load();
  console.log(`\nEvaluating ${golden.length} questions\n`);
  await run("dense only", (a) => ({ ...a, lexicalQuery: "", courseCodes: [] }));
  await run("hybrid (RRF)", (a) => a);
  const rows = await run("hybrid + rerank", (a) => a);

  const misses = rows.filter((r) => !r.hit5);
  if (misses.length) {
    console.log("\nMisses (hybrid + rerank, not in top 5):");
    misses.forEach((m) => console.log(`  - ${m.question}`));
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
