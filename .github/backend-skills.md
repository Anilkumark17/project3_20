# Backend Skills - ICA Project

## Tech Stack

- Node.js
- Express.js
- Zod
- JWT / Clerk (optional)

---

## Responsibilities

### API Development

Build REST APIs for:

- User profile
- Dashboard stats
- Course catalogue
- Recommendation engine
- Ratings

---

### Architecture

Use layered backend:

routes/
controllers/
services/
middleware/
utils/

Thin routes.
Business logic inside services.

---

### Core Skills

### Recommendation Engine

Implement logic:

- Remove completed courses
- Check semester eligibility
- Balance credits
- Balance difficulty
- Return 3–5 suggestions

---

### Validation

Use Zod for:

- request body
- params
- query filters

---

### Middleware

Use:

- auth middleware
- error middleware
- logger middleware
- rate limiter (optional)

---

### Security

- Sanitize inputs
- Protect secrets
- Use environment variables
- Handle errors safely

---

### Performance

- Efficient APIs
- Pagination
- Selective fields
- Parallel DB queries when possible

---

### Testing

Test:

- routes
- services
- recommendation logic