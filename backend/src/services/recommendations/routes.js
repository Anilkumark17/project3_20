const express = require("express");
const router = express.Router();
const { getRecommendations, refreshRecommendations } = require("./controller");

router.get("/:clerkId", getRecommendations);
router.post("/:clerkId/refresh", refreshRecommendations);

module.exports = router;
