# Layered Architecture Generator Skill

## Purpose

When user gives ANY project requirements, PRD, subsystem notes, features, functional requirements, non-functional requirements, or tech stack:

AI must generate architecture strictly from given information.

Never hallucinate.
Never invent unnecessary modules.
Never assume hidden features.

Use only:

1. User requirements
2. Mentioned technologies
3. Real engineering best practices

---

# Mandatory Thinking Process

Before generating architecture:

1. Read all Functional Requirements
2. Read Non-Functional Requirements
3. Identify core entities
4. Identify frontend responsibilities
5. Identify backend responsibilities
6. Identify business logic modules
7. Identify storage needs
8. Identify mentioned stack

Then generate layered architecture.

---

# Output Format (Mandatory)

┌─────────────────────────────┐
│     Presentation Layer      │
│-----------------------------│
│ Frontend Framework          │
│ Pages                       │
│ Components                  │
│ UI Features                 │
└──────────────┬──────────────┘
               │ API Calls
               ▼

┌─────────────────────────────┐
│     Application Layer       │
│-----------------------------│
│ Backend Framework           │
│ Routes                      │
│ Controllers                 │
│ Auth                        │
│ Validation                  │
└──────────────┬──────────────┘
               │
               ▼

┌─────────────────────────────┐
│      Business Layer         │
│-----------------------------│
│ Core Logic                  │
│ Recommendation Engine       │
│ Aggregation Logic           │
│ Domain Services             │
└──────────────┬──────────────┘
               │
               ▼

┌─────────────────────────────┐
│      Data Access Layer      │
│-----------------------------│
│ ORM                         │
│ Repositories                │
│ Query Builders              │
└──────────────┬──────────────┘
               │
               ▼

┌─────────────────────────────┐
│       Database Layer        │
│-----------------------------│
│ Database                    │
│ Tables                      │
│ Relations                   │
└─────────────────────────────┘

---

# Real Example (ICA Project)

Input Stack:
- Frontend: Next.js
- Backend: Express.js
- ORM: Drizzle
- Database: Neon PostgreSQL
- Auth: Clerk

Output:

┌─────────────────────────────┐
│     Presentation Layer      │
│-----------------------------│
│ Next.js Frontend            │
│                             │
│ • Sign In / Sign Up         │
│ • Student Profile Form      │
│ • Dashboard                 │
│ • Course Catalogue          │
│ • Recommendations UI        │
│ • Search / Filters          │
└──────────────┬──────────────┘
               │ REST API Calls
               ▼

┌─────────────────────────────┐
│     Application Layer       │
│-----------------------------│
│ Express.js Backend          │
│                             │
│ • Clerk Auth Middleware     │
│ • Profile Routes            │
│ • Course Routes             │
│ • Dashboard Routes          │
│ • Recommendation Routes     │
│ • Zod Validation            │
└──────────────┬──────────────┘
               │
               ▼

┌─────────────────────────────┐
│      Business Layer         │
│-----------------------------│
│ ICA Core Logic              │
│                             │
│ • Recommendation Engine     │
│ • Exclude Completed Courses │
│ • Select 3–5 Courses        │
│ • Workload Balancer         │
│ • Credit Calculator         │
│ • Remaining Courses Logic   │
│ • Ratings Aggregator        │
└──────────────┬──────────────┘
               │
               ▼

┌─────────────────────────────┐
│      Data Access Layer      │
│-----------------------------│
│ Drizzle ORM                 │
│                             │
│ • usersRepository           │
│ • profileRepository         │
│ • coursesRepository         │
│ • ratingsRepository         │
│ • recommendationRepository  │
└──────────────┬──────────────┘
               │
               ▼

┌─────────────────────────────┐
│       Database Layer        │
│-----------------------------│
│ Neon PostgreSQL            │
│                             │
│ Tables:                    │
│ • users                    │
│ • profiles                 │
│ • courses                  │
│ • completed_courses        │
│ • ratings                  │
│ • recommendations          │
└─────────────────────────────┘

---

# Folder Structure Generator (Mandatory)

frontend/
│── app/
│   ├── sign-in/
│   ├── sign-up/
│   ├── dashboard/
│   ├── profile/
│   ├── courses/
│   └── recommendations/
│
│── components/
│── lib/
│── hooks/

backend/
│── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── repositories/
│   ├── validators/
│   └── db/

---

# Anti Hallucination Rules

Never add:

- AI chatbot
- Notifications
- Payment gateway
- Admin panel
- Microservices
- Redis
- Kafka

Unless user explicitly asks.

---

# If user gives API keys

Never expose them in output.
Always say:

Store secrets in `.env`

Example:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

---

# Response Standard

Architecture must be:

- Realistic
- Modular
- Scalable
- Based only on user data
- Resume quality
- Production oriented

---

# Goal

Convert user requirements into exact software architecture without hallucination.