import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import FormInput from '../components/FormInput';
import ThemeToggle from '../components/ThemeToggle';
import './AuthPages.css';

const ForgotPassword = ({ role = 'admin' }) => {
  const location = useLocation();
  const stateEmail = location.state?.email || '';
  const stateToken = location.state?.resetToken || '';

  const [email, setEmail] = useState(stateEmail);
  const [message, setMessage] = useState(stateToken ? 'Reset token generated successfully!' : '');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(stateToken);

  const isSuperAdmin = role === 'superadmin';
  const backLink = isSuperAdmin ? '/super-admin-auth' : '/login';

  const emailRegex = /^[a-z0-9._%+-]+@gmail\.com$/i;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1: Check empty email
    if (!email.trim()) {
      setFieldErrors({ email: 'Please enter email first' });
      return;
    }

    // Step 2: Validate email format
    if (!emailRegex.test(email)) {
      setFieldErrors({ email: 'Enter a valid gmail' });
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.forgotPassword({ email, role });
      if (res.success) {
        setMessage('Reset token generated successfully!');
        setResetToken(res.resetToken);
      }
    } catch (err) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Failed to request reset');
      if (msg === 'Email not registered') {
        setFieldErrors({ email: 'Email not registered' });
      } else {
        setError(msg);
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-theme-wrapper">
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <h2>{isSuperAdmin ? 'Super Admin' : ''} Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to receive a reset token</p>
        
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}
        
        {!resetToken ? (
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Email Address"
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value.toLowerCase());
                if (fieldErrors.email) setFieldErrors({});
              }}
              isValid={emailRegex.test(email)}
              error={fieldErrors.email}
              required
            />

            <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
              {loading ? 'Verifying...' : 'Get Reset Token'}
            </button>
          </form>
        ) : (
          <div className="mt-6 p-4 bg-slate-100 rounded text-center">
            <p className="text-sm text-slate-600 mb-2">Simulated Reset Token:</p>
            <code className="block bg-white p-2 border rounded text-primary font-bold mb-4">{resetToken}</code>
            <Link to={isSuperAdmin ? `/superadmin/reset-password/${resetToken}` : `/admin/reset-password/${resetToken}`} className="btn btn-primary w-full inline-block">
              Go to Reset Page
            </Link>
          </div>
        )}
        
        <p className="auth-footer mt-6 text-center">
          Remember your password? Back to <Link to={backLink}>{isSuperAdmin ? 'Super Admin Auth' : 'Login'}</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
