import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  MapPin,
  Calendar, 
  LogOut, 
  Edit3, 
  Camera, 
  Save, 
  X,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiService from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, logout, login } = useAuth(); // Need to update context user if name changes, or just refresh
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    password: ''
  });

  useEffect(() => {
    if (user) setFormData({ name: user.name, password: '' });
  }, [user]);

  const handleLogout = () => {
    const redirectPath = user?.role === 'superadmin' ? '/superadmin/login' : '/admin/login';
    logout();
    navigate(redirectPath);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await apiService.updateProfile(formData);
      if (res.success) {
        addToast('Profile updated successfully!', 'success');
        // A hack to update the context without full refresh could be firing a "me" check
        // Or simply reloading the page
        window.location.reload();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
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
            <h3><UserIcon size={20} /> Personal Information</h3>
            {!isEditing ? (
              <button className="btn-edit-toggle" onClick={() => setIsEditing(true)}>
                <Edit3 size={16} /> Edit
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="btn-save" onClick={handleSave} disabled={loading}>
                  <Save size={14} /> {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="info-fields-grid">
            <div className="info-field-group">
              <span className="field-label"><UserIcon size={14} /> Full Name</span>
              {isEditing ? (
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="profile-input" />
              ) : (
                <p className="field-value">{user.name}</p>
              )}
            </div>

            {isEditing && (
              <div className="info-field-group">
                <span className="field-label"><UserIcon size={14} /> New Password (Optional)</span>
                <input type="password" name="password" placeholder="Leave blank to keep current" value={formData.password} onChange={handleChange} className="profile-input" />
              </div>
            )}

            <div className="info-field-group">
              <span className="field-label"><Mail size={14} /> Email Address</span>
              <p className="field-value">{user.email}</p>
            </div>

            <div className="info-field-group">
              <span className="field-label"><MapPin size={14} /> Role</span>
              <p className="field-value capitalize">{user.role}</p>
            </div>

            {user.plantLocation && (
              <div className="info-field-group">
                <span className="field-label"><MapPin size={14} /> Plant Location</span>
                <p className="field-value">{user.plantLocation}</p>
              </div>
            )}

            <div className="info-field-group">
              <span className="field-label"><Calendar size={14} /> Joined On</span>
              <p className="field-value">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar: Stats and Actions */}
        <div className="stats-sidebar">
          <div className="mini-stat-card">
            <div className="stat-icon-box">
              <LayoutDashboard size={24} />
            </div>
            <div className="stat-details">
              <h4>Activity Access</h4>
              <p>Active</p>
            </div>
          </div>

          <div className="action-buttons-group">
            <button 
              className="btn-premium btn-outline-premium" 
              onClick={() => navigate(user.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard')}
            >
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
