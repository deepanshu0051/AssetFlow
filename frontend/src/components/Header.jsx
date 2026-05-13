import React, { useState, useRef, useEffect } from 'react';
import { Search, User, LogOut, Settings as SettingsIcon, User as UserIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import './Header.css';


const Header = ({ title }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const { searchTerm, updateSearchTerm } = useSearch();
  const navigate = useNavigate();

  const userMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    updateSearchTerm('');
    const redirectPath = user?.role === 'superadmin' ? '/superadmin/login' : '/admin/login';
    logout();
    navigate(redirectPath);
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <div className="header-title-container">
          <h2 className="header-title">
            {title}
          </h2>
        </div>
      </div>
      
      <div className="header-center">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="header-search" 
            value={searchTerm}
            onChange={(e) => updateSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="header-right">
        <div className="header-actions">
          <NotificationBell />
          <ThemeToggle />
          
          <div className="dropdown-wrapper" ref={userMenuRef}>
            <div 
              className={`header-user ${showUserMenu ? 'active' : ''}`}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User size={20} />
            </div>

            {showUserMenu && (
              <div className="dropdown-menu user-dropdown">
                <div className="dropdown-header user-info-header">
                  <p className="user-name">{user?.name || 'User'}</p>
                  <p className="user-email">{user?.email || ''}</p>
                </div>
                <div className="dropdown-content">
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <UserIcon size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <SettingsIcon size={16} />
                    <span>Settings</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
