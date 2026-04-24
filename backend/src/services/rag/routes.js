const express = require("express");
const router = express.Router();
const ragController = require("./controller");

// Ask a question to the Graph RAG
router.post("/ask", (req, res) => ragController.ask(req, res));

// Ask a question with streaming response (SSE)
router.post("/ask/stream", (req, res) => ragController.askStream(req, res));

module.exports = router;
