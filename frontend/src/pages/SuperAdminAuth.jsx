import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight } from 'lucide-react';
import FormInput from '../components/FormInput';
import ThemeToggle from '../components/ThemeToggle';
import api from '../services/api';
import './SuperAdminAuth.css';

const SuperAdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    specialAdminId: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loginTouched, setLoginTouched] = useState({});
  const [registerTouched, setRegisterTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login, register, isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard'} replace />;
  }

  // Clear states when switching between Login and Register
  useEffect(() => {
    setFieldErrors({});
    setLoginTouched({});
    setRegisterTouched({});
    if (isLogin) {
      setRegisterData({
        name: '',
        email: '',
        specialAdminId: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setLoginData({
        email: '',
        password: ''
      });
    }
  }, [isLogin]);

  const nameRegex = /^[A-Za-z ]+$/;
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

  const validateRegisterField = (name, value) => {
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
      case 'specialAdminId':
        if (!value.trim()) errorMsg = 'Super Admin Key is required';
        else if (value !== 'SPADMIN2026') errorMsg = 'Invalid Super Admin Key';
        break;
      case 'password':
        if (!value) errorMsg = 'Password is required';
        else if (!passwordRegex.test(value)) errorMsg = 'Password must be at least 6 characters and include a letter, number, and special character.';
        break;
      case 'confirmPassword':
        if (value !== registerData.password) errorMsg = 'Passwords do not match';
        break;
      default:
        break;
    }
    return errorMsg;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    const err = validateLoginField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: loginTouched[name] ? err : '' }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    const err = validateRegisterField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: registerTouched[name] ? err : '' }));
  };

  const handleLoginBlur = (name) => {
    setLoginTouched(prev => ({ ...prev, [name]: true }));
    const err = validateLoginField(name, loginData[name]);
    setFieldErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleRegisterBlur = (name) => {
    setRegisterTouched(prev => ({ ...prev, [name]: true }));
    const err = validateRegisterField(name, registerData[name]);
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

  const validateRegister = () => {
    const errors = {};
    Object.keys(registerData).forEach(key => {
      const err = validateRegisterField(key, registerData[key]);
      if (err) errors[key] = err;
    });
    setFieldErrors(errors);
    setRegisterTouched({
      name: true,
      email: true,
      specialAdminId: true,
      password: true,
      confirmPassword: true
    });
    return Object.keys(errors).length === 0;
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

    try {
      if (isLogin) {
        if (!validateLogin()) {
          setLoading(false);
          return;
        }
        const res = await login(loginData.email, loginData.password, 'superadmin');
        if (res.success) {
          addToast('Welcome back, Super Admin!', 'success');
          navigate('/superadmin/dashboard');
        } else {
          addToast(res.message, 'error');
        }
      } else {
        if (!validateRegister()) return;
        const res = await register(registerData);
        if (res.success) {
          addToast('Super Admin registered successfully!', 'success');
          navigate('/superadmin/dashboard');
        } else {
          if (res.errors) {
            const serverErrors = {};
            res.errors.forEach(err => {
              serverErrors[err.field] = err.message;
            });
            setFieldErrors(serverErrors);
            addToast('Please fix the errors below', 'error');
          } else {
            addToast(res.message, 'error');
          }
        }
      }
    } catch (err) {
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
        >
          <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Role Selection
        </button>

        <div className="sa-auth-header">
          <h2>Super Admin <span>{isLogin ? 'Login' : 'Register'}</span></h2>
          <p>{isLogin ? 'Access restricted controls' : 'Establish new secure root access'}</p>
        </div>

        <form onSubmit={handleSubmit} className="sa-auth-form">
          {!isLogin ? (
            <>
              <FormInput
                label="Full Name"
                name="name"
                placeholder="Enter your name"
                value={registerData.name}
                onChange={handleRegisterChange}
                onBlur={() => handleRegisterBlur('name')}
                isValid={nameRegex.test(registerData.name)}
                error={fieldErrors.name}
                autoComplete="off"
                required
              />
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="admin@gmail.com"
                value={registerData.email}
                onChange={handleRegisterChange}
                onBlur={() => handleRegisterBlur('email')}
                isValid={emailRegex.test(registerData.email)}
                error={fieldErrors.email}
                autoComplete="off"
                required
              />
              <FormInput
                label="Super Admin Key"
                name="specialAdminId"
                type="password"
                placeholder="Enter security key"
                value={registerData.specialAdminId}
                onChange={handleRegisterChange}
                onBlur={() => handleRegisterBlur('specialAdminId')}
                isValid={registerData.specialAdminId === 'SPADMIN2026'}
                error={fieldErrors.specialAdminId}
                autoComplete="off"
                required
              />
              <FormInput
                label="Password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={registerData.password}
                onChange={handleRegisterChange}
                onBlur={() => handleRegisterBlur('password')}
                isValid={passwordRegex.test(registerData.password)}
                error={fieldErrors.password}
                showStrength={true}
                autoComplete="off"
                required
              />
              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                onBlur={() => handleRegisterBlur('confirmPassword')}
                isValid={registerData.confirmPassword !== '' && registerData.password === registerData.confirmPassword}
                error={fieldErrors.confirmPassword}
                autoComplete="off"
                required
              />
            </>
          ) : (
            <>
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
            </>
          )}

          <button type="submit" className="sa-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login AS SUPER ADMIN' : 'Register AS SUPER ADMIN')}
          </button>
        </form>

        <div className="sa-auth-footer">
          <p onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'New User? Register' : 'Already Registered? Login'}
          </p>
          {isLogin && (
            <p className="forgot-link" onClick={handleForgotPassword} style={{ cursor: 'pointer' }}>
              {forgotLoading ? 'Verifying...' : 'Forgot Password?'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAuth;
