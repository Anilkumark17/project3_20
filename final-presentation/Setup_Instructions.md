# Setup Instructions - Intelligent Course Advisor (ICA)

Complete guide to set up and run the ICA system locally.

---

## 📋 Prerequisites

### Required Software
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Git** for cloning repository
- **PostgreSQL** client (optional, for direct DB access)

### Required Accounts
1. **NeonDB** - https://neon.tech (Free tier)
2. **Clerk** - https://clerk.com (Free tier)
3. **FastRouter** - https://fastrouter.ai (API key)
4. **PageIndex** - For Graph RAG (optional)

---

## 🚀 Installation Steps

### Step 1: Clone Repository

```bash
git clone [YOUR_GITHUB_REPOSITORY_URL]
cd Se-project-3
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit `.env` file:**
```env
# Database
DATABASE_URL=postgresql://[username]:[password]@[host]/[database]?sslmode=require

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxx

# FastRouter AI
FASTROUTER_API_KEY=fr_xxxxx

# PageIndex (optional)
PAGEINDEX_API_KEY=pi_xxxxx

# Server
PORT=8000
NODE_ENV=development
```

**Run database migrations:**
```bash
npm run db:push
```

**Seed initial data:**
```bash
npm run seed
```

**Start backend server:**
```bash
npm run dev
```

Backend should now be running at `http://localhost:8000`

---

### Step 3: Frontend Setup

Open a **new terminal** window:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

**Edit `.env.local` file:**
```env
# Clerk Frontend Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

**Start frontend server:**
```bash
npm run dev
```

Frontend should now be running at `http://localhost:3000`

---

## 🔑 Getting API Keys

### 1. NeonDB Setup

1. Go to https://neon.tech
2. Sign up for free account
3. Create new project
4. Copy connection string from dashboard
5. Paste into `DATABASE_URL` in backend `.env`

### 2. Clerk Setup

1. Go to https://clerk.com
2. Sign up and create new application
3. Choose "Email + Password" authentication
4. Copy **Publishable Key** → frontend `.env.local`
5. Copy **Secret Key** → backend `.env` and frontend `.env.local`

### 3. FastRouter Setup

1. Go to https://fastrouter.ai
2. Sign up for account
3. Navigate to API Keys section
4. Generate new API key
5. Copy key → backend `.env` as `FASTROUTER_API_KEY`

---

## 📊 Database Schema

The system will automatically create these tables:

```sql
users (
  id, clerk_id, email, name, created_at
)

profiles (
  id, user_id, program, semester, goal, credits_completed
)

courses (
  id, code, title, credits, difficulty, description, program, semester
)

completed_courses (
  id, user_id, course_id, grade, completed_at
)

recommendations (
  id, user_id, course_id, reason, priority, generated_at
)

documents (
  id, title, content, metadata
)

course_chunks (
  id, course_id, content, embedding
)
```

---

## ✅ Verification

### 1. Check Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-04-25T..."
}
```

### 2. Check Database Connection

```bash
curl http://localhost:8000/api/courses
```

Should return list of courses (or empty array if not seeded).

### 3. Check Frontend

Open browser: `http://localhost:3000`

You should see:
- Landing page or sign-in page
- No console errors
- Clerk authentication widget

---

## 🧪 Test User Flow

1. **Sign Up:**
   - Go to http://localhost:3000/sign-up
   - Create account with email/password
   - Verify email (check inbox)

2. **Onboarding:**
   - Complete profile form
   - Select: Program, Semester, Goal
   - Submit

3. **Dashboard:**
   - View profile summary
   - See recommendations loading (SSE)
   - Check completed courses section

4. **Add Course:**
   - Click "Add Course" button
   - Search for course (try fuzzy: "javscript")
   - Select course
   - Choose grade
   - Confirm

5. **View Recommendations:**
   - Recommendations update automatically
   - See AI reasoning for each course

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `DATABASE_URL is not defined`
- **Fix:** Check `.env` file exists and has correct DATABASE_URL

**Error:** `Port 8000 already in use`
- **Fix:** Kill existing process or change PORT in `.env`

### Frontend won't start

**Error:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined`
- **Fix:** Check `.env.local` file exists with Clerk keys

**Error:** `Cannot connect to API`
- **Fix:** Ensure backend is running on port 8000

### Database errors

**Error:** `relation "users" does not exist`
- **Fix:** Run `npm run db:push` in backend folder

**Error:** `Connection timeout`
- **Fix:** Check NeonDB connection string, ensure IP is whitelisted

### Clerk authentication issues

**Error:** `Invalid publishable key`
- **Fix:** Copy correct key from Clerk dashboard

**Error:** `Redirect loop`
- **Fix:** Check CLERK_AFTER_SIGN_IN_URL matches your routes

---

## 📦 Production Deployment

### Backend (Render/Railway/Fly.io)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy

### Database (NeonDB)

Already cloud-hosted, no additional setup needed.

---

## 🔧 Development Commands

### Backend
```bash
npm run dev          # Start development server
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
npm run seed         # Seed database
npm test             # Run tests
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## 📚 Additional Resources

- **Backend API Docs:** http://localhost:8000/api-docs
- **Drizzle Studio:** http://localhost:4983
- **React DevTools:** Browser extension
- **Clerk Dashboard:** https://dashboard.clerk.com

---

## 🆘 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review error logs in terminal
3. Check browser console (F12)
4. Verify all environment variables
5. Ensure all services are running

---

**Setup Complete!** 🎉

You should now have ICA running locally with:
- ✅ Backend API on port 8000
- ✅ Frontend on port 3000
- ✅ Database connected
- ✅ Authentication working
- ✅ All features functional
