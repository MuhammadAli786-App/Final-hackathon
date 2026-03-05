import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { StatCard, Card, Button } from '../components/CommonComponents'
import { analyticsService, patientService, userService } from '../services/apiService'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import '../styles/Dashboard.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [receptionists, setReceptionists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, patientsRes, doctorsRes, receptionistsRes] = await Promise.all([
        analyticsService.getAdminStats(),
        patientService.getAll(),
        userService.getByRole('doctor'),
        userService.getByRole('receptionist')
      ])
      
      const fetched = statsRes.data
      // convert monthlyAppointments aggregation into trend data
      if (Array.isArray(fetched.monthlyAppointments)) {
        fetched.appointmentsTrend = fetched.monthlyAppointments.map(m => {
          const { year, month } = m._id || {}
          const monthStr = year && month ? `${year}-${String(month).padStart(2,'0')}` : ''
          return { month: monthStr, count: m.count }
        })
      } else {
        fetched.appointmentsTrend = []
      }
      setStats(fetched)
      setPatients(patientsRes.data.slice(0, 5)) // Show last 5 patients
      setDoctors(doctorsRes.data || [])
      setReceptionists(receptionistsRes.data || [])
      setError('')
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

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe']

  return (
    <>
      <Header />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>📊 Admin Dashboard</h1>
          <p>System Overview & Analytics</p>
        </div>

        <div className="container">
          {error && <div className="error-box">{error}</div>}

          {/* Key Stats */}
          <div className="stats-grid">
            <StatCard 
              label="Total Patients" 
              value={stats?.totalPatients || 0}
              icon="👥"
            />
            <StatCard 
              label="Total Doctors" 
              value={doctors.length}
              icon="👨‍⚕️"
            />
            <StatCard 
              label="Total Receptionists" 
              value={receptionists.length}
              icon="📋"
            />
            <StatCard 
              label="Monthly Appointments" 
              value={
                Array.isArray(stats?.monthlyAppointments)
                  ? stats.monthlyAppointments.reduce((s, m) => s + (m.count || 0), 0)
                  : stats?.monthlyAppointments || 0
              }
              icon="📅"
            />
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <Card title="Monthly Appointments Trend">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.appointmentsTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Common Diagnoses">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.commonDiagnosis || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(stats?.commonDiagnosis || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Recent Patients */}
          <Card title="Recent Patients">
            <div className="list-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(patient => (
                    <tr key={patient._id}>
                      <td>{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.contact}</td>
                      <td>
                        <div className="action-buttons">
                          <Button variant="primary" onClick={() => navigate(`/patients/${patient._id}`)}>
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Doctors List */}
          <Card title={`All Doctors (${doctors.length})`}>
            <div className="list-container">
              {doctors.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>No doctors found</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map(doctor => (
                      <tr key={doctor._id}>
                        <td>{doctor.name}</td>
                        <td>{doctor.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          {/* Receptionists List */}
          <Card title={`All Receptionists (${receptionists.length})`}>
            <div className="list-container">
              {receptionists.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>No receptionists found</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receptionists.map(receptionist => (
                      <tr key={receptionist._id}>
                        <td>{receptionist.name}</td>
                        <td>{receptionist.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions & Management">
            <div className="action-grid">
              <Button variant="primary" onClick={() => navigate('/patients/new')}>
                ➕ Add Patient
              </Button>
              <Button variant="primary" onClick={() => navigate('/appointments/new')}>
                📅 Schedule Appointment
              </Button>
              <Button variant="primary" onClick={() => navigate('/prescriptions/new')}>
                💊 Create Prescription
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/users')}>
                👥 User Management
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/subscription')}>
                💳 Subscription Panel
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/appointments')}>
                📊 Appointment Monitoring
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
