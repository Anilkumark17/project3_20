const db = require("../../../db");
const { courses } = require("../../../db/schema");
const { eq } = require("drizzle-orm");
const courseCache = require("../../../config/courseCache");

class CourseRepository {
  async findAll() {
    return courseCache.getAll();
  }

  async findById(id) {
    return courseCache.getById(id);
  }

  async findByCode(code) {
    return courseCache.getByCode(code);
  }

  async search(filters = {}, pagination = {}) {
    return courseCache.search(filters, pagination);
  }

  async create(data) {
    const result = await db.insert(courses).values(data).returning();
    await courseCache.load();
    return result[0];
  }

  async update(id, data) {
    const result = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, id))
      .returning();
    await courseCache.load();
    return result[0] || null;
  }

  async delete(id) {
    await db.delete(courses).where(eq(courses.id, id));
    await courseCache.load();
    return true;
  }

  async findByProgram(program) {
    return courseCache.getByProgram(program);
  }

  async findBySemester(semester) {
    return courseCache.getBySemester(semester);
  }

  async count(filters = {}) {
    return courseCache.count(filters);
  }
}

module.exports = new CourseRepository();
