const express = require("express");
const router = express.Router();
const profileController = require("./controller");
const { requireSelf } = require("../../middleware/auth");
const {
  validateUpdateProfile,
  validateCompletedCourse,
} = require("./validator");

// Every profile route is scoped to the signed-in user.
router.use("/:clerkId", requireSelf());

// Get profile by clerkId
router.get("/:clerkId", profileController.getProfile);

// Get full profile with completed courses
router.get("/:clerkId/full", profileController.getFullProfile);

// Create or update profile
router.put("/:clerkId", validateUpdateProfile, profileController.createOrUpdateProfile);

// Get completed courses
router.get("/:clerkId/courses", profileController.getCompletedCourses);

// Add completed course
router.post("/:clerkId/courses", validateCompletedCourse, profileController.addCompletedCourse);

// Remove completed course
router.delete("/:clerkId/courses/:courseId", profileController.removeCompletedCourse);

// Update specific profile field
router.patch("/:clerkId/:field", profileController.updateProfileField);

module.exports = router;
