import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Card, Button } from '../components/CommonComponents'
import { appointmentService, patientService, prescriptionService } from '../services/apiService'
import { useAuth } from '../context/AuthContext'
import '../styles/Dashboard.css'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchPatientData()
  }, [user])

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      let currentPatient = null
      let queryPatientId = user._id

      // try to fetch a patient document matching the user id
      try {
        const patientsRes = await patientService.getById(user._id)
        currentPatient = patientsRes.data
        queryPatientId = currentPatient._id
      } catch (err) {
        // if 404 or forbidden, just fall back to basic user info
        if (err.response && err.response.status !== 404) {
          console.error('patient lookup error', err)
          throw err
        }
        currentPatient = { _id: user._id, name: user.name }
      }

      setPatient(currentPatient)
      const apptsRes = await appointmentService.getAll({ patientId: queryPatientId })
      setAppointments(apptsRes.data)
    } catch (err) {
      setError('Failed to load patient data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading your profile...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>👤 Patient Dashboard</h1>
          <p>Your Health Records & Appointments</p>
        </div>

        <div className="container">
          {error && <div className="error-box">{error}</div>}

          {/* Patient Info */}
          {patient && (
            <Card title="My Profile">
              <div className="profile-info">
                <p><strong>Name:</strong> {patient.name}</p>
                {patient.age && <p><strong>Age:</strong> {patient.age}</p>}
                {patient.gender && <p><strong>Gender:</strong> {patient.gender}</p>}
                {patient.contact && <p><strong>Contact:</strong> {patient.contact}</p>}
              </div>
              {/* only allow editing if we have a full patient record */}
              {patient.age && (
                <Button 
                  variant="primary" 
                  onClick={() => navigate(`/patients/edit/${patient._id}`)}
                >
                  Edit Profile
                </Button>
              )}
            </Card>
          )}

          {/* Appointments */}
          <Card title="My Appointments">
            {appointments.length > 0 ? (
              <div className="list-container">
                <table>
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(appt => (
                      <tr key={appt._id}>
                        <td>{appt.doctorId?.name || 'TBD'}</td>
                        <td>{new Date(appt.appointmentDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge status-${appt.status}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td>
                          <Button variant="primary">View Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No appointments scheduled yet.</p>
            )}
            <Button 
              variant="primary" 
              onClick={() => navigate('/appointments/new')}
            >
              📅 Book Appointment
            </Button>
          </Card>

          {/* Medical History */}
          <Card title="Medical History">
            <p>📋 View your medical history and diagnosis records</p>
            {patient && patient.age && (
              <Button 
                variant="primary" 
                onClick={() => navigate(`/history/${patient._id}`)}
              >
                View Medical History
              </Button>
            )}
          </Card>

          {/* Health Services */}
          <Card title="Health Services">
            <div className="action-grid">
              {/* symptom checker only for doctors */}
              {user.role === 'doctor' && (
                <Button variant="primary" onClick={() => navigate('/diagnosis')}>
                  🔍 Symptom Checker
                </Button>
              )}
              {patient && patient.age && (
                <Button variant="primary" onClick={() => navigate(`/history/${patient._id}`)}>
                  📊 Medical History
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
