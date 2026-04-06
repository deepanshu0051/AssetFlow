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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phoneNumber.trim();
    const trimmedEmail = formData.email.trim();
    
    if (!trimmedName || !trimmedPhone || !trimmedEmail) {
      setLoading(false);
      return setMessage({ type: 'error', text: 'Name, Email, and Phone Number are required fields.' });
    }

    const phoneRegex = /^\+\d{1,2}\d{10}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setLoading(false);
      return setMessage({ type: 'error', text: 'Enter valid phone number with country code and 10 digits.' });
    }

    const payload = {
      ...formData,
      name: trimmedName,
      email: trimmedEmail,
      phoneNumber: trimmedPhone,
      companyName: formData.companyName.trim()
    };

    try {
      const res = await api.updateUser(user?._id || user?.id, payload);
      if (res.success) {
        updateUser(res.data);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
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
                  onClick={() => setIsEditing(false)}
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
                <input 
                  type="text" 
                  name="name" 
                  className="form-input-premium" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required
                />
              ) : (
                <p className="field-value">{user.name}</p>
              )}
            </div>

            <div className="info-field-group">
              <span className="field-label"><Mail size={14} /> Email Address</span>
              {isEditing ? (
                <input 
                  type="email" 
                  name="email" 
                  className="form-input-premium" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required
                />
              ) : (
                <p className="field-value">{user.email}</p>
              )}
            </div>

            <div className="info-field-group">
              <span className="field-label"><Phone size={14} /> Phone Number</span>
              {isEditing ? (
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  className="form-input-premium" 
                  placeholder="+91XXXXXXXXXX"
                  value={formData.phoneNumber} 
                  onChange={handleInputChange} 
                  required
                  maxLength={13}
                />
              ) : (
                <p className="field-value">{user.phoneNumber || 'Not specified'}</p>
              )}
            </div>

            <div className="info-field-group">
              <span className="field-label"><Building2 size={14} /> Company Name</span>
              {isEditing ? (
                <input 
                  type="text" 
                  name="companyName" 
                  className="form-input-premium" 
                  placeholder="Enter company name"
                  value={formData.companyName} 
                  onChange={handleInputChange} 
                />
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
