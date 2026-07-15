import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate session on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await API.get('/auth/me');
          if (response.data?.success) {
            setUser(response.data.user);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('[Session validation failed]:', err);
          handleLogout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Sign In
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data?.success) {
        const { token: userToken, user: userData } = response.data;
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errMsg);
      // Return custom status to check if it's email verification block
      if (err.response?.status === 403 && err.response?.data?.notVerified) {
        return { success: false, notVerified: true, email };
      }
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Sign Up
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/auth/register', { name, email, password });
      if (response.data?.success) {
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Verify Email
  const verifyEmail = async (email, code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/auth/verify-email', { email, code });
      if (response.data?.success) {
        const { token: userToken, user: userData } = response.data;
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Email verification failed';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const googleLogin = async (email, name, googleId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/auth/google-login', { email, name, googleId });
      if (response.data?.success) {
        const { token: userToken, user: userData } = response.data;
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Google Authentication failed';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/auth/forgot-password', { email });
      if (response.data?.success) {
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Password reset request failed';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (resetToken, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post(`/auth/reset-password/${resetToken}`, { password });
      if (response.data?.success) {
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Password reset failed';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        verifyEmail,
        googleLogin,
        forgotPassword,
        resetPassword,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
