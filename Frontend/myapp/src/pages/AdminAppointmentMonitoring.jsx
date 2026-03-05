import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { Card } from '../components/CommonComponents'
import { appointmentService } from '../services/apiService'
import '../styles/Dashboard.css'

export default function AdminAppointmentMonitoring() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMonth, setFilterMonth] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const res = await appointmentService.getAll()
      setAppointments(res.data || [])
      setError('')
    } catch (err) {
      setError('Failed to load appointments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredAppointments = () => {
    let filtered = appointments

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus)
    }

    // Filter by month
    if (filterMonth) {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date)
        const [year, month] = filterMonth.split('-')
        return aptDate.getFullYear() === parseInt(year) && 
               (aptDate.getMonth() + 1) === parseInt(month)
      })
    }

    return filtered
  }

  const getPatientName = (apt) => {
    if (apt.patientId?.name) return apt.patientId.name
    if (apt.patientId && typeof apt.patientId === 'string') return apt.patientId
    return 'Unknown'
  }

  const getDoctorName = (apt) => {
    if (apt.doctorId?.name) return apt.doctorId.name
    if (apt.doctorId && typeof apt.doctorId === 'string') return apt.doctorId
    return 'Unknown'
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

  const getStatusStats = () => {
    const stats = {
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length
    }
    return stats
  }

  const stats = getStatusStats()
  const filtered = getFilteredAppointments()

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading appointment data...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>📅 Appointment Monitoring</h1>
          <p>System-wide view of all appointments (Read-Only)</p>
        </div>

        <div className="container">
          {error && <div className="error-box">{error}</div>}

          {/* Appointment Statistics */}
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#856404' }}>{stats.pending}</div>
                <div style={{ color: '#856404' }}>Pending</div>
              </div>
              <div style={{ padding: '15px', background: '#d4edda', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#155724' }}>{stats.confirmed}</div>
                <div style={{ color: '#155724' }}>Confirmed</div>
              </div>
              <div style={{ padding: '15px', background: '#d1ecf1', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0c5460' }}>{stats.completed}</div>
                <div style={{ color: '#0c5460' }}>Completed</div>
              </div>
              <div style={{ padding: '15px', background: '#f8d7da', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#721c24' }}>{stats.cancelled}</div>
                <div style={{ color: '#721c24' }}>Cancelled</div>
              </div>
            </div>
          </Card>

          {/* Filters */}
          <Card>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Filter by Status:</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="all">All ({appointments.length})</option>
                  <option value="pending">Pending ({stats.pending})</option>
                  <option value="confirmed">Confirmed ({stats.confirmed})</option>
                  <option value="completed">Completed ({stats.completed})</option>
                  <option value="cancelled">Cancelled ({stats.cancelled})</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Filter by Month:</label>
                <input 
                  type="month" 
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
          </Card>

          {/* Appointments Table */}
          <Card title="All System Appointments">
            <div className="list-container">
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No appointments match the selected filters</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date & Time</th>
                      <th>Reason/Notes</th>
                      <th>Status</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(appointment => {
                      const durationMins = appointment.durationMinutes || 30
                      return (
                        <tr key={appointment._id}>
                          <td>{getPatientName(appointment)}</td>
                          <td>{getDoctorName(appointment)}</td>
                          <td>{formatDateTime(appointment.date)}</td>
                          <td>{appointment.notes || '-'}</td>
                          <td>{getStatusBadge(appointment.status)}</td>
                          <td>{durationMins} mins</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          {/* Key Metrics */}
          <Card title="Appointment Metrics">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <h4>Total Appointments</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>{appointments.length}</p>
              </div>
              <div>
                <h4>Completion Rate</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                  {appointments.length > 0 ? Math.round((stats.completed / appointments.length) * 100) : 0}%
                </p>
              </div>
              <div>
                <h4>Cancellation Rate</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                  {appointments.length > 0 ? Math.round((stats.cancelled / appointments.length) * 100) : 0}%
                </p>
              </div>
              <div>
                <h4>Pending Action</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>{stats.pending}</p>
              </div>
            </div>
          </Card>

          {/* Legend */}
          <Card title="Status Legend">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div>{getStatusBadge('pending')} - Awaiting confirmation</div>
              <div>{getStatusBadge('confirmed')} - Confirmed and scheduled</div>
              <div>{getStatusBadge('completed')} - Appointment completed</div>
              <div>{getStatusBadge('cancelled')} - Cancelled by patient/doctor</div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
