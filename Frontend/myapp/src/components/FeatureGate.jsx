import { useSubscription } from '../context/SubscriptionContext'
import { useNavigate } from 'react-router-dom'
import '../styles/Subscription.css'

/**
 * FeatureGate Component
 * Displays content only if user has access to feature
 * Otherwise shows upgrade prompt
 */
export default function FeatureGate({ 
  featureName, 
  children, 
  fallback = null,
  showUpgradePrompt = true 
}) {
  const { subscriptionStatus, features } = useSubscription()
  const navigate = useNavigate()

  // Check if user has access to this feature
  const hasAccess = features?.flags?.[featureName] || false
  const isOnTrial = subscriptionStatus?.subscriptionStatus?.isOnTrial
  const currentPlan = subscriptionStatus?.currentPlan?.name

  // Trial users have access to all features
  if (isOnTrial) {
    return <>{children}</>
  }

  // If user has feature access, show content
  if (hasAccess) {
    return <>{children}</>
  }

  // Feature not available - show fallback or upgrade prompt
  if (!showUpgradePrompt) {
    return fallback
  }

  return (
    <div className="upgrade-prompt">
      <h4>🔒 Feature Unavailable</h4>
      <p>{featureName} is only available on Pro and Enterprise plans.</p>
      <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
        Current Plan: <strong>{currentPlan?.toUpperCase()}</strong>
      </p>
      <button 
        className="upgrade-prompt-btn"
        onClick={() => navigate('/subscription')}
      >
        View Plans & Upgrade
      </button>
    </div>
  )
}

/**
 * ConditionalFeature Component
 * Renders content based on feature availability
 * If feature not available, renders fallback instead of disabled UI
 */
export function ConditionalFeature({ featureName, children, fallback = null }) {
  const { features } = useSubscription()
  const hasAccess = features?.flags?.[featureName] || false

  return hasAccess ? children : fallback
}

/**
 * FeatureButton Component
 * Button that shows lock icon if feature not available
 */
export function FeatureButton({ 
  featureName, 
  children, 
  onClick, 
  disabled = false,
  className = '',
  ...props 
}) {
  const { features } = useSubscription()
  const navigate = useNavigate()
  const hasAccess = features?.flags?.[featureName] || false

  const handleClick = (e) => {
    if (!hasAccess) {
      e.preventDefault()
      navigate('/subscription')
      return
    }
    onClick?.(e)
  }

  return (
    <button
      className={`${className} ${!hasAccess ? 'feature-locked' : ''}`}
      onClick={handleClick}
      disabled={disabled || !hasAccess}
      title={!hasAccess ? `Upgrade to unlock ${featureName}` : ''}
      {...props}
    >
      {!hasAccess && <span style={{ marginRight: '8px' }}>🔒</span>}
      {children}
    </button>
  )
}

/**
 * TrialExpiredBanner Component
 * Shows when trial is expired and subscription is not active
 */
export function TrialExpiredBanner() {
  const { subscriptionStatus } = useSubscription()
  const navigate = useNavigate()

  const isTrialExpired = 
    !subscriptionStatus?.subscriptionStatus?.isOnTrial && 
    subscriptionStatus?.subscriptionStatus?.subscriptionEndsAt &&
    new Date(subscriptionStatus.subscriptionStatus.subscriptionEndsAt) < new Date()

  if (!isTrialExpired) return null

  return (
    <div style={{
      background: '#f8d7da',
      border: '2px solid #f5c6cb',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      textAlign: 'center'
    }}>
      <h4 style={{ color: '#721c24', margin: '0 0 10px 0' }}>
        ⚠️ Trial Expired
      </h4>
      <p style={{ color: '#721c24', margin: '10px 0' }}>
        Your trial has ended. Upgrade to continue using all features.
      </p>
      <button
        style={{
          background: '#721c24',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
        onClick={() => navigate('/subscription')}
      >
        Upgrade Now
      </button>
    </div>
  )
}

/**
 * TrialWarningBanner Component
 * Shows when trial is ending soon
 */
export function TrialWarningBanner() {
  const { subscriptionStatus } = useSubscription()
  const navigate = useNavigate()

  const daysLeft = subscriptionStatus?.subscriptionStatus?.daysRemaining
  const isTrialEndingSoon = daysLeft && daysLeft <= 3

  if (!isTrialEndingSoon) return null

  return (
    <div style={{
      background: '#fff3cd',
      border: '2px solid #ffeaa7',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      textAlign: 'center'
    }}>
      <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>
        ⏰ Trial Ending Soon
      </h4>
      <p style={{ color: '#856404', margin: '10px 0' }}>
        Your trial ends in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>. 
        Upgrade to keep using premium features.
      </p>
      <button
        style={{
          background: '#ffc107',
          color: '#333',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
        onClick={() => navigate('/subscription')}
      >
        View Plans
      </button>
    </div>
  )
}

/**
 * UsageLimitWarning Component
 * Shows when user is approaching usage limits
 */
export function UsageLimitWarning() {
  const { subscriptionStatus } = useSubscription()
  const navigate = useNavigate()

  if (!subscriptionStatus?.usage) return null

  // Check if approaching limits (80% of limit)
  const appointmentLimit = subscriptionStatus.currentPlan?.limits?.appointmentsPerMonth || 100
  const appointmentUsage = subscriptionStatus.usage.appointmentsThisMonth || 0
  const appointmentPercentage = (appointmentUsage / appointmentLimit) * 100

  if (appointmentPercentage < 80) return null

  return (
    <div style={{
      background: '#e3f2fd',
      border: '2px solid #90caf9',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <h4 style={{ color: '#1565c0', margin: '0 0 10px 0' }}>
        📊 Usage Limit Warning
      </h4>
      <p style={{ color: '#1565c0', margin: '10px 0' }}>
        You've used {appointmentUsage} of {appointmentLimit} appointments this month.
      </p>
      <p style={{ fontSize: '0.9rem', color: '#1565c0', opacity: 0.8 }}>
        Upgrade to Enterprise for unlimited appointments.
      </p>
      <button
        style={{
          background: '#1976d2',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
        onClick={() => navigate('/subscription')}
      >
        Upgrade Plan
      </button>
    </div>
  )
}
