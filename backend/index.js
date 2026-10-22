const { env, assertServerEnv } = require("./src/config/env");

assertServerEnv();

const app = require("./src/app");
const courseCache = require("./src/config/courseCache");
const { warmUp } = require("./src/rag/models");

async function start() {
  await courseCache.load();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 ICA API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  // Load the ONNX embedding + reranker models in the background so the first question is fast.
  warmUp()
    .then(() => console.log("✓ RAG models loaded"))
    .catch((err) => console.error("RAG model warm-up failed:", err.message));

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down…`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
