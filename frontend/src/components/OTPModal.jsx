import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import './OTPModal.css';

const OTPModal = ({ isOpen, onClose, email, onVerify, onResend, loading: externalLoading, initialError = '' }) => {
  const [otpValue, setOtpValue] = useState('');
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState(initialError);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0 && !externalLoading) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer, externalLoading]);

  useEffect(() => {
    if (isOpen) {
      setOtpValue('');
      setTimer(60);
      setError(initialError);
      setIsFocused(true);
      if (!externalLoading) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    }
  }, [isOpen, initialError]);

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 6) {
      setOtpValue(val);
      setError('');
    }
  };

  const handleResend = async () => {
    setError('');
    const success = await onResend();
    if (success) {
      setTimer(60);
      setOtpValue('');
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="otp-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={`otp-modal-content card fade-in ${externalLoading && otpValue === '' ? 'pulse' : ''}`}>
        <button className="otp-close-btn" type="button" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="otp-header">
          <div className="otp-icon-wrapper">
            <ShieldCheck size={32} className={externalLoading && otpValue === '' ? 'pulse text-primary' : 'text-primary'} />
          </div>
          <h2>{externalLoading && otpValue === '' ? 'Sending OTP...' : 'Email Verification'}</h2>
          <p>
            {externalLoading && otpValue === '' 
              ? `Please wait while we secure your request for ${email}...` 
              : <>We've sent a 6-digit code to <strong>{email}</strong></>
            }
          </p>
        </div>

        {error && (
          <div className="otp-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {externalLoading && otpValue === '' ? (
          <div className="otp-loading-placeholder">
            <div className="otp-skeleton-boxes">
              {[...Array(6)].map((_, i) => <div key={i} className="otp-skeleton-box shimmer" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
            </div>
            <p className="otp-loading-text">Communicating with email services...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="otp-form">
            <div className="otp-input-wrapper-relative">
              {/* Invisible native numeric input to process typing natively on mobile keyboards */}
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otpValue}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoComplete="one-time-code"
                className="otp-hidden-native-input"
                disabled={externalLoading}
              />
              
              {/* Presentational stylized indicator boxes */}
              <div className="otp-input-container" onClick={() => !externalLoading && inputRef.current?.focus()}>
                {Array.from({ length: 6 }).map((_, idx) => {
                  const digit = otpValue[idx] || '';
                  const isCurrent = idx === otpValue.length;
                  const isLast = idx === 5 && otpValue.length === 6;
                  const isSelected = isFocused && (isCurrent || isLast);

                  return (
                    <div
                      key={idx}
                      className={`otp-digit-box ${error ? 'error' : ''} ${isSelected ? 'focused' : ''} ${digit ? 'filled' : ''}`}
                    >
                      {digit}
                    </div>
                  );
                })}
              </div>
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
                  disabled={externalLoading}
                >
                  <RefreshCw size={14} className={externalLoading ? 'spin' : ''} />
                  Resend Code
                </button>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={externalLoading || otpValue.length !== 6}>
              {externalLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            
            <button type="button" className="btn btn-ghost w-full mt-2" onClick={onClose} disabled={externalLoading}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default OTPModal;
