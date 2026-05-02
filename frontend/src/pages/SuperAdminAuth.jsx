import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight } from 'lucide-react';
import FormInput from '../components/FormInput';
import ThemeToggle from '../components/ThemeToggle';
import api from '../services/api';
import './SuperAdminAuth.css';

const SuperAdminAuth = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loginTouched, setLoginTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard'} replace />;
  }

  const emailRegex = /^(?=[^@]*[a-z])[a-z0-9]+(\.[a-z0-9]+)?@gmail\.com$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  const validateLoginField = (name, value) => {
    let errorMsg = '';
    if (name === 'email') {
      if (!value.trim()) errorMsg = 'Email is required';
      else if (!emailRegex.test(value)) errorMsg = 'Enter a valid Gmail (lowercase letters required, only one dot allowed, must include at least one letter)';
    } else if (name === 'password') {
      if (!value) errorMsg = 'Password is required';
    }
    return errorMsg;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    const err = validateLoginField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: loginTouched[name] ? err : '' }));
  };

  const handleLoginBlur = (name) => {
    setLoginTouched(prev => ({ ...prev, [name]: true }));
    const err = validateLoginField(name, loginData[name]);
    setFieldErrors(prev => ({ ...prev, [name]: err }));
  };

  const validateLogin = () => {
    const emailErr = validateLoginField('email', loginData.email);
    const passwordErr = validateLoginField('password', loginData.password);
    const errors = { email: emailErr, password: passwordErr };
    setFieldErrors(errors);
    setLoginTouched({ email: true, password: true });
    return !emailErr && !passwordErr;
  };

  const handleForgotPassword = async () => {
    const email = loginData.email.trim();
    
    // Step 1: Check if email is empty
    if (!email) {
      setFieldErrors({ email: 'Please enter email first' });
      addToast('Please enter your email to proceed', 'error');
      setLoginTouched({ email: true });
      return;
    }

    // Step 2: Validate email format
    if (!emailRegex.test(email)) {
      setFieldErrors({ email: 'Enter a valid gmail' });
      addToast('Valid Gmail required for password reset', 'error');
      setLoginTouched({ email: true });
      return;
    }

    // Step 3: Check email exists in SuperAdmin database
    setForgotLoading(true);
    try {
      const res = await api.forgotPassword({ email, role: 'superadmin' });
      if (res.success) {
        addToast('Email verified! Proceed to reset password.', 'success');
        navigate('/superadmin/forgot-password', { state: { email, resetToken: res.resetToken } });
      }
    } catch (err) {
      if (err.message === 'Email not registered') {
        setFieldErrors({ email: 'Email not registered' });
        addToast('This email is not registered as Super Admin', 'error');
        setLoginTouched({ email: true });
      } else {
        addToast(err.message || 'Failed to process request', 'error');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      if (!validateLogin()) {
        setLoading(false);
        return;
      }
      const res = await login(loginData.email, loginData.password, 'superadmin');
      if (res.success) {
        addToast('Welcome back, Super Admin!', 'success');
        navigate('/superadmin/dashboard');
      } else {
        setError(res.message || 'Invalid Super Admin credentials');
        addToast(res.message || 'Login failed', 'error');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      addToast('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-auth-container">
      <div className="auth-theme-wrapper">
        <ThemeToggle />
      </div>

      <div className="sa-auth-card">
        <button 
          className="sa-back-btn" 
          onClick={() => navigate('/')}
          title="Back to Role Selection"
        >
          <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>

        <div className="sa-auth-header">
          <h2>Super Admin <span>Login</span></h2>
          <p>Access restricted controls</p>
        </div>

        {error && (
          <div className="auth-error" style={{ 
            background: 'var(--danger-bg)', 
            color: 'var(--danger)', 
            padding: '12px', 
            borderRadius: '12px', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <span style={{ fontWeight: 600 }}>Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="sa-auth-form">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="admin@gmail.com"
            value={loginData.email}
            onChange={handleLoginChange}
            onBlur={() => handleLoginBlur('email')}
            isValid={emailRegex.test(loginData.email)}
            error={fieldErrors.email}
            autoComplete="off"
            required
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={loginData.password}
            onChange={handleLoginChange}
            onBlur={() => handleLoginBlur('password')}
            isValid={passwordRegex.test(loginData.password)}
            error={fieldErrors.password}
            autoComplete="off"
            required
          />
          <div className="sa-forgot-link-container">
            <span className="sa-forgot-link" onClick={handleForgotPassword}>
              {forgotLoading ? 'Verifying...' : 'Forgot Password?'}
            </span>
          </div>

          <button type="submit" className="sa-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Login AS SUPER ADMIN'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default SuperAdminAuth;
