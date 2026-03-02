import React, { useState, useEffect } from 'react';
import { itemsAPI, salesAPI, formatCurrency, formatDate } from '../api';
import { exportSalesToCSV } from '../utils/exportData';

function Sales({ showToast }) {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    itemId: '',
    quantitySold: '',
  });
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsRes, salesRes] = await Promise.all([
        itemsAPI.getAll(),
        salesAPI.getAll(),
      ]);
      setItems(itemsRes.data || []);
      setSales(salesRes.data || []);
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (e) => {
    const itemId = e.target.value;
    setFormData({ ...formData, itemId });
    const item = items.find((i) => i._id === itemId);
    setSelectedItem(item || null);
  };

  const handleQuantityChange = (e) => {
    setFormData({ ...formData, quantitySold: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemId || !formData.quantitySold) {
      showToast('Please select an item and enter quantity', 'error');
      return;
    }

    const quantity = parseInt(formData.quantitySold);
    if (quantity < 1) {
      showToast('Quantity must be at least 1', 'error');
      return;
    }

    if (selectedItem && quantity > selectedItem.quantity) {
      showToast('Insufficient stock available', 'error');
      return;
    }

    try {
      await salesAPI.create({
        itemId: formData.itemId,
        quantitySold: quantity,
      });
      
      showToast('Sale recorded successfully!', 'success');
      setFormData({ itemId: '', quantitySold: '' });
      setSelectedItem(null);
      loadData();
    } catch (error) {
      showToast(error.message || 'Failed to record sale', 'error');
    }
  };

  const calculateTotal = () => {
    if (!selectedItem || !formData.quantitySold) return 0;
    return selectedItem.price * parseInt(formData.quantitySold);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header">
        <h1 className="section-title">Sales</h1>
        <button 
          className="btn btn-outline-export" 
          onClick={() => {
            exportSalesToCSV(sales);
            showToast('Sales exported successfully!', 'success');
          }}
          disabled={sales.length === 0}
        >
          📥 Export CSV
        </button>
      </div>

      {/* Record Sale Form */}
      <div className="form-card">
        <h3 className="form-title">💰 Record New Sale</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Select Item *</label>
              <select
                name="itemId"
                value={formData.itemId}
                onChange={handleItemChange}
                className="form-select"
                required
              >
                <option value="">-- Choose an item --</option>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} ({item.quantity} available) - {formatCurrency(item.price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                name="quantitySold"
                value={formData.quantitySold}
                onChange={handleQuantityChange}
                className="form-input"
                placeholder="Enter quantity"
                min="1"
                max={selectedItem?.quantity || 999}
                required
              />
            </div>
          </div>

          {selectedItem && formData.quantitySold && (
            <div className="sale-preview">
              <div className="sale-preview-row">
                <span className="sale-preview-label">Item</span>
                <span className="sale-preview-value">{selectedItem.name}</span>
              </div>
              <div className="sale-preview-row">
                <span className="sale-preview-label">Quantity</span>
                <span className="sale-preview-value">{formData.quantitySold}</span>
              </div>
              <div className="sale-preview-row">
                <span className="sale-preview-label">Stock after sale</span>
                <span className="sale-preview-value">
                  {selectedItem.quantity - parseInt(formData.quantitySold)}
                </span>
              </div>
              <div className="sale-preview-row sale-preview-total">
                <span className="sale-preview-label">Total Amount</span>
                <span className="sale-preview-value">{formatCurrency(calculateTotal())}</span>
              </div>

              {parseInt(formData.quantitySold) > selectedItem.quantity && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(255, 59, 48, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-danger)',
                  fontSize: '14px',
                  fontWeight: '500',
                }}>
                  ⚠️ Insufficient stock! Only {selectedItem.quantity} available.
                </div>
              )}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => {
                setFormData({ itemId: '', quantitySold: '' });
                setSelectedItem(null);
              }}
              className="btn btn-secondary"
            >
              Clear
            </button>
            <button type="submit" className="btn btn-success">
              Record Sale
            </button>
          </div>
        </form>
      </div>

      {/* Sales History */}
      <div className="card">
        <h3 className="form-title">📜 Recent Sales</h3>
        {sales.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <h3 className="empty-state-title">No sales yet</h3>
            <p className="empty-state-text">Record your first sale using the form above</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td>{formatDate(sale.saleDate)}</td>
                    <td>
                      <strong>{sale.itemName}</strong>
                    </td>
                    <td>{sale.quantitySold}</td>
                    <td>
                      <strong style={{ color: 'var(--color-success)' }}>
                        {formatCurrency(sale.totalAmount)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sales;
