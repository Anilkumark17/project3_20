const recommendationService = require("./service");

const getRecommendations = async (req, res) => {
  const result = await recommendationService.getRecommendations(req.params.clerkId);
  res.status(200).json({ success: true, ...result });
};

const refreshRecommendations = async (req, res) => {
  const result = await recommendationService.getRecommendations(req.params.clerkId, { forceRefresh: true });
  res.status(200).json({ success: true, ...result });
};

/**
 * Server-Sent Events: phase → candidates → phase → complete → done | error.
 * Candidates arrive in ~100 ms from retrieval; AI-ranked picks follow.
 */
const streamRecommendations = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const emit = (event, data) => {
    if (!res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await recommendationService.streamRecommendations(req.params.clerkId, emit);
    emit("done", {});
  } catch (error) {
    console.error("Stream recommendations error:", error);
    emit("error", { message: "Failed to generate recommendations. Please try again." });
  } finally {
    res.end();
  }
};

module.exports = { getRecommendations, refreshRecommendations, streamRecommendations };
