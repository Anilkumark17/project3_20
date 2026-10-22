const userRepository = require("../auth/repository");
const profileRepository = require("../profile/repository");
const completedCoursesRepository = require("../courses/repositories/completed");
const recommendationRepository = require("../recommendations/repository");
const conversationRepository = require("../rag/repository");
const courseCache = require("../../config/courseCache");
const { HttpError } = require("../../utils/httpError");

// MTech degree requirement used for the progress indicator.
const CREDITS_REQUIRED = 64;

/** GET /api/dashboard/:clerkId — everything the dashboard needs in one round trip. */
const getDashboard = async (req, res) => {
  const user = await userRepository.findByClerkId(req.params.clerkId);
  if (!user) throw new HttpError(404, "User not found");

  const [profile, completed, recommendations, conversations] = await Promise.all([
    profileRepository.findByUserId(user.id),
    completedCoursesRepository.findByUserId(user.id),
    recommendationRepository.findByUserId(user.id),
    conversationRepository.listForUser(user.id, 5),
  ]);

  const credits = profile?.creditsCompleted || 0;
  const difficulties = completed.map((c) => courseCache.getById(c.courseId)?.difficulty).filter(Boolean);

  res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email },
      profile,
      stats: {
        creditsCompleted: credits,
        creditsRequired: CREDITS_REQUIRED,
        progress: Math.min(1, credits / CREDITS_REQUIRED),
        coursesCompleted: completed.length,
        averageDifficulty: difficulties.length ? difficulties.reduce((a, b) => a + b, 0) / difficulties.length : null,
        catalogSize: courseCache.getAll().length,
      },
      recentCourses: completed.slice(-5).reverse(),
      recommendations: recommendations.slice(0, 3),
      conversations,
    },
  });
};

module.exports = { getDashboard };
