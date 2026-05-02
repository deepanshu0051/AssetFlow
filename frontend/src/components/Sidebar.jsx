import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  User,
  Cpu, 
  Package, 
  MapPin, 
  Wrench, 
  TrendingUp, 
  Receipt,
  PlusCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { clearSearchTerm } = useSearch();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSearchTerm();
    const redirectPath = user?.role === 'superadmin' ? '/superadmin/login' : '/admin/login';
    logout();
    navigate(redirectPath);
  };
  const menuGroups = [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: user?.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard' },
        { name: 'Profile', icon: User, path: '/profile' },
      ]
    },
    {
      title: 'Asset Management',
      items: [
        { name: 'Machines', icon: Cpu, path: '/machines' },
        { name: 'Add Machine', icon: PlusCircle, path: '/machines/add' },
      ]
    },
    {
      title: 'Finance',
      items: [
        { name: 'GST Record', icon: Receipt, path: '/gst' },
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">AF</div>
        <span className="logo-text">AssetFlow</span>
      </div>
      
      <nav className="sidebar-nav">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="nav-group">
            <h3 className="nav-group-title">{group.title}</h3>
            <ul>
              {group.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <NavLink 
                    to={item.path} 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="nav-icon" size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-link settings-nav-link ${isActive ? 'active' : ''}`}>
          <Settings className="nav-icon" size={18} />
          <span>Settings</span>
        </NavLink>
        
        <div className="user-profile">
          <div className="avatar">{user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || 'User'}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
