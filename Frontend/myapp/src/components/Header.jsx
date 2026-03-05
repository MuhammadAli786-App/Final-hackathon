import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Header.css'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getDashboardPath = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'admin':
        return '/admin'
      case 'doctor':
        return '/doctor'
      case 'receptionist':
        return '/receptionist'
      case 'patient':
        return '/patient'
      default:
        return '/'
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="logo" onClick={() => navigate(getDashboardPath())}>
            🏥 AI Clinic
          </h1>
        </div>
        
        {user && (
          <nav className="header-nav">
            <span className="user-info">
              👤 {user.name} <span className="role-badge">{user.role.toUpperCase()}</span>
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
