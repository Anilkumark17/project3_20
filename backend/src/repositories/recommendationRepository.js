// Recommendation Repository
// const db = require("../db");

const findByUserId = async (userId) => {
  // TODO: return db.select().from(recommendations).where(eq(recommendations.userId, userId))
  return [];
};

const saveRecommendation = async (data) => {
  // TODO: return db.insert(recommendations).values(data)
  return null;
};

module.exports = { findByUserId, saveRecommendation };
