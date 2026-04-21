const { pgTable, serial, text, integer, timestamp } = require("drizzle-orm/pg-core");

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
});

const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  credits: integer("credits").notNull(),
  difficulty: integer("difficulty"),
  workload: text("workload"),
  description: text("description"),
  program: text("program"),
  semester: integer("semester"),
  createdAt: timestamp("created_at").defaultNow(),
});

const completedCourses = pgTable("completed_courses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  grade: text("grade"),
  completedAt: timestamp("completed_at").defaultNow(),
});

const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  difficulty: integer("difficulty"),
  workload: integer("workload"),
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

module.exports = {
  users,
  profiles,
  courses,
  completedCourses,
  ratings,
  recommendations,
};
