import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import FormInput from '../components/FormInput';
import './AuthPages.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.resetPassword(token, { password: formData.password });
      if (res.success) {
        alert('Password reset successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Set New Password</h2>
        <p className="auth-subtitle">Create a strong password for your account</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <FormInput
            label="New Password"
            type="password"
            placeholder="Min. 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <FormInput
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />

          <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        
        <p className="auth-footer mt-6 text-center">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
