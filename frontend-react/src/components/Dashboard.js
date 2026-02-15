import React, { useEffect, useState } from 'react';
import { itemsAPI, salesAPI, formatCurrency } from '../api';
import Charts from './Charts';

function Dashboard({ showToast }) {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalStock: 0,
    totalValue: 0,
    totalSales: 0,
    totalRevenue: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [itemsData, salesData] = await Promise.all([
        itemsAPI.getAll(),
        salesAPI.getAll(),
      ]);

      const items = itemsData.data || [];
      const sales = salesData.data || [];

      const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const lowStockCount = items.filter((item) => item.quantity < 10).length;

      setStats({
        totalItems: items.length,
        totalStock,
        totalValue,
        totalSales: sales.length,
        totalRevenue,
        lowStockCount,
      });
    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header">
        <h1 className="section-title">Dashboard Overview</h1>
        <button className="btn btn-primary" onClick={loadDashboard}>
          🔄 Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">📦</div>
          <div className="stat-info">
            <h3>{stats.totalItems}</h3>
            <p>Total Items</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">📊</div>
          <div className="stat-info">
            <h3>{stats.totalStock}</h3>
            <p>Total Stock</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">💵</div>
          <div className="stat-info">
            <h3>{formatCurrency(stats.totalValue)}</h3>
            <p>Inventory Value</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">💰</div>
          <div className="stat-info">
            <h3>{stats.totalSales}</h3>
            <p>Total Sales</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Quick Insights</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div
            style={{
              padding: '1rem',
              background: 'var(--light-gray)',
              borderRadius: '8px',
            }}
          >
            <strong style={{ color: 'var(--primary)' }}>Total Revenue:</strong>{' '}
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div
            style={{
              padding: '1rem',
              background: 'var(--light-gray)',
              borderRadius: '8px',
            }}
          >
            <strong style={{ color: 'var(--warning)' }}>Low Stock Items:</strong>{' '}
            {stats.lowStockCount}{' '}
            {stats.lowStockCount > 0 && '⚠️'}
          </div>
          <div
            style={{
              padding: '1rem',
              background: 'var(--light-gray)',
              borderRadius: '8px',
            }}
          >
            <strong style={{ color: 'var(--secondary)' }}>Avg. Sale Value:</strong>{' '}
            {formatCurrency(stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0)}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <Charts showToast={showToast} />
    </div>
  );
}

export default Dashboard;
