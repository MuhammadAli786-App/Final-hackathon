import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { Card, Button } from '../components/CommonComponents'
import { diagnosisService, patientService } from '../services/apiService'
import '../styles/Dashboard.css'

export default function MedicalHistory() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMedicalHistory()
  }, [patientId])

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true)
      const [patRes, logsRes] = await Promise.all([
        patientService.getById(patientId),
        diagnosisService.getPatientLogs(patientId)
      ])
      
      setPatient(patRes.data)
      setLogs(logsRes.data)
    } catch (err) {
      setError('Failed to load medical history')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading medical history...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        {error && <div className="error-box">{error}</div>}

        {/* Patient Info */}
        {patient && (
          <Card title={`${patient.name}'s Medical History`}>
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Age:</strong> {patient.age}</p>
              <p><strong>Gender:</strong> {patient.gender}</p>
              {patient.medicalHistory && (
                <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <strong>Background:</strong>
                  <p style={{ marginTop: '8px' }}>{patient.medicalHistory}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Diagnosis Timeline */}
        <Card title="📋 Diagnosis & Symptoms Log">
          {logs.length > 0 ? (
            <div style={{ position: 'relative' }}>
              {logs.map((log, idx) => (
                <div key={log._id} style={{
                  paddingLeft: '30px',
                  paddingBottom: '25px',
                  borderLeft: idx !== logs.length - 1 ? '2px solid #667eea' : 'none',
                  position: 'relative'
                }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-8px',
                    top: '0',
                    width: '14px',
                    height: '14px',
                    backgroundColor: '#667eea',
                    borderRadius: '50%',
                    border: '3px solid white'
                  }} />

                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '6px',
                    borderLeft: '4px solid #667eea'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                          {new Date(log.createdAt).toLocaleDateString()}
                        </h4>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <span style={{
                        padding: '5px 12px',
                        borderRadius: '16px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        backgroundColor: log.riskLevel === 'HIGH' ? '#f8d7da' :
                                         log.riskLevel === 'MEDIUM' ? '#fff3cd' : '#d4edda',
                        color: log.riskLevel === 'HIGH' ? '#721c24' :
                               log.riskLevel === 'MEDIUM' ? '#856404' : '#155724'
                      }}>
                        {log.riskLevel || 'Normal'} Risk
                      </span>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <strong>Symptoms:</strong>
                      <p style={{ marginTop: '5px', color: '#555' }}>{log.symptoms}</p>
                    </div>

                    {log.possibleConditions && log.possibleConditions.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Possible Conditions:</strong>
                        <ul style={{ marginTop: '5px', paddingLeft: '20px', color: '#555' }}>
                          {log.possibleConditions.map((cond, i) => (
                            <li key={i}>{typeof cond === 'string' ? cond : cond.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {log.recommendations && log.recommendations.length > 0 && (
                      <div>
                        <strong>Recommendations:</strong>
                        <ul style={{ marginTop: '5px', paddingLeft: '20px', color: '#555' }}>
                          {log.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No diagnosis records found for this patient.</p>
          )}
        </Card>

        {/* Actions */}
        <Card title="Actions">
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="primary" onClick={() => navigate(`/patients/${patientId}`)}>
              Back to Profile
            </Button>
            <Button variant="primary" onClick={() => navigate('/diagnosis')}>
              New Symptom Check
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}
