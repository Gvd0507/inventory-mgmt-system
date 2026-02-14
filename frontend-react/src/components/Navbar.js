import React from 'react';

function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'items', name: 'Items', icon: '📦' },
    { id: 'sales', name: 'Sales', icon: '💰' },
    { id: 'reports', name: 'Reports', icon: '📈' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-brand">
          <div className="navbar-brand-icon">📦</div>
          <span>Inventory Pro</span>
        </a>
        <div className="navbar-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
