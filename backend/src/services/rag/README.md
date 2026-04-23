# RAG Service - Strategy Pattern Implementation

## Architecture Overview

This RAG (Retrieval-Augmented Generation) service uses the **Strategy Pattern** to process PDF course catalogs and store them in Pinecone vector database.

## Strategy Pattern Structure

```
PDFProcessingContext (Context)
├── PDFExtractionStrategy      - Extract text from PDF files
├── TextCleaningStrategy        - Clean and normalize text
├── CourseChunkingStrategy      - Split text into course chunks
├── EmbeddingStrategy           - Generate vector embeddings
└── PineconeStorageStrategy     - Store/query vectors in Pinecone
```

## Processing Pipeline

```
PDF File
  ↓
[1. PDFExtractionStrategy]  → Extract raw text
  ↓
[2. TextCleaningStrategy]   → Clean and normalize
  ↓
[3. CourseChunkingStrategy] → Split into course sections
  ↓
[4. EmbeddingStrategy]      → Generate 1536-dim vectors
  ↓
[5. PineconeStorageStrategy] → Store in Pinecone
  ↓
PostgreSQL (metadata)
```

## Usage

### Seeding Documents
```bash
npm run seed:documents
```

### API Endpoints
```
GET  /api/rag                    - List all documents
GET  /api/rag?semester=monsoon   - Filter by semester
GET  /api/rag/:namespace         - Get document with chunks
GET  /api/rag/search/:semester?q=query - Semantic search
DELETE /api/rag/:namespace       - Delete document
```

### Example Search
```bash
curl "http://localhost:5000/api/rag/search/monsoon?q=machine learning"
```

## Course Chunk Format

Each course is stored as a single chunk containing:
```json
{
  "courseCode": "CS2.501",
  "courseTitle": "Advanced Computer Architecture",
  "content": "Title of the Course: Advanced Computer Architecture\nName of the Faculty: Suresh Purini\n...",
  "metadata": {
    "faculty": "Suresh Purini",
    "credits": 4,
    "ltp": "3-1-0"
  }
}
```

## Strategy Pattern Benefits

1. **Open/Closed Principle** - Easy to add new strategies without modifying existing code
2. **Single Responsibility** - Each strategy has one clear purpose
3. **Testability** - Strategies can be tested independently
4. **Flexibility** - Strategies can be swapped at runtime

## Extending the System

### Add a new extraction strategy:
```javascript
class AdvancedPDFExtractionStrategy {
  async extract(filePath) {
    // Your implementation
  }
}

// Use it
const context = new PDFProcessingContext();
context.setExtractionStrategy(new AdvancedPDFExtractionStrategy());
```

### Add a new embedding strategy:
```javascript
class OpenAIEmbeddingStrategy {
  generate(text) {
    // Call OpenAI API
  }
}

context.setEmbeddingStrategy(new OpenAIEmbeddingStrategy());
```
