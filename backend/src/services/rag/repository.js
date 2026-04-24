const axios = require("axios");

/**
 * RAG Repository – FastRouter Client Wrapper
 * Used solely for Chat Completions in this Graph RAG implementation.
 */
class RAGRepository {
  constructor() {
    if (!process.env.FASTROUTER_API_KEY) {
      throw new Error("FASTROUTER_API_KEY is not set in environment variables.");
    }
    this.apiKey = process.env.FASTROUTER_API_KEY;
    this.baseUrl = process.env.FASTROUTER_URL || "https://go.fastrouter.ai/api/v1/chat/completions";
    this.model = process.env.FASTROUTER_MODEL || "google/gemini-2.5-pro";
  }

  /**
   * Send messages to FastRouter Chat API.
   * @param {Array<{role: string, content: string}>} messages 
   */
  async chat(messages) {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      return response.data;
    } catch (error) {
      console.error("FastRouter Chat API Error:", error.response?.data || error.message);
      throw new Error(`API request failed with status ${error.response?.status}`);
    }
  }

  /**
   * Stream chat with FastRouter Chat API.
   * @param {Array<{role: string, content: string}>} messages 
   */
  async chatStream(messages) {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: true,
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
          responseType: "stream",
        }
      );
      return response.data;
    } catch (error) {
      console.error("FastRouter Stream API Error:", error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new RAGRepository();
