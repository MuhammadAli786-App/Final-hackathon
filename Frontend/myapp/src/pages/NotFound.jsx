import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Button } from '../components/CommonComponents'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '20px', color: '#667eea' }}>404</h1>
        <h2 style={{ marginBottom: '10px' }}>Page Not Found</h2>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '1.1rem' }}>
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </div>
    </>
  )
}
