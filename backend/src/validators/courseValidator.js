const { z } = require("zod");

const courseSchema = z.object({
  code: z.string().min(1, "Course code is required").max(20),
  title: z.string().min(1, "Course title is required").max(200),
  credits: z.number().int().min(1).max(6, "Credits must be between 1 and 6"),
  difficulty: z.number().int().min(1).max(5).optional(),
  workload: z.string().optional(),
  description: z.string().optional(),
  program: z.enum(["CSE", "PDM", "CSIS", "CASE"]).optional(),
  semester: z.number().int().min(1).max(8).optional(),
});

const updateCourseSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  title: z.string().min(1).max(200).optional(),
  credits: z.number().int().min(1).max(6).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  workload: z.string().optional(),
  description: z.string().optional(),
  program: z.enum(["CSE", "PDM", "CSIS", "CASE"]).optional(),
  semester: z.number().int().min(1).max(8).optional(),
});

const validateCourse = (req, res, next) => {
  try {
    courseSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.errors,
    });
  }
};

const validateUpdateCourse = (req, res, next) => {
  try {
    updateCourseSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.errors,
    });
  }
};

module.exports = {
  validateCourse,
  validateUpdateCourse,
};
