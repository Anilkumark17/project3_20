# Intelligent Course Advisor (ICA) — Task 2: Architecture Framework

---

## Part 1: Stakeholder Identification (IEEE 42010)

### 1.1 Overview

Following the IEEE 42010:2011 standard, an architecture description must identify the stakeholders of a system, their concerns, and the viewpoints used to address those concerns. This section documents the stakeholders for the ICA system and maps their concerns to architectural viewpoints and views.

---

### 1.2 Stakeholders and Their Concerns

---

#### Stakeholder 1: Students (End Users)

**Description:**
Graduate students enrolled in programs such as CSE, PDM, CSIS, or CASE who use the ICA to plan their semester course load.

**Concerns:**
- Will the system give me accurate and relevant course recommendations based on my completed courses and goals?
- Will the dashboard correctly reflect my progress and remaining credits?
- Is the system fast and easy to use — can I complete onboarding in under 2 minutes?
- Will my profile data persist correctly across sessions?
- Can I search and filter courses quickly without lag?

**Addressed By:**
| Viewpoint | View |
|---|---|
| Scenarios / Use Case View | Course recommendation flow, onboarding flow, dashboard load flow |
| Process View | Data flow from profile input → recommendation engine → dashboard output |
| Logical View | Recommendation Engine subsystem, Student Profile subsystem |

---

#### Stakeholder 2: System Developers (Development Team)

**Description:**
The engineering team responsible for designing, building, testing, and maintaining the ICA system.

**Concerns:**
- How is the system decomposed into modules and subsystems?
- Where does the Recommendation Engine live — as part of Express or a separate FastAPI service?
- How do frontend (React), backend (Express/Node.js), and database (NeonDB) communicate?
- How do we ensure the codebase is modular, maintainable, and extensible for future tasks (Task 3+)?
- What database schema supports profile management, course catalogue, and ratings?
- How are API endpoints structured for performance and consistency?
- What deployment environment is being used, and how are services connected?

**Addressed By:**
| Viewpoint | View |
|---|---|
| Logical View | Component breakdown: Frontend, Backend API, Recommendation Engine, Database, Course Data |
| Development View | Module structure, separation of concerns, folder/service boundaries |
| Physical/Deployment View | Hosting of React app, Express API, NeonDB, optional FastAPI service |
| Process View | API request/response flow, recommendation computation pipeline |

---

#### Stakeholder 3: Course Data Maintainers

**Description:**
Administrative or faculty personnel responsible for keeping the course catalogue accurate — including course names, credits, difficulty ratings, and workload classifications.

**Concerns:**
- How is course data stored and updated — is it static or database-driven?
- Can the course catalogue be updated without developer intervention?
- How are difficulty and workload ratings aggregated and displayed?
- Is there a clear data model for course entries?

**Addressed By:**
| Viewpoint | View |
|---|---|
| Logical View | Course Data Subsystem, Database Subsystem |
| Development View | Database schema for the course catalogue |
| Process View | Data flow from course catalogue → filtering → recommendation engine |

---

### 1.3 Architectural Viewpoints

Following IEEE 42010, the five viewpoints used in this architecture description are:

| Viewpoint | Purpose | Primary Stakeholders |
|---|---|---|
| **Logical View** | Describes the functional decomposition of the system into components and subsystems | Developers, Students |
| **Process View** | Describes runtime behavior — how data flows between components during key operations | Developers, Students |
| **Development View** | Describes the code/module structure, separation of concerns, and technology boundaries | Developers |
| **Physical / Deployment View** | Describes where components are hosted and how they are connected | Developers |
| **Scenarios / Use Case View** | Describes key user interactions that validate the architecture | Students, Developers |

---

### 1.4 Concern-to-Viewpoint Mapping Summary

| Concern | Stakeholder | Viewpoint |
|---|---|---|
| Accurate semester recommendations | Students | Logical, Process, Scenarios |
| Fast dashboard and search performance | Students | Process, Physical |
| Persistent profile data across sessions | Students | Logical, Physical |
| Modular, extensible codebase | Developers | Development |
| Recommendation Engine placement | Developers | Logical, Development, Physical |
| Course data storage and updates | Course Data Maintainers | Logical, Development |
| API structure and communication | Developers | Process, Development |
| Deployment and service connectivity | Developers | Physical |

---

## Part 2: Architecture Decision Records (ADRs)

The following ADRs follow the **Nygard ADR template**: Title, Status, Context, Decision, Consequences.

---

### ADR-001: Use React as the Frontend Framework

**Status:** Accepted

**Context:**

The ICA system requires a responsive, component-driven user interface that handles multiple views: an onboarding form, a dashboard, a course catalogue with search/filter, and a recommendations display. The frontend must support efficient state management across these views and communicate with a REST API backend.

Options considered:
- **React** — component-based, large ecosystem, widely used in team's prior experience
- **Vue.js** — lighter weight, simpler learning curve
- **Plain HTML/CSS/JS** — no build complexity, but lacks scalability for dynamic UI

The NFR for usability (onboarding in under 2 minutes, core actions in 3 clicks) and the need for real-time filtering (NFR-01: <1 second response) require a reactive UI layer that efficiently re-renders on state changes.

**Decision:**

We will use **React** as the frontend framework, with functional components and hooks for state management. React Router will handle client-side navigation between views. No heavy state management library (e.g., Redux) is introduced at this stage — component-level state and props are sufficient for Task 1–2 scope.

**Consequences:**

- *Positive:* Component reusability across dashboard, catalogue, and recommendation views. Fast re-rendering supports the <1 second filtering requirement. Large ecosystem for future extension (e.g., charts for Task 3+).
- *Negative:* Introduces a build pipeline (Vite or Create React App). Developers unfamiliar with React have a steeper learning curve than plain HTML.
- *Future Impact:* If the system scales to include more complex data visualizations (Task 3+), React's component model accommodates libraries like Recharts or D3 without architectural rework.

---

### ADR-002: Use NeonDB (PostgreSQL) as the Primary Database

**Status:** Accepted

**Context:**

The ICA system requires persistent storage for user profiles, completed course records, the course catalogue, and course ratings. The database must support relational queries (e.g., joining user profiles with course data), concurrent access by multiple users (NFR-03), and consistency across sessions (NFR-04).

Options considered:
- **NeonDB** — serverless PostgreSQL, cloud-native, branching support, free tier for development
- **Supabase** — PostgreSQL with a built-in Auth layer, REST API auto-generation, and storage
- **Firebase Firestore** — NoSQL, real-time sync, but less suited for relational course/profile data
- **SQLite** — lightweight but not suitable for concurrent multi-user access

Supabase was seriously considered due to its built-in authentication and auto-generated REST API. However, the ICA backend already has a dedicated Express/Node.js API layer, making Supabase's auto-generated APIs redundant. NeonDB provides a clean PostgreSQL interface without introducing overlapping responsibilities.

**Decision:**

We will use **NeonDB (serverless PostgreSQL)** as the primary database. The Express backend will connect to NeonDB using the `@neondatabase/serverless` driver or `pg` (node-postgres). The schema will include tables for: `users`, `completed_courses`, `courses`, and `ratings`.

**Consequences:**

- *Positive:* Full SQL expressiveness for relational queries (joins, aggregations for ratings). Serverless scaling aligns with NFR-03. Branching feature in NeonDB supports parallel development and testing without affecting production data.
- *Negative:* No built-in authentication layer (unlike Supabase) — auth must be handled separately in the Express layer.
- *Future Impact:* If authentication becomes a requirement in Task 3+, a library such as Passport.js or a JWT middleware will need to be added to the Express layer. The schema design must account for this from the start.

---

### ADR-003: Expose Backend Functionality via a REST API (Express/Node.js)

**Status:** Accepted

**Context:**

The ICA system has a clear separation between the React frontend and backend logic. The frontend needs to retrieve user profiles, fetch course data, and receive recommendations — all of which involve business logic and database access that should not live in the client.

Options considered:
- **REST API (Express/Node.js)** — well-understood, stateless, works cleanly with React via fetch/axios
- **GraphQL (Apollo)** — flexible querying, avoids over-fetching, but adds complexity for a relatively simple data model
- **Direct database access from frontend** — possible with Supabase client, but couples frontend to DB schema and exposes security risks
- **tRPC** — type-safe end-to-end API, excellent for TypeScript monorepos, but less conventional and adds tooling overhead

Given the system's data model (profiles, courses, recommendations) and the team's familiarity with Express, a RESTful approach provides the right balance of simplicity, convention, and maintainability.

**Decision:**

We will use **Express.js (Node.js)** to build a RESTful API. Key endpoint groups:
- `POST /api/profile` — create/update student profile
- `GET /api/courses` — fetch course catalogue (with query params for filtering)
- `GET /api/recommendations/:userId` — retrieve generated semester plan
- `GET /api/dashboard/:userId` — aggregated dashboard data

All API responses will follow a consistent JSON structure. The API layer is responsible for input validation, business logic orchestration, and database interaction.

**Consequences:**

- *Positive:* Clean separation between frontend and backend. REST is stateless, making horizontal scaling straightforward (NFR-03). Conventional endpoint structure is easy to document and test.
- *Negative:* Some endpoints (e.g., dashboard) may require multiple DB queries, creating potential latency. This must be managed through query optimization and response caching if needed.
- *Future Impact:* If the Recommendation Engine is extracted as a FastAPI microservice (see ADR-004), the Express API acts as an orchestrator — calling FastAPI internally and returning results to the frontend. This intermediary pattern keeps the frontend unaware of the internal service split.

---

### ADR-004: Recommendation Engine Placement — Express Module vs. FastAPI Microservice

**Status:** Accepted

**Context:**

The Recommendation Engine (FR-04) is the core business logic of the ICA system. It filters completed courses, selects 3–5 courses per semester, and classifies the plan by workload. A key architectural decision is where this logic should live.

Options under consideration:

**Option A — Implement within Express/Node.js**
- Recommendation logic is a module inside the Express backend
- Single deployment unit; no inter-service communication overhead
- Simpler to develop and debug at the current project stage
- Suitable if the engine remains rule-based (no ML)

**Option B — Implement as a FastAPI (Python) Microservice**
- Recommendation logic runs as an independent Python service
- Express calls FastAPI via internal HTTP (`/recommend` endpoint)
- Enables future use of ML/NLP libraries (scikit-learn, pandas, etc.)
- Adds deployment complexity (two services to manage)

The current recommendation logic described in FR-04 is rule-based (filter → select → classify). There is no confirmed ML requirement at this stage. However, future tasks may introduce more intelligent recommendations.

**Decision:**

The Recommendation Engine will be implemented as a **self-contained module within the Express/Node.js backend**. It will reside in a dedicated folder (e.g., `src/engine/`) with a clean internal interface, keeping it logically isolated from routing and database layers.

The interface contract is defined as:
- Input: `{ userId, completedCourses[], goal, currentSemester }`
- Output: `{ recommendedCourses[], planClassification }`

FastAPI is not used. All recommendation logic remains in Node.js.

**Consequences:**

- *Positive:* Single deployment unit — no inter-service HTTP calls, no additional service to manage. Simpler local development and debugging. Consistent language across the entire backend.
- *Negative:* If ML/NLP capabilities are needed in the future, Python libraries cannot be used directly. A full extraction to a separate service would be required at that point.
- *Future Impact (Task 3+):* The isolated module structure ensures that if more sophisticated recommendation logic is needed later, it can be enhanced in place without affecting the API layer or frontend.

---

### ADR-005: Course Catalogue — Database-Driven over Static JSON

**Status:** Accepted

**Context:**

The course catalogue (FR-03) needs to support search by name and filtering by credits and difficulty. The catalogue could be stored as:

- **Static JSON file** — simple, no DB overhead, but not updatable by non-developers
- **Database table (NeonDB)** — queryable, filterable server-side, updatable by course data maintainers

Given that Course Data Maintainers are an identified stakeholder with a concern around updating course data without developer intervention, a static JSON file does not meet this requirement. Additionally, as the catalogue grows, client-side filtering of a large JSON array becomes inefficient and violates NFR-01 (<1 second filtering).

**Decision:**

The course catalogue will be stored in a **NeonDB `courses` table**. The Express API will handle search and filter queries using SQL `WHERE` clauses and `ILIKE` for name search. The frontend will send filter parameters as query strings to `GET /api/courses`.

Schema (draft):
```
courses (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255),
  credits     INT,
  difficulty  INT CHECK (difficulty BETWEEN 1 AND 5),
  workload    VARCHAR(10),  -- 'Light' | 'Medium' | 'Heavy'
  program     VARCHAR(10)   -- 'CSE' | 'PDM' | 'CSIS' | 'CASE'
)
```

**Consequences:**

- *Positive:* Course data maintainers can update the catalogue via DB tooling without touching code. Server-side filtering is faster than client-side for large catalogues. Supports NFR-01 and NFR-03.
- *Negative:* Requires initial data seeding. Every filter request hits the database — query optimization (indexes on `credits`, `difficulty`, `program`) is necessary.
- *Future Impact:* If a course management UI is added in Task 3+, the database-driven approach means the UI can directly call existing API endpoints with `POST /api/courses` and `PUT /api/courses/:id` — no architectural changes required.

---

## Summary

### Stakeholder-Viewpoint Map

| Stakeholder | Logical | Process | Development | Physical | Scenarios |
|---|:---:|:---:|:---:|:---:|:---:|
| Students | ✓ | ✓ | | | ✓ |
| Developers | ✓ | ✓ | ✓ | ✓ | ✓ |
| Course Data Maintainers | ✓ | ✓ | ✓ | | |

### ADR Status Summary

| ADR | Title | Status |
|---|---|---|
| ADR-001 | React as Frontend Framework | Accepted |
| ADR-002 | NeonDB as Primary Database | Accepted |
| ADR-003 | REST API via Express/Node.js | Accepted |
| ADR-004 | Recommendation Engine Placement | Accepted |
| ADR-005 | Database-Driven Course Catalogue | Accepted |
