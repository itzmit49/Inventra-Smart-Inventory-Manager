import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Redirect to login if user is not authenticated
 * Optionally restrict by role
 * 
 * Usage:
 * <ProtectedRoute element={<Dashboard />} />
 * <ProtectedRoute element={<AdminPanel />} requiredRole="admin" />
 */
const ProtectedRoute = ({ element, requiredRole = null }) => {
  const { isAuthenticated, hasRole, loading } = useContext(AuthContext);

  // Show loading state while checking auth
  if (loading) {
    return <div className="container mt-5 text-center"><p>Loading...</p></div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and user doesn't have it, redirect to home
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role (if any)
  return element;
};

export default ProtectedRoute;
