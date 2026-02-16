import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';

function Settings() {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) {
      showToast('Only admins can update settings', 'error');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.success) {
        showToast('Settings saved successfully', 'success');
      } else {
        showToast(data.message || 'Failed to save settings', 'error');
      }
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!isAdmin) {
      showToast('Only admins can reset settings', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to reset all settings to defaults?')) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/settings/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        showToast('Settings reset to defaults', 'success');
      } else {
        showToast(data.message || 'Failed to reset settings', 'error');
      }
    } catch (error) {
      showToast('Failed to reset settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!settings) {
    return <div className="page-container">Failed to load settings</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><SettingsIcon size={28} /> Settings</h1>
          <p>Configure application preferences and business information</p>
        </div>
        {isAdmin && (
          <div className="page-actions">
            <button onClick={handleReset} className="btn-secondary" disabled={saving}>
              <RotateCcw size={18} />
              Reset to Defaults
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>

      <div className="settings-container">
        <div className="settings-section">
          <h2>Business Information</h2>
          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              value={settings.businessName || ''}
              onChange={(e) => handleChange('businessName', e.target.value)}
              disabled={!isAdmin}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={settings.businessAddress || ''}
              onChange={(e) => handleChange('businessAddress', e.target.value)}
              disabled={!isAdmin}
              rows="3"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={settings.businessPhone || ''}
                onChange={(e) => handleChange('businessPhone', e.target.value)}
                disabled={!isAdmin}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={settings.businessEmail || ''}
                onChange={(e) => handleChange('businessEmail', e.target.value)}
                disabled={!isAdmin}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Currency Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Currency Symbol</label>
              <select
                value={settings.currency || '₹'}
                onChange={(e) => handleChange('currency', e.target.value)}
                disabled={!isAdmin}
              >
                <option value="₹">₹ (Rupee)</option>
                <option value="$">$ (Dollar)</option>
                <option value="€">€ (Euro)</option>
                <option value="£">£ (Pound)</option>
                <option value="¥">¥ (Yen)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Currency Code</label>
              <select
                value={settings.currencyCode || 'INR'}
                onChange={(e) => handleChange('currencyCode', e.target.value)}
                disabled={!isAdmin}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Alert Settings</h2>
          <div className="form-group">
            <label>Low Stock Threshold</label>
            <input
              type="number"
              value={settings.lowStockThreshold || 10}
              onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
              disabled={!isAdmin}
              min="1"
            />
            <small>Get alerts when item quantity falls below this number</small>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.enableEmailAlerts || false}
                onChange={(e) => handleChange('enableEmailAlerts', e.target.checked)}
                disabled={!isAdmin}
              />
              Enable Email Alerts
            </label>
          </div>
          {settings.enableEmailAlerts && (
            <div className="form-group">
              <label>Alert Email</label>
              <input
                type="email"
                value={settings.alertEmail || ''}
                onChange={(e) => handleChange('alertEmail', e.target.value)}
                disabled={!isAdmin}
                placeholder="alerts@example.com"
              />
            </div>
          )}
        </div>

        <div className="settings-section">
          <h2>Display  Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Items Per Page</label>
              <input
                type="number"
                value={settings.itemsPerPage || 20}
                onChange={(e) => handleChange('itemsPerPage', parseInt(e.target.value))}
                disabled={!isAdmin}
                min="10"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Date Format</label>
              <select
                value={settings.dateFormat || 'MM/DD/YYYY'}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                disabled={!isAdmin}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className="info-banner">
            <p>⚠️ Only administrators can modify settings</p>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Settings;
