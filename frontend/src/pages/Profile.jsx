import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  LogOut, 
  ChevronRight, 
  Edit3, 
  Camera, 
  Save, 
  X,
  CreditCard,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    companyName: user?.companyName || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  // Update formData when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        companyName: user.companyName || ''
      });
    }
  }, [user]);

  const validateField = (name, value) => {
    let error = '';
    const trimmedValue = value ? value.toString().trim() : '';

    if (['name', 'email', 'phoneNumber'].includes(name) && !trimmedValue) {
      return 'This field is required';
    }

    if (['name', 'companyName'].includes(name) && trimmedValue) {
      if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
        error = 'Only letters are allowed';
      }
    }

    if (name === 'email' && trimmedValue) {
      if (!/^[^\s@]+@gmail\.com$/.test(trimmedValue)) {
        error = 'Enter a valid Gmail address';
      }
    }

    if (name === 'phoneNumber' && trimmedValue) {
      if (!/^\+?\d+$/.test(trimmedValue)) {
        error = 'Only numbers are allowed';
      }
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear global message
    if (message.text) setMessage({ type: '', text: '' });

    // Validate field
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please correct the errors before saving.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      companyName: (formData.companyName || '').trim()
    };

    try {
      const res = await api.updateUser(user?._id || user?.id, payload);
      if (res.success) {
        updateUser(res.data);
        setIsEditing(false);
        setFieldErrors({});
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      companyName: user.companyName || ''
    });
    setFieldErrors({});
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <div className="loading-spinner">Loading Profile...</div>;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="profile-page-wrapper">
      {/* Header Section with Premium Banner */}
      <div className="profile-header-card">
        <div className="profile-banner"></div>
        <div className="profile-header-content">
          <div className="avatar-container">
            <div className="profile-avatar-giant">
              {initials}
            </div>
            <div className="avatar-edit-overlay">
              <Camera size={24} />
            </div>
          </div>
          <div className="header-user-meta">
            <h1>{user.name}</h1>
          </div>
        </div>
      </div>

      <div className="profile-grid-system">
        {/* Main Content Area: Personal Details Card */}
        <div className="glass-card">
          <div className="card-title-row">
            <h3><UserIcon size={20} color="var(--primary)" /> Personal Information</h3>
            {!isEditing ? (
              <button 
                className="btn-premium btn-outline-premium" 
                onClick={() => setIsEditing(true)} 
                style={{ width: 'auto', padding: '0.6rem 1.2rem' }}
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn-premium btn-primary-gradient" 
                  onClick={handleUpdate} 
                  disabled={loading}
                  style={{ width: 'auto', padding: '0.6rem 1.2rem', minWidth: '100px' }}
                >
                  {loading ? 'Saving...' : <><Save size={16} /> Save</>}
                </button>
                <button 
                  className="btn-premium btn-outline-premium" 
                  onClick={handleCancel}
                  style={{ width: 'auto', padding: '0.6rem 1.2rem' }}
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleUpdate} className="info-fields-grid">
            <div className="info-field-group">
              <span className="field-label"><UserIcon size={14} /> Full Name</span>
              {isEditing ? (
                <>
                  <input 
                    type="text" 
                    name="name" 
                    className={`form-input-premium ${fieldErrors.name ? 'error' : ''}`} 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required
                  />
                  {fieldErrors.name && <span className="profile-error-msg">{fieldErrors.name}</span>}
                </>
              ) : (
                <p className="field-value">{user.name}</p>
              )}
            </div>

            <div className="info-field-group">
              <span className="field-label"><Mail size={14} /> Email Address</span>
              {isEditing ? (
                <>
                  <input 
                    type="email" 
                    name="email" 
                    className={`form-input-premium ${fieldErrors.email ? 'error' : ''}`} 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required
                  />
                  {fieldErrors.email && <span className="profile-error-msg">{fieldErrors.email}</span>}
                </>
              ) : (
                <p className="field-value">{user.email}</p>
              )}
            </div>

            <div className="info-field-group">
              <span className="field-label"><Phone size={14} /> Phone Number</span>
              {isEditing ? (
                <>
                  <input 
                    type="tel" 
                    name="phoneNumber" 
                    className={`form-input-premium ${fieldErrors.phoneNumber ? 'error' : ''}`} 
                    placeholder="+91XXXXXXXXXX"
                    value={formData.phoneNumber} 
                    onChange={handleInputChange} 
                    required
                    maxLength={13}
                  />
                  {fieldErrors.phoneNumber && <span className="profile-error-msg">{fieldErrors.phoneNumber}</span>}
                </>
              ) : (
                <p className="field-value">{user.phoneNumber || 'Not specified'}</p>
              )}
            </div>

            <div className="info-field-group">
              <span className="field-label"><Building2 size={14} /> Company Name</span>
              {isEditing ? (
                <>
                  <input 
                    type="text" 
                    name="companyName" 
                    className={`form-input-premium ${fieldErrors.companyName ? 'error' : ''}`} 
                    placeholder="Enter company name"
                    value={formData.companyName} 
                    onChange={handleInputChange} 
                  />
                  {fieldErrors.companyName && <span className="profile-error-msg">{fieldErrors.companyName}</span>}
                </>
              ) : (
                <p className="field-value">{user.companyName || 'Not specified'}</p>
              )}
            </div>


            <div className="info-field-group">
              <span className="field-label"><Calendar size={14} /> Joined On</span>
              <p className="field-value">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'April 2024'}
              </p>
            </div>
          </form>

          {message.text && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1.25rem', 
              borderRadius: '12px', 
              fontSize: '0.95rem',
              fontWeight: '500',
              backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: message.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              animation: 'fadeIn 0.3s ease'
            }}>
              {message.type === 'success' ? <Save size={18} /> : <X size={18} />}
              {message.text}
            </div>
          )}
        </div>

        {/* Sidebar: Stats and Actions */}
        <div className="stats-sidebar">
          <div className="mini-stat-card">
            <div className="stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <LayoutDashboard size={24} />
            </div>
            <div className="stat-details">
              <h4>Activity Access</h4>
              <p>Active</p>
            </div>
          </div>



          <div className="action-buttons-group">
            <button className="btn-premium btn-outline-premium" onClick={() => navigate('/')}>
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button className="btn-premium btn-outline-premium" onClick={() => navigate('/settings')}>
              <Settings size={18} /> Settings
            </button>
            <button className="btn-premium btn-danger-soft" onClick={handleLogout}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
