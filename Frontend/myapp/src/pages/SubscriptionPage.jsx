import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Card, Button } from '../components/CommonComponents'
import { useSubscription } from '../context/SubscriptionContext'
import axios from 'axios'
import '../styles/Subscription.css'

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const { subscriptionStatus, loading, upgradePlan } = useSubscription()
  const [allPlans, setAllPlans] = useState([])
  const [upgrading, setUpgrading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/subscriptions/plans')
      setAllPlans(res.data.plans)
    } catch (err) {
      setError('Failed to load plans')
      console.error(err)
    }
  }

  const handleUpgrade = async (planName) => {
    setError('')
    setSuccess('')
    setUpgrading(true)

    const result = await upgradePlan(planName)
    if (result.success) {
      setSuccess(`Successfully upgraded to ${planName.toUpperCase()} plan!`)
      setTimeout(() => navigate('/admin'), 2000)
    } else {
      setError(result.error || 'Upgrade failed')
    }
    setUpgrading(false)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading subscription info...</div>
      </>
    )
  }

  const currentPlan = subscriptionStatus?.currentPlan?.name || 'free'
  const isOnTrial = subscriptionStatus?.subscriptionStatus?.isOnTrial

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Current Plan Info */}
        {subscriptionStatus && (
          <Card title="Your Current Plan">
            <div className="subscription-info">
              <div className="plan-badge">
                {subscriptionStatus.currentPlan.displayName}
                {isOnTrial && <span className="trial-badge">TRIAL</span>}
              </div>
              
              <div className="plan-details">
                <p><strong>Status:</strong> {subscriptionStatus.subscriptionStatus.isActive ? '✓ Active' : '✗ Inactive'}</p>
                
                {isOnTrial && (
                  <>
                    <p><strong>Trial Ends:</strong> {new Date(subscriptionStatus.subscriptionStatus.trialEndsAt).toLocaleDateString()}</p>
                    <p><strong>Days Remaining:</strong> {subscriptionStatus.subscriptionStatus.daysRemaining} days</p>
                  </>
                )}
                
                {subscriptionStatus.subscriptionStatus.subscriptionEndsAt && !isOnTrial && (
                  <p><strong>Renews:</strong> {new Date(subscriptionStatus.subscriptionStatus.subscriptionEndsAt).toLocaleDateString()}</p>
                )}

                <div className="plan-features-list">
                  <h4>Included Features:</h4>
                  <ul>
                    {subscriptionStatus.currentPlan.features && Object.entries(subscriptionStatus.currentPlan.features).map(([feature, value]) => (
                      value && <li key={feature}>✓ {formatFeatureName(feature)}</li>
                    ))}
                  </ul>
                </div>

                {subscriptionStatus.currentPlan.limits && (
                  <div className="plan-limits">
                    <h4>Monthly Limits:</h4>
                    <ul>
                      <li>Appointments: {subscriptionStatus.currentPlan.limits.appointmentsPerMonth || '∞'}</li>
                      <li>Prescriptions: {subscriptionStatus.currentPlan.limits.prescriptionsPerMonth || '∞'}</li>
                      <li>Storage: {subscriptionStatus.currentPlan.limits.storageGB}GB</li>
                      <li>Support: {subscriptionStatus.currentPlan.features.supportTier}</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* All Plans Comparison */}
        <Card title="Upgrade Your Plan">
          <div className="plans-grid">
            {allPlans.map(plan => (
              <div key={plan._id} className={`plan-card ${plan.name === currentPlan ? 'current' : ''}`}>
                <h3>{plan.displayName}</h3>
                
                <div className="plan-price">
                  {plan.price === 0 ? (
                    <span>Free</span>
                  ) : (
                    <span>${plan.price}/month</span>
                  )}
                </div>

                <div className="plan-description">
                  {plan.description}
                </div>

                <div className="plan-features">
                  <h5>Features:</h5>
                  <ul>
                    {plan.features && Object.entries(plan.features).map(([feature, value]) => (
                      value && (
                        <li key={feature}>
                          ✓ {formatFeatureName(feature)}
                        </li>
                      )
                    ))}
                  </ul>
                </div>

                <div className="plan-limits-display">
                  <h5>Limits:</h5>
                  <ul>
                    <li>Patients: {plan.features?.maxPatients || 'Unlimited'}</li>
                    <li>Doctors: {plan.features?.maxDoctors || 'Unlimited'}</li>
                    <li>AI Credits: {plan.features?.aiCreditsPerMonth || 'Unlimited'}/month</li>
                    <li>Storage: {plan.limits?.storageGB}GB</li>
                  </ul>
                </div>

                {plan.name === currentPlan ? (
                  <div className="plan-button current-badge">Current Plan</div>
                ) : (
                  <button
                    className="plan-button upgrade-btn"
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={upgrading}
                  >
                    {upgrading ? 'Upgrading...' : `Upgrade to ${plan.displayName}`}
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Usage Statistics */}
        {subscriptionStatus?.usage && (
          <Card title="Your Usage This Month">
            <div className="usage-stats">
              <div className="usage-item">
                <span className="usage-label">Appointments</span>
                <div className="usage-bar">
                  <div 
                    className="usage-progress"
                    style={{
                      width: `${(subscriptionStatus.usage.appointmentsThisMonth / 100) * 100}%`
                    }}
                  />
                </div>
                <span className="usage-value">{subscriptionStatus.usage.appointmentsThisMonth}</span>
              </div>

              <div className="usage-item">
                <span className="usage-label">Prescriptions</span>
                <div className="usage-bar">
                  <div 
                    className="usage-progress"
                    style={{
                      width: `${(subscriptionStatus.usage.prescriptionsThisMonth / 100) * 100}%`
                    }}
                  />
                </div>
                <span className="usage-value">{subscriptionStatus.usage.prescriptionsThisMonth}</span>
              </div>

              <div className="usage-item">
                <span className="usage-label">AI Requests</span>
                <div className="usage-bar">
                  <div 
                    className="usage-progress"
                    style={{
                      width: `${(subscriptionStatus.usage.aiRequestsThisMonth / 1000) * 100}%`
                    }}
                  />
                </div>
                <span className="usage-value">{subscriptionStatus.usage.aiRequestsThisMonth}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Contact Support */}
        <Card title="Need Help?">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Have questions about our plans or need a custom solution?</p>
            <p style={{ color: '#666' }}>Email us at <strong>support@aiclinic.com</strong></p>
            <Button variant="secondary" onClick={() => window.location.href = 'mailto:support@aiclinic.com'}>
              Contact Support
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}

function formatFeatureName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}
