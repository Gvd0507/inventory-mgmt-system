import React, { useState, useEffect } from 'react';
import { itemsAPI, purchasesAPI, formatCurrency } from '../api';
import { exportItemsToCSV } from '../utils/exportData';
import Icon from './Icon';

function Items({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [restockingItem, setRestockingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    totalCost: '',
    quantity: '',
    sku: '',
    reorderPoint: '10',
    preferredSupplier: '',
  });
  const [restockForm, setRestockForm] = useState({
    quantity: '',
    costPerUnit: '',
    supplier: '',
    notes: '',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await itemsAPI.getAll();
      setItems(response.data || []);
    } catch (error) {
      showToast('Failed to load items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price || !formData.quantity || !formData.sku || !formData.preferredSupplier) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    if (!formData.totalCost || parseFloat(formData.totalCost) <= 0) {
      showToast('Total Cost must be greater than 0', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        totalCost: parseFloat(formData.totalCost) || 0,
        quantity: parseInt(formData.quantity) || 0,
        reorderPoint: parseInt(formData.reorderPoint) || 0,
      };
      if (editingItem) {
        await itemsAPI.update(editingItem._id, payload);
        showToast('Item updated successfully', 'success');
      } else {
        await itemsAPI.create(payload);
        showToast('Item created successfully', 'success');
      }
      
      resetForm();
      loadItems();
    } catch (error) {
      showToast(error.message || 'Failed to save item', 'error');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      totalCost: item.costPrice > 0 && item.quantity > 0 ? (item.costPrice * item.quantity).toFixed(2) : '',
      quantity: item.quantity,
      sku: item.sku,
      reorderPoint: item.reorderPoint || 2,
      preferredSupplier: item.preferredSupplier || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, itemName) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await itemsAPI.delete(id);
      showToast('Item deleted successfully', 'success');
      loadItems();
    } catch (error) {
      showToast('Failed to delete item', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      totalCost: '',
      quantity: '',
      sku: '',
      reorderPoint: '2',
      preferredSupplier: '',
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleRestockClick = (item) => {
    setRestockingItem(item);
    setRestockForm({
      quantity: '',
      totalCost: '',
      supplier: item.preferredSupplier || '',
      notes: '',
    });
  };

  const handleRestockInputChange = (e) => {
    const { name, value } = e.target;
    setRestockForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    
    if (!restockForm.quantity || !restockForm.totalCost || !restockForm.supplier) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      await purchasesAPI.create({
        itemId: restockingItem._id,
        quantityPurchased: parseInt(restockForm.quantity),
        totalCost: parseFloat(restockForm.totalCost),
        supplier: restockForm.supplier,
        notes: restockForm.notes,
      });
      
      showToast(`Restocked ${restockForm.quantity} units of ${restockingItem.name}`, 'success');
      setRestockingItem(null);
      setRestockForm({ quantity: '', totalCost: '', supplier: '', notes: '' });
      loadItems();
    } catch (error) {
      showToast(error.message || 'Failed to restock item', 'error');
    }
  };

  const closeRestockModal = () => {
    setRestockingItem(null);
    setRestockForm({ quantity: '', totalCost: '', supplier: '', notes: '' });
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header">
        <h1 className="section-title">Items Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!showForm && !editingItem && (
            <button 
              className="btn btn-outline-action" 
              onClick={() => setShowForm(true)}
            >
              <Icon name="plus" size={16} /> Add Item
            </button>
          )}
          <button 
            className="btn btn-outline-export" 
            onClick={() => {
              exportItemsToCSV(items);
              showToast('Items exported successfully!', 'success');
            }}
            disabled={items.length === 0}
          >
            <Icon name="download" size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Add/Edit Form - Collapsible */}
      {(showForm || editingItem) && (
        <div className="form-card" style={{ animation: 'slideDown 0.3s ease-out' }}>
          <h3 className="form-title">
            {editingItem ? <><Icon name="edit" size={20} /> Edit Item</> : <><Icon name="plus" size={20} /> Add New Item</>}
          </h3>
          <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Wireless Mouse"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Electronics"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Selling Price per Unit (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="form-input"
                placeholder="99"
                step="1"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Cost (₹) *</label>
              <input
                type="number"
                name="totalCost"
                value={formData.totalCost}
                onChange={handleInputChange}
                className="form-input"
                placeholder="700"
                step="1"
                min="0"
                required
              />
              <small>Total amount paid for all units</small>
              {formData.totalCost && formData.quantity && Number(formData.quantity) > 0 && (
                <small style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Cost per unit: ₹{(parseFloat(formData.totalCost) / parseInt(formData.quantity)).toFixed(2)}
                </small>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="form-input"
                placeholder="100"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="form-input"
                placeholder="ELEC-MOUSE-001"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Reorder Point</label>
              <input
                type="number"
                name="reorderPoint"
                value={formData.reorderPoint}
                onChange={handleInputChange}
                className="form-input"
                placeholder="10"
                min="0"
              />
              <small>Alert when stock falls below this quantity</small>
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Supplier *</label>
              <input
                type="text"
                name="preferredSupplier"
                value={formData.preferredSupplier}
                onChange={handleInputChange}
                className="form-input"
                placeholder="ABC Suppliers"
                required
              />
              <small>Vendor to contact for restocking</small>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Enter item description..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search items by name, category, or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Icon name="package" size={48} /></div>
          <h3 className="empty-state-title">
            {searchTerm ? 'No items found' : 'No items yet'}
          </h3>
          <p className="empty-state-text">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Click "Add Item" button to get started'}
          </p>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <div key={item._id} className="item-card fade-in">
              <div className="item-card-header">
                <div>
                  <h3 className="item-card-name">{item.name}</h3>
                  <p className="item-card-category">{item.category}</p>
                </div>
                <span className={`badge ${item.quantity < (item.reorderPoint || 10) ? 'badge-warning' : 'badge-success'}`}>
                  {item.quantity} in stock
                </span>
              </div>

              <div className="item-card-body">
                {item.description && (
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    {item.description}
                  </p>
                )}
                <div className="item-card-detail">
                  <span className="item-card-label">Selling Price</span>
                  <span className="item-card-value">{formatCurrency(item.price)}</span>
                </div>
                <div className="item-card-detail">
                  <span className="item-card-label">SKU</span>
                  <span className="item-card-value">{item.sku}</span>
                </div>
                <div className="item-card-detail">
                  <span className="item-card-label">Stock Value</span>
                  <span className="item-card-value">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
                <div className="item-card-detail">
                  <span className="item-card-label">Reorder Point</span>
                  <span className="item-card-value">{item.reorderPoint || 10} units</span>
                </div>
                {item.preferredSupplier && (
                  <div className="item-card-detail">
                    <span className="item-card-label">Supplier</span>
                    <span className="item-card-value">{item.preferredSupplier}</span>
                  </div>
                )}
              </div>

              <div className="item-card-actions">
                <button onClick={() => handleRestockClick(item)} className="btn btn-success" style={{ flex: 1 }}>
                  <Icon name="shopping-cart" size={16} /> Restock
                </button>
                <button onClick={() => handleEdit(item)} className="btn btn-primary">
                  <Icon name="edit" size={16} /> Edit
                </button>
                <button onClick={() => handleDelete(item._id, item.name)} className="btn btn-danger">
                  <Icon name="trash" size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restock Modal */}
      {restockingItem && (
        <div className="modal-overlay" onClick={closeRestockModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Icon name="shopping-cart" size={24} /> Restock Item</h2>
              <button className="modal-close" onClick={closeRestockModal}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{restockingItem.name}</h3>
                <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Current Stock: <strong>{restockingItem.quantity} units</strong>
                </p>
                {restockingItem.costPrice > 0 && (
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Last Cost: <strong>{formatCurrency(restockingItem.costPrice)}</strong> per unit
                  </p>
                )}
              </div>
              
              <form onSubmit={handleRestockSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity to Add *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={restockForm.quantity}
                      onChange={handleRestockInputChange}
                      className="form-input"
                      placeholder="50"
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Cost (₹) *</label>
                    <input
                      type="number"
                      name="totalCost"
                      value={restockForm.totalCost}
                      onChange={handleRestockInputChange}
                      className="form-input"
                      placeholder="1250"
                      step="0.01"
                      min="0"
                      required
                    />
                    <small>Total amount paid for all units</small>
                    {restockForm.totalCost && restockForm.quantity && Number(restockForm.quantity) > 0 && (
                      <small style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Cost per unit: ₹{(parseFloat(restockForm.totalCost) / parseInt(restockForm.quantity)).toFixed(2)}
                      </small>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Supplier *</label>
                  <input
                    type="text"
                    name="supplier"
                    value={restockForm.supplier}
                    onChange={handleRestockInputChange}
                    className="form-input"
                    placeholder="ABC Wholesalers"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={restockForm.notes}
                    onChange={handleRestockInputChange}
                    className="form-textarea"
                    placeholder="Purchase order number, delivery date, etc."
                    rows="3"
                  />
                </div>
                
                {restockForm.quantity && restockForm.totalCost && (
                  <div style={{
                    background: 'var(--primary-light)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginTop: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: '600' }}>Cost Per Unit:</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {formatCurrency(restockForm.totalCost / restockForm.quantity)}
                    </span>
                  </div>
                )}
                
                <div className="form-actions" style={{ marginTop: '24px' }}>
                  <button type="button" onClick={closeRestockModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Confirm Restock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Items;
