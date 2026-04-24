require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function createIndexes() {
  const indexes = [
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS profiles_user_id_idx ON profiles(user_id)",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS courses_program_idx ON courses(program)",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS courses_semester_idx ON courses(semester)",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS courses_difficulty_idx ON courses(difficulty)",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS courses_credits_idx ON courses(credits)",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS completed_courses_user_course_idx ON completed_courses(user_id, course_id)",
  ];

  for (const stmt of indexes) {
    const name = stmt.match(/IF NOT EXISTS (\S+)/)[1];
    try {
      await sql.query(stmt);
      console.log(`✓ ${name}`);
    } catch (err) {
      console.error(`✗ ${name}: ${err.message}`);
    }
  }
}

createIndexes().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
