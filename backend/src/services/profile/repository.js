const db = require("../../db");
const { profiles } = require("../../db/schema");
const { eq } = require("drizzle-orm");

class ProfileRepository {
  async findByUserId(userId) {
    const result = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return result[0] || null;
  }

  async create(data) {
    const result = await db.insert(profiles).values(data).returning();
    return result[0];
  }

  async update(userId, data) {
    const result = await db.update(profiles).set(data).where(eq(profiles.userId, userId)).returning();
    return result[0] || null;
  }

  async upsert(data) {
    const existing = await this.findByUserId(data.userId);
    if (existing) {
      return await this.update(data.userId, data);
    }
    return await this.create(data);
  }

  async delete(userId) {
    await db.delete(profiles).where(eq(profiles.userId, userId));
    return true;
  }
}

module.exports = new ProfileRepository();
