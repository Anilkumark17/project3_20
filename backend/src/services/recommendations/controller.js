const recommendationService = require("./service");

const getRecommendations = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const result = await recommendationService.getRecommendations(clerkId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Get recommendations error:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations", message: error.message });
  }
};

const refreshRecommendations = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const result = await recommendationService.getRecommendations(clerkId, { forceRefresh: true });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Refresh recommendations error:", error);
    return res.status(500).json({ error: "Failed to refresh recommendations", message: error.message });
  }
};

module.exports = { getRecommendations, refreshRecommendations };
