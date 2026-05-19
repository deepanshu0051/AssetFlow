import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import SuperAdminAuth from './pages/SuperAdminAuth';
import SuperAdminRegister from './pages/SuperAdminRegister';
import PortalEntry from './pages/PortalEntry';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Machines from './pages/Machines';
import AddMachine from './pages/AddMachine';
import MachineDetails from './pages/MachineDetails';
import GSTRecords from './pages/GSTRecords';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { SearchProvider } from './context/SearchContext';
import ThemeToggle from './components/ThemeToggle';
import './styles/global.css';
import { Navigate } from 'react-router-dom';

// Centralized redirector for '/dashboard'
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Navigate to={user.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard'} replace />;
};

import { NotificationProvider } from './context/NotificationContext';
import { SidebarProvider } from './context/SidebarContext';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <SidebarProvider>
            <ToastProvider>
            <AuthProvider>
              <Router>
                <SearchProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PortalEntry />} />
                  <Route path="/superadmin/login" element={<SuperAdminAuth />} />
                  <Route path="/superadmin/register" element={<SuperAdminRegister />} />
                  <Route path="/admin/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin/forgot-password" element={<ForgotPassword role="admin" />} />
                  <Route path="/superadmin/forgot-password" element={<ForgotPassword role="superadmin" />} />
                  <Route path="/admin/reset-password/:token" element={<ResetPassword role="admin" />} />
                  <Route path="/superadmin/reset-password/:token" element={<ResetPassword role="superadmin" />} />
                  <Route path="/forgot-password" element={<ForgotPassword role="admin" />} />
                  <Route path="/reset-password/:token" element={<ResetPassword role="admin" />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
                    <Route path="/machines" element={<Machines />} />
                    <Route path="/machines/add" element={<AddMachine />} />
                    <Route path="/machines/edit/:id" element={<AddMachine />} />
                    <Route path="/machines/:id" element={<MachineDetails />} />
                    <Route path="/gst" element={<GSTRecords />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                  
                  <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                    <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  </Route>

                  {/* Centralized Redirector */}
                  <Route path="/dashboard" element={<DashboardRedirect />} />
                </Routes>
                </SearchProvider>
              </Router>
            </AuthProvider>
            </ToastProvider>
          </SidebarProvider>
        </NotificationProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
