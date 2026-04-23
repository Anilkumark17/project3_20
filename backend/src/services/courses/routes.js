const express = require("express");
const router = express.Router();
const courseController = require("./controller");
const { validateCourse, validateUpdateCourse } = require("./validator");

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
router.post("/", validateCourse, courseController.createCourse);

// Update course
router.put("/:id", validateUpdateCourse, courseController.updateCourse);

// Delete course
router.delete("/:id", courseController.deleteCourse);

module.exports = router;
