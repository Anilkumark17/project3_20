const { and, asc, desc, eq } = require("drizzle-orm");
const db = require("../../db");
const { sql } = require("../../db");
const { conversations, messages, ragQueryLogs } = require("../../db/schema");

class ConversationRepository {
  async create(userId, title) {
    const [row] = await db.insert(conversations).values({ userId, title }).returning();
    return row;
  }

  async findForUser(id, userId) {
    const [row] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    return row || null;
  }

  async listForUser(userId, limit = 50) {
    return db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt))
      .limit(limit);
  }

  async rename(id, userId, title) {
    const [row] = await db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning();
    return row || null;
  }

  async delete(id, userId) {
    const rows = await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning({ id: conversations.id });
    return rows.length > 0;
  }

  async messages(conversationId, limit = 200) {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt), asc(messages.id))
      .limit(limit);
  }

  async recentHistory(conversationId, limit = 8) {
    const rows = await db
      .select({ role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt), desc(messages.id))
      .limit(limit);
    return rows.reverse();
  }

  /** Persist a question/answer pair and bump the conversation in one transaction. */
  async saveExchange(conversationId, question, answer, citations) {
    const [, [assistant]] = await db.batch([
      db.insert(messages).values({ conversationId, role: "user", content: question }),
      db.insert(messages).values({ conversationId, role: "assistant", content: answer, citations }).returning(),
      db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId)),
    ]);
    return assistant;
  }

  async logQuery(entry) {
    try {
      await db.insert(ragQueryLogs).values(entry);
    } catch (err) {
      console.warn("Failed to write rag_query_logs:", err.message);
    }
  }

  async indexStats() {
    const [row] = await sql`
      SELECT (SELECT count(*) FROM rag_documents)::int AS documents,
             (SELECT count(*) FROM rag_chunks)::int AS chunks,
             (SELECT count(DISTINCT course_code) FROM rag_chunks)::int AS courses,
             (SELECT max(updated_at) FROM rag_documents) AS last_ingested_at`;
    return row;
  }

  async queryStats(days = 7) {
    const [row] = await sql`
      SELECT count(*)::int AS total,
             count(*) FILTER (WHERE status = 'ok')::int AS ok,
             count(*) FILTER (WHERE status = 'no_context')::int AS no_context,
             count(*) FILTER (WHERE status = 'error')::int AS errors,
             percentile_cont(0.5) WITHIN GROUP (ORDER BY (timings->>'totalMs')::numeric) AS p50_ms,
             percentile_cont(0.95) WITHIN GROUP (ORDER BY (timings->>'totalMs')::numeric) AS p95_ms
      FROM rag_query_logs
      WHERE created_at > now() - make_interval(days => ${days})`;
    return row;
  }
}

module.exports = new ConversationRepository();
