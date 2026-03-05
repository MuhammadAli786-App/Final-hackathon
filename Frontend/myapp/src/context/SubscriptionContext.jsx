import React, { createContext, useState, useEffect } from 'react'
import { subscriptionService } from '../services/apiService'
import { useAuth } from './AuthContext'

export const SubscriptionContext = createContext()

export function SubscriptionProvider({ children }) {
  const { user, token } = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [features, setFeatures] = useState(null)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch subscription status when user logs in
  useEffect(() => {
    if (user && token) {
      fetchSubscriptionData()
    }
  }, [user, token])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [statusRes, featuresRes, usageRes] = await Promise.all([
        subscriptionService.getStatus(),
        subscriptionService.getFeatures(), // returns raw features + flags
        subscriptionService.getUsageStats()
      ])
      
      setSubscriptionStatus(statusRes.data)
      setFeatures(featuresRes.data) // includes .flags now
      setUsage(usageRes.data)
    } catch (err) {
      setError('Failed to load subscription data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const checkFeature = (featureName) => {
    if (!features) return false
    // look at boolean flags returned from backend
    if (features.flags && typeof features.flags[featureName] !== 'undefined') {
      return features.flags[featureName]
    }
    // fall back to raw features existence
    return features.features && features.features[featureName] !== undefined
  }

  const hasFeatureAccess = (featureName) => {
    if (!subscriptionStatus) return false
    return checkFeature(featureName)
  }

  const upgradePlan = async (planName) => {
    try {
      setLoading(true)
      const response = await subscriptionService.upgradePlan(planName)
      await fetchSubscriptionData()
      return { success: true, message: response.data.message }
    } catch (err) {
      const message = err.response?.data?.message || 'Upgrade failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const downgradePlan = async () => {
    try {
      setLoading(true)
      const response = await subscriptionService.downgradePlan()
      await fetchSubscriptionData()
      return { success: true, message: response.data.message }
    } catch (err) {
      const message = err.response?.data?.message || 'Downgrade failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const getTrialDaysLeft = () => {
    if (!subscriptionStatus?.status?.isEndingSoon) return null
    return subscriptionStatus.status.daysLeft
  }

  const isTrialEndingSoon = () => {
    return subscriptionStatus?.status?.isEndingSoon || false
  }

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionStatus,
        features,
        usage,
        loading,
        error,
        checkFeature,
        hasFeatureAccess,
        upgradePlan,
        downgradePlan,
        getTrialDaysLeft,
        isTrialEndingSoon,
        fetchSubscriptionData
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => {
  const context = React.useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider')
  }
  return context
}
