import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Layout from './Layout';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Not authenticated — redirect to the correct login page based on the URL they tried to access
  if (!isAuthenticated) {
    if (location.pathname.startsWith('/superadmin')) {
      return <Navigate to="/superadmin/login" replace />;
    }
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated but wrong role — redirect to the user's OWN dashboard (not the route's login page)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};


export default ProtectedRoute;

