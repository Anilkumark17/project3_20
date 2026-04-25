const express = require("express");
const router = express.Router();
const { getRecommendations, refreshRecommendations, streamRecommendations } = require("./controller");

// Regular endpoints
router.get("/:clerkId", getRecommendations);
router.post("/:clerkId/refresh", refreshRecommendations);

// SSE streaming endpoint for progressive loading
router.get("/:clerkId/stream", streamRecommendations);

module.exports = router;
