import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import './OTPModal.css';

const OTPModal = ({ isOpen, onClose, email, onVerify, onResend, loading }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setTimer(60);
      setError('');
      // Focus first input after a small delay for modal animation
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    setError('');
    const success = await onResend();
    if (success) {
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } else {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    const result = await onVerify(otpValue);
    if (!result.success) {
      setError(result.message || 'Invalid OTP');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal-content card fade-in">
        <button className="otp-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="otp-header">
          <div className="otp-icon-wrapper">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <h2>Email Verification</h2>
          <p>We've sent a 6-digit code to <strong>{email}</strong></p>
        </div>

        {error && (
          <div className="otp-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-input-container">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={error ? 'error' : ''}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          <div className="otp-timer-container">
            {timer > 0 ? (
              <div className="otp-timer">
                <Clock size={14} />
                <span>Resend code in {timer}s</span>
              </div>
            ) : (
              <button 
                type="button" 
                className="otp-resend-btn" 
                onClick={handleResend}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                Resend Code
              </button>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
          
          <button type="button" className="btn btn-ghost w-full mt-2" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPModal;
