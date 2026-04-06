import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import FormInput from '../components/FormInput';
import './AuthPages.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(''); // For simulation purposes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.forgotPassword({ email });
      if (res.success) {
        setMessage('Reset token generated successfully!');
        setResetToken(res.resetToken);
      }
    } catch (err) {
      setError(err.message || 'Failed to request reset');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to receive a reset token</p>
        
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}
        
        {!resetToken ? (
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
              {loading ? 'Requesting...' : 'Get Reset Token'}
            </button>
          </form>
        ) : (
          <div className="mt-6 p-4 bg-slate-100 rounded text-center">
            <p className="text-sm text-slate-600 mb-2">Simulated Reset Token:</p>
            <code className="block bg-white p-2 border rounded text-primary font-bold mb-4">{resetToken}</code>
            <Link to={`/reset-password/${resetToken}`} className="btn btn-primary w-full inline-block">
              Go to Reset Page
            </Link>
          </div>
        )}
        
        <p className="auth-footer mt-6 text-center">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
