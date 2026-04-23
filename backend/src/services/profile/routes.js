const express = require("express");
const router = express.Router();
const profileController = require("./controller");
const {
  validateProfile,
  validateUpdateProfile,
  validateCompletedCourse,
} = require("./validator");

// Get profile by clerkId
router.get("/:clerkId", profileController.getProfile);

// Get full profile with completed courses
router.get("/:clerkId/full", profileController.getFullProfile);

// Create or update profile
router.put("/:clerkId", validateUpdateProfile, profileController.createOrUpdateProfile);

// Update specific profile field
router.patch("/:clerkId/:field", profileController.updateProfileField);

// Get completed courses
router.get("/:clerkId/courses", profileController.getCompletedCourses);

// Add completed course
router.post("/:clerkId/courses", validateCompletedCourse, profileController.addCompletedCourse);

// Remove completed course
router.delete("/:clerkId/courses/:courseId", profileController.removeCompletedCourse);

module.exports = router;
