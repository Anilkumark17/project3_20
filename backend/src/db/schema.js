const {
  pgTable,
  serial,
  text,
  integer,
  real,
  timestamp,
  json,
  jsonb,
  uuid,
  index,
  uniqueIndex,
  vector,
  customType,
} = require("drizzle-orm/pg-core");
const { sql } = require("drizzle-orm");

// Must match the output dimension of EMBEDDING_MODEL (bge-small-en-v1.5 = 384).
const EMBEDDING_DIM = 384;

const tsvector = customType({
  dataType() {
    return "tsvector";
  },
});

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  program: text("program"),
  semester: integer("semester"),
  goal: text("goal"),
  creditsCompleted: integer("credits_completed").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  index("profiles_user_id_idx").on(t.userId),
]);

const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  credits: integer("credits").notNull(),
  difficulty: integer("difficulty"),
  description: text("description"),
  program: text("program"),
  semester: integer("semester"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("courses_program_idx").on(t.program),
  index("courses_semester_idx").on(t.semester),
  index("courses_difficulty_idx").on(t.difficulty),
  index("courses_credits_idx").on(t.credits),
]);

const completedCourses = pgTable("completed_courses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  grade: text("grade"),
  completedAt: timestamp("completed_at").defaultNow(),
}, (t) => [
  index("completed_courses_user_course_idx").on(t.userId, t.courseId),
]);

const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  difficulty: integer("difficulty"),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
});

const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  reason: text("reason"),
  priority: integer("priority"),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// ── RAG ──────────────────────────────────────────────────────────────────────

// One row per ingested source file (a syllabus markdown or the JSON catalog).
const ragDocuments = pgTable("rag_documents", {
  id: serial("id").primaryKey(),
  sourceId: text("source_id").notNull().unique(),
  sourceType: text("source_type").notNull(), // 'syllabus' | 'catalog'
  title: text("title").notNull(),
  season: text("season"),
  program: text("program"),
  checksum: text("checksum").notNull(),
  chunkCount: integer("chunk_count").default(0).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const ragChunks = pgTable("rag_chunks", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => ragDocuments.id, { onDelete: "cascade" }).notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  courseCode: text("course_code"),
  courseTitle: text("course_title"),
  section: text("section"),
  headingPath: text("heading_path"),
  season: text("season"),
  program: text("program"),
  content: text("content").notNull(),
  tokenCount: integer("token_count"),
  metadata: jsonb("metadata"),
  embedding: vector("embedding", { dimensions: EMBEDDING_DIM }).notNull(),
  tsv: tsvector("tsv").generatedAlwaysAs(
    sql`setweight(to_tsvector('english', coalesce(course_title, '')), 'A') || setweight(to_tsvector('english', coalesce(section, '')), 'B') || setweight(to_tsvector('english', content), 'C')`
  ),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("rag_chunks_embedding_hnsw_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  index("rag_chunks_tsv_gin_idx").using("gin", t.tsv),
  index("rag_chunks_course_code_idx").on(t.courseCode),
  index("rag_chunks_season_idx").on(t.season),
  uniqueIndex("rag_chunks_document_chunk_uidx").on(t.documentId, t.chunkIndex),
]);

const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  index("conversations_user_updated_idx").on(t.userId, t.updatedAt),
]);

const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  citations: jsonb("citations"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("messages_conversation_idx").on(t.conversationId, t.createdAt),
]);

// Observability: one row per RAG request, with per-stage timings.
const ragQueryLogs = pgTable("rag_query_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  conversationId: uuid("conversation_id"),
  question: text("question").notNull(),
  searchQuery: text("search_query"),
  retrievedChunkIds: json("retrieved_chunk_ids"),
  topScore: real("top_score"),
  timings: jsonb("timings"),
  model: text("model"),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  status: text("status").notNull(), // 'ok' | 'error' | 'no_context'
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("rag_query_logs_created_idx").on(t.createdAt),
]);

module.exports = {
  EMBEDDING_DIM,
  users,
  profiles,
  courses,
  completedCourses,
  ratings,
  recommendations,
  ragDocuments,
  ragChunks,
  conversations,
  messages,
  ragQueryLogs,
};
