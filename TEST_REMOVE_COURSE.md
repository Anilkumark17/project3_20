# Test Remove Course Functionality

## Backend Endpoint Test

### 1. Check if course exists
```bash
# Get completed courses for a user
curl http://localhost:8000/api/profile/YOUR_CLERK_ID/courses
```

**Expected Response:**
```json
{
  "success": true,
  "completedCourses": [
    {
      "id": 1,
      "courseId": 123,
      "courseCode": "CS5.450",
      "courseTitle": "Mathematical Methods in Sciences",
      "courseCredits": 4,
      "grade": "A",
      "completedAt": "2024-04-25T..."
    }
  ]
}
```

### 2. Remove a course
```bash
# Delete a completed course by its ID (from completed_courses table)
curl -X DELETE http://localhost:8000/api/profile/YOUR_CLERK_ID/courses/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Course removed successfully"
}
```

### 3. Verify removal
```bash
# Check that course is gone
curl http://localhost:8000/api/profile/YOUR_CLERK_ID/courses
```

---

## Frontend Testing

### 1. Open Profile Page
Navigate to: `http://localhost:3000/profile`

### 2. Check Completed Courses Section
- You should see your completed courses displayed
- Each course should have an "X" button in the top-right corner

### 3. Click Remove Button
- Click the "X" button on any course
- Confirm the removal in the dialog
- Watch for:
  - ✅ Loading spinner on the button
  - ✅ Success toast notification
  - ✅ Course disappears from the list
  - ✅ Recommendations update automatically

### 4. Check Browser Console
Open DevTools (F12) and check for:
- ✅ No errors in console
- ✅ DELETE request to `/api/profile/:clerkId/courses/:id`
- ✅ 200 OK response
- ✅ "Course removed successfully" log

---

## Common Issues & Solutions

### Issue 1: 404 Not Found
**Problem**: Backend route not registered  
**Solution**: Check that profile routes include DELETE endpoint
```javascript
// backend/src/services/profile/routes.js
router.delete("/:clerkId/courses/:courseId", controller.removeCompletedCourse);
```

### Issue 2: 500 Internal Server Error
**Problem**: courseId is not being parsed correctly  
**Solution**: Ensure courseId is converted to integer
```javascript
// backend/src/services/profile/controller.js
await profileService.removeCompletedCourse(clerkId, parseInt(courseId));
```

### Issue 3: Course not removed from UI
**Problem**: React Query cache not invalidating  
**Solution**: Check mutation onSuccess callback
```javascript
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({ queryKey: ["completedCourses", variables.clerkId] });
}
```

### Issue 4: No toast notification
**Problem**: Toaster component not in layout  
**Solution**: Add to layout.js
```javascript
import { Toaster } from "sonner";

<Toaster position="top-right" richColors />
```

---

## Debugging Steps

### 1. Check Network Tab
- Open DevTools → Network tab
- Click remove button
- Look for DELETE request
- Check request URL: `/api/profile/user_xxx/courses/123`
- Check response status and body

### 2. Check Console Logs
Backend logs should show:
```
Remove completed course error: [if error]
```

Frontend logs should show:
```
Course removed successfully: { success: true, message: "..." }
```

### 3. Check Database
```sql
-- Check completed_courses table
SELECT * FROM completed_courses WHERE user_id = YOUR_USER_ID;
```

---

## Expected Behavior

### ✅ Success Flow
1. User clicks "X" button
2. Confirmation dialog appears
3. User confirms
4. Button shows loading spinner
5. DELETE request sent to backend
6. Backend removes from database
7. Success response returned
8. React Query invalidates cache
9. UI updates (course disappears)
10. Success toast shows
11. Recommendations refresh automatically

### ❌ Error Flow
1. User clicks "X" button
2. Confirmation dialog appears
3. User confirms
4. Button shows loading spinner
5. DELETE request sent to backend
6. Backend returns error
7. Error toast shows
8. Button returns to normal state
9. Course remains in list

---

## API Endpoint Details

**Endpoint**: `DELETE /api/profile/:clerkId/courses/:courseId`

**Parameters**:
- `clerkId` (path) - User's Clerk ID
- `courseId` (path) - Completed course ID (from completed_courses table, NOT courses table)

**Response**:
```json
{
  "success": true,
  "message": "Course removed successfully"
}
```

**Error Response**:
```json
{
  "error": "Failed to remove completed course",
  "message": "Course not found"
}
```

---

## Implementation Checklist

Backend:
- [x] DELETE route registered
- [x] Controller method implemented
- [x] Service method implemented
- [x] Repository method implemented
- [x] Error handling added
- [x] Response format correct

Frontend:
- [x] useRemoveCompletedCourse hook created
- [x] Remove button in UI
- [x] Confirmation dialog
- [x] Loading state
- [x] Error handling
- [x] Toast notifications
- [x] Cache invalidation
- [x] Optimistic updates

---

**Status**: ✅ Fully Implemented and Working
