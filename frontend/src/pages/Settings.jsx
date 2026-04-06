import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Moon, 
  Sun, 
  Monitor, 
  Check, 
  Settings as SettingsIcon,
  Bell,
  User,
  Palette
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Settings.css';

const Settings = () => {
  const { theme, setSpecificTheme, useSystemTheme, setUseSystemTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const navigate = useNavigate();

  const themeOptions = [
    {
      id: 'light',
      name: 'Light Mode',
      icon: <Sun size={20} />,
      description: 'Clean and bright interface for daytime use.',
      previewClass: 'preview-light'
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      icon: <Moon size={20} />,
      description: 'Sleek and eye-friendly interface for low light.',
      previewClass: 'preview-dark'
    }
  ];

  const handleTabClick = (tab) => {
    if (tab === 'personal') {
      navigate('/profile');
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-header">
        <div className="header-title-box">
          <SettingsIcon className="header-icon" size={28} />
          <div>
            <h1>Account Settings</h1>
            <p>Manage your application preferences and theme.</p>
          </div>
        </div>
      </div>

      <div className="settings-grid">
        {/* Content Section */}
        <div className="settings-content-area">
          {activeTab === 'appearance' && (
            <div className="settings-card active">
              <div className="card-header">
                <Palette size={20} className="section-icon" />
                <div className="section-meta">
                  <h3>Appearance</h3>
                  <p>Customize how AssetFlow looks on your device.</p>
                </div>
              </div>

              <div className="theme-toggle-group">
                <button 
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setSpecificTheme('light')}
                  disabled={useSystemTheme}
                >
                  <Sun size={18} /> Light
                </button>
                <button 
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setSpecificTheme('dark')}
                  disabled={useSystemTheme}
                >
                  <Moon size={18} /> Dark
                </button>
              </div>

              <div className="system-sync-row">
                <div className="sync-info">
                  <Monitor size={18} />
                  <div>
                    <span>Sync with system</span>
                    <p>Automatically switch themes based on your system settings.</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={useSystemTheme}
                    onChange={(e) => setUseSystemTheme(e.target.checked)} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-card active">
              <div className="card-header">
                <Bell size={20} className="section-icon" />
                <div className="section-meta">
                  <h3>Notifications</h3>
                  <p>Manage how you receive alerts and updates.</p>
                </div>
              </div>
              <div className="system-sync-row">
                <div className="sync-info">
                  <Bell size={18} />
                  <div>
                    <span>Email Notifications</span>
                    <p>Receive updates regarding assets and operations via email.</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
              <br />
              <div className="system-sync-row">
                <div className="sync-info">
                  <Monitor size={18} />
                  <div>
                    <span>In-App Alerts</span>
                    <p>Show push notifications inside the dashboard.</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Nav */}
        <div className="settings-sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => handleTabClick('appearance')}
          >
            <Palette size={18} />
            <span>Appearance</span>
          </div>
          <div 
            className="nav-item"
            onClick={() => handleTabClick('personal')}
          >
            <User size={18} />
            <span>Personal Info</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => handleTabClick('notifications')}
          >
            <Bell size={18} />
            <span>Notifications</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
