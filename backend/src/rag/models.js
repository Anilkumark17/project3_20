/**
 * Local ONNX models (via transformers.js), loaded lazily once per process.
 *  - Embedder: bge-small-en-v1.5 (384-d, CLS pooling, L2-normalised)
 *  - Reranker: ms-marco-MiniLM-L-6-v2 cross-encoder
 * Running them in-process means no embedding API key, no per-call cost, and
 * query embeddings in ~10-30 ms after warm-up.
 */
const path = require("path");
const { env } = require("../config/env");
const { EMBEDDING_DIM } = require("../db/schema");

// bge models expect this instruction on queries (not on passages).
const BGE_QUERY_PREFIX = "Represent this sentence for searching relevant passages: ";

let transformersPromise = null;
function loadTransformers() {
  if (!transformersPromise) {
    transformersPromise = import("@huggingface/transformers").then((t) => {
      t.env.cacheDir = path.resolve(__dirname, "../..", env.MODEL_CACHE_DIR);
      return t;
    });
  }
  return transformersPromise;
}

let embedderPromise = null;
function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = loadTransformers().then((t) =>
      t.pipeline("feature-extraction", env.EMBEDDING_MODEL, { dtype: "q8" })
    );
    embedderPromise.catch(() => (embedderPromise = null));
  }
  return embedderPromise;
}

let rerankerPromise = null;
function getReranker() {
  if (!rerankerPromise) {
    rerankerPromise = loadTransformers().then(async (t) => ({
      tokenizer: await t.AutoTokenizer.from_pretrained(env.RERANK_MODEL),
      model: await t.AutoModelForSequenceClassification.from_pretrained(env.RERANK_MODEL, { dtype: "q8" }),
    }));
    rerankerPromise.catch(() => (rerankerPromise = null));
  }
  return rerankerPromise;
}

async function embed(texts, { batchSize = 32 } = {}) {
  const extractor = await getEmbedder();
  const out = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const tensor = await extractor(texts.slice(i, i + batchSize), { pooling: "cls", normalize: true });
    out.push(...tensor.tolist());
  }
  if (out[0] && out[0].length !== EMBEDDING_DIM) {
    throw new Error(`Embedding model returned ${out[0].length} dims; schema expects ${EMBEDDING_DIM}`);
  }
  return out;
}

const embedPassages = (texts) => embed(texts);
const embedQuery = async (text) => (await embed([BGE_QUERY_PREFIX + text]))[0];

/** Cross-encoder relevance logits for (query, passage) pairs. Higher is more relevant. */
async function rerankScores(query, passages) {
  if (!passages.length) return [];
  const { tokenizer, model } = await getReranker();
  const inputs = tokenizer(new Array(passages.length).fill(query), {
    text_pair: passages,
    padding: true,
    truncation: true,
    max_length: 384,
  });
  const { logits } = await model(inputs);
  return logits.tolist().map((row) => row[0]);
}

async function warmUp({ reranker = env.RAG_RERANK } = {}) {
  await embedQuery("warm up");
  if (reranker) await rerankScores("warm up", ["warm up"]);
}

module.exports = { embedPassages, embedQuery, rerankScores, warmUp };
