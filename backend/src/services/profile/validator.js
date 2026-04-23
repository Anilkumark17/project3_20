const { z } = require("zod");

const profileSchema = z.object({
  program: z.enum(["CSE", "PDM", "CSIS", "CASE"], {
    required_error: "Program is required",
    invalid_type_error: "Invalid program selection",
  }),
  semester: z.number().int().min(1).max(8, "Semester must be between 1 and 8"),
  goal: z.enum(["Placement", "Research", "Skills"], {
    required_error: "Goal is required",
    invalid_type_error: "Invalid goal selection",
  }),
  creditsCompleted: z.number().int().min(0).optional(),
});

const updateProfileSchema = z.object({
  program: z.enum(["CSE", "PDM", "CSIS", "CASE"]).optional(),
  semester: z.number().int().min(1).max(8).optional(),
  goal: z.enum(["Placement", "Research", "Skills"]).optional(),
  creditsCompleted: z.number().int().min(0).optional(),
});

const completedCourseSchema = z.object({
  courseId: z.number().int().positive("Course ID is required"),
  grade: z.string().optional(),
  credits: z.number().int().positive().optional(),
});

const validateProfile = (req, res, next) => {
  try {
    profileSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.errors,
    });
  }
};

const validateUpdateProfile = (req, res, next) => {
  try {
    updateProfileSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.errors,
    });
  }
};

const validateCompletedCourse = (req, res, next) => {
  try {
    completedCourseSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.errors,
    });
  }
};

module.exports = {
  validateProfile,
  validateUpdateProfile,
  validateCompletedCourse,
};
