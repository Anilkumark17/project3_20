const db = require("../../db");
const { recommendations, courses } = require("../../db/schema");
const { eq } = require("drizzle-orm");

const findByUserId = async (userId) => {
  return db
    .select({
      id: recommendations.id,
      userId: recommendations.userId,
      courseId: recommendations.courseId,
      reason: recommendations.reason,
      priority: recommendations.priority,
      generatedAt: recommendations.generatedAt,
      code: courses.code,
      title: courses.title,
      credits: courses.credits,
      difficulty: courses.difficulty,
      description: courses.description,
      program: courses.program,
      semester: courses.semester,
    })
    .from(recommendations)
    .leftJoin(courses, eq(recommendations.courseId, courses.id))
    .where(eq(recommendations.userId, userId))
    .orderBy(recommendations.priority);
};

/** Atomically swap a user's recommendation set. */
const replaceForUser = async (userId, rows) => {
  const statements = [db.delete(recommendations).where(eq(recommendations.userId, userId))];
  if (rows.length) statements.push(db.insert(recommendations).values(rows));
  await db.batch(statements);
};

module.exports = { findByUserId, replaceForUser };
