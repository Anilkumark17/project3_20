// Recommendation Controller
const recommendationService = require("./service");

const getRecommendations = async (req, res) => {
  try {
    res.json({ message: "getRecommendations - not yet implemented" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getRecommendations };
