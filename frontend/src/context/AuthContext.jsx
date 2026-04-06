import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const savedToken = localStorage.getItem('token');

      if (!savedToken) {
        // No token — user is not logged in
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Validate token against the backend
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          // Update localStorage with fresh user data from server
          localStorage.setItem('user', JSON.stringify(res.user));
        } else {
          // Token invalid — clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (err) {
        // Token expired or invalid — clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.success) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        setUser(res.user);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res.success) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        setUser(res.user);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

