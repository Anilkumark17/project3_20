const db = require("../db");
const { users } = require("../db/schema");
const { eq } = require("drizzle-orm");

class UserRepository {
  async findById(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async findByClerkId(clerkId) {
    const result = await db.select().from(users).where(eq(users.clerkId, clerkId));
    return result[0] || null;
  }

  async findByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  async create(data) {
    const result = await db.insert(users).values(data).returning();
    return result[0];
  }

  async update(id, data) {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0] || null;
  }

  async delete(id) {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async findAll() {
    return await db.select().from(users);
  }
}

module.exports = new UserRepository();
