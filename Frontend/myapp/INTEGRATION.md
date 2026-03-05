# Frontend-Backend Integration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         React Application (Port 3000)               │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  Pages, Components, State Management (Context) │ │  │
│  │  └──────────────────────┬───────────────────────────┘ │  │
│  └─────────────────────────┼──────────────────────────────┘
│                            │ HTTP/CORS
│                            ▼
│  ┌─────────────────────────────────────────────────────┐
│  │        API Gateway / Proxy                          │
│  │  (Vite proxy config routes /api to :5000)          │
│  └────────────────────┬────────────────────────────────┘
│                       │
└───────────────────────┼──────────────────────────────────┘
                        │ API Requests
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Express.js Backend (Port 5000)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes → Middleware (Auth, RBAC) → Controllers     │  │
│  │  ↓                                                    │  │
│  │  MongoDB Operations → Cloudinary Uploads             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Example

### User Authentication Flow

```
1. User enters email/password
   ↓
2. Frontend: POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend returns: { token, user: { id, name, role, ... } }
   ↓
5. Frontend stores in localStorage:
   - token: JWT token
   - user: User object
   ↓
6. Frontend redirects to role-based dashboard
   ↓
7. All subsequent requests include:
   Authorization: Bearer {token}
```

### Patient Creation Flow

```
1. Receptionist fills patient form
   ↓
2. Frontend POST /api/patients
   {
     name: "John Doe",
     age: 35,
     gender: "male",
     contact: "+91999999999"
   }
   ↓
3. Backend middleware:
   - Verify JWT token
   - Check user role (receptionist allowed)
   ↓
4. Backend controller:
   - Validate input
   - Create in MongoDB
   - Return: { _id, name, age, ... }
   ↓
5. Frontend receives patient ID
   ↓
6. Frontend redirects to patient profile
   ↓
7. Additional table in UI updates with new patient
```

### Appointment Booking Flow

```
1. User selects:
   - Patient ID
   - Doctor ID
   - Date & Time
   - Reason
   ↓
2. Frontend POST /api/appointments
   ↓
3. Backend:
   - Validates date is in future
   - Checks doctor availability (optional)
   - Creates appointment record
   - Returns appointment with status "pending"
   ↓
4. Frontend shows success message
   ↓
5. Receptionist/Admin can:
   - PUT /api/appointments/:id (to update status)
   - DELETE /api/appointments/:id (to cancel)
   ↓
6. Doctor sees in dashboard (filtered by their ID)
```

### Prescription with PDF Flow

```
1. Doctor creates prescription
   - Selects patient
   - Adds medicines
   - Adds instructions
   ↓
2. Frontend POST /api/prescriptions
   ↓
3. Backend:
   - Creates prescription record
   - Generates PDF (pdfkit)
   - Saves to uploads/ folder
   - Returns: { _id, pdfUrl, ... }
   ↓
4. Frontend can:
   - Download PDF: GET /api/prescriptions/:id/pdf
   - Get AI explanation: POST /api/prescriptions/:id/explain
   ↓
5. Backend (for explanation):
   - Calls OpenAI with prescription data
   - Saves explanation in DB
   - Returns patient-friendly text
```

### AI Symptom Checker Flow

```
1. Patient describes symptoms
   ↓
2. Frontend POST /api/diagnosis/check
   {
     symptoms: "fever, cough, shortness of breath",
     age: 45,
     gender: "male",
     history: { duration: "3 days" }
   }
   ↓
3. Backend:
   - Calls OpenAI GPT-3.5-turbo
   - Parses JSON response
   - Creates diagnosis log
   ↓
4. If AI fails:
   - Uses keyword-based analyzer
   - Still provides helpful response
   - Graceful degradation
   ↓
5. Frontend displays:
   - Possible conditions
   - Risk level (LOW/MEDIUM/HIGH)
   - Recommendations
   - Disclaimer about seeing doctor
```

## API Request Examples

### With Authentication

```javascript
// Frontend code
const token = localStorage.getItem('token')

// All requests automatically include token via interceptor
const response = await fetch('http://localhost:5000/api/patients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ name: 'John', age: 30, ... })
})
```

### File Upload (Multipart)

```javascript
const formData = new FormData()
formData.append('file', fileObject)
formData.append('patientId', patientId)

// Upload to Cloudinary
await fetch('http://localhost:5000/api/uploads/patient-document', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
})
```

### Query Parameters

```javascript
// Frontend filtering appointments
await fetch(
  'http://localhost:5000/api/appointments?status=confirmed&patientId=123',
  { headers: { 'Authorization': `Bearer ${token}` } }
)

// Backend filters results
```

## Error Handling

### Frontend Error Handling

```javascript
try {
  const response = await patientService.create(data)
  // Success
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - token expired
    logout()
    redirect('/login')
  } else if (error.response?.status === 403) {
    // Forbidden - insufficient permissions
    showError('You do not have permission')
  } else {
    // Other errors
    showError(error.response?.data?.message || 'Request failed')
  }
}
```

### Backend Error Responses

```javascript
// 400 Bad Request
{ message: "Validation failed", errors: { ... } }

// 401 Unauthorized
{ message: "Invalid or expired token" }

// 403 Forbidden
{ message: "You do not have permission to access this resource" }

// 404 Not Found
{ message: "Patient not found" }

// 500 Server Error
{ message: "Internal server error" }
```

## CORS Configuration

Frontend and backend are on different ports, so CORS is needed:

**Backend (Express):**
```javascript
// app.js should have CORS enabled
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

**Frontend (Vite):**
```javascript
// vite.config.js proxy automatically handles CORS
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

## Environment-Specific URLs

### Development
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API Path: `/api` (proxied)

### Production
- Frontend: `https://yourdomain.com`
- Backend: `https://api.yourdomain.com`
- API Path: `https://api.yourdomain.com/api`

Update `.env.local`:
```env
VITE_API_URL=https://api.yourdomain.com
```

## Token Management

### Token Lifecycle

```
1. User logs in → Backend issues JWT
2. Frontend stores token in localStorage
3. Frontend sends token in every request header
4. Backend validates token on each request
5. If token expires → Middleware returns 401
6. Frontend catches 401 → Clears localStorage → Redirects to login
7. User must login again
```

### Token Structure

```
Header: { alg: "HS256", typ: "JWT" }
Payload: { userId, email, name, role, exp: 1234567890 }
Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
```

## Data Consistency

### Optimistic Updates
```javascript
// Frontend assumes success and updates UI immediately
setPrescriptions([...prescriptions, newPrescription])

// Then confirms with backend
try {
  await prescriptionService.create(data)
} catch (error) {
  // Rollback if failed
  setPrescriptions(originalList)
}
```

### Fresh Data Loading
```javascript
// After critical operations, refetch data
useEffect(() => {
  fetchDashboardData()
}, [id]) // Refetch when patient ID changes
```

## API Rate Limiting (Future)

Backend can implement rate limiting:

```javascript
// Backend might return:
// 429 Too Many Requests
// X-RateLimit-Remaining: 50
// X-RateLimit-Reset: 1234567890

// Frontend should respect and show:
// "Please try again after 60 seconds"
```

## Real-Time Features (Future)

For live updates, could implement WebSockets:

```javascript
// Frontend
const socket = io('http://localhost:5000')

socket.on('appointment:scheduled', (appointment) => {
  // Real-time update in dashboard
  addAppointment(appointment)
})

// Backend
io.emit('appointment:scheduled', newAppointment)
```

## Performance Optimization

### Caching Strategies
```javascript
// Cache patients list in frontend
const [cachedPatients, setCachedPatients] = useState(null)
const [lastFetch, setLastFetch] = useState(null)

// Only refetch if > 5 min old
if (!cachedPatients || Date.now() - lastFetch > 300000) {
  const data = await patientService.getAll()
  setCachedPatients(data)
  setLastFetch(Date.now())
}
```

### Pagination (Future)
```javascript
// Frontend requests with pagination
const response = await patientService.getAll({ 
  page: 1, 
  limit: 10 
})

// Backend returns:
{
  data: [...],
  pagination: { page: 1, limit: 10, total: 100, pages: 10 }
}
```

## Troubleshooting Guide

| Issue | Frontend | Backend | Solution |
|-------|----------|---------|----------|
| Token invalid | 401 error | `verify()` fails | Logout and login again |
| API not found | Network error | 404 response | Check route definition |
| CORS error | OPTIONS fails | Missing header | Enable CORS in backend |
| Validation error | Display error | 400 response | Check form validation |
| File upload | Multipart error | Multer fails | Check file size limit |

## Testing the Integration

### 1. Test Authentication
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.com","password":"Admin@123"}'
```

### 2. Test Protected Route with Token
```bash
curl -X GET http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test in Frontend Console
```javascript
// Check stored data
console.log(localStorage.getItem('token'))
console.log(JSON.parse(localStorage.getItem('user')))

// Check recent API calls (Network tab)
// Look for Authorization header in requests
```

## Summary

The frontend and backend are tightly integrated through:
1. **HTTP REST API** - Standard request/response
2. **JWT Authentication** - Token-based security
3. **Role-Based Access** - Backend enforces permissions
4. **Error Handling** - Both layers validate
5. **Data Consistency** - Optimistic updates with fallback
6. **CORS Proxy** - Vite handles cross-origin requests

This architecture ensures:
- ✅ Secure communication
- ✅ Role-based access control
- ✅ Optimized performance
- ✅ Graceful error handling
- ✅ Easy scalability

---

**For detailed API endpoints, see `/backend/README.md`**
