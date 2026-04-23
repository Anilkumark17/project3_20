const { Pinecone } = require("@pinecone-database/pinecone");

// Strategy for storing vectors in Pinecone
class PineconeStorageStrategy {
  constructor() {
    this.client = null;
    this.index = null;
  }

  _initializeClient() {
    if (!this.client) {
      const apiKey = process.env.PINECONE_API_KEY;
      
      if (!apiKey) {
        throw new Error("PINECONE_API_KEY not configured");
      }
      
      this.client = new Pinecone({ apiKey });
      const indexName = process.env.PINECONE_INDEX_NAME || "quickstart";
      this.index = this.client.index(indexName);
    }
  }

  async store(namespace, vectors) {
    this._initializeClient();
    await this.index.namespace(namespace).upsert(vectors);
  }

  async query(namespace, vector, topK = 10) {
    this._initializeClient();
    
    const response = await this.index.namespace(namespace).query({
      vector,
      topK,
      includeMetadata: true,
    });
    
    return response.matches || [];
  }

  async deleteNamespace(namespace) {
    this._initializeClient();
    await this.index.namespace(namespace).deleteAll();
  }
}

module.exports = PineconeStorageStrategy;
