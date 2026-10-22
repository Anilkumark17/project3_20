const express = require("express");
const router = express.Router();
const authController = require("./controller");
const { requireSelf } = require("../../middleware/auth");
const { validateSyncUser, validateProfile } = require("./validator");

router.post("/sync", validateSyncUser, authController.syncUser);

router.get("/user/:clerkId", requireSelf(), authController.getUser);

router.get("/profile/:clerkId", requireSelf(), authController.getProfile);

router.put("/profile/:clerkId", requireSelf(), validateProfile, authController.updateProfile);

module.exports = router;
