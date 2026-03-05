import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Button, Card } from '../components/CommonComponents'
import { userService } from '../services/apiService'
import '../styles/Dashboard.css'

export default function AdminUserManagement() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [receptionists, setReceptionists] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toasts, setToasts] = useState([])
  const [activeTab, setActiveTab] = useState('doctors')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'doctor' })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const addToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const [doctorsRes, receptionistsRes, patientsRes] = await Promise.all([
        userService.getByRole('doctor'),
        userService.getByRole('receptionist'),
        fetch('http://localhost:5000/api/patients', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json())
      ])
      setDoctors(doctorsRes.data || [])
      setReceptionists(receptionistsRes.data || [])
      setPatients(patientsRes || [])
      setError('')
    } catch (err) {
      setError('Failed to load users or patients')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      if (activeTab === 'patients') {
        // patient form validation
        const { name, age, gender, contact } = formData
        if (!name || !age || !gender || !contact) {
          addToast('All fields are required for patient', 'error')
          return
        }
        const res = await fetch('http://localhost:5000/api/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        })
        if (!res.ok) throw new Error('Failed to create patient')
        const pat = await res.json()
        setPatients([...patients, pat])
        addToast('Patient created successfully', 'success')
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          addToast('All fields are required', 'error')
          return
        }

        const response = await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        })

        if (!response.ok) throw new Error('Failed to create user')

        const newUser = await response.json()
        
        if (formData.role === 'doctor') {
          setDoctors([...doctors, newUser.user])
        } else {
          setReceptionists([...receptionists, newUser.user])
        }
        addToast(`${formData.role} created successfully`, 'success')
      }
      setFormData({ name: '', email: '', password: '', role: 'doctor', age: '', gender: '', contact: '' })
      setShowAddForm(false)
    } catch (err) {
      addToast(err.message || 'Error creating user/patient', 'error')
    }
  }

  const handleDelete = async (userId, role) => {
    if (!window.confirm(`Delete this ${role}?`)) return

    try {
      let response
      if (role === 'patient') {
        response = await fetch(`http://localhost:5000/api/patients/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      } else {
        response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      }

      if (!response.ok) throw new Error('Failed to delete')

      if (role === 'doctor') {
        setDoctors(doctors.filter(u => u._id !== userId))
      } else if (role === 'receptionist') {
        setReceptionists(receptionists.filter(u => u._id !== userId))
      } else {
        setPatients(patients.filter(u => u._id !== userId))
      }

      addToast(`${role} deleted successfully`, 'success')
    } catch (err) {
      addToast(err.message || 'Error deleting user', 'error')
    }
  }

  const handleToggleActive = async (userId, currentStatus, role) => {
    try {
      let response, updated
      if (role === 'patient') {
        response = await fetch(`http://localhost:5000/api/patients/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ isActive: !currentStatus })
        })
        updated = await response.json()
        setPatients(patients.map(u => u._id === userId ? updated : u))
      } else {
        response = await fetch(`http://localhost:5000/api/users/${userId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ isActive: !currentStatus })
        })
        updated = await response.json()
        if (role === 'doctor') {
          setDoctors(doctors.map(u => u._id === userId ? updated.user : u))
        } else {
          setReceptionists(receptionists.map(u => u._id === userId ? updated.user : u))
        }
      }

      addToast(`${role} ${!currentStatus ? 'activated' : 'deactivated'}`, 'success')
    } catch (err) {
      addToast(err.message || 'Error updating status', 'error')
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading user management...</div>
      </>
    )
  }

  const currentUsers = activeTab === 'doctors' ? doctors : activeTab === 'receptionists' ? receptionists : patients
  const currentRole = activeTab === 'doctors' ? 'doctor' : activeTab === 'receptionists' ? 'receptionist' : 'patient'

  return (
    <>
      <Header />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>👥 User Management</h1>
          <p>Manage doctors, receptionists & patients</p>
        </div>

        <div className="container">
          {error && <div className="error-box">{error}</div>}

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setActiveTab('doctors')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: activeTab === 'doctors' ? '#667eea' : '#e0e0e0',
                    color: activeTab === 'doctors' ? '#fff' : '#000'
                  }}
                >
                  Doctors ({doctors.length})
                </button>
                <button
                  onClick={() => setActiveTab('receptionists')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: activeTab === 'receptionists' ? '#667eea' : '#e0e0e0',
                    color: activeTab === 'receptionists' ? '#fff' : '#000'
                  }}
                >
                  Receptionists ({receptionists.length})
                </button>
                <button
                  onClick={() => setActiveTab('patients')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: activeTab === 'patients' ? '#667eea' : '#e0e0e0',
                    color: activeTab === 'patients' ? '#fff' : '#000'
                  }}
                >
                  Patients ({patients.length})
                </button>
              </div>
              <Button variant="primary" onClick={() => { setShowAddForm(true); setFormData({ ...formData, role: currentRole }); }}>
                ➕ Add {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
              </Button>
            </div>

            {showAddForm && (
              <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>Add New {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}</h3>
                <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  {currentRole === 'patient' ? (
                    <>
                      <input
                        type="number"
                        placeholder="Age"
                        value={formData.age || ''}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      <select
                        value={formData.gender || ''}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Contact Number"
                        value={formData.contact || ''}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      <input
                        type="text"
                        placeholder="Address (optional)"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      <input
                        type="password"
                        placeholder="Password (min 8 chars, uppercase, lowercase, number, special char)"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </>
                  )}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="primary" type="submit">Create</Button>
                    <Button variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}

            <div className="list-container">
              {currentUsers.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>No {activeTab} found</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>{currentRole === 'patient' ? 'Contact' : 'Email'}</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{currentRole === 'patient' ? user.contact : user.email}</td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            background: user.isActive ? '#d4edda' : '#f8d7da',
                            color: user.isActive ? '#155724' : '#721c24'
                          }}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            <Button
                              variant="secondary"
                              onClick={() => handleToggleActive(user._id, user.isActive, currentRole)}
                              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDelete(user._id, currentRole)}
                              style={{ fontSize: '0.8rem', padding: '4px 8px', background: '#dc3545' }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* Toast container */}
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
