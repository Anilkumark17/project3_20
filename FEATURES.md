# 🎓 Course Recommendation System - Features Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Backend Features](#backend-features)
  - [Authentication System](#1-authentication-system)
  - [Profile Management](#2-profile-management)
  - [Course Management](#3-course-management)
  - [PageIndex Graph RAG](#4-pageindex-graph-rag-system)
  - [Recommendations](#5-recommendations-system)
- [API Endpoints](#api-endpoints)
- [Frontend Features](#frontend-features)

---

## Overview

A comprehensive course recommendation system built with a modern tech stack, featuring AI-powered course recommendations using Graph RAG and FastRouter integration.

---

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **AI/ML**: 
  - FastRouter API (Google Gemini 2.5 Pro)
  - PageIndex SDK for document processing
- **Validation**: Zod
- **HTTP Client**: Axios

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Authentication**: Clerk
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

---

## Database Schema

### 1. **Users Table**
```javascript
{
  id: serial (Primary Key)
  clerkId: text (Unique, Not Null)
  email: text (Not Null)
  name: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 2. **Profiles Table**
```javascript
{
  id: serial (Primary Key)
  userId: integer (Foreign Key -> users.id)
  program: text
  semester: integer
  goal: text
  creditsCompleted: integer (Default: 0)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 3. **Courses Table**
```javascript
{
  id: serial (Primary Key)
  code: text (Unique, Not Null)
  title: text (Not Null)
  credits: integer (Not Null)
  difficulty: integer
  description: text
  program: text
  semester: integer
  createdAt: timestamp
}
```

### 4. **Completed Courses Table**
```javascript
{
  id: serial (Primary Key)
  userId: integer (Foreign Key -> users.id)
  courseId: integer (Foreign Key -> courses.id)
  grade: text
  completedAt: timestamp
}
```

### 5. **Ratings Table**
```javascript
{
  id: serial (Primary Key)
  userId: integer (Foreign Key -> users.id)
  courseId: integer (Foreign Key -> courses.id)
  difficulty: integer
  workload: integer
  rating: integer (Not Null)
  review: text
  createdAt: timestamp
}
```

### 6. **Recommendations Table**
```javascript
{
  id: serial (Primary Key)
  userId: integer (Foreign Key -> users.id)
  courseId: integer (Foreign Key -> courses.id)
  reason: text
  priority: integer
  generatedAt: timestamp
}
```

### 7. **Documents Table**
```javascript
{
  id: serial (Primary Key)
  name: text (Not Null)
  description: text
  semester: text (Not Null)
  pageNum: integer
  vectorCount: integer (Default: 0)
  namespace: text (Unique, Not Null)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 8. **Course Chunks Table**
```javascript
{
  id: serial (Primary Key)
  documentId: integer (Foreign Key -> documents.id)
  vectorId: text (Unique, Not Null)
  courseCode: text
  courseTitle: text (Not Null)
  content: text (Not Null)
  pageNumber: integer
  chunkIndex: integer
  metadata: json
  createdAt: timestamp
}
```

---

## Backend Features

### 1. Authentication System

#### **Features**
- ✅ Clerk integration for secure authentication
- ✅ User synchronization with Clerk
- ✅ User profile management
- ✅ Session management

#### **Endpoints**
```
POST   /api/auth/sync              - Sync user with Clerk
GET    /api/auth/user/:clerkId     - Get user by Clerk ID
GET    /api/auth/profile/:clerkId  - Get user profile
PUT    /api/auth/profile/:clerkId  - Update user profile
```

#### **Key Components**
- **Controller**: `backend/src/services/auth/controller.js`
- **Service**: `backend/src/services/auth/service.js`
- **Repository**: `backend/src/services/auth/repository.js`
- **Validator**: `backend/src/services/auth/validator.js`
- **Routes**: `backend/src/services/auth/routes.js`

#### **Functionality**
1. **User Sync**: Automatically syncs user data from Clerk to local database
2. **Profile Creation**: Creates user profile on first login
3. **Profile Updates**: Allows users to update their academic information
4. **Data Validation**: Uses Zod schemas for request validation

---

### 2. Profile Management

#### **Features**
- ✅ Create and update user profiles
- ✅ Track completed courses
- ✅ Manage academic progress
- ✅ Store user preferences and goals
- ✅ Credits tracking

#### **Endpoints**
```
GET    /api/profile/:clerkId              - Get basic profile
GET    /api/profile/:clerkId/full         - Get full profile with courses
PUT    /api/profile/:clerkId              - Create or update profile
PATCH  /api/profile/:clerkId/:field       - Update specific field
GET    /api/profile/:clerkId/courses      - Get completed courses
POST   /api/profile/:clerkId/courses      - Add completed course
DELETE /api/profile/:clerkId/courses/:id  - Remove completed course
```

#### **Key Components**
- **Controller**: `backend/src/services/profile/controller.js`
- **Service**: `backend/src/services/profile/service.js`
- **Repository**: `backend/src/services/profile/repository.js`
- **Validator**: `backend/src/services/profile/validator.js`

#### **Profile Fields**
- Program (e.g., Computer Science, Data Science)
- Current Semester
- Academic Goals
- Credits Completed
- Completed Courses List

---

### 3. Course Management

#### **Features**
- ✅ Comprehensive course catalog
- ✅ Advanced search and filtering
- ✅ Course CRUD operations
- ✅ Program-based filtering
- ✅ Semester-based filtering
- ✅ Course difficulty ratings

#### **Endpoints**
```
GET    /api/courses                    - Get all courses
GET    /api/courses/catalog            - Get filtered catalog
GET    /api/courses/search             - Search courses
GET    /api/courses/program/:program   - Get courses by program
GET    /api/courses/semester/:semester - Get courses by semester
GET    /api/courses/:id                - Get course by ID
GET    /api/courses/code/:code         - Get course by code
POST   /api/courses                    - Create new course
PUT    /api/courses/:id                - Update course
DELETE /api/courses/:id                - Delete course
```

#### **Key Components**
- **Controller**: `backend/src/services/courses/controller.js`
- **Service**: `backend/src/services/courses/service.js`
- **Repository**: `backend/src/services/courses/repository.js`
- **Validator**: `backend/src/services/courses/validator.js`

#### **Course Data Structure**
- Course Code (Unique identifier)
- Title
- Credits
- Difficulty Level (1-5)
- Description
- Program
- Semester
- Prerequisites (if any)

#### **Data Sources**
- `backend/src/utils/monsoon.json` - Monsoon semester courses
- `backend/src/utils/spring.json` - Spring semester courses

---

### 4. PageIndex Graph RAG System

#### **Features**
- ✅ Graph-based Retrieval-Augmented Generation
- ✅ AI-powered course Q&A
- ✅ Contextual course recommendations
- ✅ Streaming responses (SSE)
- ✅ FastRouter integration (Google Gemini 2.5 Pro)
- ✅ Course relationship mapping
- ✅ Semantic search

#### **Endpoints**
```
POST /api/rag/ask         - Ask a question (regular response)
POST /api/rag/ask/stream  - Ask a question (streaming response)
```

#### **Request Format**
```json
{
  "question": "What are some good courses for Distributed Systems students?",
  "history": [
    {
      "role": "user",
      "content": "Previous question"
    },
    {
      "role": "assistant",
      "content": "Previous answer"
    }
  ]
}
```

#### **Response Format**
```json
{
  "success": true,
  "data": {
    "answer": "Based on the course catalog...",
    "contextUsed": true
  }
}
```

#### **Key Components**
- **Controller**: `backend/src/services/rag/controller.js`
- **Service**: `backend/src/services/rag/service.js`
- **Repository**: `backend/src/services/rag/repository.js`
- **Routes**: `backend/src/services/rag/routes.js`

#### **PageIndex Graph RAG Implementation**

##### **How It Works**
1. **Data Loading**: Loads courses from `monsoon.json` and `spring.json`
2. **Graph Building**: Creates relationships between courses based on:
   - Same program
   - Similar difficulty
   - Overlapping keywords in descriptions (2+ matching words > 4 chars)
3. **Context Retrieval**: 
   - Searches for courses matching query terms
   - Expands to neighboring courses in the graph
   - Returns top 10 contextual courses
4. **AI Response**: Sends context + query to FastRouter (Gemini 2.5 Pro)

##### **FastRouter Configuration**
```javascript
{
  apiKey: process.env.FASTROUTER_API_KEY
  baseUrl: "https://go.fastrouter.ai/api/v1/chat/completions"
  model: "google/gemini-2.5-pro"
  temperature: 0.7
  maxTokens: 2000
}
```

##### **Document Ingestion**
- Script: `backend/scripts/ingestCourses.js`
- Converts JSON courses to text documents
- Uploads to PageIndex for vector storage
- Supports both seasons: `npm run ingest:courses [monsoon|spring]`

#### **Course Chunking**
- **Chunker**: `backend/src/utils/courseChunker.js`
- Splits course documents into semantic chunks
- Stores chunks with metadata in database
- Links chunks to original documents

---

### 5. Recommendations System

#### **Features**
- ✅ Personalized course recommendations
- ✅ AI-powered reranking with FastRouter
- ✅ Context-aware suggestions
- ✅ Match scoring
- ✅ Prerequisite alignment

#### **Status**
- Routes defined but controller implementation pending
- FastRouter client ready for reranking
- Database schema in place

#### **Planned Endpoints**
```
GET /api/recommendations/:userId - Get personalized recommendations
```

#### **FastRouter Reranking**
The system uses FastRouter's Gemini 2.5 Pro to rerank courses based on:
- User's academic goals
- Current program and semester
- Completed courses
- Interests
- Similarity scores from semantic search

**Output includes:**
- Top 5 recommended courses
- Detailed reasoning for each recommendation
- Match score (0-1)
- Key learning outcomes
- Prerequisite alignment

---

## API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sync` | Sync user with Clerk |
| GET | `/api/auth/user/:clerkId` | Get user data |
| GET | `/api/auth/profile/:clerkId` | Get user profile |
| PUT | `/api/auth/profile/:clerkId` | Update profile |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/:clerkId` | Get basic profile |
| GET | `/api/profile/:clerkId/full` | Get full profile |
| PUT | `/api/profile/:clerkId` | Create/update profile |
| PATCH | `/api/profile/:clerkId/:field` | Update specific field |
| GET | `/api/profile/:clerkId/courses` | Get completed courses |
| POST | `/api/profile/:clerkId/courses` | Add completed course |
| DELETE | `/api/profile/:clerkId/courses/:id` | Remove completed course |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/catalog` | Get filtered catalog |
| GET | `/api/courses/search` | Search courses |
| GET | `/api/courses/program/:program` | Filter by program |
| GET | `/api/courses/semester/:semester` | Filter by semester |
| GET | `/api/courses/:id` | Get by ID |
| GET | `/api/courses/code/:code` | Get by code |
| POST | `/api/courses` | Create course |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |

### PageIndex Graph RAG (AI Q&A)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rag/ask` | Ask question (regular) |
| POST | `/api/rag/ask/stream` | Ask question (streaming) |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations/:userId` | Get recommendations (planned) |

---

## Frontend Features

### Pages
1. **Profile Page** (`/profile`)
   - User profile management
   - Program selection
   - Semester tracking
   - Goal setting
   - Completed courses management

2. **Dashboard** (`/dashboard`)
   - Overview of academic progress
   - Quick stats
   - Recent activities

3. **Courses** (`/courses`)
   - Browse course catalog
   - Search and filter
   - View course details

4. **Onboarding** (`/onboarding`)
   - First-time user setup
   - Profile creation wizard

### UI Components
- **shadcn/ui components**:
  - Card, Button, Label
  - Select, Badge, Alert
  - Form components
- **Custom components**:
  - Navbar
  - DashboardSkeleton
  - Course cards

### Hooks
- `useAuth` - Authentication state management
- `useUpdateProfile` - Profile update mutations
- `useUser` - User data fetching
- `use-mobile` - Responsive design helper

---

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://...

# Server
PORT=5000

# PageIndex
PAGEINDEX_API_KEY=your_pageindex_key

# FastRouter (AI)
FASTROUTER_API_KEY=your_fastrouter_key
FASTROUTER_URL=https://go.fastrouter.ai/api/v1/chat/completions
FASTROUTER_MODEL=google/gemini-2.5-pro

# OpenAI (Optional)
OPENAI_API_KEY=your_openai_key
```

### Frontend (.env.local)
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# API
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Scripts

### Backend
```bash
npm run dev              # Start development server
npm run start            # Start production server
npm run db:push          # Push schema to database
npm run db:generate      # Generate migrations
npm run ingest:courses   # Ingest course documents to PageIndex
```

### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
```

---

## Key Features Summary

### ✅ Implemented
- User authentication with Clerk
- Profile management system
- Comprehensive course catalog
- PageIndex Graph RAG for AI-powered Q&A
- FastRouter integration (Gemini 2.5 Pro)
- Course search and filtering
- Completed courses tracking
- Database schema with relationships
- Document ingestion pipeline
- Streaming responses (SSE)

### 🚧 In Progress / Planned
- Dashboard implementation
- Recommendations algorithm
- Course ratings system
- Advanced analytics
- Mobile responsiveness enhancements

---

## Architecture Highlights

### Repository Pattern
All services follow a clean architecture with:
- **Controller**: HTTP request handling
- **Service**: Business logic
- **Repository**: Data access layer
- **Validator**: Input validation with Zod

### AI Integration
- **FastRouter**: Primary AI provider (Google Gemini 2.5 Pro)
- **PageIndex**: Document processing and vector storage
- **PageIndex Graph RAG**: Relationship-based context retrieval

### Security
- Clerk authentication
- Environment variable protection
- Input validation
- SQL injection prevention (Drizzle ORM)

---

## Contact & Support

For questions or issues, please refer to the project documentation or contact the development team.

---

**Last Updated**: April 2026
**Version**: 1.0.0
