const ragService = require("./service");

class RAGController {
  /** POST /api/rag/ask  { question, conversationId? } */
  async ask(req, res) {
    const result = await ragService.ask(req.userId, req.body);
    res.json({ success: true, data: result });
  }

  /**
   * POST /api/rag/ask/stream  { question, conversationId? }
   * Server-Sent Events: conversation → sources → token* → done | error
   */
  async askStream(req, res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const controller = new AbortController();
    res.on("close", () => controller.abort());
    const emit = (event, data) => {
      if (!res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };
    const heartbeat = setInterval(() => !res.writableEnded && res.write(": ping\n\n"), 15000);

    try {
      await ragService.askStream(req.userId, req.body, { emit, signal: controller.signal });
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("RAG stream error:", error);
        emit("error", { message: error.status ? error.message : "The advisor failed to answer. Please try again." });
      }
    } finally {
      clearInterval(heartbeat);
      res.end();
    }
  }

  async listConversations(req, res) {
    res.json({ success: true, conversations: await ragService.listConversations(req.userId) });
  }

  async getConversation(req, res) {
    res.json({ success: true, conversation: await ragService.getConversation(req.userId, req.params.id) });
  }

  async renameConversation(req, res) {
    res.json({ success: true, conversation: await ragService.renameConversation(req.userId, req.params.id, req.body.title) });
  }

  async deleteConversation(req, res) {
    await ragService.deleteConversation(req.userId, req.params.id);
    res.status(204).end();
  }

  async search(req, res) {
    res.json({ success: true, data: await ragService.search(req.query.q) });
  }

  async stats(req, res) {
    res.json({ success: true, data: await ragService.stats() });
  }
}

module.exports = new RAGController();
