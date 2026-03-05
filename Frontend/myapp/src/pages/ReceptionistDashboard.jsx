import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { StatCard, Card, Button } from '../components/CommonComponents'
import { appointmentService, patientService } from '../services/apiService'
import '../styles/Dashboard.css'

export default function ReceptionistDashboard() {
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [patientsRes, apptsRes] = await Promise.all([
        patientService.getAll(),
        appointmentService.getAll({ status: 'pending' })
      ])
      
      setPatients(patientsRes.data)
      setAppointments(apptsRes.data)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading dashboard...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>👨‍💼 Receptionist Dashboard</h1>
          <p>Patient & Appointment Management</p>
        </div>

        <div className="container">
          {error && <div className="error-box">{error}</div>}

          {/* Key Stats */}
          <div className="stats-grid">
            <StatCard 
              label="Total Patients" 
              value={patients.length}
              icon="👥"
            />
            <StatCard 
              label="Pending Appointments" 
              value={appointments.length}
              icon="⏳"
            />
          </div>

          {/* Pending Appointments */}
          <Card title="Pending Appointments">
            <div className="list-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appt => (
                    <tr key={appt._id}>
                      <td>{appt.patientId?.name || 'N/A'}</td>
                      <td>{new Date(appt.appointmentDate).toLocaleDateString()}</td>
                      <td>{appt.doctorId?.name || 'Not assigned'}</td>
                      <td>
                        <Button 
                          variant="primary" 
                          onClick={() => navigate(`/appointments/edit/${appt._id}`)}
                        >
                          Confirm
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Patients List */}
          <Card title="All Patients">
            <div className="list-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Contact</th>
                    <th>Gender</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(patient => (
                    <tr key={patient._id}>
                      <td>{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.contact}</td>
                      <td>{patient.gender}</td>
                      <td>
                        <div className="action-buttons">
                          <Button variant="primary" onClick={() => navigate(`/patients/${patient._id}`)}>
                            View
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => navigate(`/appointments/new?patientId=${patient._id}`)}
                          >
                            Book Appt
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="action-grid">
              <Button variant="primary" onClick={() => navigate('/patients/new')}>
                ➕ Register Patient
              </Button>
              <Button variant="primary" onClick={() => navigate('/appointments/new')}>
                📅 Schedule Appt
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
