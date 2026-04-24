# 🚀 RAG Course Recommendation System - Implementation Guide

## 📋 Overview

Production-ready RAG system for intelligent course recommendations using:
- **Pinecone** for vector storage (namespace-based filtering)
- **OpenAI** for embeddings
- **FastRouter AI** for intelligent reranking with Gemini 2.5 Pro
- **Express.js** backend with clean service architecture

---

## 🏗️ Architecture

```
User Request
    ↓
POST /api/rag/recommendations
    ↓
Controller (validation)
    ↓
Service (business logic)
    ├→ Build semantic query
    ├→ Generate embedding (OpenAI)
    ├→ Search Pinecone (namespace: monsoon/spring)
    ├→ Deduplicate courses
    ├→ Filter completed courses
    └→ Rerank with FastRouter AI (Gemini 2.5 Pro)
    ↓
Repository (Pinecone operations)
    ↓
Response with top 5 personalized recommendations
```

---

## 📁 File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── embeddings.js          # OpenAI embedding service
│   │   └── fastrouter.js          # FastRouter AI client
│   ├── services/
│   │   └── rag/
│   │       ├── repository.js      # Pinecone operations
│   │       ├── service.js         # Business logic
│   │       ├── controller.js      # HTTP handlers
│   │       ├── routes.js          # API routes
│   │       └── README.md          # Service docs
│   └── utils/
│       ├── courseChunker.js       # Field-based chunking
│       ├── monsoon.json           # Monsoon courses
│       └── spring.json            # Spring courses
├── scripts/
│   └── ingestCourses.js           # Pinecone ingestion
└── package.json
```

---

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

Required packages:
- `@pinecone-database/pinecone` - Vector database
- `axios` - HTTP client
- `dotenv` - Environment variables

### 2. Configure Environment

Create/update `.env`:

```env
# Pinecone
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=courses

# FastRouter AI
FASTROUTER_API_KEY=your_fastrouter_api_key_here
FASTROUTER_URL=https://go.fastrouter.ai/api/v1/chat/completions
FASTROUTER_MODEL=google/gemini-2.5-pro

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Prepare Course Data

Ensure JSON files exist at:
- `src/utils/monsoon.json`
- `src/utils/spring.json`

Each course should have:
```json
{
  "id": 135,
  "code": "CS3.401",
  "title": "Distributed Systems",
  "credits": 4,
  "difficulty": 2,
  "description": "Course description...",
  "program": "CSIS",
  "semester": 1,
  "learning_outcomes": ["outcome1", "outcome2"],
  "assessments": {
    "assignments": 20,
    "quizzes": 10,
    "mid_exam": 30,
    "project": 40
  },
  "prerequisites": ["CS1.101"]
}
```

---

## 📊 Data Ingestion

### Run Ingestion Script

```bash
npm run ingest:courses
```

### What It Does

1. **Loads JSON files** from `src/utils/`
2. **Creates semantic chunks** for each course:
   - Identity chunk (code, title, credits)
   - Summary chunk (description)
   - Learning outcomes chunk
   - Assessments chunk
   - Prerequisites chunk
3. **Generates embeddings** using OpenAI (1536-dim)
4. **Stores in Pinecone** with namespaces:
   - `monsoon` namespace for monsoon courses
   - `spring` namespace for spring courses

### Expected Output

```
🚀 Starting Course Ingestion Pipeline

✓ Connected to Pinecone index: courses

==================================================
Processing MONSOON courses
==================================================
✓ Loaded 89 courses from monsoon.json
Generated 356 chunks from 89 courses (monsoon)
Generating embeddings for 356 chunks...
Upserting 356 vectors to namespace: monsoon
  ✓ Upserted batch 1/4
  ✓ Upserted batch 2/4
  ✓ Upserted batch 3/4
  ✓ Upserted batch 4/4
✓ Successfully ingested monsoon courses

==================================================
Processing SPRING courses
==================================================
✓ Loaded 75 courses from spring.json
Generated 300 chunks from 75 courses (spring)
Generating embeddings for 300 chunks...
Upserting 300 vectors to namespace: spring
  ✓ Upserted batch 1/3
  ✓ Upserted batch 2/3
  ✓ Upserted batch 3/3
✓ Successfully ingested spring courses

==================================================
✅ INGESTION COMPLETE
==================================================
Total chunks ingested: 656
  - Monsoon: 356 chunks
  - Spring: 300 chunks

Namespaces created:
  - monsoon
  - spring
```

---

## 🔌 API Usage

### 1. Get Personalized Recommendations

**Endpoint:** `POST /api/rag/recommendations`

**Request:**
```json
{
  "season": "monsoon",
  "goal": "AI Engineer",
  "currentProgram": "BTech CSE",
  "completedCourses": ["Python Basics", "DBMS"],
  "interests": ["Machine Learning", "Backend Development"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "Career goal: AI Engineer. Current program: BTech CSE. Interests: Machine Learning, Backend Development",
    "season": "monsoon",
    "totalRetrieved": 20,
    "totalUnique": 15,
    "totalFiltered": 12,
    "recommendedCourses": [
      {
        "title": "Advanced Natural Language Processing",
        "code": "CS7.501",
        "credits": 4,
        "difficulty": 3,
        "reason": "Perfect match for AI Engineer goal. Covers transformers, BERT, and modern NLP techniques essential for AI development.",
        "matchScore": 0.95,
        "keyOutcomes": [
          "Build transformer-based models",
          "Implement BERT for NLP tasks",
          "Deploy production NLP systems"
        ],
        "prerequisiteAlignment": "Builds on your Python Basics foundation with advanced ML concepts"
      },
      {
        "title": "Deep Learning: Theory and Practices",
        "code": "CS7.601",
        "credits": 4,
        "difficulty": 3,
        "reason": "Core course for AI engineers covering CNNs, RNNs, and modern architectures with hands-on implementation.",
        "matchScore": 0.92,
        "keyOutcomes": [
          "Design deep neural networks",
          "Implement CNNs and RNNs",
          "Optimize model performance"
        ],
        "prerequisiteAlignment": "Directly applicable to Machine Learning interest"
      }
    ]
  }
}
```

### 2. Get Seasonal Courses with Filters

**Endpoint:** `GET /api/rag/courses/:season`

**Examples:**

```bash
# All monsoon courses
GET /api/rag/courses/monsoon

# Filter by program
GET /api/rag/courses/monsoon?program=CSIS

# Filter by difficulty
GET /api/rag/courses/spring?difficulty=3

# Multiple filters
GET /api/rag/courses/monsoon?program=CSE&minCredits=4&maxCredits=4
```

**Response:**
```json
{
  "success": true,
  "season": "monsoon",
  "count": 12,
  "courses": [
    {
      "id": 135,
      "title": "Distributed Systems",
      "code": "CS3.401",
      "credits": 4,
      "difficulty": 2,
      "description": "Examines distributed computing principles...",
      "program": "CSIS",
      "semester": 1,
      "score": 0.87
    }
  ]
}
```

### 3. Get Index Statistics

**Endpoint:** `GET /api/rag/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "namespaces": {
      "monsoon": {
        "vectorCount": 356
      },
      "spring": {
        "vectorCount": 300
      }
    },
    "dimension": 1536,
    "indexFullness": 0.0
  }
}
```

---

## 🎯 How It Works

### 1. Chunking Strategy

Each course is split into **5 semantic chunks**:

```javascript
// Identity Chunk
"Course: Distributed Systems
Code: CS3.401
Credits: 4
Difficulty: 2/5
Program: CSIS
Semester: 1"

// Summary Chunk
"Distributed Systems (CS3.401):
Examines the principles and design of distributed computing systems...
This is a 4-credit course in the CSIS program, rated 2/5 difficulty."

// Learning Outcomes Chunk
"Learning Outcomes for Distributed Systems (CS3.401):
1. Understand distributed algorithms
2. Implement consensus protocols
3. Design fault-tolerant systems
..."

// Assessments Chunk
"Assessment Structure for Distributed Systems (CS3.401):
- assignments: 20%
- quizzes: 10%
- mid_exam: 30%
- project: 40%
Total: 100%"

// Prerequisites Chunk
"Prerequisites for Distributed Systems (CS3.401):
CS1.101, CS2.201
Students should complete these courses before enrolling."
```

### 2. Namespace Strategy

**Why Namespaces?**
- ✅ Faster queries (search only relevant season)
- ✅ Better organization
- ✅ Easier maintenance
- ✅ Cost-effective

**Namespaces:**
- `monsoon` - All monsoon semester courses
- `spring` - All spring semester courses

### 3. Recommendation Flow

```
1. User submits request with season, goal, interests
2. Build semantic query from user context
3. Generate embedding for query (OpenAI)
4. Search Pinecone in season namespace (top 20)
5. Transform results to course objects
6. Deduplicate (same course, multiple chunks)
7. Filter out completed courses
8. Send to FastRouter AI for reranking
9. Return top 5 with explanations
```

### 4. Deduplication Logic

```javascript
// Multiple chunks per course → Keep highest scoring
Course CS3.401 appears 3 times:
- Identity chunk: score 0.85
- Summary chunk: score 0.92  ← KEEP THIS
- Outcomes chunk: score 0.78

Result: One entry with score 0.92
```

---

## 🎓 Best Practices

### ✅ DO

1. **Always specify season** in recommendations
2. **Use namespaces** for filtering (not metadata filters)
3. **Deduplicate results** before presenting
4. **Filter completed courses** to avoid redundancy
5. **Use FastRouter reranking** for personalized results
6. **Monitor Pinecone stats** regularly

### ❌ DON'T

1. Don't query without season (searches all namespaces)
2. Don't skip deduplication (duplicate courses in results)
3. Don't ignore completed courses filter
4. Don't bypass FastRouter reranking (loses personalization)
5. Don't hardcode API keys

---

## 🔍 Troubleshooting

### Issue: "Cannot find module 'axios'"
```bash
npm install axios
```

### Issue: "PINECONE_API_KEY is required"
Check `.env` file has correct API key

### Issue: "No courses found"
- Verify ingestion completed successfully
- Check namespace exists in Pinecone
- Verify season parameter is correct

### Issue: "Embedding generation failed"
- Check OPENAI_API_KEY in `.env`
- Verify API key has credits
- Falls back to mock embeddings if key missing

### Issue: "FastRouter request failed"
- Check FASTROUTER_API_KEY in `.env`
- Verify API endpoint is correct
- Check network connectivity

---

## 📈 Performance Optimization

### Current Setup
- **Embedding Model:** `text-embedding-3-small` (1536-dim)
- **Batch Size:** 100 vectors per upsert
- **Top K:** 20 initial results
- **Final Results:** 5 reranked recommendations

### Optimization Tips

1. **Increase batch size** for faster ingestion (max 1000)
2. **Cache embeddings** for frequently searched queries
3. **Use metadata filters** for additional filtering
4. **Adjust topK** based on result quality
5. **Monitor Pinecone usage** to optimize costs

---

## 🚀 Next Steps

1. **Run ingestion:** `npm run ingest:courses`
2. **Start server:** `npm run dev`
3. **Test API:** Use Postman/curl to test endpoints
4. **Monitor:** Check Pinecone dashboard for stats
5. **Optimize:** Adjust topK, filters based on results

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review service README: `src/services/rag/README.md`
3. Check Pinecone dashboard
4. Review FastRouter documentation

---

**Built with ❤️ for intelligent course recommendations**
