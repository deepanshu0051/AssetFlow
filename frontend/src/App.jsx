import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import AddMachine from './pages/AddMachine';
import MachineDetails from './pages/MachineDetails';
import GSTRecords from './pages/GSTRecords';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { SearchProvider } from './context/SearchContext';
import './styles/global.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
        <AuthProvider>
          <Router>
            <SearchProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/machines" element={<Machines />} />
                <Route path="/machines/add" element={<AddMachine />} />
                <Route path="/machines/edit/:id" element={<AddMachine />} />
                <Route path="/machines/:id" element={<MachineDetails />} />
                <Route path="/gst" element={<GSTRecords />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
            </SearchProvider>
          </Router>
        </AuthProvider>
        </ToastProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
