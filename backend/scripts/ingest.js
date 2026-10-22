/**
 * Builds / refreshes the RAG index in Neon (pgvector).
 *
 *   npm run rag:ingest            # incremental: only changed sources are re-embedded
 *   npm run rag:ingest -- --force # re-embed everything
 */
const { ingestAll } = require("../src/rag/ingest");

async function main() {
  const force = process.argv.includes("--force");
  console.log(`\nRAG ingestion${force ? " (forced)" : ""}\n`);
  const t0 = Date.now();
  const { results, pruned } = await ingestAll({ force });

  const summary = results.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
  const chunks = results.reduce((n, r) => n + r.chunks, 0);
  console.log(
    `\n✓ ${results.length} sources (${Object.entries(summary).map(([k, v]) => `${v} ${k}`).join(", ")}${pruned ? `, ${pruned} pruned` : ""}), ${chunks} chunks indexed in ${((Date.now() - t0) / 1000).toFixed(1)} s`
  );
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("✗ Ingestion failed:", err);
  process.exit(1);
});
