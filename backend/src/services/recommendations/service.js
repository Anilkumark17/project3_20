const userRepository = require("../auth/repository");
const profileRepository = require("../profile/repository");
const completedCoursesRepository = require("../courses/repositories/completed");
const courseCache = require("../../config/courseCache");
const fastrouter = require("../../config/fastrouter");
const recommendationRepository = require("./repository");

const getRecommendations = async (clerkId, { forceRefresh = false } = {}) => {
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) return { recommendations: [], generatedAt: null };

  const profile = await profileRepository.findByUserId(user.id);
  const completedCourses = await completedCoursesRepository.findByUserId(user.id);
  const completedIds = new Set(completedCourses.map((c) => c.courseId));
  const completedCodes = completedCourses.map((c) => c.courseCode);

  // GET: always serve from DB cache only, never call FastRouter
  if (!forceRefresh) {
    const cached = await recommendationRepository.findByUserId(user.id);
    return { recommendations: cached, generatedAt: cached[0]?.generatedAt || null };
  }

  // POST /refresh: call FastRouter to generate new recommendations
  const candidates = (profile?.program ? courseCache.getByProgram(profile.program) : courseCache.getAll())
    .filter((c) => !completedIds.has(c.id))
    .slice(0, 8)
    .map((c) => ({ ...c, score: 1.0 }));

  if (!candidates.length) return { recommendations: [], generatedAt: null };

  const season = profile?.semester === 1 ? "monsoon" : profile?.semester === 2 ? "spring" : "any";
  const userContext = {
    goal: profile?.goal || "general academic progress",
    currentProgram: profile?.program || "unknown",
    completedCourses: completedCodes,
    interests: [],
    season,
  };

  const userQuery = `Recommend courses for a ${profile?.program || "student"} focused on: ${profile?.goal || "general progress"}`;
  const aiResult = await fastrouter.rerankAndExplain(userQuery, candidates, userContext);

  const aiRecs = aiResult?.recommendations || [];

  // Map AI output back to DB rows using course codes
  const rows = aiRecs
    .map((rec, idx) => {
      const course = courseCache.getByCode(rec.code);
      if (!course) return null;
      return {
        userId: user.id,
        courseId: course.id,
        reason: rec.reason || null,
        priority: idx + 1,
        generatedAt: new Date(),
      };
    })
    .filter(Boolean);

  await recommendationRepository.deleteByUserId(user.id);
  await recommendationRepository.saveAll(rows);

  const saved = await recommendationRepository.findByUserId(user.id);
  return { recommendations: saved, generatedAt: new Date() };
};

module.exports = { getRecommendations };
