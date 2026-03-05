import './styles/App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AdminUserManagement from './pages/AdminUserManagement'
import AdminSubscriptionPanel from './pages/AdminSubscriptionPanel'
import AdminAppointmentMonitoring from './pages/AdminAppointmentMonitoring'
import DoctorDashboard from './pages/DoctorDashboard'
import ReceptionistDashboard from './pages/ReceptionistDashboard'
import PatientDashboard from './pages/PatientDashboard'
import PatientForm from './pages/PatientForm'
import AppointmentForm from './pages/AppointmentForm'
import PrescriptionForm from './pages/PrescriptionForm'
import DiagnosisForm from './pages/DiagnosisForm'
import PatientProfile from './pages/PatientProfile'
import MedicalHistory from './pages/MedicalHistory'
import AppointmentsList from './pages/AppointmentsList'
import Pricing from './pages/Pricing'
import SubscriptionPage from './pages/SubscriptionPage'
import NotFound from './pages/NotFound'
import Signup from './pages/Signup'
import VerifyOTP from './pages/VerifyOtp'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />


        
        <Route 
          path="/admin" 
          element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} 
        />
        
        <Route 
          path="/admin/users" 
          element={<ProtectedRoute roles={['admin']}><AdminUserManagement /></ProtectedRoute>} 
        />
        
        <Route 
          path="/admin/subscription" 
          element={<ProtectedRoute roles={['admin']}><AdminSubscriptionPanel /></ProtectedRoute>} 
        />
        
        <Route 
          path="/admin/appointments" 
          element={<ProtectedRoute roles={['admin']}><AdminAppointmentMonitoring /></ProtectedRoute>} 
        />
        
        <Route 
          path="/doctor" 
          element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} 
        />
        
        <Route 
          path="/receptionist" 
          element={<ProtectedRoute roles={['receptionist']}><ReceptionistDashboard /></ProtectedRoute>} 
        />
        
        <Route 
          path="/patient" 
          element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} 
        />
        
        {/* Patient Management */}
        <Route 
          path="/patients/new" 
          element={<ProtectedRoute roles={['admin', 'receptionist']}><PatientForm /></ProtectedRoute>} 
        />
        <Route 
          path="/patients/edit/:id" 
          element={<ProtectedRoute roles={['admin', 'receptionist']}><PatientForm /></ProtectedRoute>} 
        />
        <Route 
          path="/patients/:id" 
          element={<ProtectedRoute roles={['admin', 'doctor', 'receptionist', 'patient']}><PatientProfile /></ProtectedRoute>} 
        />
        
        {/* Appointments */}
        <Route 
          path="/appointments" 
          element={<ProtectedRoute roles={['admin', 'receptionist', 'doctor', 'patient']}><AppointmentsList /></ProtectedRoute>} 
        />
        <Route 
          path="/appointments/new" 
          element={<ProtectedRoute roles={['admin', 'receptionist', 'patient']}><AppointmentForm /></ProtectedRoute>} 
        />
        <Route 
          path="/appointments/edit/:id" 
          element={<ProtectedRoute roles={['admin', 'receptionist']}><AppointmentForm /></ProtectedRoute>} 
        />
        
        {/* Prescriptions */}
        <Route 
          path="/prescriptions/new" 
          element={<ProtectedRoute roles={['admin', 'doctor']}><PrescriptionForm /></ProtectedRoute>} 
        />
        
        {/* Diagnosis */}
        <Route 
          path="/diagnosis" 
          element={<ProtectedRoute roles={['doctor']}><DiagnosisForm /></ProtectedRoute>} 
        />
        
        {/* Medical History */}
        <Route 
          path="/history/:patientId" 
          element={<ProtectedRoute roles={['admin', 'doctor', 'receptionist', 'patient']}><MedicalHistory /></ProtectedRoute>} 
        />
        
        {/* Subscription & Pricing */}
        <Route path="/pricing" element={<Pricing />} />
        <Route 
          path="/subscription" 
          element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} 
        />
        
        <Route path="/" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  )
}
