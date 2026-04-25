const recommendationService = require("./service");

const getRecommendations = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const result = await recommendationService.getRecommendations(clerkId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Get recommendations error:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations", message: error.message });
  }
};

const refreshRecommendations = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const result = await recommendationService.getRecommendations(clerkId, { forceRefresh: true });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Refresh recommendations error:", error);
    return res.status(500).json({ error: "Failed to refresh recommendations", message: error.message });
  }
};

/**
 * Server-Sent Events (SSE) endpoint for streaming recommendations
 * Provides progressive loading: immediate rule-based results + AI reranking stream
 */
const streamRecommendations = async (req, res) => {
  const { clerkId } = req.params;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Helper function to send SSE events
  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // Phase 1: Send immediate rule-based recommendations (fast)
    sendEvent('phase', { phase: 'rule-based', message: 'Loading initial recommendations...' });
    
    const ruleBasedResult = await recommendationService.getRuleBasedRecommendations(clerkId);
    sendEvent('rule-based', {
      recommendations: ruleBasedResult.recommendations,
      count: ruleBasedResult.recommendations.length,
      timestamp: new Date().toISOString()
    });

    // Phase 2: Stream AI-enhanced recommendations (progressive)
    sendEvent('phase', { phase: 'ai-reranking', message: 'Enhancing with AI...' });
    
    await recommendationService.streamAIReranking(clerkId, (chunk) => {
      sendEvent('ai-chunk', chunk);
    });

    // Phase 3: Final recommendations
    sendEvent('phase', { phase: 'complete', message: 'Recommendations ready!' });
    
    const finalResult = await recommendationService.getRecommendations(clerkId);
    sendEvent('complete', {
      recommendations: finalResult.recommendations,
      generatedAt: finalResult.generatedAt,
      timestamp: new Date().toISOString()
    });

    // Close the stream
    sendEvent('done', { message: 'Stream complete' });
    res.end();

  } catch (error) {
    console.error("Stream recommendations error:", error);
    sendEvent('error', { 
      error: 'Failed to stream recommendations', 
      message: error.message 
    });
    res.end();
  }
};

module.exports = { 
  getRecommendations, 
  refreshRecommendations,
  streamRecommendations 
};
