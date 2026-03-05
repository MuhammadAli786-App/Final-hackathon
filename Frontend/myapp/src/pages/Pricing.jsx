import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { Button, Card } from '../components/CommonComponents'
import { subscriptionService } from '../services/apiService'
import '../styles/Pricing.css'

export default function Pricing() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const res = await subscriptionService.getPlans()
      setPlans(res.data.plans)
    } catch (err) {
      setError('Failed to load pricing plans')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading">Loading pricing plans...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="pricing-container">
        <div className="pricing-header">
          <h1>💰 Simple, Transparent Pricing</h1>
          <p>Choose the perfect plan for your healthcare needs</p>
        </div>

        <div className="container">
          {error && <div className="error-box">{error}</div>}

          <div className="pricing-grid">
            {plans.map(plan => (
              <div key={plan.name} className={`pricing-card ${plan.name === 'pro' ? 'popular' : ''}`}>
                {plan.name === 'pro' && <div className="popular-badge">Most Popular</div>}
                
                <h3>{plan.displayName}</h3>
                
                <div className="price">
                  {typeof plan.price === 'number' ? (
                    <>
                      <span className="amount">₹{plan.price}</span>
                      <span className="period">/{plan.billingCycle}</span>
                    </>
                  ) : (
                    <span className="amount">{plan.price}</span>
                  )}
                </div>

                <p className="description">
                  {plan.name === 'free' && 'Perfect for getting started'}
                  {plan.name === 'pro' && 'Best for growing practices'}
                  {plan.name === 'enterprise' && 'Full-featured solution'}
                </p>

                <div className="features-list">
                  <h4>Features:</h4>
                  <ul>
                    {Object.entries(plan.features).map(([key, value]) => (
                      <li key={key}>
                        <span className="checkmark">✓</span>
                        <strong>{formatFeatureName(key)}:</strong> {formatFeatureValue(value)}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={plan.name === 'pro' ? 'primary' : 'secondary'}
                  onClick={() => {
                    if (user) {
                      navigate('/subscription')
                    } else {
                      navigate('/login')
                    }
                  }}
                  className="pricing-btn"
                >
                  {plan.name === 'free' ? 'Get Started' : 'Upgrade Now'}
                </Button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <Card title="❓ Frequently Asked Questions" className="faq-section">
            <div className="faq-items">
              <div className="faq-item">
                <h4>Can I switch plans anytime?</h4>
                <p>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div className="faq-item">
                <h4>Is there a free trial?</h4>
                <p>Yes, new users get a 14-day free trial of all Pro features. No credit card required.</p>
              </div>
              <div className="faq-item">
                <h4>What happens after my trial ends?</h4>
                <p>You'll automatically be downgraded to the Free plan unless you upgrade before your trial ends.</p>
              </div>
              <div className="faq-item">
                <h4>Do you offer annual billing?</h4>
                <p>Yes! Enterprise customers can choose annual billing for a 20% discount.</p>
              </div>
              <div className="faq-item">
                <h4>Can I get a refund?</h4>
                <p>We offer a 7-day money-back guarantee for all paid plans. No questions asked.</p>
              </div>
              <div className="faq-item">
                <h4>What about team members?</h4>
                <p>Each plan includes unlimited team members. Manage who has access in your account settings.</p>
              </div>
            </div>
          </Card>

          {/* Comparison Table */}
          <Card title="📊 Detailed Feature Comparison">
            <div className="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Free</th>
                    <th>Pro</th>
                    <th>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Patients</strong></td>
                    <td>5</td>
                    <td>100</td>
                    <td>Unlimited</td>
                  </tr>
                  <tr>
                    <td><strong>Appointments</strong></td>
                    <td>10</td>
                    <td>500</td>
                    <td>Unlimited</td>
                  </tr>
                  <tr>
                    <td><strong>Prescriptions</strong></td>
                    <td>5</td>
                    <td>250</td>
                    <td>Unlimited</td>
                  </tr>
                  <tr>
                    <td><strong>AI Symptom Checker</strong></td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td><strong>AI Prescription Explanation</strong></td>
                    <td>✗</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td><strong>Document Storage</strong></td>
                    <td>100 MB</td>
                    <td>5 GB</td>
                    <td>Unlimited</td>
                  </tr>
                  <tr>
                    <td><strong>Advanced Analytics</strong></td>
                    <td>✗</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td><strong>API Access</strong></td>
                    <td>✗</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td><strong>Custom Branding</strong></td>
                    <td>✗</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td><strong>SSO Integration</strong></td>
                    <td>✗</td>
                    <td>✗</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td><strong>Dedicated Support</strong></td>
                    <td>✗</td>
                    <td>Priority Email</td>
                    <td>✓ 24/7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

function formatFeatureName(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
}

function formatFeatureValue(value) {
  if (value === true) return 'Included'
  if (value === false) return 'Not included'
  if (typeof value === 'number') return `${value} ${key.includes('Storage') ? 'MB' : ''}`
  return String(value)
}
