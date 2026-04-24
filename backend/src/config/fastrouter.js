const OpenAI = require("openai");

class FastRouterClient {
  constructor() {
    if (!process.env.FASTROUTER_API_KEY) {
      throw new Error("FASTROUTER_API_KEY is required");
    }
    this.model = process.env.FASTROUTER_MODEL || "anthropic/claude-haiku-4-5";
    this.client = new OpenAI({
      baseURL: process.env.FASTROUTER_URL || "https://go.fastrouter.ai/api/v1",
      apiKey: process.env.FASTROUTER_API_KEY,
    });
  }

  async chat(messages, options = {}) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 2000,
    });
    return response.choices[0].message.content;
  }

  async rerankAndExplain(userQuery, retrievedCourses, userContext) {
    const prompt = this.buildRerankingPrompt(userQuery, retrievedCourses, userContext);
    const response = await this.chat(
      [{ role: "user", content: prompt }],
      { temperature: 0.3 }
    );
    return this.parseRecommendations(response);
  }

  buildRerankingPrompt(userQuery, courses, context) {
    return `You are an expert academic advisor. Return ONLY valid JSON, no markdown.

USER PROFILE:
- Program: ${context.currentProgram || "Not specified"}
- Goal: ${context.goal || "Not specified"}
- Completed Courses: ${context.completedCourses?.join(", ") || "None"}
- Season: ${context.season}

USER QUERY: ${userQuery}

COURSES TO RANK:
${courses.map((c, i) => `${i + 1}. ${c.title} (${c.code}) — ${c.credits} credits, difficulty ${c.difficulty}/5 — ${c.description}`).join("\n")}

Select the TOP 5 most relevant courses and return this exact JSON:
{
  "recommendations": [
    {
      "title": "Course Title",
      "code": "CS1.234",
      "credits": 4,
      "difficulty": 3,
      "reason": "Why this course fits the student's goals"
    }
  ]
}`;
  }

  parseRecommendations(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Failed to parse FastRouter response:", error);
      return { recommendations: [] };
    }
  }
}

module.exports = new FastRouterClient();
