const { pgTable, serial, text, integer, timestamp, json, index } = require("drizzle-orm/pg-core");

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

const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  semester: text("semester").notNull(),
  pageNum: integer("page_num"),
  vectorCount: integer("vector_count").default(0),
  namespace: text("namespace").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const courseChunks = pgTable("course_chunks", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  vectorId: text("vector_id").notNull().unique(),
  courseCode: text("course_code"),
  courseTitle: text("course_title").notNull(),
  content: text("content").notNull(),
  pageNumber: integer("page_number"),
  chunkIndex: integer("chunk_index"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

module.exports = {
  users,
  profiles,
  courses,
  completedCourses,
  ratings,
  recommendations,
  documents,
  courseChunks,
};
