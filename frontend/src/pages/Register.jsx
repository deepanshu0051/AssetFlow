import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, UserPlus, CheckCircle } from 'lucide-react';
import FormInput from '../components/FormInput';
import './AuthPages.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Strict numeric only for phone
    if (name === 'phoneNumber') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Trim inputs
    const trimmedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword
    };

    if (!trimmedData.name || !trimmedData.email || !trimmedData.password || !trimmedData.phoneNumber) {
      return setError('Please fill in all required fields');
    }

    // Validation
    if (/[0-9]/.test(trimmedData.name)) {
      return setError('Name should not contain numbers');
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(trimmedData.email)) {
      return setError('Please enter a valid email address');
    }

    if (trimmedData.phoneNumber.length !== 10) {
      return setError('Enter a valid 10-digit phone number');
    }

    // Prepare final data with +91 prefix for backend
    const finalData = {
      ...trimmedData,
      phoneNumber: `+91${trimmedData.phoneNumber}`
    };

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;
    if (!passwordRegex.test(trimmedData.password)) {
      return setError('Password must contain uppercase, lowercase, number, and special character');
    }

    if (trimmedData.password !== trimmedData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await register(finalData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2010);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          <h2 className="text-green-600">Registration Successful!</h2>
          <p className="auth-subtitle">Your account has been created. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join AssetFlow to streamline your industrial resource tracking.</p>
        </div>
        
        {error && (
          <div className="auth-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Full Name"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            placeholder="90XXXXXXXX"
            value={formData.phoneNumber}
            onChange={handleChange}
            prefix="+91"
            maxLength={10}
            required
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Enter your password again"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn-auth mt-4" disabled={loading}>
            {loading ? 'Creating Account...' : (
              <>
                Register <UserPlus size={18} />
              </>
            )}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
