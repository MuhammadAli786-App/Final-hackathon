import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Button, Card } from '../components/CommonComponents'
import { appointmentService } from '../services/apiService'
import { useAuth } from '../context/AuthContext'
import '../styles/Dashboard.css'

export default function AppointmentsList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }

  useEffect(() => {
    fetchAppointments()
  }, [user])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      let res
      
      // For patients, need to request their own appointments via query param
      if (user?.role === 'patient') {
        res = await appointmentService.getAll({ patientId: user._id })
      } else {
        res = await appointmentService.getAll()
      }
      
      let filtered = res.data || []
      
      // Filter appointments based on user role
      if (user?.role === 'patient') {
        // Patients should get filtered on backend, but double-check
        filtered = filtered.filter(apt => apt.patientId._id === user._id || apt.patientId === user._id)
      } else if (user?.role === 'doctor') {
        // Doctors see their appointments
        filtered = filtered.filter(apt => apt.doctorId._id === user._id || apt.doctorId === user._id)
      }
      // Admin and receptionist see all appointments
      
      setAppointments(filtered)
      setError('')
    } catch (err) {
      setError('Failed to load appointments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredAppointments = () => {
    if (filterStatus === 'all') return appointments
    return appointments.filter(apt => apt.status === filterStatus)
  }

  const handleCancel = async (appointmentId) => {
    try {
      // Use the /status endpoint for status updates
      const res = await fetch(`https://final-hakathon-backend-production.up.railway.app/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (!res.ok) throw new Error('Failed to cancel')

      setAppointments(appointments.map(apt => 
        apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
      ))

      addToast('Appointment cancelled successfully', 'success')
    } catch (err) {
      addToast('Failed to cancel appointment: ' + (err.message || 'Unknown error'), 'error')
      console.error(err)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: { background: '#ffc107', color: '#000' },
      confirmed: { background: '#28a745', color: '#fff' },
      completed: { background: '#6c757d', color: '#fff' },
      cancelled: { background: '#dc3545', color: '#fff' }
    }
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        ...styles[status]
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A'
    try {
      const date = new Date(dateTime)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateTime
    }
  }

  const getPatientName = (apt) => {
    if (apt.patientId?.name) return apt.patientId.name
    if (apt.patientId && typeof apt.patientId === 'string') return apt.patientId
    return 'Unknown'
  }

  const getPatientId = (apt) => {
    if (apt.patientId?._id) return apt.patientId._id
    if (typeof apt.patientId === 'string') return apt.patientId
    return ''
  }

  const getDoctorName = (apt) => {
    if (apt.doctorId?.name) return apt.doctorId.name
    if (apt.doctorId && typeof apt.doctorId === 'string') return apt.doctorId
    return 'Unknown'
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading appointments...</div>
      </>
    )
  }

  const filtered = getFilteredAppointments()

  return (
    <>
      <Header />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>📅 Appointments</h1>
          <p>Manage your appointment schedule</p>
        </div>

        <div className="container">
          {error && <div className="error-box">{error}</div>}

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFilterStatus('all')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: filterStatus === 'all' ? '#667eea' : '#e0e0e0',
                    color: filterStatus === 'all' ? '#fff' : '#000'
                  }}
                >
                  All ({appointments.length})
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: filterStatus === 'pending' ? '#ffc107' : '#e0e0e0',
                    color: filterStatus === 'pending' ? '#000' : '#666'
                  }}
                >
                  Pending ({appointments.filter(a => a.status === 'pending').length})
                </button>
                <button
                  onClick={() => setFilterStatus('confirmed')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: filterStatus === 'confirmed' ? '#28a745' : '#e0e0e0',
                    color: filterStatus === 'confirmed' ? '#fff' : '#666'
                  }}
                >
                  Confirmed ({appointments.filter(a => a.status === 'confirmed').length})
                </button>
              </div>
              
              {(user?.role === 'admin' || user?.role === 'receptionist' || user?.role === 'patient') && (
                <Button variant="primary" onClick={() => navigate('/appointments/new')}>
                  + New Appointment
                </Button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p style={{ fontSize: '1.1rem' }}>No appointments found</p>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/appointments/new')}
                  style={{ marginTop: '20px' }}
                >
                  Schedule Appointment
                </Button>
              </div>
            ) : (
              <div className="list-container">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date & Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(appointment => (
                      <tr key={appointment._id}>
                        <td>{getPatientName(appointment)}</td>
                        <td>{getDoctorName(appointment)}</td>
                        <td>{formatDateTime(appointment.date)}</td>
                        <td>{appointment.notes || '-'}</td>
                        <td>{getStatusBadge(appointment.status)}</td>
                        <td>
                          <div className="action-buttons" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                              <>
                                <Button 
                                  variant="secondary" 
                                  onClick={() => navigate(`/appointments/${appointment._id}/edit`)}
                                  style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="danger" 
                                  onClick={() => handleCancel(appointment._id)}
                                  style={{ fontSize: '0.8rem', padding: '4px 8px', background: '#dc3545' }}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="secondary" 
                              onClick={() => navigate(`/patients/${getPatientId(appointment)}`)}
                              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                            >
                              View Patient
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
        {/* Toast container for lightweight notifications */}
        <div className="toast-container" aria-live="polite">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              <div className="toast-message">{t.message}</div>
              <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>×</button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
