import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { Button } from '../components/CommonComponents'
import { patientService, uploadService } from '../services/apiService'
import '../styles/Forms.css'

export default function PatientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [documents, setDocuments] = useState([])
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    contact: '',
    medicalHistory: ''
  })

  useEffect(() => {
    if (id) {
      fetchPatient()
    }
  }, [id])

  const fetchPatient = async () => {
    try {
      setLoading(true)
      const res = await patientService.getById(id)
      setFormData(res.data)
      setDocuments(res.data.documents || [])
    } catch (err) {
      setError('Failed to load patient data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const res = await uploadService.uploadPatientDocument(id || formData._id, file)
      setDocuments([...documents, res.data])
      setSuccess('Document uploaded successfully')
    } catch (err) {
      setError('Failed to upload document')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || !formData.age || !formData.contact) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitLoading(true)

    try {
      if (id) {
        await patientService.update(id, formData)
        setSuccess('Patient updated successfully')
      } else {
        const res = await patientService.create(formData)
        setSuccess('Patient created successfully')
        setTimeout(() => navigate(`/patients/${res.data._id}`), 1500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient')
    } finally {
      setSubmitLoading(false)
    }
  }

  const removeDocument = async (docUrl) => {
    // Would need to implement delete on backend
    setDocuments(documents.filter(d => d.url !== docUrl))
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading patient data...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="form-container">
          <h2>{id ? 'Edit Patient' : 'Register New Patient'}</h2>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">Age *</label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter age"
                  required
                  min="0"
                  max="150"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contact">Contact Number *</label>
                <input
                  id="contact"
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="medicalHistory">Medical History</label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="Enter relevant medical history, allergies, chronic conditions..."
              />
            </div>

            {/* Document Upload */}
            {id && (
              <>
                <div className="form-group">
                  <label>Attached Documents</label>
                  {documents.length > 0 && (
                    <div className="field-list">
                      {documents.map((doc, idx) => (
                        <div key={idx} className="field-list-item">
                          <span>📄 {doc.fileName || 'Document'}</span>
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => removeDocument(doc.url)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="file-upload">
                    <label htmlFor="file-input" className="file-input-label">
                      📁 Click or drag files here to upload
                      <input
                        id="file-input"
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="form-actions">
              <Button
                variant="primary"
                type="submit"
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : id ? 'Update Patient' : 'Create Patient'}
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
