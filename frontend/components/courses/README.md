# Add Course Feature - Production Documentation

## Overview

A production-grade course management system with fuzzy search, allowing users to add completed courses to their academic profile with real-time updates and toast notifications.

---

## Architecture

### Component Structure

```
components/courses/
├── AddCourseModal.jsx      # Main modal with fuzzy search
├── CourseCard.jsx          # Reusable course display card
├── CourseSearchBar.jsx     # Debounced search input
├── index.js                # Barrel exports
└── README.md               # This file
```

### Hooks

```
hooks/
├── useCourses.js           # Course data fetching
└── useCompletedCourses.js  # Completed courses CRUD
```

---

## Features

### ✅ Fuzzy Search
- **Library**: Fuse.js
- **Search Fields**: 
  - Course Code (40% weight)
  - Course Title (30% weight)
  - Description (20% weight)
  - Program (10% weight)
- **Threshold**: 0.4 (balanced accuracy)
- **Debounce**: 300ms
- **Results Limit**: 50 courses

### ✅ Real-time UI Updates
- React Query automatic cache invalidation
- Instant profile refresh after adding courses
- Optimistic UI updates with loading states

### ✅ Grade Selection
- Two-step process: Select course → Select grade
- 11 grade options (A, A-, B+, B, B-, C+, C, C-, D, F, Pass)
- Validation before submission

### ✅ Duplicate Prevention
- Tracks completed course IDs
- Disables "Add" button for already-added courses
- Shows "Added" state with checkmark

### ✅ Toast Notifications
- Success: Course added with grade
- Error: Already added or API failure
- Rich colors and descriptions

### ✅ Accessibility
- Keyboard navigation
- ESC to close modal
- Backdrop click to close
- ARIA labels and roles
- Focus management

---

## Usage

### Basic Implementation

```jsx
import AddCourseModal from '@/components/courses/AddCourseModal';

function ProfilePage() {
  const { user } = useUser();
  
  return (
    <AddCourseModal clerkId={user?.id} />
  );
}
```

### Custom Trigger

```jsx
<AddCourseModal 
  clerkId={user?.id}
  trigger={
    <Button variant="outline">
      <Plus className="mr-2" />
      Custom Button
    </Button>
  }
/>
```

---

## API Integration

### Backend Endpoints

#### GET `/api/courses`
Returns all available courses

**Response:**
```json
{
  "success": true,
  "courses": [
    {
      "id": 1,
      "code": "CS101",
      "title": "Introduction to Programming",
      "description": "Learn programming fundamentals",
      "credits": 4,
      "difficulty": 2,
      "program": "CSE",
      "semester": 1
    }
  ]
}
```

#### GET `/api/profile/:clerkId/courses`
Returns user's completed courses

**Response:**
```json
{
  "success": true,
  "completedCourses": [
    {
      "id": 1,
      "courseId": 143,
      "courseCode": "CS101",
      "courseTitle": "Introduction to Programming",
      "courseCredits": 4,
      "grade": "A",
      "completedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST `/api/profile/:clerkId/courses`
Adds a completed course

**Request Body:**
```json
{
  "courseId": 143,
  "grade": "A"
}
```

**Response:**
```json
{
  "success": true,
  "completedCourse": {
    "id": 1,
    "courseId": 143,
    "grade": "A"
  }
}
```

#### DELETE `/api/profile/:clerkId/courses/:courseId`
Removes a completed course

---

## Database Schema

### `courses` Table
```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  credits INTEGER NOT NULL,
  difficulty INTEGER,
  description TEXT,
  program TEXT,
  semester INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `completed_courses` Table
```sql
CREATE TABLE completed_courses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  course_id INTEGER REFERENCES courses(id) NOT NULL,
  grade TEXT,
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);
```

---

## Performance Optimizations

### 1. Memoization
- `allCourses`: Wrapped in useMemo to prevent re-creation
- `completedCourseIds`: Set for O(1) lookup
- `fuse`: Fuse.js instance cached
- `filteredCourses`: Computed only when search changes

### 2. Debouncing
- Search input debounced at 300ms
- Prevents excessive re-renders and API calls

### 3. React Query Caching
- Courses cached for 5 minutes
- Completed courses cached for 5 minutes
- Automatic background refetch disabled
- Manual invalidation on mutations

### 4. Lazy Loading
- Results limited to 50 courses
- Prevents rendering thousands of DOM nodes

---

## Error Handling

### Network Errors
```javascript
try {
  await addCourseMutation.mutateAsync({ ... });
} catch (error) {
  if (error.message.includes("already")) {
    toast.error("Course already added");
  } else {
    toast.error("Failed to add course", {
      description: error.message
    });
  }
}
```

### Validation
- Grade required before submission
- Duplicate prevention at UI level
- Backend validation for data integrity

---

## Testing Checklist

### Functional Tests
- [ ] Search returns correct results
- [ ] Fuzzy search handles typos
- [ ] Adding course shows success toast
- [ ] Duplicate courses show "Added" state
- [ ] Grade selection is required
- [ ] Modal closes after successful add
- [ ] Profile updates immediately
- [ ] Remove course works correctly

### Edge Cases
- [ ] Empty search shows all courses (limited to 50)
- [ ] No results shows empty state
- [ ] Network error shows error toast
- [ ] Already added course prevents duplicate
- [ ] Rapid clicking doesn't create duplicates

### Accessibility
- [ ] Keyboard navigation works
- [ ] ESC closes modal
- [ ] Focus trapped in modal
- [ ] Screen reader announces states
- [ ] ARIA labels present

---

## Customization

### Styling
All components use Tailwind CSS and can be customized via className props.

### Search Configuration
Modify `FUSE_OPTIONS` in `AddCourseModal.jsx`:

```javascript
const FUSE_OPTIONS = {
  keys: [
    { name: "code", weight: 0.4 },
    { name: "title", weight: 0.3 },
    // Add more fields...
  ],
  threshold: 0.4,  // Lower = stricter
  // ...
};
```

### Grade Options
Modify `GRADES` array in `AddCourseModal.jsx`:

```javascript
const GRADES = [
  { value: "A+", label: "A+" },
  // Add custom grades...
];
```

---

## Future Enhancements

- [ ] Bulk course import
- [ ] Course recommendations based on profile
- [ ] Filter by program/semester in modal
- [ ] Export completed courses to PDF
- [ ] Course prerequisites validation
- [ ] Semester-wise grouping
- [ ] GPA calculation
- [ ] Course ratings and reviews

---

## Dependencies

```json
{
  "fuse.js": "^7.0.0",
  "sonner": "^2.0.7",
  "@tanstack/react-query": "^5.99.2",
  "lucide-react": "^1.8.0"
}
```

---

## Support

For issues or questions, contact the development team or open an issue in the repository.

---

**Built with ❤️ for production use**
