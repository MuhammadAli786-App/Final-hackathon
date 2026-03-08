import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { Button, Card, StatCard } from '../components/CommonComponents'
import '../styles/Dashboard.css'

export default function AdminSubscriptionPanel() {
  const [currentPlan, setCurrentPlan] = useState(null)
  const [availableFeatures, setAvailableFeatures] = useState({})
  const [planStatus, setPlanStatus] = useState(null)
  const [allPlans, setAllPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  // Fetch subscription status and features on mount
  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // Fetch current subscription status
      const statusRes = await fetch('https://final-hakathon-backend-production.up.railway.app/api/subscriptions/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const statusData = await statusRes.json()
      setCurrentPlan(statusData.user?.plan || 'free')
      setPlanStatus(statusData)

      // Fetch available features for current plan
      const featuresRes = await fetch('https://final-hakathon-backend-production.up.railway.app/api/subscriptions/features', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const featuresData = await featuresRes.json()
      setAvailableFeatures(featuresData.features || {})

      // Fetch all available plans
      const plansRes = await fetch('https://final-hakathon-backend-production.up.railway.app/api/subscriptions/plans')
      const plansData = await plansRes.json()
      setAllPlans(plansData.plans || [])

      setLoading(false)
    } catch (err) {
      console.error('Error fetching subscription data:', err)
      addToast('Failed to load subscription data', 'error')
      setLoading(false)
    }
  }

  const handleUpgrade = async (planName) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://final-hakathon-backend-production.up.railway.app/api/subscriptions/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planName: planName.toLowerCase(),
          paymentMethod: 'mock'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Upgrade failed')
      }

      const data = await response.json()
      addToast(`✓ Upgraded to ${planName} plan!`, 'success')

      // Refetch subscription data to get updated plan and features
      setTimeout(() => fetchSubscriptionData(), 500)
    } catch (err) {
      addToast(err.message || 'Error upgrading plan', 'error')
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading subscription data...</div>
      </>
    )
  }

  const planInfo = {
    'free': { price: 'PKR 0', patients: 'Up to 50', appointments: 'Unlimited' },
    'pro': { price: 'PKR 4,999/month', patients: 'Up to 500', appointments: 'Unlimited' },
    'enterprise': { price: 'PKR Custom', patients: 'Unlimited', appointments: 'Unlimited' }
  }

  const aiFeatures = [
    { name: 'AI Symptom Checker', key: 'aiSymptomChecker', icon: '🤖' },
    { name: 'Prescription Explanation', key: 'aiPrescriptionExplanation', icon: '💊' },
    { name: 'Appointment Analytics', key: 'appointmentAnalytics', icon: '📊' },
    { name: 'Patient Summary AI', key: 'patientSummaryAI', icon: '📝' }
  ]

  return (
    <>
      <Header />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>💳 Subscription Management</h1>
          <p>Manage clinic subscription and AI features</p>
        </div>

        <div className="container">
          {/* Current Plan Status */}
          <Card title="Current Subscription Status">
            <div className="stats-grid" style={{ marginBottom: '30px' }}>
              <StatCard 
                label="Current Plan" 
                value={currentPlan?.toUpperCase() || 'FREE'}
                icon="📋"
              />
              <StatCard 
                label="Trial Status" 
                value={planStatus?.status?.isOnTrial ? `Active (${planStatus.status.daysRemaining} days)` : 'Inactive'}
                icon="⏰"
              />
              <StatCard 
                label="AI Requests (This Month)" 
                value={`${planStatus?.status?.usage?.aiRequestsThisMonth || '0'}/∞`}
                icon="🤖"
              />
              <StatCard 
                label="Renewal Date" 
                value={planStatus?.subscriptionEndsAt ? new Date(planStatus.subscriptionEndsAt).toLocaleDateString() : 'N/A'}
                icon="📅"
              />
            </div>
          </Card>

          {/* Plans Comparison */}
          <Card title="Available Plans">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {[
                {
                  name: 'Free',
                  features: ['Basic patient management', 'Appointment scheduling', 'Limited AI features'],
                  disabled: ['Priority support', 'Advanced analytics']
                },
                {
                  name: 'Pro',
                  features: ['Full patient management', 'Unlimited appointments', 'Full AI features', 'Advanced analytics', 'Prescription templates'],
                  disabled: ['White-label support', 'API access']
                },
                {
                  name: 'Enterprise',
                  features: ['Everything in Pro', 'Unlimited everything', 'Priority support', 'White-label support', 'API access', 'Dedicated account manager'],
                  disabled: []
                }
              ].map(plan => (
                <div key={plan.name} style={{
                  border: currentPlan === plan.name.toLowerCase() ? '2px solid #667eea' : '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  background: currentPlan === plan.name.toLowerCase() ? '#f0f4ff' : '#fff'
                }}>
                  <h3>{plan.name}</h3>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea', marginBottom: '10px' }}>
                    {planInfo[plan.name.toLowerCase()]?.price || 'PKR Custom'}
                  </div>
                  <div style={{ marginBottom: '20px', color: '#666' }}>
                    <div>👥 Patients: {planInfo[plan.name.toLowerCase()]?.patients}</div>
                    <div>📅 Appointments: {planInfo[plan.name.toLowerCase()]?.appointments}</div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>✅ Included:</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {plan.features.map(feature => (
                        <li key={feature} style={{ padding: '5px 0', color: '#28a745' }}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>

                  {plan.disabled.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ marginBottom: '10px' }}>❌ Not Included:</h4>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {plan.disabled.map(feature => (
                          <li key={feature} style={{ padding: '5px 0', color: '#dc3545' }}>✗ {feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentPlan !== plan.name.toLowerCase() && (
                    <Button 
                      variant="primary" 
                      onClick={() => handleUpgrade(plan.name)}
                      style={{ width: '100%' }}
                    >
                      Upgrade to {plan.name}
                    </Button>
                  )}
                  {currentPlan === plan.name.toLowerCase() && (
                    <div style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                      ✓ Current Plan
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* AI Feature Management */}
          <Card title="AI Feature Control">
            <p style={{ color: '#666', marginBottom: '20px' }}>
              These AI features are automatically enabled/disabled based on your current plan ({currentPlan?.toUpperCase()})
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {aiFeatures.map(feature => {
                const isEnabled = availableFeatures[feature.key] === true
                return (
                  <div key={feature.name} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    background: isEnabled ? '#fff' : '#f5f5f5'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                          {feature.icon} {feature.name}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                          Status: {isEnabled ? '✓ Enabled' : '✗ Disabled'}
                        </div>
                        {!isEnabled && (
                          <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '3px' }}>
                            Upgrade your plan to access this feature
                          </div>
                        )}
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        background: isEnabled ? '#d4edda' : '#e2e3e5',
                        color: isEnabled ? '#155724' : '#383d41',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {isEnabled ? '✓ ON' : '✗ OFF'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Billing Information */}
          <Card title="Billing Information">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <h4>Payment Method</h4>
                <p style={{ color: '#666' }}>💳 {planStatus?.user?.plan === 'free' ? 'None (Free Plan)' : 'Visa ending in 4242'}</p>
              </div>
              <div>
                <h4>Billing Cycle</h4>
                <p style={{ color: '#666' }}>{planStatus?.user?.plan === 'free' ? 'N/A' : 'Monthly (Auto-renewal)'}</p>
              </div>
              <div>
                <h4>Next Billing Date</h4>
                <p style={{ color: '#666' }}>{planStatus?.subscriptionEndsAt ? new Date(planStatus.subscriptionEndsAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <h4>Total Spent (This Year)</h4>
                <p style={{ color: '#667eea', fontWeight: 'bold', fontSize: '1.2rem' }}>PKR {planStatus?.user?.plan === 'free' ? '0 (Free)' : '4,999'}</p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="action-grid">
              <Button variant="secondary">📧 Download Invoice</Button>
              <Button variant="secondary">🔔 Billing Notifications</Button>
              <Button variant="secondary">❓ Support & FAQ</Button>
              {currentPlan !== 'free' && (
                <Button variant="danger">⚠️ Cancel Subscription</Button>
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

