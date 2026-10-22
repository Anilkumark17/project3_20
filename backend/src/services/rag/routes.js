const express = require("express");
const router = express.Router();
const ragController = require("./controller");
const { requireAdmin } = require("../../middleware/auth");
const { ragLimiter } = require("../../middleware/rateLimit");
const { validateAsk, validateRename, validateSearch, validateId } = require("./validator");

// Q&A (rate-limited: each call runs embedding, reranking and an LLM completion)
router.post("/ask", ragLimiter, validateAsk, ragController.ask);
router.post("/ask/stream", ragLimiter, validateAsk, ragController.askStream);

// Conversation history
router.get("/conversations", ragController.listConversations);
router.get("/conversations/:id", validateId, ragController.getConversation);
router.patch("/conversations/:id", validateId, validateRename, ragController.renameConversation);
router.delete("/conversations/:id", validateId, ragController.deleteConversation);

// Diagnostics
router.get("/search", requireAdmin, validateSearch, ragController.search);
router.get("/stats", requireAdmin, ragController.stats);

module.exports = router;
