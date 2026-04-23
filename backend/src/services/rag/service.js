const repository = require("./repository");
const PDFProcessingContext = require("./PDFProcessingContext");

class RAGService {
  constructor() {
    this.pdfProcessor = new PDFProcessingContext();
  }

  async processAndStoreDocument(filePath, fileName, semester) {
    console.log(`\n📚 Processing: ${fileName} (${semester})`);
    
    const namespace = `${semester}-${Date.now()}`;
    
    // Process PDF using strategy pattern pipeline
    const result = await this.pdfProcessor.process(filePath, namespace);
    
    // Store document metadata in database
    const document = await repository.create({
      name: fileName,
      description: `${semester.charAt(0).toUpperCase() + semester.slice(1)} semester courses`,
      semester: semester.toLowerCase(),
      pageNum: result.pages,
      vectorCount: result.chunks.length,
      namespace,
    });

    // Store chunks in database
    const chunksToStore = result.chunks.map((chunk, index) => ({
      documentId: document.id,
      vectorId: `${namespace}-${index}`,
      courseCode: chunk.courseCode,
      courseTitle: chunk.courseTitle,
      content: chunk.content,
      pageNumber: null,
      chunkIndex: chunk.chunkIndex,
      metadata: chunk.metadata,
    }));

    if (chunksToStore.length > 0) {
      await repository.createChunksBatch(chunksToStore);
      console.log(`✅ Stored ${chunksToStore.length} chunks in database\n`);
    }
    
    return document;
  }

  async getDocumentsBySemester(semester) {
    return await repository.findBySemester(semester.toLowerCase());
  }

  async getAllDocuments() {
    return await repository.findAll();
  }

  async getDocumentWithChunks(namespace) {
    const document = await repository.findByNamespace(namespace);
    
    if (!document) {
      throw new Error("Document not found");
    }

    const chunks = await repository.findChunksByDocumentId(document.id);
    
    return {
      ...document,
      chunks,
    };
  }

  async searchCourses(semester, query, topK = 10) {
    const documents = await repository.findBySemester(semester.toLowerCase());
    
    if (documents.length === 0) {
      return [];
    }

    const document = documents[0];
    
    // Use Pinecone for semantic search
    const matches = await this.pdfProcessor.search(document.namespace, query, topK);
    
    // Fetch full chunk data from database
    const results = [];
    for (const match of matches) {
      const chunk = await repository.findChunkByVectorId(match.id);
      if (chunk) {
        results.push({
          ...chunk,
          score: match.score,
        });
      }
    }

    return results;
  }

  async deleteDocument(namespace) {
    const document = await repository.findByNamespace(namespace);
    
    if (!document) {
      throw new Error("Document not found");
    }

    // Delete from Pinecone
    await this.pdfProcessor.deleteNamespace(namespace);
    
    // Delete from database
    await repository.deleteChunksByDocumentId(document.id);
    await repository.delete(document.id);
  }
}

module.exports = new RAGService();
