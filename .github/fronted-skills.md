# Frontend Skills - ICA Project

## Tech Stack

- Next.js App Router
- React.js
- Tailwind CSS
- ShadCN UI
- Axios
- TanStack React Query
- React Hook Form
- Zod

---

# Responsibilities

## UI Development

Build clean responsive interfaces for:

- Landing Page
- Login / Signup
- Student Profile Setup
- Dashboard
- Course Catalogue
- Recommendation Page

---

# Routing Skill

Use Next.js App Router:

app/
dashboard/
courses/
profile/
recommendations/

Use nested layouts where useful.

Use route groups for clean organization.

Use server rendering where beneficial.

---

# State Management Strategy

Use correct tool for correct state.

## Local UI State

Use:

- useState
- useReducer

Examples:

- modal open/close
- selected tab
- filters UI

## Server State (Mandatory)

Use React Query for:

- API data
- caching
- background refresh
- pagination
- optimistic updates

Never manage API state manually with useEffect if React Query is better.

## Global App State

Use Zustand only if needed for:

- auth state
- global filters
- sidebar state

---

# API Layer Strategy

Use Axios instance:

lib/api.js

Features:

- baseURL
- auth headers
- interceptors
- timeout
- error handling

Example usage:

api.get("/courses")

---

# React Query Performance Strategy (Mandatory)

Use React Query whenever speed matters.

## For Frequently Used Data

Examples:

- dashboard
- profile
- course catalogue

Use:

- staleTime: long
- cacheTime: long
- keepPreviousData: true

This avoids reloading every page visit.

---

## Example Rules

### Dashboard

Use cache for 5–10 mins.

Because data rarely changes instantly.

### Course Catalogue

Use cache for long time.

Because courses are mostly static.

### Recommendations

Use manual refetch after profile changes.

Do not auto-fetch repeatedly.

### Ratings

Use cached background refresh.

---

# Smart Loading Strategy

## Never Reload Every Time

Use React Query cache first.

If cache exists:

Show cached data instantly.

Then revalidate silently.

## Use keepPreviousData

For:

- pagination
- filters
- search transitions

Prevents UI flicker.

---

# Prefetch Strategy

When user likely navigates:

Prefetch next page data.

Examples:

- Hover dashboard link
- Open course page
- After login

Use:

queryClient.prefetchQuery()

---

# Mutation Strategy

Use React Query mutations for:

- update profile
- mark course complete
- submit ratings

Use optimistic UI when safe.

Show instant result before server responds.

---

# Search Performance Strategy

For course search:

Use:

- debounce input
- query by search term
- keepPreviousData

Avoid API call on every keystroke.

---

# Infinite / Pagination Strategy

For long course list:

Use:

- pagination
or
- infinite scroll

Never fetch huge dataset at once.

---

# UI Quality Standards

Always include:

- Loading skeletons
- Empty states
- Error states
- Retry button
- Mobile responsive design
- Accessible labels

---

# Reusable Components

Build:

- Navbar
- Sidebar
- Cards
- Tables
- Search bars
- Filter panels
- Buttons
- Modals
- Skeleton loaders

---

# Rendering Performance

## Use Server Components where possible

For static pages:

- landing page
- layout
- non-interactive sections

## Use Client Components only when needed

For:

- forms
- filters
- modals
- live search

---

# React Optimization Rules

Use:

- memo()
- useMemo()
- useCallback()

Only where rerender issues exist.

Do not over-optimize early.

---

# Image / Asset Speed

Use:

- next/image
- lazy loading
- compressed assets

---

# Network Speed Rules

- Minimize duplicate requests
- Parallel fetch when possible
- Cache responses
- Cancel stale requests

---

# Folder Structure

app/
components/
features/
hooks/
lib/
providers/
services/

---

# Mandatory React Query Provider

Create global provider in layout.

providers/query-provider.jsx

---

# Speed Priority Rules

When speed required:

1. Use React Query cache
2. Show cached data first
3. Background refetch
4. Skeleton only first load
5. Prefetch next likely screen
6. Paginate large lists
7. Debounce search
8. Optimistic updates

---

# What NOT to Do

❌ useEffect + useState for every API call  
❌ refetch on every tab change  
❌ fetch full dataset repeatedly  
❌ block UI waiting for network  
❌ duplicate requests

---

# Goal

Fast UX feels instant.

User should think app is faster than internet.