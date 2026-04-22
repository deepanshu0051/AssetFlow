import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import FormInput from '../components/FormInput';
import ThemeToggle from '../components/ThemeToggle';
import './AuthPages.css';

const ResetPassword = ({ role = 'admin' }) => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = role === 'superadmin';
  const loginLink = isSuperAdmin ? '/super-admin-auth' : '/login';

  const validateForm = () => {
    const errors = {};
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = 'Must be 6+ chars with a letter, number, and special character';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.resetPassword(token, { password: formData.password });
      if (res.success) {
        alert('Password reset successful! Please login.');
        navigate(loginLink);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-theme-wrapper">
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <h2>Set New {isSuperAdmin ? 'Super Admin' : ''} Password</h2>
        <p className="auth-subtitle">Create a strong password for your account</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <FormInput
            label="New Password"
            type="password"
            placeholder="Min. 6 characters"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
            }}
            isValid={/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(formData.password)}
            error={fieldErrors.password}
            showStrength={true}
            required
          />
          <FormInput
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value });
              if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
            }}
            isValid={formData.confirmPassword !== '' && formData.password === formData.confirmPassword}
            error={fieldErrors.confirmPassword}
            required
          />

          <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        
        <p className="auth-footer mt-6 text-center">
          <Link to={loginLink}>Back to {isSuperAdmin ? 'Super Admin Auth' : 'Login'}</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
