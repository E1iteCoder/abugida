import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const data = await authAPI.getCurrentUser();
          setUser(data.user);
          setToken(storedToken);
          // Sync theme preference to localStorage
          if (data.user?.themeMode) {
            localStorage.setItem("themeMode", data.user.themeMode);
          }
        } catch (error) {
          // Token is invalid or network error, clear it
          console.error('Auth check failed:', error.message);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const data = await authAPI.login(usernameOrEmail, password);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      // Sync theme preference to localStorage
      if (data.user?.themeMode) {
        localStorage.setItem("themeMode", data.user.themeMode);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const data = await authAPI.register(username, email, password);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      // Sync theme preference to localStorage
      if (data.user?.themeMode) {
        localStorage.setItem("themeMode", data.user.themeMode);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

