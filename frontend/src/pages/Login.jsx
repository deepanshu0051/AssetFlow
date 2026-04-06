import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight } from 'lucide-react';
import FormInput from '../components/FormInput';
import './AuthPages.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      return setError('Please enter both email and password');
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
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
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="auth-links">
            <Link to="/forgot-password">Forgot password?</Link>
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
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
