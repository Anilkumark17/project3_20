# Intelligent Course Advisor (ICA) - Copilot Instructions

## Project Overview

Build an Intelligent Course Advisor (ICA) platform for students to manage academic progress, view dashboards, browse courses, and receive semester recommendations.

## Tech Stack

- Frontend: Next.js (App Router)
- Backend: Express.js
- ORM: Drizzle ORM
- Database: Neon PostgreSQL
- Styling: Tailwind CSS + ShadCN UI

---

# Core Execution Rule (Mandatory Workflow)

Whenever I give any new task or feature request, always follow this order:

## Step 1 → Database First

Generate only:

- Drizzle schema
- Table changes
- Relations
- Migration changes
- Query structure if needed

Then stop and wait for approval.

Response format:

"Database layer ready. Approve to continue Backend."

---

## Step 2 → Backend Second

After approval, generate only:

- Express routes
- Controllers
- Services
- Validation
- Business logic
- API responses

Then stop and wait for approval.

Response format:

"Backend layer ready. Approve to continue Frontend."

---

## Step 3 → Frontend Third

After approval, generate only:

- Next.js pages
- Components
- Forms
- UI states
- API integration
- UX polish

---

## Never Skip Order

Wrong ❌

Frontend first

Correct ✅

Database → Backend → Frontend

---

## If Task Needs Only One Layer

Examples:

- "Create UI card" → frontend only
- "Fix schema" → database only
- "Optimize API" → backend only

Use judgment.

---

# Architecture First

Always follow layered architecture:

1. Presentation Layer → Next.js UI
2. API Layer → Express Routes
3. Business Layer → Services
4. Data Layer → Drizzle ORM
5. Database Layer → Neon PostgreSQL

Never mix business logic inside React components.

---

# Code Standards

- Use clean modular folder structure
- Reusable components only
- Use async/await
- Handle errors properly
- Use environment variables
- No hardcoded secrets
- Validate all inputs using Zod
- Keep files under 250 lines if possible

---

# Frontend Rules

Use:

- Server Components where possible
- Client Components only when needed
- Tailwind utility classes
- Responsive UI
- Loading states
- Error states
- Skeleton states

Pages:

- Landing Page
- Sign In
- Dashboard
- Profile Setup
- Course Catalogue
- Recommendations

---

# Backend Rules

Use Express structure:

src/
routes/
controllers/
services/
db/
middleware/
validators/

Routes must be thin.

Business logic goes inside services.

---

# Recommendation Engine Rules

Recommendation engine must:

- Exclude completed courses
- Suggest 3–5 courses
- Balance credits
- Balance difficulty
- Balance workload
- Respect semester constraints

Return JSON:

{
  recommendedCourses: [],
  workload: "Light | Moderate | Heavy"
}

---

# Database Rules

Use Drizzle schema files.

Main tables:

- users
- profiles
- courses
- completed_courses
- ratings
- recommendations

Always use indexes where useful.

Use foreign keys properly.

Use migrations safely.

---

# Security Rules

- Validate request body
- Sanitize inputs
- Use rate limiting if auth added
- Never expose DB credentials
- Use parameterized queries
- Store secrets in .env

---

# Performance Rules

- Dashboard <2 seconds
- Search <1 second
- Use pagination
- Use caching if needed
- Avoid unnecessary rerenders
- Optimize DB queries

---

# When Writing Code

Always think:

1. Is this modular?
2. Is this scalable?
3. Is this maintainable?
4. Is logic separated from UI?
5. Is it production quality?

---

# Git Workflow

Before coding:

1. Understand task
2. Implement database first
3. Test
4. Wait approval
5. Implement backend
6. Test
7. Wait approval
8. Implement frontend
9. Commit only working code

---

# Response Style

When generating code:

- Explain folder placement
- Explain why approach chosen
- Give production-ready solution
- Avoid toy examples
- Keep output structured
- Follow approval workflow strictly

---

# Example Workflow

User: Add completed courses feature

AI must reply:

Step 1: Drizzle schema for completed_courses table

(wait)

After approval:

Step 2: Express APIs for completed courses

(wait)

After approval:

Step 3: Frontend UI for adding completed courses

---

# Highest Priority Rule

Do not rush coding.

Follow system.

Database → Backend → Frontend