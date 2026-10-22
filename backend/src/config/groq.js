const Groq = require("groq-sdk");
const { env } = require("./env");

let client = null;

function getClient() {
  if (!client) {
    if (!env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");
    client = new Groq({ apiKey: env.GROQ_API_KEY, maxRetries: 2, timeout: 60_000 });
  }
  return client;
}

// gpt-oss models reason before answering; keep effort low for interactive latency
// and keep the reasoning out of the returned content.
function modelOptions(model) {
  return model.startsWith("openai/gpt-oss")
    ? { reasoning_effort: "low", include_reasoning: false }
    : {};
}

async function chat(messages, { model = env.GROQ_CHAT_MODEL, temperature = 0.3, maxTokens = 1500, signal } = {}) {
  const res = await getClient().chat.completions.create(
    { model, messages, temperature, max_completion_tokens: maxTokens, ...modelOptions(model) },
    { signal }
  );
  return { content: res.choices[0]?.message?.content ?? "", usage: res.usage, model };
}

/** Chat completion constrained to a JSON object, parsed and validated with a zod schema. */
async function chatJSON(messages, schema, { model = env.GROQ_CHAT_MODEL, temperature = 0.2, maxTokens = 2000 } = {}) {
  const res = await getClient().chat.completions.create({
    model,
    messages,
    temperature,
    max_completion_tokens: maxTokens,
    response_format: { type: "json_object" },
    ...modelOptions(model),
  });
  const raw = res.choices[0]?.message?.content ?? "{}";
  return { data: schema.parse(JSON.parse(raw)), usage: res.usage, model };
}

/** Async iterable of content deltas; the final chunk carries usage (x_groq.usage). */
async function chatStream(messages, { model = env.GROQ_CHAT_MODEL, temperature = 0.3, maxTokens = 1500, signal } = {}) {
  return getClient().chat.completions.create(
    { model, messages, temperature, max_completion_tokens: maxTokens, stream: true, ...modelOptions(model) },
    { signal }
  );
}

module.exports = { chat, chatJSON, chatStream };
