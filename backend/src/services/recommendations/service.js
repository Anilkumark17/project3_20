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

/**
 * Get fast rule-based recommendations without AI
 * Used for immediate SSE response
 */
const getRuleBasedRecommendations = async (clerkId) => {
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) return { recommendations: [] };

  const profile = await profileRepository.findByUserId(user.id);
  const completedCourses = await completedCoursesRepository.findByUserId(user.id);
  const completedIds = new Set(completedCourses.map((c) => c.courseId));

  // Fast filtering: program match + not completed + limit to 8
  const candidates = (profile?.program ? courseCache.getByProgram(profile.program) : courseCache.getAll())
    .filter((c) => !completedIds.has(c.id))
    .slice(0, 8);

  // Map to recommendation format
  const recommendations = candidates.map((course, idx) => ({
    ...course,
    reason: `Matches your ${profile?.program || 'program'} curriculum`,
    priority: idx + 1,
    score: 1.0 - (idx * 0.1) // Simple descending score
  }));

  return { recommendations };
};

/**
 * Stream AI reranking results progressively
 * Calls FastRouter and yields chunks as they arrive
 */
const streamAIReranking = async (clerkId, onChunk) => {
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) return;

  const profile = await profileRepository.findByUserId(user.id);
  const completedCourses = await completedCoursesRepository.findByUserId(user.id);
  const completedIds = new Set(completedCourses.map((c) => c.courseId));
  const completedCodes = completedCourses.map((c) => c.courseCode);

  const candidates = (profile?.program ? courseCache.getByProgram(profile.program) : courseCache.getAll())
    .filter((c) => !completedIds.has(c.id))
    .slice(0, 8)
    .map((c) => ({ ...c, score: 1.0 }));

  if (!candidates.length) return;

  const season = profile?.semester === 1 ? "monsoon" : profile?.semester === 2 ? "spring" : "any";
  const userContext = {
    goal: profile?.goal || "general academic progress",
    currentProgram: profile?.program || "unknown",
    completedCourses: completedCodes,
    interests: [],
    season,
  };

  const userQuery = `Recommend courses for a ${profile?.program || "student"} focused on: ${profile?.goal || "general progress"}`;

  // Stream AI results
  try {
    const aiResult = await fastrouter.rerankAndExplain(userQuery, candidates, userContext);
    const aiRecs = aiResult?.recommendations || [];

    // Send each recommendation as it's processed
    for (let i = 0; i < aiRecs.length; i++) {
      const rec = aiRecs[i];
      const course = courseCache.getByCode(rec.code);
      
      if (course) {
        onChunk({
          index: i,
          total: aiRecs.length,
          course: {
            ...course,
            reason: rec.reason,
            priority: i + 1,
            score: rec.score || (1.0 - i * 0.1)
          },
          progress: ((i + 1) / aiRecs.length) * 100
        });

        // Small delay to simulate streaming (remove in production if FastRouter supports true streaming)
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Save final results to DB
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

  } catch (error) {
    console.error('AI streaming error:', error);
    throw error;
  }
};

module.exports = { 
  getRecommendations,
  getRuleBasedRecommendations,
  streamAIReranking
};
