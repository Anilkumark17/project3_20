# Test Endpoints

## Test these in your browser or with curl:

### 1. Test Courses Endpoint
```bash
curl http://localhost:5000/api/courses/search?page=1&pageSize=12
```

Expected response:
```json
{
  "success": true,
  "courses": [...],
  "total": 119,
  "page": 1,
  "pageSize": 12,
  "totalPages": 10
}
```

### 2. Test Recommendations Endpoint
```bash
curl http://localhost:5000/api/recommendations/YOUR_CLERK_ID
```

Expected response:
```json
{
  "success": true,
  "recommendations": [],
  "generatedAt": null
}
```

### 3. Test Refresh Recommendations
```bash
curl -X POST http://localhost:5000/api/recommendations/YOUR_CLERK_ID/refresh
```

## Common Issues:

1. **Backend not running** - Check if server is on port 5000
2. **Course cache not loaded** - Check server logs for "✓ Course cache loaded: 119 courses"
3. **CORS issues** - Check browser console for CORS errors
4. **Frontend not connecting** - Check Network tab in browser DevTools

## Debugging Steps:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to `/courses` page
4. Check if request to `http://localhost:5000/api/courses/search` is made
5. Check response status and data
6. Check Console tab for any JavaScript errors
