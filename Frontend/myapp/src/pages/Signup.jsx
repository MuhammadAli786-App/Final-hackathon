import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import '../styles/Login.css'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor'
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signup(formData)

      if (result && result.success) {
        // ✅ Only redirect if backend actually succeeded
        navigate(
          `/verify-otp?email=${formData.email}&role=${formData.role}`
        )
      } else {
        setError(result?.error || "Signup failed")
      }
    } catch (err) {
      setError("Server error. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="login-container">
      <Header />
      <div className="login-content">
        <div className="login-box">
          <div className="login-header">
            <h1>🏥 AI Clinic Management</h1>
            <p>Create your account</p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Select Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
                <option value="admin">Admin</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-btn"
            >
              {loading ? "Signing up..." : "Signup"}
            </button>
<button 
        type="button"
        className="link-button"
        onClick={() => navigate('/login')}
        style={{ marginTop: '20px', background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', textDecoration: 'underline' }}
      >
        Already have an account? Login
      </button>
          </form>
        </div>
      </div>
    </div>
  )
}