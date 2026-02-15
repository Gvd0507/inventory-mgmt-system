import React, { useState, useEffect } from 'react';
import { itemsAPI, formatCurrency } from '../api';
import { exportItemsToCSV } from '../utils/exportData';

function Items({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    sku: '',
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
    
    if (!formData.name || !formData.category || !formData.price || !formData.quantity || !formData.sku) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      if (editingItem) {
        await itemsAPI.update(editingItem._id, formData);
        showToast('Item updated successfully', 'success');
      } else {
        await itemsAPI.create(formData);
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
      quantity: item.quantity,
      sku: item.sku,
    });
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
      quantity: '',
      sku: '',
    });
    setEditingItem(null);
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
        <button 
          className="btn btn-success" 
          onClick={() => {
            exportItemsToCSV(items);
            showToast('Items exported successfully!', 'success');
          }}
          disabled={items.length === 0}
        >
          📥 Export CSV
        </button>
      </div>

      {/* Add/Edit Form */}
      <div className="form-card">
        <h3 className="form-title">
          {editingItem ? '✏️ Edit Item' : '➕ Add New Item'}
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
              <label className="form-label">Price (₹) *</label>
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
            {editingItem && (
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>

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
          <div className="empty-state-icon">📦</div>
          <h3 className="empty-state-title">
            {searchTerm ? 'No items found' : 'No items yet'}
          </h3>
          <p className="empty-state-text">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Add your first item using the form above'}
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
                <span className={`badge ${item.quantity < 10 ? 'badge-warning' : 'badge-success'}`}>
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
                  <span className="item-card-label">Price</span>
                  <span className="item-card-value">{formatCurrency(item.price)}</span>
                </div>
                <div className="item-card-detail">
                  <span className="item-card-label">SKU</span>
                  <span className="item-card-value">{item.sku}</span>
                </div>
                <div className="item-card-detail">
                  <span className="item-card-label">Total Value</span>
                  <span className="item-card-value">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>

              <div className="item-card-actions">
                <button onClick={() => handleEdit(item)} className="btn btn-primary">
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(item._id, item.name)} className="btn btn-danger">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Items;
