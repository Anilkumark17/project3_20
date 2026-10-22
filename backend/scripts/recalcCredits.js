/** Recomputes profiles.credits_completed from completed courses (repairs drifted data). */
const { sql } = require("../src/db");

sql`
  UPDATE profiles p
  SET credits_completed = COALESCE((
    SELECT sum(c.credits) FROM completed_courses cc JOIN courses c ON c.id = cc.course_id WHERE cc.user_id = p.user_id
  ), 0), updated_at = now()
  RETURNING user_id, credits_completed`
  .then((rows) => { console.log(`✓ Recalculated credits for ${rows.length} profiles`); process.exit(0); })
  .catch((e) => { console.error("✗", e.message); process.exit(1); });
