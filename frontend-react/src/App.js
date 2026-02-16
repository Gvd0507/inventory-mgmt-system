import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Items from './components/Items';
import Sales from './components/Sales';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Login from './components/Login';
import Toast from './components/Toast';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Main App Layout Component
function AppLayout() {
  const [toast, setToast] = useState(null);
  const { isAuthenticated } = useAuth();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard showToast={showToast} />} />
          <Route path="/items" element={<Items showToast={showToast} />} />
          <Route path="/sales" element={<Sales showToast={showToast} />} />
          <Route path="/reports" element={<Reports showToast={showToast} />} />
          <Route path="/settings" element={<Settings showToast={showToast} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
