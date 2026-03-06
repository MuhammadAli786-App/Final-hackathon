import React, { createContext, useState, useEffect } from "react";
import { authService } from "../services/apiService";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedSubscription = localStorage.getItem("subscription");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.warn("failed to parse stored user, clearing invalid value", e);
        localStorage.removeItem("user");
      }

      if (storedSubscription) {
        try {
          setSubscription(JSON.parse(storedSubscription));
        } catch (e) {
          console.warn(
            "failed to parse stored subscription, clearing invalid value",
            e,
          );
          localStorage.removeItem("subscription");
        }
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);

      // Store subscription info
      const subInfo = {
        plan: user.subscriptionPlan || "free",
        isOnTrial: user.isOnTrial || false,
        trialEndsAt: user.trialEndsAt || null,
      };
      localStorage.setItem("subscription", JSON.stringify(subInfo));
      setSubscription(subInfo);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const signup = async (data) => {
    try {
      const response = await axios.post(
        "https://heroic-sparkle.railway.app/api/auth/signup",
        data,
      );

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Signup failed",
      };
    }
  };
  const verifyOTP = async ({ email, otp }) => {
    try {
      const response = await axios.post(
        "https://heroic-sparkle.railway.app/api/auth/verify-otp",
        { email, otp },
      );

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "OTP verification failed",
      };
    }
  };
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setSubscription(null);
  };

  const updateSubscription = (newSubscription) => {
    setSubscription(newSubscription);
    localStorage.setItem("subscription", JSON.stringify(newSubscription));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        subscription,
        login,
        signup,
        verifyOTP,
        logout,
        updateSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
