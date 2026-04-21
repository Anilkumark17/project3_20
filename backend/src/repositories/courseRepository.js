const db = require("../db");
const { courses } = require("../db/schema");
const { eq, like, and, or, sql } = require("drizzle-orm");

class CourseRepository {
  async findAll() {
    const result = await db.select().from(courses);
    return result;
  }

  async findById(id) {
    const result = await db.select().from(courses).where(eq(courses.id, id));
    return result[0] || null;
  }

  async findByCode(code) {
    const result = await db.select().from(courses).where(eq(courses.code, code));
    return result[0] || null;
  }

  async search(filters = {}) {
    let query = db.select().from(courses);
    const conditions = [];

    // Search by keyword (code or title)
    if (filters.keyword) {
      conditions.push(
        or(
          like(courses.code, `%${filters.keyword}%`),
          like(courses.title, `%${filters.keyword}%`)
        )
      );
    }

    // Filter by program
    if (filters.program) {
      conditions.push(eq(courses.program, filters.program));
    }

    // Filter by semester
    if (filters.semester) {
      conditions.push(eq(courses.semester, parseInt(filters.semester)));
    }

    // Filter by difficulty range
    if (filters.minDifficulty) {
      conditions.push(sql`${courses.difficulty} >= ${parseInt(filters.minDifficulty)}`);
    }
    if (filters.maxDifficulty) {
      conditions.push(sql`${courses.difficulty} <= ${parseInt(filters.maxDifficulty)}`);
    }

    // Filter by credits
    if (filters.credits) {
      conditions.push(eq(courses.credits, parseInt(filters.credits)));
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result;
  }

  async create(data) {
    const result = await db.insert(courses).values(data).returning();
    return result[0];
  }

  async update(id, data) {
    const result = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id) {
    await db.delete(courses).where(eq(courses.id, id));
    return true;
  }

  async findByProgram(program) {
    const result = await db.select().from(courses).where(eq(courses.program, program));
    return result;
  }

  async findBySemester(semester) {
    const result = await db.select().from(courses).where(eq(courses.semester, semester));
    return result;
  }

  async count(filters = {}) {
    let query = db.select({ count: sql`count(*)` }).from(courses);
    const conditions = [];

    if (filters.program) {
      conditions.push(eq(courses.program, filters.program));
    }
    if (filters.semester) {
      conditions.push(eq(courses.semester, parseInt(filters.semester)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return parseInt(result[0]?.count || 0);
  }
}

module.exports = new CourseRepository();
