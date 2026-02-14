import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Items from './components/Items';
import Sales from './components/Sales';
import Reports from './components/Reports';
import Toast from './components/Toast';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard showToast={showToast} />;
      case 'items':
        return <Items showToast={showToast} />;
      case 'sales':
        return <Sales showToast={showToast} />;
      case 'reports':
        return <Reports showToast={showToast} />;
      default:
        return <Dashboard showToast={showToast} />;
    }
  };

  return (
    <div className="app">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default App;
