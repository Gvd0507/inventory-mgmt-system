import React, { useState, useEffect } from 'react';

function Settings({ showToast }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      showToast?.('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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
        showToast?.('Settings saved successfully', 'success');
      } else {
        showToast?.(data.message || 'Failed to save settings', 'error');
      }
    } catch (error) {
      showToast?.('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
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
        showToast?.('Settings reset to defaults', 'success');
      } else {
        showToast?.(data.message || 'Failed to reset settings', 'error');
      }
    } catch (error) {
      showToast?.('Failed to reset settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return <div className="container">Failed to load settings</div>;
  }

  return (
    <div className="container">
      <div className="section-header">
        <div>
          <h1 className="section-title">⚙️ Settings</h1>
          <p className="section-subtitle">Configure essential shop settings</p>
        </div>
        <div className="page-actions">
          <button onClick={handleReset} className="btn btn-secondary" disabled={saving}>
            🔄 Reset to Defaults
          </button>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
            💾 {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-section">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label>Business/Shop Name</label>
            <input
              type="text"
              value={settings.businessName || ''}
              onChange={(e) => handleChange('businessName', e.target.value)}
            />
            <small>The name of your shop or business</small>
          </div>
        </div>

        <div className="settings-section">
          <h2>Currency</h2>
          <div className="form-group">
            <label>Currency Symbol</label>
            <select
              value={settings.currency || '₹'}
              onChange={(e) => handleChange('currency', e.target.value)}
            >
              <option value="₹">₹ (Rupee)</option>
              <option value="$">$ (Dollar)</option>
              <option value="€">€ (Euro)</option>
              <option value="£">£ (Pound)</option>
              <option value="¥">¥ (Yen)</option>
            </select>
            <small>Currency used for pricing</small>
          </div>
        </div>

        <div className="settings-section">
          <h2>Inventory Alerts</h2>
          <div className="form-group">
            <label>Low Stock Threshold</label>
            <input
              type="number"
              value={settings.lowStockThreshold || 10}
              onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
              min="1"
            />
            <small>Get notified when item quantity falls below this number</small>
          </div>
        </div>

        <div className="settings-section">
          <h2>Tax & Pricing</h2>
          <div className="form-group">
            <label>Tax/GST Percentage (%)</label>
            <input
              type="number"
              value={settings.taxPercentage || 18}
              onChange={(e) => handleChange('taxPercentage', parseFloat(e.target.value))}
              min="0"
              max="100"
              step="0.1"
            />
            <small>Tax percentage applied on sales (e.g., 18 for GST)</small>
          </div>
        </div>

        <div className="settings-section">
          <h2>Contact Information</h2>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={settings.phoneNumber || ''}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="+91 98765 43210"
            />
            <small>Contact number for receipts and customer communication</small>
          </div>
        </div>

        <div className="settings-section">
          <h2>Receipt Customization</h2>
          <div className="form-group">
            <label>Receipt Footer Text</label>
            <textarea
              value={settings.receiptFooter || ''}
              onChange={(e) => handleChange('receiptFooter', e.target.value)}
              placeholder="Thank you for your business!\nVisit again!"
              rows="3"
            />
            <small>Message shown at bottom of receipts (address, thank you note, etc.)</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
