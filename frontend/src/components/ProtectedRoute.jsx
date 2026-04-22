import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    if (allowedRoles && allowedRoles.includes('superadmin') && !allowedRoles.includes('admin')) {
      return <Navigate to="/super-admin-auth" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Check role authorization if roles are specified
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If mismatch, also redirect to the correct login page based on the allowed role of the route
    if (allowedRoles.includes('superadmin')) {
      return <Navigate to="/super-admin-auth" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedRoute;
