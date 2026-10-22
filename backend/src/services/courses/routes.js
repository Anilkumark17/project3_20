const express = require("express");
const router = express.Router();
const courseController = require("./controller");
const { validateCourse, validateUpdateCourse } = require("./validator");
const { requireAuth, requireAdmin } = require("../../middleware/auth");

// Catalog reads are public; writes are restricted to admins.
const adminOnly = [requireAuth, requireAdmin];

// Get all courses
router.get("/", courseController.getAllCourses);

// Get course catalog with filters
router.get("/catalog", courseController.getCourseCatalog);

// Search courses
router.get("/search", courseController.searchCourses);

// Get courses by program
router.get("/program/:program", courseController.getCoursesByProgram);

// Get courses by semester
router.get("/semester/:semester", courseController.getCoursesBySemester);

// Get course by ID
router.get("/:id", courseController.getCourseById);

// Get course by code
router.get("/code/:code", courseController.getCourseByCode);

// Create new course
router.post("/", adminOnly, validateCourse, courseController.createCourse);

// Update course
router.put("/:id", adminOnly, validateUpdateCourse, courseController.updateCourse);

// Delete course
router.delete("/:id", adminOnly, courseController.deleteCourse);

module.exports = router;
