const db = require("../../db");
const { documents, courseChunks } = require("../../db/schema");
const { eq, and } = require("drizzle-orm");

class DocumentRepository {
  async create(documentData) {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  }

  async findByNamespace(namespace) {
    const [document] = await db.select().from(documents).where(eq(documents.namespace, namespace));
    return document;
  }

  async findBySemester(semester) {
    return await db.select().from(documents).where(eq(documents.semester, semester));
  }

  async findAll() {
    return await db.select().from(documents);
  }

  async update(id, updateData) {
    const [updated] = await db
      .update(documents)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    
    return updated;
  }

  async delete(id) {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async createChunk(chunkData) {
    const [chunk] = await db.insert(courseChunks).values(chunkData).returning();
    return chunk;
  }

  async createChunksBatch(chunksData) {
    return await db.insert(courseChunks).values(chunksData).returning();
  }

  async findChunksByDocumentId(documentId) {
    return await db.select().from(courseChunks).where(eq(courseChunks.documentId, documentId));
  }

  async findChunkByVectorId(vectorId) {
    const [chunk] = await db.select().from(courseChunks).where(eq(courseChunks.vectorId, vectorId));
    return chunk;
  }

  async deleteChunksByDocumentId(documentId) {
    await db.delete(courseChunks).where(eq(courseChunks.documentId, documentId));
  }
}

module.exports = new DocumentRepository();
