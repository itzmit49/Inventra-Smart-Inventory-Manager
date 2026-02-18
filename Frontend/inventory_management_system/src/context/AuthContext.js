import React, { createContext, useState, useEffect } from 'react';

/**
 * AuthContext - Global authentication state management
 * Stores user info and JWT token
 * Provides auth functions to all components
 */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  /**
   * Signup function
   * @param {Object} userData - { name, email, password }
   */
  const signup = async (userData) => {
    try {
      const res = await fetch('https://inventra-smart-inventory-manager.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (data.success) {
        // Store token and user in localStorage and state
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Signup failed. Please try again.' };
    }
  };

  /**
   * Login function
   * @param {Object} credentials - { email, password }
   */
  const login = async (credentials) => {
    try {
      const res = await fetch('https://inventra-smart-inventory-manager.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      if (data.success) {
        // Store token and user in localStorage and state
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  /**
   * Logout function
   * Clear token and user from localStorage and state
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => !!token;

  /**
   * Check if user has specific role
   */
  const hasRole = (role) => user?.role === role;

  const value = {
    user,
    token,
    loading,
    signup,
    login,
    logout,
    isAuthenticated,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
