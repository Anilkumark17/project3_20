const { z } = require("zod");

const syncUserSchema = z.object({
  clerkId: z.string().optional(),
  email: z.string().email("Valid email is required"),
  name: z.string().optional(),
});

const profileSchema = z.object({
  program: z.enum(["CSE", "PDM", "CSIS", "CASE"]).optional(),
  semester: z.number().int().min(1).max(8).optional(),
  goal: z.enum(["Placement", "Research", "Skills"]).optional(),
  creditsCompleted: z.number().int().min(0).optional(),
});

const validateSyncUser = (req, res, next) => {
  try {
    syncUserSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: error.errors 
    });
  }
};

const validateProfile = (req, res, next) => {
  try {
    // Strip unknown keys so clients cannot write columns like userId.
    req.body = profileSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: error.errors 
    });
  }
};

module.exports = {
  validateSyncUser,
  validateProfile,
};
