const PDFExtractionStrategy = require("./strategies/PDFExtractionStrategy");
const TextCleaningStrategy = require("./strategies/TextCleaningStrategy");
const CourseChunkingStrategy = require("./strategies/CourseChunkingStrategy");
const EmbeddingStrategy = require("./strategies/EmbeddingStrategy");
const PineconeStorageStrategy = require("./strategies/PineconeStorageStrategy");

// Context class that orchestrates the PDF processing pipeline
class PDFProcessingContext {
  constructor() {
    // Initialize all strategies
    this.extractionStrategy = new PDFExtractionStrategy();
    this.cleaningStrategy = new TextCleaningStrategy();
    this.chunkingStrategy = new CourseChunkingStrategy();
    this.embeddingStrategy = new EmbeddingStrategy();
    this.storageStrategy = new PineconeStorageStrategy();
  }

  // Allow strategy replacement if needed
  setExtractionStrategy(strategy) {
    this.extractionStrategy = strategy;
  }

  setCleaningStrategy(strategy) {
    this.cleaningStrategy = strategy;
  }

  setChunkingStrategy(strategy) {
    this.chunkingStrategy = strategy;
  }

  setEmbeddingStrategy(strategy) {
    this.embeddingStrategy = strategy;
  }

  setStorageStrategy(strategy) {
    this.storageStrategy = strategy;
  }

  // Main processing pipeline
  async process(filePath, namespace) {
    console.log("📄 Step 1: Extracting text from PDF...");
    const extracted = await this.extractionStrategy.extract(filePath);
    
    console.log("🧹 Step 2: Cleaning text...");
    const cleanedText = this.cleaningStrategy.clean(extracted.text);
    
    console.log("✂️  Step 3: Chunking into courses...");
    const chunks = this.chunkingStrategy.chunk(cleanedText);
    
    console.log("🔢 Step 4: Generating embeddings...");
    const vectors = chunks.map((chunk, index) => ({
      id: `${namespace}-${index}`,
      values: this.embeddingStrategy.generate(chunk.content),
      metadata: {
        courseCode: chunk.courseCode,
        courseTitle: chunk.courseTitle,
        chunkIndex: chunk.chunkIndex,
        ...chunk.metadata,
      },
    }));
    
    console.log("💾 Step 5: Storing in Pinecone...");
    await this.storageStrategy.store(namespace, vectors);
    
    return {
      pages: extracted.pages,
      chunks,
      vectors,
    };
  }

  async search(namespace, query, topK = 10) {
    const queryEmbedding = this.embeddingStrategy.generate(query);
    return await this.storageStrategy.query(namespace, queryEmbedding, topK);
  }

  async deleteNamespace(namespace) {
    await this.storageStrategy.deleteNamespace(namespace);
  }
}

module.exports = PDFProcessingContext;
