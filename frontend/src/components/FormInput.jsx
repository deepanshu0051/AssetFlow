import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './FormInput.css';

const FormInput = ({ label, type = 'text', placeholder, value, onChange, options, name, required = false, error, prefix, maxLength }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`form-group ${error ? 'has-error' : ''}`}>
      {label && <label className="form-label">{label}{required && <span className="required-star">*</span>}</label>}
      
      <div className="input-with-icon">
        {type === 'select' ? (
          <select 
            name={name} 
            className={`form-control ${error ? 'error' : ''}`} 
            value={value} 
            onChange={onChange}
            required={required}
          >
            <option value="" disabled>{placeholder || 'Select an option'}</option>
            {options?.map((opt, idx) => (
              <option key={idx} value={opt.value || opt}>{opt.label || opt}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            className={`form-control textarea ${error ? 'error' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            rows={4}
          />
        ) : (
          <div className={`input-wrapper ${error ? 'error' : ''} ${prefix ? 'with-prefix' : ''}`}>
            {prefix && <span className="input-prefix">{prefix}</span>}
            <input
              type={inputType}
              name={name}
              className={`form-control ${error ? 'error' : ''}`}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              required={required}
              maxLength={maxLength}
            />
            {isPassword && (
              <button 
                type="button" 
                className="password-toggle" 
                onClick={togglePasswordVisibility}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
        )}
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default FormInput;
