# Database Skills - ICA Project

## Tech Stack

- Neon PostgreSQL
- Drizzle ORM

---

## Responsibilities

### Schema Design

Tables:

- users
- profiles
- courses
- completed_courses
- ratings
- recommendations

---

### Relationships

Use foreign keys:

users -> profiles
users -> completed_courses
courses -> ratings
users -> recommendations

---

### Drizzle ORM Skills

Use for:

- schema creation
- inserts
- updates
- joins
- filtering
- migrations

---

### Query Skills

Build optimized queries for:

- dashboard aggregation
- remaining credits
- search courses
- recommendation fetch
- course ratings average

---

### Performance

Use:

- indexes on search fields
- indexes on foreign keys
- pagination
- selective columns

---

### Data Integrity

Use:

- not null constraints
- unique constraints
- foreign keys
- transactions when needed

---

### Backup & Reliability

- Use Neon branch backups
- Use migrations safely
- Avoid destructive changes in production

---

### Example Important Fields

users:
id, email

profiles:
user_id, program, semester, goal

courses:
code, title, credits, difficulty, workload

completed_courses:
user_id, course_id

ratings:
course_id, difficulty, workload