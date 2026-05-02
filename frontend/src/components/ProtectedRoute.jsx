import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Layout from './Layout';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    if (allowedRoles && allowedRoles.includes('superadmin') && !allowedRoles.includes('admin')) {
      return <Navigate to="/superadmin/login" replace />;
    }
    return <Navigate to="/admin/login" replace />;
  }

  // Check role authorization if roles are specified
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If mismatch, also redirect to the correct login page based on the allowed role of the route
    if (allowedRoles.includes('superadmin')) {
      return <Navigate to="/superadmin/login" replace />;
    }
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};


export default ProtectedRoute;
