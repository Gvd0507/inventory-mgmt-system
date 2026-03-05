import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import Icon from './Icon';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: 'dashboard', path: '/', name: 'Dashboard', icon: 'dashboard' },
    { id: 'items', path: '/items', name: 'Items', icon: 'package' },
    { id: 'sales', path: '/sales', name: 'Sales', icon: 'dollar-sign' },
    { id: 'reports', path: '/reports', name: 'Reports', icon: 'trending-up' },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <Icon name="package" size={24} />
          </div>
          <span>Inventory Pro</span>
        </NavLink>
        <div className="navbar-tabs">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
              end={tab.path === '/'}
            >
              <Icon name={tab.icon} size={18} />
              <span>{tab.name}</span>
            </NavLink>
          ))}
        </div>
        <div className="navbar-user">
          <NotificationCenter />
          <div className="user-info">
            <User size={18} />
            <span className="user-name">{user?.username}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
