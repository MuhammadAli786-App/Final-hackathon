# AI Clinic Management System - Frontend

A modern React-based frontend for the AI-powered clinic management system with role-based dashboards and comprehensive healthcare features.

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ 
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📋 Project Structure

```
src/
├── pages/              # Page components for each feature
│   ├── Login.jsx
│   ├── AdminDashboard.jsx
│   ├── DoctorDashboard.jsx
│   ├── ReceptionistDashboard.jsx
│   ├── PatientDashboard.jsx
│   ├── PatientForm.jsx
│   ├── AppointmentForm.jsx
│   ├── PrescriptionForm.jsx
│   ├── DiagnosisForm.jsx
│   ├── PatientProfile.jsx
│   ├── MedicalHistory.jsx
│   └── NotFound.jsx
├── components/         # Reusable components
│   ├── Header.jsx
│   ├── ProtectedRoute.jsx
│   └── CommonComponents.jsx
├── services/          # API communication
│   └── apiService.js
├── context/           # State management
│   └── AuthContext.jsx
├── styles/           # CSS stylesheets
│   ├── index.css
│   ├── App.css
│   ├── Forms.css
│   ├── Card.css
│   ├── Header.css
│   ├── Login.css
│   └── Dashboard.css
├── App.jsx
└── main.jsx
```

## 🎯 Features

### Role-Based Access Control
- **Admin Dashboard**: System overview, patient management, analytics
- **Doctor Dashboard**: Appointments, prescriptions, AI diagnosis tools
- **Receptionist Dashboard**: Patient registration, appointment scheduling
- **Patient Dashboard**: Personal health records, symptom checker, appointment booking

### Patient Management
- Create, read, update patient profiles
- Attach medical documents (PDF, images)
- View medical history timeline
- Track diagnoses and symptoms

### Appointment System
- Schedule appointments with doctors
- View appointment status (pending, confirmed, completed, cancelled)
- Role-based appointment filtering
- Patient-doctor relationship tracking

### Prescription Management
- Create prescriptions with multiple medicines
- PDF generation and download
- AI-powered patient-friendly explanations
- Attachment support for medication documents

### AI Symptom Checker
- Describe symptoms and get AI analysis
- Risk level assessment
- Possible condition suggestions
- Personalized recommendations
- Graceful fallback if AI is unavailable

### Analytics & Dashboards
- Admin: Total patients, doctors, revenue, appointment trends
- Doctor: Daily/monthly appointment counts, prescription stats
- Visual charts using Recharts (Line, Bar, Pie charts)

### Medical History Timeline
- Visual timeline of diagnosis logs
- Symptom tracking over time
- Risk level indicators
- Medical recommendations history

## 🔐 Authentication

### Login Credentials (Demo)
```
Admin Account:
Email: admin@clinic.com
Password: Admin@123

Doctor Account:
Email: doctor@clinic.com
Password: Doctor@123

Receptionist Account:
Email: receptionist@clinic.com
Password: Receptionist@123

Patient Account:
Email: patient@clinic.com
Password: Patient@123
```

JWT tokens are stored in localStorage and automatically included in all API requests.

## 🛠 API Integration

The frontend communicates with the backend API via the `apiService.js` file:

```javascript
// Example API calls
import { patientService, appointmentService, diagnosisService } from '@/services/apiService'

// Create patient
const response = await patientService.create(patientData)

// Get appointments
const appointments = await appointmentService.getAll({ status: 'confirmed' })

// Check symptoms with AI
const result = await diagnosisService.checkSymptoms(symptoms)
```

### Available Services
- `authService`: Login, signup, logout
- `patientService`: CRUD for patients
- `appointmentService`: Manage appointments
- `prescriptionService`: Create prescriptions, generate PDFs
- `diagnosisService`: AI symptom checking
- `analyticsService`: Dashboard statistics
- `uploadService`: File uploads to Cloudinary

## 📊 Chart Components

Recharts is used for all data visualizations:
- **LineChart**: Appointment trends, monthly statistics
- **BarChart**: Prescription counts, appointment distribution
- **PieChart**: Diagnosis distribution, condition breakdown

## 🎨 UI/UX

- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Color Scheme**: Professional purple gradient theme (#667eea to #764ba2)
- **Components**:
  - StatCard: Display KPIs
  - Card: Content containers
  - Button: Reusable button component
  - Modal: Dialog overlays
  - Table: Data display with sorting

## ⚙️ Environment Configuration

Create a `.env.local` file:
```env
VITE_API_URL=http://localhost:5000
```

Backend proxy is configured in `vite.config.js` to forward `/api` requests to `http://localhost:5000`.

## 🔄 State Management

Uses React Context API for authentication state:
- `AuthContext.jsx`: Manages user login, logout, token storage
- `useAuth()` hook: Access auth state in any component

```javascript
import { useAuth } from '@/context/AuthContext'

function MyComponent() {
  const { user, token, login, logout } = useAuth()
  // ...
}
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Push to GitHub and connect to Vercel
```

### Netlify
```bash
npm run build
# Drag & drop the dist/ folder to Netlify
```

### Environment Variables for Production
```env
VITE_API_URL=https://your-backend-url.com
```

## 📱 Mobile Responsiveness

- Hamburger menu for mobile navigation
- Touch-friendly buttons and inputs
- Responsive grid layouts
- Mobile-optimized tables

## 🐛 Troubleshooting

**API Connection Issues:**
- Ensure backend is running on port 5000
- Check CORS configuration in backend
- Verify token is saved in localStorage

**Page Not Loading:**
- Clear browser cache and localStorage
- Check browser console for errors
- Verify route paths match in App.jsx

**Form Submission Failing:**
- Validate all required fields are filled
- Check API response in network tab
- Verify user has required permissions

## 📚 Dependencies

- **react**: UI library
- **react-router-dom**: Routing
- **axios**: HTTP client
- **recharts**: Data visualization
- **date-fns**: Date formatting

## 🎓 Learn More

- React: https://react.dev
- React Router: https://reactrouter.com
- Vite: https://vitejs.dev
- Recharts: https://recharts.org

## 📝 Notes

- This is a demo application for the AI Clinic Management SaaS hackathon
- Backend API documentation available in backend README.md
- All demo credentials are for testing purposes only
- Change credentials before production deployment

## 🤝 Next Steps

1. **SaaS Features**: Implement subscription plans and feature flags
2. **Advanced Analytics**: Add more visualization options and exports
3. **Notifications**: Add real-time notifications and email alerts
4. **Mobile App**: Create React Native mobile version
5. **PWA**: Convert to Progressive Web App

---

**Built with ❤️ for AI Clinic Management System Hackathon**
