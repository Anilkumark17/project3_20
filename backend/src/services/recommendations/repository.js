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

const deleteByUserId = async (userId) => {
  await db.delete(recommendations).where(eq(recommendations.userId, userId));
};

const saveAll = async (rows) => {
  if (!rows.length) return [];
  return db.insert(recommendations).values(rows).returning();
};

module.exports = { findByUserId, deleteByUserId, saveAll };
