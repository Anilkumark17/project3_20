const db = require("../db");
const { completedCourses, courses } = require("../db/schema");
const { eq, and } = require("drizzle-orm");

class CompletedCoursesRepository {
  async findByUserId(userId) {
    const result = await db
      .select({
        id: completedCourses.id,
        userId: completedCourses.userId,
        courseId: completedCourses.courseId,
        grade: completedCourses.grade,
        completedAt: completedCourses.completedAt,
        courseCode: courses.code,
        courseTitle: courses.title,
        courseCredits: courses.credits,
      })
      .from(completedCourses)
      .leftJoin(courses, eq(completedCourses.courseId, courses.id))
      .where(eq(completedCourses.userId, userId));
    return result;
  }

  async findById(id) {
    const result = await db
      .select()
      .from(completedCourses)
      .where(eq(completedCourses.id, id));
    return result[0] || null;
  }

  async create(data) {
    const result = await db.insert(completedCourses).values(data).returning();
    return result[0];
  }

  async update(id, data) {
    const result = await db
      .update(completedCourses)
      .set(data)
      .where(eq(completedCourses.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id) {
    await db.delete(completedCourses).where(eq(completedCourses.id, id));
    return true;
  }

  async deleteByUserAndCourse(userId, courseId) {
    await db
      .delete(completedCourses)
      .where(
        and(
          eq(completedCourses.userId, userId),
          eq(completedCourses.courseId, courseId)
        )
      );
    return true;
  }

  async exists(userId, courseId) {
    const result = await db
      .select()
      .from(completedCourses)
      .where(
        and(
          eq(completedCourses.userId, userId),
          eq(completedCourses.courseId, courseId)
        )
      );
    return result.length > 0;
  }
}

module.exports = new CompletedCoursesRepository();
