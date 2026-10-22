const express = require("express");
const router = express.Router();
const { getDashboard } = require("./controller");
const { requireSelf } = require("../../middleware/auth");

router.get("/:clerkId", requireSelf(), getDashboard);

module.exports = router;
