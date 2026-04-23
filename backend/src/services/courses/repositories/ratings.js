// Ratings Repository
// const db = require("../db");

const findByCourseId = async (courseId) => {
  // TODO: return db.select().from(ratings).where(eq(ratings.courseId, courseId))
  return [];
};

const addRating = async (data) => {
  // TODO: return db.insert(ratings).values(data)
  return null;
};

module.exports = { findByCourseId, addRating };
