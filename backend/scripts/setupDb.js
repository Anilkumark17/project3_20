/**
 * Enables the pgvector extension. Run before `drizzle-kit push`, which creates
 * the vector(384) column and HNSW index (Neon supports pgvector out of the box).
 */
const { sql } = require("../src/db");

async function main() {
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;
  const [{ extversion }] = await sql`SELECT extversion FROM pg_extension WHERE extname = 'vector'`;
  console.log(`✓ pgvector ${extversion} enabled`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("✗ Database setup failed:", err.message);
  process.exit(1);
});
