const ragService = require("./service");

/**
 * RAG Controller – HTTP interface for the Graph RAG
 */
class RAGController {
  /**
   * POST /api/rag/ask
   * Body: { question: string, history?: Array }
   */
  async ask(req, res) {
    try {
      const { question, history } = req.body;

      if (!question || !question.trim()) {
        return res.status(400).json({
          success: false,
          error: "A question is required.",
        });
      }

      const result = await ragService.ask(question.trim(), history || []);
      
      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("RAG Ask Error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "An error occurred while processing your request.",
      });
    }
  }

  /**
   * POST /api/rag/ask/stream
   */
  async askStream(req, res) {
    try {
      const { question, history } = req.body;

      if (!question || !question.trim()) {
        return res.status(400).send("A question is required.");
      }

      // SSE setup
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const stream = await ragService.askStream(question.trim(), history || []);

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content ?? "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("RAG Stream Error:", error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}

module.exports = new RAGController();
