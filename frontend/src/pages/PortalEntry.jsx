import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './PortalEntry.css';

const PortalEntry = () => {
  const navigate = useNavigate();

  return (
    <div className="portal-container">
      <div className="auth-theme-wrapper">
        <ThemeToggle />
      </div>
      <div className="portal-glass-bg"></div>
      
      <div className="portal-content">
        <h1 className="portal-title">Asset<span>Flow</span></h1>
        <p className="portal-subtitle">Choose your access gateway</p>
        
        <div className="portal-options">
          <div 
            className="portal-circle super-admin"
            onClick={() => navigate('/super-admin-auth')}
          >
            <div className="circle-inner">
              <i className="fas fa-user-shield"></i>
              <span>Super Admin</span>
            </div>
            <div className="circle-glow"></div>
          </div>

          <div 
            className="portal-circle admin"
            onClick={() => navigate('/login')}
          >
            <div className="circle-inner">
              <i className="fas fa-user-tie"></i>
              <span>Admin</span>
            </div>
            <div className="circle-glow"></div>
          </div>
        </div>
        
        <footer className="portal-footer">
          &copy; 2026 AssetFlow Secure Systems
        </footer>
      </div>
    </div>
  );
};

export default PortalEntry;
