import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Button } from '../components/CommonComponents'
import { prescriptionService, patientService } from '../services/apiService'
import '../styles/Forms.css'

export default function PrescriptionForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }])
  
  const [formData, setFormData] = useState({
    patientId: '',
    instructions: '',
    notes: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await patientService.getAll()
      setPatients(res.data)
    } catch (err) {
      setError('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines]
    newMedicines[index][field] = value
    setMedicines(newMedicines)
  }

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '' }])
  }

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.patientId) {
      setError('Please select a patient')
      return
    }

    if (medicines.some(m => !m.name || !m.dosage || !m.duration)) {
      setError('Please fill in all medicine details')
      return
    }

    setSubmitLoading(true)

    try {
      const res = await prescriptionService.create({
        ...formData,
        medicines: medicines.filter(m => m.name && m.dosage && m.duration)
      })
      
      setSuccess('Prescription created successfully')
      setTimeout(() => navigate(`/patients/${formData.patientId}`), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create prescription')
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
          <h2>Create Prescription</h2>

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
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name} ({patient.age}y)
                  </option>
                ))}
              </select>
            </div>

            {/* Medicines */}
            <div className="form-group">
              <label>Medicines *</label>
              <div className="field-list">
                {medicines.map((medicine, index) => (
                  <div key={index} className="field-list-item" style={{ flexDirection: 'column' }}>
                    <div style={{ width: '100%', display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="Medicine name"
                        value={medicine.name}
                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g., 500mg)"
                        value={medicine.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g., 7 days)"
                        value={medicine.duration}
                        onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeMedicine(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="add-field-btn"
                onClick={addMedicine}
              >
                ➕ Add Medicine
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="instructions">Instructions</label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="E.g., Take twice daily after food, avoid dairy..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional medical notes or observations..."
              />
            </div>

            <div className="form-actions">
              <Button
                variant="primary"
                type="submit"
                disabled={submitLoading}
              >
                {submitLoading ? 'Creating...' : 'Create Prescription'}
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
