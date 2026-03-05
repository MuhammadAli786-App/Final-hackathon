import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Button, Card } from '../components/CommonComponents'
import { diagnosisService } from '../services/apiService'
import '../styles/Forms.css'

export default function DiagnosisForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  
  const [formData, setFormData] = useState({
    symptoms: '',
    age: '',
    gender: 'male',
    duration: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!formData.symptoms) {
      setError('Please describe your symptoms')
      return
    }

    setLoading(true)

    try {
      const res = await diagnosisService.checkSymptoms({
        symptoms: formData.symptoms,
        age: formData.age || 30,
        gender: formData.gender,
        history: { duration: formData.duration || 'recent' }
      })
      
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze symptoms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="form-container">
            <h2>🔍 AI Symptom Checker</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Describe your symptoms and get an AI-powered preliminary analysis. 
              This is not a replacement for professional medical advice.
            </p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="symptoms">Describe Your Symptoms *</label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="E.g., I have a persistent cough, fever, and difficulty breathing for the last 3 days"
                  style={{ minHeight: '120px' }}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Your age"
                    min="0"
                    max="150"
                  />
                </div>

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
              </div>

              <div className="form-group">
                <label htmlFor="duration">Symptom Duration</label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                >
                  <option value="">Not specified</option>
                  <option value="1-2 days">1-2 days</option>
                  <option value="3-7 days">3-7 days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="more than 2 weeks">More than 2 weeks</option>
                </select>
              </div>

              <div className="form-actions">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Analyze Symptoms'}
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

          {/* Results */}
          {result && (
            <div style={{ marginTop: '30px' }}>
              <Card title="Analysis Results">
                <div style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '10px' }}>Possible Conditions</h3>
                    {result.possibleConditions && result.possibleConditions.length > 0 ? (
                      <ul style={{ paddingLeft: '20px' }}>
                        {result.possibleConditions.map((condition, idx) => (
                          <li key={idx} style={{ marginBottom: '8px', color: '#333' }}>
                            {typeof condition === 'string' ? condition : condition.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No specific conditions identified. Please consult a healthcare professional.</p>
                    )}
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '10px' }}>Risk Level</h3>
                    <div style={{
                      padding: '10px 15px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      backgroundColor: result.riskLevel === 'HIGH' ? '#f8d7da' :
                                       result.riskLevel === 'MEDIUM' ? '#fff3cd' : '#d4edda',
                      color: result.riskLevel === 'HIGH' ? '#721c24' :
                             result.riskLevel === 'MEDIUM' ? '#856404' : '#155724'
                    }}>
                      {result.riskLevel || 'Moderate'}
                    </div>
                  </div>

                  {result.recommendations && (
                    <div>
                      <h3 style={{ marginBottom: '10px' }}>Recommendations</h3>
                      <ul style={{ paddingLeft: '20px' }}>
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} style={{ marginBottom: '8px', color: '#333' }}>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '6px', borderLeft: '4px solid #2196F3' }}>
                    <strong>⚠️ Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. 
                    Please consult with a qualified healthcare provider for proper diagnosis and treatment.
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
