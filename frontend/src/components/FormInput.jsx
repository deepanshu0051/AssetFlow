import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './FormInput.css';

const FormInput = ({ label, type = 'text', placeholder, value, onChange, onBlur, options, name, required = false, error, isValid, prefix, maxLength, readOnly, showStrength, rightAction, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: 'Weak', class: 'weak' };
    
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

    if (hasLetters && hasNumbers && hasSpecial) return { label: 'Strong', class: 'strong' };
    if (hasLetters && hasNumbers) return { label: 'Medium', class: 'medium' };
    return { label: 'Weak', class: 'weak' };
  };

  const strength = isPassword && showStrength ? getPasswordStrength(value) : null;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputClasses = `form-control ${error ? 'error' : (isValid && value !== '' ? 'success' : '')}`;
  const wrapperClasses = `input-wrapper ${error ? 'error' : (isValid && value !== '' ? 'success' : '')} ${prefix ? 'with-prefix' : ''}`;

  return (
    <div className={`form-group ${error ? 'has-error' : ''}`}>
      {label && <label className="form-label">{label}</label>}
      
      <div className="input-with-icon">
        {type === 'select' ? (
          <select 
            name={name} 
            className={inputClasses} 
            value={value} 
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            {...props}
          >
            <option value="" disabled>{placeholder || 'Select an option'}</option>
            {options?.map((opt, idx) => (
              <option key={idx} value={opt.value || opt}>{opt.label || opt}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            className={`${inputClasses} textarea`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            rows={4}
            {...props}
          />
        ) : (
          <div className={wrapperClasses}>
            {prefix && <span className="input-prefix">{prefix}</span>}
            <input
              type={inputType}
              name={name}
              className={inputClasses}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              required={required}
              maxLength={maxLength}
              readOnly={readOnly}
              style={readOnly ? { backgroundColor: 'var(--accent-color)', cursor: 'not-allowed' } : {}}
              {...props}
            />
            {isPassword ? (
              <button 
                type="button" 
                className="password-toggle" 
                onClick={togglePasswordVisibility}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            ) : rightAction && (
              <div className="input-right-action">
                {rightAction}
              </div>
            )}
          </div>
        )}
      </div>
      {error && <span className="error-message">{error}</span>}
      {isPassword && showStrength && value && (
        <div className="strength-meter">
          <div className={`strength-bar ${strength?.class}`}></div>
          <span className={`strength-text ${strength?.class}`}>Strength: {strength?.label}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;
