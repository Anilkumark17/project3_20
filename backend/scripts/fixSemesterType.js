require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function fixSemesterType() {
  // Safety check: any non-numeric values would cause the cast to fail
  const bad = await sql`SELECT id, semester FROM courses WHERE semester::text !~ '^[0-9]+$' AND semester IS NOT NULL`;
  if (bad.length > 0) {
    console.error("Non-numeric semester values found — fix these before migrating:");
    console.error(bad);
    process.exit(1);
  }
  console.log("✓ Safety check passed — all semester values are numeric or NULL");

  await sql.query(
    `ALTER TABLE courses ALTER COLUMN semester TYPE integer USING semester::integer`
  );
  console.log("✓ courses.semester column type changed to integer");
}

fixSemesterType().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
