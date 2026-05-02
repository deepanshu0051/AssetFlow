import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, UserPlus, CheckCircle, ArrowRight } from 'lucide-react';
import FormInput from '../components/FormInput';
import apiService from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import OTPModal from '../components/OTPModal';
import './AuthPages.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plantLocation: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    adminAccessId: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plants, setPlants] = useState([]);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await apiService.getPlants();
        if (res.success) setPlants(res.data);
      } catch (error) {
        console.error('Error fetching plant locations', error);
      }
    };
    fetchPlants();
  }, []);

  // Redirect to dashboard if already logged in
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard'} replace />;
  }

  const nameRegex = /^[A-Za-z ]+$/;
  const emailRegex = /^(?=[^@]*[a-z])[a-z0-9]+(\.[a-z0-9]+)?@gmail\.com$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
  const mobileRegex = /^\d{10}$/;

  const validateField = (name, value) => {
    let errorMsg = '';
    switch (name) {
      case 'name':
        if (!value.trim()) errorMsg = 'Full Name is required';
        else if (!nameRegex.test(value)) errorMsg = 'Only letters and spaces are allowed';
        break;
      case 'email':
        if (!value.trim()) errorMsg = 'Email is required';
        else if (!emailRegex.test(value)) errorMsg = 'Enter a valid gmail';
        break;
      case 'plantLocation':
        if (!value) errorMsg = 'Plant Location is required';
        break;
      case 'password':
        if (!value) errorMsg = 'Password is required';
        else if (!passwordRegex.test(value)) errorMsg = 'Password must be at least 6 characters and include a letter, number, and special character.';
        break;
      case 'confirmPassword':
        if (value !== formData.password) errorMsg = 'Passwords do not match';
        break;
      case 'mobileNumber':
        if (!value) errorMsg = 'Mobile Number is required';
        else if (!/^\d+$/.test(value)) errorMsg = 'Only numbers allowed';
        else if (value.length !== 10) errorMsg = 'Exactly 10 digits required';
        break;
      case 'adminAccessId':
        if (!value.trim()) errorMsg = 'Admin Access ID is required';
        else if (value !== 'AF202600') errorMsg = 'Invalid Admin Access ID';
        break;
      default:
        break;
    }
    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const err = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: touched[name] ? err : '' }));
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateField(name, formData[name]);
    setFieldErrors(prev => ({ ...prev, [name]: err }));
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) errors[key] = err;
    });
    setFieldErrors(errors);
    setTouched({
      name: true,
      email: true,
      plantLocation: true,
      password: true,
      confirmPassword: true,
      mobileNumber: true,
      adminAccessId: true
    });
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!isEmailVerified) {
      setError('Please verify your email first');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await register(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          // Determine path from response user or default to admin
          const path = res.user?.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard';
          navigate(path);
        }, 2010);
      } else {
        if (res.errors) {
          const serverErrors = {};
          res.errors.forEach(err => {
            serverErrors[err.field] = err.message;
          });
          setFieldErrors(serverErrors);
          setError('Please fix the errors below');
        } else {
          setError(res.message || 'Registration failed');
        }
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
      <div className="auth-theme-wrapper">
        <ThemeToggle />
      </div>

      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        email={formData.email}
        loading={otpLoading}
        onVerify={async (otp) => {
          setOtpLoading(true);
          try {
            const res = await apiService.verifyOTP({ 
              email: formData.email, 
              role: 'admin', 
              otp 
            });
            if (res.success) {
              setIsEmailVerified(true);
              setIsOTPModalOpen(false);
              return { success: true };
            }
            return { success: false, message: res.message };
          } catch (err) {
            return { success: false, message: 'Verification failed' };
          } finally {
            setOtpLoading(false);
          }
        }}
        onResend={async () => {
          setOtpLoading(true);
          try {
            const res = await apiService.sendOTP({ email: formData.email, role: 'admin' });
            return res.success;
          } catch (err) {
            return false;
          } finally {
            setOtpLoading(false);
          }
        }}
      />
      <div className="auth-card">
        <button 
          className="back-btn" 
          onClick={() => navigate('/')}
          title="Back to Role Selection"
        >
          <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>

        <div className="auth-header">
          <h2>Admin <span>Register</span></h2>
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
            onBlur={() => handleBlur('name')}
            isValid={nameRegex.test(formData.name)}
            error={fieldErrors.name}
            autoComplete="off"
            required
          />
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@gmail.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            isValid={emailRegex.test(formData.email)}
            error={fieldErrors.email}
            autoComplete="off"
            required
            readOnly={isEmailVerified}
            rightAction={
              isEmailVerified ? (
                <span className="text-green-500 font-bold" style={{ fontSize: '0.8rem', paddingRight: '8px' }}>Verified ✓</span>
              ) : (
                <button
                  type="button"
                  className="btn-verify-input"
                  onClick={async () => {
                    setOtpLoading(true);
                    try {
                      const res = await apiService.sendOTP({ email: formData.email, role: 'admin' });
                      if (res.success) {
                        setIsOTPModalOpen(true);
                      } else {
                        setError(res.message);
                      }
                    } catch (err) {
                      setError('Failed to send OTP');
                    } finally {
                      setOtpLoading(false);
                    }
                  }}
                  disabled={otpLoading || !emailRegex.test(formData.email)}
                >
                  {otpLoading ? '...' : 'Verify'}
                </button>
              )
            }
          />
          <FormInput
            label="Plant Location"
            name="plantLocation"
            type="select"
            options={plants.length > 0 ? plants : ['Loading...']}
            value={formData.plantLocation}
            onChange={handleChange}
            onBlur={() => handleBlur('plantLocation')}
            isValid={!!formData.plantLocation}
            error={fieldErrors.plantLocation}
            required
          />
          <FormInput
            label="Mobile Number"
            name="mobileNumber"
            placeholder="10-digit mobile number"
            value={formData.mobileNumber}
            onChange={handleChange}
            onBlur={() => handleBlur('mobileNumber')}
            isValid={mobileRegex.test(formData.mobileNumber)}
            error={fieldErrors.mobileNumber}
            prefix="+91"
            maxLength={10}
            required
          />
          <FormInput
            label="Admin Access ID"
            name="adminAccessId"
            type="password"
            placeholder="Enter Admin Access ID"
            value={formData.adminAccessId}
            onChange={handleChange}
            onBlur={() => handleBlur('adminAccessId')}
            isValid={formData.adminAccessId === 'AF202600'}
            error={fieldErrors.adminAccessId}
            required
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="Enter a strong password"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => handleBlur('password')}
            isValid={passwordRegex.test(formData.password)}
            error={fieldErrors.password}
            showStrength={true}
            autoComplete="off"
            required
          />
          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={() => handleBlur('confirmPassword')}
            isValid={formData.confirmPassword !== '' && formData.password === formData.confirmPassword}
            error={fieldErrors.confirmPassword}
            autoComplete="off"
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
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
