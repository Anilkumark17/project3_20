require("dotenv").config({ quiet: true });
const { z } = require("zod");

const bool = (def) =>
  z
    .enum(["true", "false", "1", "0"])
    .default(def ? "true" : "false")
    .transform((v) => v === "true" || v === "1");

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid Postgres connection string"),

  // Clerk (required by the API server, not by offline scripts)
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),

  // Groq LLM
  GROQ_API_KEY: z.string().optional(),
  GROQ_CHAT_MODEL: z.string().default("openai/gpt-oss-120b"),
  GROQ_FAST_MODEL: z.string().default("openai/gpt-oss-20b"),

  // Local embedding + reranking models (ONNX, run in-process)
  EMBEDDING_MODEL: z.string().default("Xenova/bge-small-en-v1.5"),
  RERANK_MODEL: z.string().default("Xenova/ms-marco-MiniLM-L-6-v2"),
  RAG_RERANK: bool(true),
  MODEL_CACHE_DIR: z.string().default(".model-cache"),

  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean),
  isProd: parsed.data.NODE_ENV === "production",
};

/** Fail fast when the HTTP server starts without the secrets it needs. */
function assertServerEnv() {
  const missing = ["CLERK_SECRET_KEY", "CLERK_PUBLISHABLE_KEY", "GROQ_API_KEY"].filter((k) => !env[k]);
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}

module.exports = { env, assertServerEnv };
