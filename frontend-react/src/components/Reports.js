import React, { useEffect, useState } from 'react';
import { itemsAPI, salesAPI, formatCurrency } from '../api';

function Reports({ showToast }) {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [itemsData, salesData] = await Promise.all([
        itemsAPI.getAll(),
        salesAPI.getAll(),
      ]);
      setItems(itemsData.data || []);
      setSales(salesData.data || []);
    } catch (error) {
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate low stock items
  const lowStockItems = items.filter((item) => item.quantity < 10);

  // Calculate sales summary
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  // Calculate top selling items
  const itemSales = {};
  sales.forEach((sale) => {
    if (!itemSales[sale.itemName]) {
      itemSales[sale.itemName] = {
        name: sale.itemName,
        quantity: 0,
        revenue: 0,
      };
    }
    itemSales[sale.itemName].quantity += sale.quantitySold;
    itemSales[sale.itemName].revenue += sale.totalAmount;
  });
  const topItems = Object.values(itemSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Calculate category breakdown
  const categories = {};
  items.forEach((item) => {
    const category = item.category || 'Uncategorized';
    if (!categories[category]) {
      categories[category] = {
        count: 0,
        value: 0,
        quantity: 0,
      };
    }
    categories[category].count++;
    categories[category].value += item.price * item.quantity;
    categories[category].quantity += item.quantity;
  });

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header">
        <h1 className="section-title">Reports & Analytics</h1>
        <button className="btn btn-primary" onClick={loadReports}>
          🔄 Refresh
        </button>
      </div>

      <div className="reports-grid">
        {/* Low Stock Alert */}
        <div className="report-card">
          <h3 className="report-card-title">
            ⚠️ Low Stock Alert
          </h3>
          {lowStockItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <p>All items have sufficient stock!</p>
            </div>
          ) : (
            <div>
              {lowStockItems.map((item) => (
                <div key={item._id} className="report-item">
                  <div className="report-item-header">
                    <span className="report-item-name">{item.name}</span>
                    <span className={`badge ${item.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                      {item.quantity} left
                    </span>
                  </div>
                  <p className="report-item-detail">
                    {item.category} • SKU: {item.sku}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales Summary */}
        <div className="report-card">
          <h3 className="report-card-title">
            📊 Sales Summary
          </h3>
          {sales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
              <p>No sales recorded yet</p>
            </div>
          ) : (
            <div>
              <div className="report-item">
                <div className="report-item-header">
                  <span className="report-item-name">Total Revenue</span>
                  <span className="report-item-name" style={{ color: 'var(--color-success)' }}>
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>
              </div>
              <div className="report-item">
                <div className="report-item-header">
                  <span className="report-item-name">Total Orders</span>
                  <span className="report-item-name">{sales.length}</span>
                </div>
              </div>
              <div className="report-item">
                <div className="report-item-header">
                  <span className="report-item-name">Items Sold</span>
                  <span className="report-item-name">{totalItemsSold}</span>
                </div>
              </div>
              <div className="report-item">
                <div className="report-item-header">
                  <span className="report-item-name">Avg. Order Value</span>
                  <span className="report-item-name" style={{ color: 'var(--color-primary)' }}>
                    {formatCurrency(avgOrderValue)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Selling Items */}
        <div className="report-card">
          <h3 className="report-card-title">
            🏆 Top Selling Items
          </h3>
          {topItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📈</div>
              <p>No sales data available</p>
            </div>
          ) : (
            <div>
              {topItems.map((item, index) => (
                <div key={item.name} className="report-item">
                  <div className="report-item-header">
                    <span className="report-item-name">
                      <span style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        color: 'white',
                        textAlign: 'center',
                        lineHeight: '24px',
                        fontSize: '12px',
                        fontWeight: '700',
                        marginRight: '8px',
                      }}>
                        {index + 1}
                      </span>
                      {item.name}
                    </span>
                  </div>
                  <p className="report-item-detail">
                    Sold: {item.quantity} units • Revenue: {formatCurrency(item.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="report-card">
          <h3 className="report-card-title">
            📁 Category Breakdown
          </h3>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
              <p>No items available</p>
            </div>
          ) : (
            <div>
              {Object.entries(categories).map(([category, data]) => (
                <div key={category} className="report-item">
                  <div className="report-item-header">
                    <span className="report-item-name">{category}</span>
                    <span className="badge badge-primary">{data.count} items</span>
                  </div>
                  <p className="report-item-detail">
                    Stock: {data.quantity} units • Value: {formatCurrency(data.value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
