const axios = require('axios');

class FastRouterClient {
  constructor() {
    this.apiKey = process.env.FASTROUTER_API_KEY;
    this.baseUrl = process.env.FASTROUTER_URL || 'https://go.fastrouter.ai/api/v1/chat/completions';
    this.model = process.env.FASTROUTER_MODEL || 'google/gemini-2.5-pro';
    
    if (!this.apiKey) {
      throw new Error('FASTROUTER_API_KEY is required');
    }
  }
  

  async chat(messages, options = {}) {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
          ...options
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('FastRouter API Error:', error.response?.data || error.message);
      throw new Error(`FastRouter request failed: ${error.message}`);
    }
  }

  async rerankAndExplain(userQuery, retrievedCourses, userContext) {
    const prompt = this.buildRerankingPrompt(userQuery, retrievedCourses, userContext);
    
    const messages = [
      {
        role: 'system',
        content: 'You are an expert academic advisor specializing in course recommendations. Analyze courses and provide personalized, actionable recommendations with clear reasoning.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.chat(messages, { temperature: 0.3 });
    return this.parseRecommendations(response);
  }

  buildRerankingPrompt(userQuery, courses, context) {
    return `
USER PROFILE:
- Goal: ${context.goal || 'Not specified'}
- Current Program: ${context.currentProgram || 'Not specified'}
- Completed Courses: ${context.completedCourses?.join(', ') || 'None'}
- Interests: ${context.interests?.join(', ') || 'Not specified'}
- Season: ${context.season}

USER QUERY: ${userQuery}

RETRIEVED COURSES (from semantic search):
${courses.map((c, i) => `
${i + 1}. ${c.title} (${c.code})
   Credits: ${c.credits}
   Difficulty: ${c.difficulty}/5
   Description: ${c.description}
   Program: ${c.program}
   Similarity Score: ${c.score?.toFixed(3)}
`).join('\n')}

TASK:
1. Rerank these courses based on user's goal, interests, and background
2. Select TOP 5 most relevant courses
3. For each course, provide:
   - Why it matches their goals
   - How it builds on their completed courses
   - Specific learning outcomes relevant to their interests
   - Match score (0-1)

OUTPUT FORMAT (strict JSON):
{
  "recommendations": [
    {
      "title": "Course Title",
      "code": "CS1.234",
      "credits": 4,
      "difficulty": 3,
      "reason": "Detailed explanation of why this course is recommended",
      "matchScore": 0.95,
      "keyOutcomes": ["outcome1", "outcome2"],
      "prerequisiteAlignment": "How this builds on completed courses"
    }
  ]
}

Return ONLY valid JSON, no markdown formatting.
`;
  }

  parseRecommendations(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse FastRouter response:', error);
      return { recommendations: [] };
    }
  }
}

module.exports = new FastRouterClient();
