const axios = require('axios');

class EmbeddingService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.embeddingModel = 'text-embedding-3-small';
    this.dimension = 1536;
  }

  async generateEmbedding(text) {
    if (!this.apiKey) {
      console.warn('OpenAI API key not found, using mock embeddings');
      return this.generateMockEmbedding();
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          model: this.embeddingModel,
          input: text,
          encoding_format: 'float'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation failed:', error.message);
      return this.generateMockEmbedding();
    }
  }

  async generateBatchEmbeddings(texts) {
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.warn('⚠ OpenAI API key not configured, using mock embeddings');
      const mockEmbeddings = texts.map(() => this.generateMockEmbedding());
      console.log(`  Generated ${mockEmbeddings.length} mock embeddings`);
      return mockEmbeddings;
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          model: this.embeddingModel,
          input: texts,
          encoding_format: 'float'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data.map(item => item.embedding);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn('⚠ OpenAI rate limit hit (429), falling back to mock embeddings');
        console.warn('  Tip: Wait a few minutes or upgrade your OpenAI plan');
      } else {
        console.error('Batch embedding generation failed:', error.message);
      }
      console.log(`  Generating ${texts.length} mock embeddings as fallback...`);
      const mockEmbeddings = texts.map(() => this.generateMockEmbedding());
      console.log(`  ✓ Generated ${mockEmbeddings.length} mock embeddings (dimension: ${mockEmbeddings[0]?.length})`);
      return mockEmbeddings;
    }
  }

  generateMockEmbedding() {
    const embedding = [];
    for (let i = 0; i < this.dimension; i++) {
      embedding.push(Math.random() * 2 - 1);
    }
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }

  getDimension() {
    return this.dimension;
  }
}

module.exports = new EmbeddingService();
