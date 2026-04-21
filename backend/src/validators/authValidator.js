const { z } = require("zod");

const syncUserSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID is required"),
  email: z.string().email("Valid email is required"),
  name: z.string().optional(),
});

const profileSchema = z.object({
  program: z.string().optional(),
  semester: z.number().int().min(1).max(12).optional(),
  goal: z.string().optional(),
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
    profileSchema.parse(req.body);
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
