import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { Button } from '../components/CommonComponents'
import { appointmentService, patientService } from '../services/apiService'
import { useAuth } from '../context/AuthContext'
import '../styles/Forms.css'

export default function AppointmentForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const isEditing = Boolean(id)
  
  const [formData, setFormData] = useState({
    patientId: searchParams.get('patientId') || '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '09:00',
    reason: ''
  })

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [patientsRes] = await Promise.all([
        patientService.getAll()
      ])
      
      setPatients(patientsRes.data)
      
      // Fetch doctors from user API
      const docsRes = await fetch('https://heroic-sparkle.railway.app/api/users?role=doctor', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const docs = await docsRes.json()
      setDoctors(docs)

      // If editing, fetch the appointment
      if (isEditing) {
        const aptRes = await appointmentService.getById(id)
        const apt = aptRes.data
        const dateObj = new Date(apt.date)
        const dateStr = dateObj.toISOString().split('T')[0]
        const timeStr = dateObj.toTimeString().split(' ')[0].substring(0, 5)
        
        setFormData({
          patientId: apt.patientId?._id || apt.patientId,
          doctorId: apt.doctorId?._id || apt.doctorId,
          appointmentDate: dateStr,
          appointmentTime: timeStr,
          reason: apt.notes || ''
        })
      }
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitLoading(true)

    try {
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime || '09:00'}`)
      const payload = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentDate: appointmentDateTime,
        reason: formData.reason
      }

      if (isEditing) {
        // For edit, we need to use the backend update endpoint
        // The appointmentService.update() might use the wrong endpoint
        const res = await fetch(`https://heroic-sparkle.railway.app/api/appointments/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        })
        
        if (!res.ok) {
          throw new Error('Failed to update appointment')
        }
        setSuccess('Appointment updated successfully')
      } else {
        await appointmentService.create({
          ...payload,
          status: 'pending'
        })
        setSuccess('Appointment scheduled successfully')
      }
      
      setTimeout(() => navigate('/appointments'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save appointment')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="form-container">
          <h2>{isEditing ? 'Edit Appointment' : 'Schedule Appointment'}</h2>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="patientId">Patient *</label>
              <select
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
                disabled={isEditing}
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name} ({patient.age}y)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="doctorId">Doctor *</label>
              <select
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                disabled={isEditing}
              >
                <option value="">Select a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="appointmentDate">Appointment Date *</label>
                <input
                  id="appointmentDate"
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label htmlFor="appointmentTime">Appointment Time</label>
                <input
                  id="appointmentTime"
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for Appointment</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Describe the reason for your appointment..."
              />
            </div>

            <div className="form-actions">
              <Button
                variant="primary"
                type="submit"
                disabled={submitLoading}
              >
                {submitLoading ? (isEditing ? 'Updating...' : 'Scheduling...') : (isEditing ? 'Update Appointment' : 'Schedule Appointment')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

