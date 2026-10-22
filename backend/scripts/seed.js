/**
 * Seeds the `courses` table from data/monsoon.json and data/spring.json.
 * Upserts on course code (safe to re-run) and keeps the JSON ids stable.
 */
const path = require("path");
const { sql: dsql } = require("drizzle-orm");
const db = require("../src/db");
const { sql } = require("../src/db");
const { courses } = require("../src/db/schema");

const load = (season) => require(path.join(__dirname, "..", "data", `${season}.json`));

async function main() {
  const rows = [...load("monsoon"), ...load("spring")].map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
    credits: c.credits,
    difficulty: c.difficulty,
    description: c.description,
    program: c.program,
    semester: c.semester,
  }));

  await db
    .insert(courses)
    .values(rows)
    .onConflictDoUpdate({
      target: courses.code,
      set: {
        title: dsql`excluded.title`,
        credits: dsql`excluded.credits`,
        difficulty: dsql`excluded.difficulty`,
        description: dsql`excluded.description`,
        program: dsql`excluded.program`,
        semester: dsql`excluded.semester`,
      },
    });

  // Explicit ids were inserted, so move the serial sequence past them.
  await sql`SELECT setval(pg_get_serial_sequence('courses', 'id'), (SELECT max(id) FROM courses))`;
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM courses`;
  console.log(`✓ Seeded ${rows.length} courses (${count} in table)`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("✗ Seed failed:", err.message);
  process.exit(1);
});
