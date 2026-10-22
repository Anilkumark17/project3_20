const express = require("express");
const router = express.Router();
const { getRecommendations, refreshRecommendations, streamRecommendations } = require("./controller");
const { requireSelf } = require("../../middleware/auth");
const { recommendationLimiter } = require("../../middleware/rateLimit");

router.get("/:clerkId", requireSelf(), getRecommendations);
router.post("/:clerkId/refresh", requireSelf(), recommendationLimiter, refreshRecommendations);

// SSE streaming endpoint for progressive loading (POST so the bearer token can be sent)
router.post("/:clerkId/stream", requireSelf(), recommendationLimiter, streamRecommendations);

module.exports = router;
