import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, UserPlus, CheckCircle } from 'lucide-react';
import FormInput from '../components/FormInput';
import ThemeToggle from '../components/ThemeToggle';
import OTPModal from '../components/OTPModal';
import api from '../services/api';
import './SuperAdminAuth.css';

const SuperAdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialAdminId: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [isSpecialAdminIdCorrect, setIsSpecialAdminIdCorrect] = useState(false);
  const [isSpecialAdminIdValidating, setIsSpecialAdminIdValidating] = useState(false);

  const { register, isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated && user) {
    if (user.role === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  const nameRegex = /^[A-Za-z ]+$/;
  const emailRegex = /^[a-z0-9._%+-]+@gmail\.com$/i;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  const validateField = (name, value) => {
    let errorMsg = '';
    switch (name) {
      case 'name':
        if (!value.trim()) errorMsg = 'Full Name is required';
        else if (!nameRegex.test(value)) errorMsg = 'Only letters and spaces are allowed';
        break;
      case 'email':
        if (!value.trim()) errorMsg = 'Email is required';
        else if (!emailRegex.test(value)) errorMsg = 'Enter a valid Gmail';
        break;
      case 'password':
        if (!value) errorMsg = 'Password is required';
        else if (!passwordRegex.test(value)) errorMsg = 'Password must be at least 6 chars with letter, number & special char';
        break;
      case 'confirmPassword':
        if (value !== formData.password) errorMsg = 'Passwords do not match';
        break;
      case 'specialAdminId':
        if (!value.trim()) errorMsg = 'Super Admin Key is required';
        else if (!isSpecialAdminIdCorrect && !isSpecialAdminIdValidating) errorMsg = 'Invalid Super Admin Key';
        break;
      default:
        break;
    }
    return errorMsg;
  };

  // Debounced real-time validation for Super Admin Key
  useEffect(() => {
    const key = formData.specialAdminId.trim();
    if (!key) {
      setIsSpecialAdminIdCorrect(false);
      setIsSpecialAdminIdValidating(false);
      return;
    }

    setIsSpecialAdminIdValidating(true);
    setIsSpecialAdminIdCorrect(false);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.validateKey({ key, type: 'superadmin' });
        setIsSpecialAdminIdValidating(false);
        if (res.success && res.isValid) {
          setIsSpecialAdminIdCorrect(true);
          setFieldErrors(prev => ({ ...prev, specialAdminId: '' }));
        } else {
          setIsSpecialAdminIdCorrect(false);
          if (touched.specialAdminId) {
            setFieldErrors(prev => ({ ...prev, specialAdminId: 'Invalid Super Admin Key' }));
          }
        }
      } catch (err) {
        setIsSpecialAdminIdValidating(false);
        setIsSpecialAdminIdCorrect(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.specialAdminId, touched.specialAdminId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'email' ? value.toLowerCase() : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    if (name === 'specialAdminId') {
      setIsSpecialAdminIdCorrect(false);
      if (!value.trim()) {
        setFieldErrors(prev => ({ ...prev, specialAdminId: '' }));
      }
    } else {
      const err = validateField(name, finalValue);
      setFieldErrors(prev => ({ ...prev, [name]: touched[name] ? err : '' }));
    }
  };

  const handleBlur = async (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (name === 'specialAdminId') {
      const value = formData.specialAdminId.trim();
      if (!value) {
        setFieldErrors(prev => ({ ...prev, specialAdminId: 'Super Admin Key is required' }));
        return;
      }
      setIsSpecialAdminIdValidating(true);
      try {
        const res = await api.validateKey({ key: value, type: 'superadmin' });
        setIsSpecialAdminIdValidating(false);
        if (res.success && res.isValid) {
          setIsSpecialAdminIdCorrect(true);
          setFieldErrors(prev => ({ ...prev, specialAdminId: '' }));
        } else {
          setIsSpecialAdminIdCorrect(false);
          setFieldErrors(prev => ({ ...prev, specialAdminId: 'Invalid Super Admin Key' }));
        }
      } catch (err) {
        setIsSpecialAdminIdValidating(false);
        setIsSpecialAdminIdCorrect(false);
        setFieldErrors(prev => ({ ...prev, specialAdminId: 'Validation failed' }));
      }
    } else {
      const err = validateField(name, formData[name]);
      setFieldErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) errors[key] = err;
    });
    if (formData.specialAdminId && !isSpecialAdminIdCorrect) {
      errors.specialAdminId = 'Invalid Super Admin Key';
    }
    setFieldErrors(errors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const key = formData.specialAdminId.trim();
    if (!key) {
      setFieldErrors(prev => ({ ...prev, specialAdminId: 'Super Admin Key is required' }));
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Synchronous/immediate validation check right before submit
      const valRes = await api.validateKey({ key, type: 'superadmin' });
      if (!valRes.success || !valRes.isValid) {
        setIsSpecialAdminIdCorrect(false);
        setFieldErrors(prev => ({ ...prev, specialAdminId: 'Invalid Super Admin Key' }));
        setLoading(false);
        return;
      }
      setIsSpecialAdminIdCorrect(true);

      if (!validateForm()) {
        setLoading(false);
        return;
      }
      
      if (!isEmailVerified) {
        setError('Please verify your email first');
        addToast('Please verify your email first', 'error');
        setLoading(false);
        return;
      }
      
      // We pass role: 'superadmin' so the backend knows to use SuperAdmin model
      const res = await register({ ...formData, role: 'superadmin' });
      if (res.success) {
        setSuccess(true);
        addToast('Super Admin account created successfully!', 'success');
        setTimeout(() => {
          navigate('/superadmin/dashboard', { replace: true });
        }, 2000);
      } else {
        setError(res.message || 'Registration failed');
        addToast(res.message || 'Registration failed', 'error');
      }
    } catch (err) {
      const msg = err?.message || (typeof err === 'string' ? err : 'An unexpected error occurred');
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="sa-auth-container">
        <div className="sa-auth-card" style={{ alignItems: 'center', textAlign: 'center', padding: '40px' }}>
          <CheckCircle size={64} style={{ color: 'var(--success)', marginBottom: '20px' }} />
          <h2 style={{ color: 'var(--success)' }}>Registration Successful!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Welcome, Super Admin. Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-auth-container">
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
            const res = await api.verifyOTP({ 
              email: formData.email, 
              role: 'superadmin', 
              otp 
            });
            if (res.success) {
              setIsEmailVerified(true);
              setIsOTPModalOpen(false);
              addToast('Email verified successfully!', 'success');
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
            console.log('Dispatching resendOTP request for superadmin:', formData.email);
            const res = await api.sendOTP({ email: formData.email, role: 'superadmin' });
            if (res.success) {
              addToast('New OTP sent to your email', 'success');
              return true;
            }
            addToast(res.message || 'Failed to resend OTP', 'error');
            return false;
          } catch (err) {
            const errMsg = err?.message || (typeof err === 'string' ? err : 'Failed to resend OTP email.');
            console.error('Production SuperAdmin OTP Resend Failure:', err);
            addToast(errMsg, 'error');
            return false;
          } finally {
            setOtpLoading(false);
          }
        }}
      />

      <div className="sa-auth-card">
        <button 
          className="sa-back-btn" 
          onClick={() => navigate('/superadmin/login')}
          title="Back to Login"
        >
          <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>

        <div className="sa-auth-header">
          <h2>Super Admin <span>Register</span></h2>
          <p>Create restricted access account</p>
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
            label="Full Name"
            name="name"
            placeholder="Super Admin Name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            isValid={nameRegex.test(formData.name)}
            error={fieldErrors.name}
            required
          />
          
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="admin@gmail.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            isValid={emailRegex.test(formData.email)}
            error={fieldErrors.email}
            required
            readOnly={isEmailVerified}
            rightAction={
              isEmailVerified ? (
                <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.8rem', paddingRight: '8px' }}>Verified ✓</span>
              ) : (
                <button
                  type="button"
                  className="sa-verify-btn"
                  onClick={async () => {
                    if (!emailRegex.test(formData.email)) {
                      setFieldErrors(prev => ({ ...prev, email: 'Enter a valid Gmail' }));
                      return;
                    }
                    setOtpLoading(true);
                    setError('');
                    try {
                      console.log('Dispatching sendOTP request for superadmin:', formData.email);
                      const res = await api.sendOTP({ email: formData.email, role: 'superadmin' });
                      if (res.success) {
                        setIsOTPModalOpen(true);
                        addToast('OTP sent to your email', 'success');
                      } else {
                        const errMsg = res.message || 'Failed to send OTP';
                        setError(errMsg);
                        addToast(errMsg, 'error');
                      }
                    } catch (err) {
                      const errMsg = err?.message || (typeof err === 'string' ? err : 'Failed to send OTP email. Please verify SMTP credentials or network settings.');
                      console.error('Production SuperAdmin OTP Send Failure:', err);
                      setError(errMsg);
                      addToast(errMsg, 'error');
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
            label="Super Admin Key"
            name="specialAdminId"
            type="password"
            placeholder="Enter security key"
            value={formData.specialAdminId}
            onChange={handleChange}
            onBlur={() => handleBlur('specialAdminId')}
            isValid={isSpecialAdminIdCorrect}
            error={fieldErrors.specialAdminId}
            required
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="Create password"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => handleBlur('password')}
            isValid={passwordRegex.test(formData.password)}
            error={fieldErrors.password}
            showStrength={true}
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
            required
          />

          <button type="submit" className="sa-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Register <UserPlus size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="sa-auth-footer">
          <p>
            Already have an account? <span className="sa-link" onClick={() => navigate('/superadmin/login')}>Login here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminRegister;
