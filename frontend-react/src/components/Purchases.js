import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Purchases({ showToast }) {
  const { token } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    itemId: '',
    supplier: '',
    quantityPurchased: '',
    costPerUnit: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadPurchases(),
        loadItems(),
        loadSuppliers(),
        loadStats()
      ]);
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPurchases = async () => {
    const response = await fetch('http://localhost:5000/api/purchases', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success) {
      setPurchases(data.purchases);
    }
  };

  const loadItems = async () => {
    const response = await fetch('http://localhost:5000/api/items');
    const data = await response.json();
    setItems(data.items || []);
  };

  const loadSuppliers = async () => {
    const response = await fetch('http://localhost:5000/api/purchases/suppliers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success) {
      setSuppliers(data.suppliers);
    }
  };

  const loadStats = async () => {
    const response = await fetch('http://localhost:5000/api/purchases/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success) {
      setStats(data.stats);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemId || !formData.supplier || !formData.quantityPurchased || !formData.costPerUnit) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (parseInt(formData.quantityPurchased) < 1) {
      showToast('Quantity must be at least 1', 'error');
      return;
    }

    if (parseFloat(formData.costPerUnit) < 0) {
      showToast('Cost cannot be negative', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: formData.itemId,
          supplier: formData.supplier.trim(),
          quantityPurchased: parseInt(formData.quantityPurchased),
          costPerUnit: parseFloat(formData.costPerUnit),
          notes: formData.notes
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast(`Purchase recorded! New stock: ${data.newStock}`, 'success');
        setFormData({ itemId: '', supplier: '', quantityPurchased: '', costPerUnit: '', notes: '' });
        setShowForm(false);
        loadData();
      } else {
        showToast(data.error || 'Failed to record purchase', 'error');
      }
    } catch (error) {
      showToast('Failed to record purchase', 'error');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header">
        <div>
          <h1 className="section-title">📦 Purchases & Restocking</h1>
          <p className="section-subtitle">Record inventory purchases from suppliers</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary"
        >
          ➕ {showForm ? 'Cancel' : 'Record Purchase'}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon primary">💰</div>
            <div className="stat-info">
              <h3>{formatCurrency(stats.totalSpent || 0)}</h3>
              <p>Total Spent</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">📦</div>
            <div className="stat-info">
              <h3>{stats.totalQuantity || 0}</h3>
              <p>Total Quantity</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning">👥</div>
            <div className="stat-info">
              <h3>{suppliers.length}</h3>
              <p>Suppliers</p>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Form */}
      {showForm && (
        <div className="form-card">
          <h3 className="form-title">📝 Record New Purchase</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Item *</label>
                <select
                  value={formData.itemId}
                  onChange={(e) => {
                    const selectedItem = items.find(i => i._id === e.target.value);
                    setFormData({
                      ...formData,
                      itemId: e.target.value,
                      supplier: selectedItem?.preferredSupplier || formData.supplier
                    });
                  }}
                  className="form-select"
                  required
                >
                  <option value="">Select item to restock</option>
                  {items.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.name} (Current: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Supplier *</label>
                <input
                  type="text"
                  list="suppliers-list"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="form-input"
                  placeholder="Enter supplier name"
                  required
                />
                <datalist id="suppliers-list">
                  {suppliers.map((supplier, idx) => (
                    <option key={idx} value={supplier} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity Purchased *</label>
                <input
                  type="number"
                  value={formData.quantityPurchased}
                  onChange={(e) => setFormData({ ...formData, quantityPurchased: e.target.value })}
                  className="form-input"
                  placeholder="How many units?"
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cost Per Unit *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                  className="form-input"
                  placeholder="Cost per item"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="form-textarea"
                placeholder="Delivery info, quality notes, etc."
                rows="3"
              />
            </div>
            
            {formData.quantityPurchased && formData.costPerUnit && (
              <div className="sale-preview">
                <div className="sale-preview-row">
                  <span className="sale-preview-label">Quantity</span>
                  <span className="sale-preview-value">{formData.quantityPurchased}</span>
                </div>
                <div className="sale-preview-row">
                  <span className="sale-preview-label">Cost Per Unit</span>
                  <span className="sale-preview-value">{formatCurrency(parseFloat(formData.costPerUnit))}</span>
                </div>
                <div className="sale-preview-row sale-preview-total">
                  <span className="sale-preview-label">Total Cost</span>
                  <span className="sale-preview-value">
                    {formatCurrency(
                      parseFloat(formData.quantityPurchased || 0) * parseFloat(formData.costPerUnit || 0)
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                ✅ Record Purchase
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Purchases Table */}
      <div className="card">
        <h3 className="form-title">📋 Purchase History</h3>
        {purchases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3 className="empty-state-title">No purchases recorded yet</h3>
            <p className="empty-state-text">Record your first purchase using the form above</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Supplier</th>
                  <th>Quantity</th>
                  <th>Cost/Unit</th>
                  <th>Total Cost</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(purchase => (
                  <tr key={purchase._id}>
                    <td>{formatDate(purchase.purchaseDate)}</td>
                    <td><strong>{purchase.itemName}</strong></td>
                    <td>{purchase.supplier}</td>
                    <td>{purchase.quantityPurchased}</td>
                    <td>{formatCurrency(purchase.costPerUnit)}</td>
                    <td><strong style={{ color: 'var(--color-danger)' }}>{formatCurrency(purchase.totalCost)}</strong></td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {purchase.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suppliers List */}
      {suppliers.length > 0 && (
        <div className="insights-card">
          <h3 className="insights-title">👥 Suppliers ({suppliers.length})</h3>
          <div className="suppliers-grid">
            {suppliers.map((supplier, idx) => (
              <div key={idx} className="supplier-card">
                <span className="supplier-icon">🏪</span>
                <span>{supplier}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Purchases;
