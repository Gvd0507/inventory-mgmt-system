import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI, salesAPI, formatCurrency } from '../api';
import Charts from './Charts';
import Icon from './Icon';

function Dashboard({ showToast }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalItems: 0,
    totalStock: 0,
    totalValue: 0,
    totalSales: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    lowStockItems: [],
  });
  const [loading, setLoading] = useState(true);
  const [showLowStockBanner, setShowLowStockBanner] = useState(true);

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

      const totalStock = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      const totalValue = items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0);
      const totalRevenue = sales.reduce((sum, sale) => sum + (Number(sale.totalAmount) || 0), 0);
      // Use per-item reorderPoint instead of global threshold
      const lowStockItems = items.filter((item) => Number(item.quantity) < (Number(item.reorderPoint) || 10));
      const lowStockCount = lowStockItems.length;

      setStats({
        totalItems: items.length,
        totalStock,
        totalValue,
        totalSales: sales.length,
        totalRevenue,
        lowStockCount,
        lowStockItems,
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
        <button className="btn btn-outline-action" onClick={loadDashboard}>
          <Icon name="refresh" size={16} /> Refresh
        </button>
      </div>

      {/* Low Stock Alert Banner */}
      {showLowStockBanner && stats.lowStockCount > 0 && (
        <div className="alert-banner warning">
          <div className="alert-banner-content">
            <span className="alert-icon">
              <Icon name="alert-triangle" size={20} />
            </span>
            <div className="alert-text">
              <strong>{stats.lowStockCount} item{stats.lowStockCount > 1 ? 's' : ''}</strong> running low on stock!
              <div className="low-stock-items-preview">
                {stats.lowStockItems.slice(0, 3).map(item => (
                  <span key={item._id} className="low-stock-badge">
                    {item.name} ({item.quantity} left)
                  </span>
                ))}
                {stats.lowStockCount > 3 && <span className="more-items">+{stats.lowStockCount - 3} more</span>}
              </div>
            </div>
            <div className="alert-actions">
              <button className="btn-alert-action" onClick={() => navigate('/items')}>
                Restock Now
              </button>
              <button className="btn-alert-close" onClick={() => setShowLowStockBanner(false)}>
                <Icon name="x" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><Icon name="package" size={28} /></div>
          <div className="stat-info">
            <h3>{stats.totalItems}</h3>
            <p>Total Items</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success"><Icon name="bar-chart" size={28} /></div>
          <div className="stat-info">
            <h3>{stats.totalStock}</h3>
            <p>Total Stock</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning"><Icon name="dollar-sign" size={28} /></div>
          <div className="stat-info">
            <h3>{formatCurrency(stats.totalValue)}</h3>
            <p>Inventory Value</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger"><Icon name="dollar-sign" size={28} /></div>
          <div className="stat-info">
            <h3>{stats.totalSales}</h3>
            <p>Total Sales</p>
          </div>
        </div>
      </div>

      <div className="insights-card">
        <h3 className="insights-title">Quick Insights</h3>
        <div className="insights-grid">
          <div className="insight-item">
            <div className="insight-icon primary"><Icon name="dollar-sign" size={24} /></div>
            <div className="insight-content">
              <span className="insight-label">Total Revenue</span>
              <span className="insight-value">{formatCurrency(stats.totalRevenue)}</span>
            </div>
          </div>
          <div className="insight-item">
            <div className="insight-icon warning"><Icon name="alert-triangle" size={24} /></div>
            <div className="insight-content">
              <span className="insight-label">Low Stock Items</span>
              <span className="insight-value">
                {stats.lowStockCount} {stats.lowStockCount > 0 ? 'items' : ''}
              </span>
            </div>
          </div>
          <div className="insight-item">
            <div className="insight-icon info"><Icon name="trending-up" size={24} /></div>
            <div className="insight-content">
              <span className="insight-label">Avg. Sale Value</span>
              <span className="insight-value">
                {formatCurrency(stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <Charts showToast={showToast} />
    </div>
  );
}

export default Dashboard;
