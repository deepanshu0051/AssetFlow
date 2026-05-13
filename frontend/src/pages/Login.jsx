import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight } from 'lucide-react';
import FormInput from '../components/FormInput';
import ThemeToggle from '../components/ThemeToggle';
import api from '../services/api';
import './AuthPages.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  // Redirect to correct dashboard if already logged in
  if (isAuthenticated && user) {
    if (user.role === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  const emailRegex = /^(?=[^@]*[a-z])[a-z0-9]+(\.[a-z0-9]+)?@gmail\.com$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'email') {
      if (!value.trim()) errorMsg = 'Email is required';
      else if (!emailRegex.test(value)) errorMsg = 'Enter a valid Gmail (lowercase letters required, only one dot allowed, must include at least one letter)';
    } else if (name === 'password') {
      if (!value) errorMsg = 'Password is required';
      else if (!passwordRegex.test(value)) errorMsg = 'Password must be at least 6 characters and include a letter, number, and special character.';
    }
    return errorMsg;
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    const err = validateField('email', val);
    setFieldErrors(prev => ({ ...prev, email: touched.email ? err : '' }));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    const err = validateField('password', val);
    setFieldErrors(prev => ({ ...prev, password: touched.password ? err : '' }));
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const val = name === 'email' ? email : password;
    const err = validateField(name, val);
    setFieldErrors(prev => ({ ...prev, [name]: err }));
  };

  const validateForm = () => {
    const emailErr = validateField('email', email);
    const passwordErr = validateField('password', password);
    const errors = { email: emailErr, password: passwordErr };
    setFieldErrors(errors);
    setTouched({ email: true, password: true });
    return !emailErr && !passwordErr;
  };

  const handleForgotPassword = async () => {
    setError('');
    
    // Step 1: Check if email is empty
    if (!email.trim()) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter email first' }));
      setTouched(prev => ({ ...prev, email: true }));
      return;
    }

    // Step 2: Validate email format
    if (!emailRegex.test(email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Enter a valid gmail' }));
      setTouched(prev => ({ ...prev, email: true }));
      return;
    }

    // Step 3: Check email exists in Admin database
    setForgotLoading(true);
    try {
      const res = await api.forgotPassword({ email, role: 'admin' });
      if (res.success) {
        navigate('/admin/forgot-password', { state: { email, resetToken: res.resetToken } });
      }
    } catch (err) {
      if (err.message === 'Email not registered') {
        setFieldErrors(prev => ({ ...prev, email: 'Email not registered' }));
        setTouched(prev => ({ ...prev, email: true }));
      } else {
        setError(err.message || 'Failed to process forgot password request');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const res = await login(email, password, 'admin');
      if (res.success) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        if (res.errors) {
          const serverErrors = {};
          res.errors.forEach(err => {
            serverErrors[err.field] = err.message;
          });
          setFieldErrors(serverErrors);
          setError('Please fix the errors shown below');
        } else {
          setError(res.message || 'Invalid email or password');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-theme-wrapper">
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <button 
          className="back-btn" 
          onClick={() => navigate('/')}
          title="Back to Role Selection"
        >
          <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>

        <div className="auth-header">
          <h2>Admin <span>Login</span></h2>
          <p className="auth-subtitle">Log in to your AssetFlow account to manage your resources.</p>
        </div>
        
        {error && (
          <div className="auth-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur('email')}
            isValid={emailRegex.test(email)}
            error={fieldErrors.email}
            autoComplete="off"
            required
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => handleBlur('password')}
            isValid={passwordRegex.test(password)}
            error={fieldErrors.password}
            autoComplete="off"
            required
          />
          
          <div className="auth-links">
            <span className="forgot-link" onClick={handleForgotPassword} style={{ cursor: 'pointer' }}>
              {forgotLoading ? 'Verifying...' : 'Forgot password?'}
            </span>
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Authenticating...' : (
              <>
                Login <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
        
        <p className="auth-footer">
           Don't have an account? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
