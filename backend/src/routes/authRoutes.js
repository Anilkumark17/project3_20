const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validateSyncUser, validateProfile } = require("../validators/authValidator");

router.post("/sync", validateSyncUser, authController.syncUser);

router.get("/user/:clerkId", authController.getUser);

router.get("/profile/:clerkId", authController.getProfile);

router.put("/profile/:clerkId", validateProfile, authController.updateProfile);

module.exports = router;
