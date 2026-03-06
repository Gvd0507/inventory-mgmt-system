import React, { useState, useEffect } from 'react';
import { Bell, X, AlertCircle } from 'lucide-react';

function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkLowStockItems();
    // Check every 5 minutes
    const interval = setInterval(checkLowStockItems, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkLowStockItems = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/items/low-stock`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.count > 0) {
        const lowStockNotifs = data.data.map(item => ({
          id: item._id,
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `${item.name} is running low (${item.quantity} left)`,
          timestamp: Date.now(),
          read: false
        }));

        setNotifications(lowStockNotifs);
        setUnreadCount(lowStockNotifs.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to check low stock:', error);
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    setIsOpen(false);
  };

  return (
    <div className="notification-center">
      <button 
        className="notification-bell" 
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="notification-actions">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="btn-text">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="btn-close">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <Bell size={40} />
                  <p>No notifications</p>
                  <small>You're all caught up!</small>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="notification-icon">
                      <AlertCircle size={20} />
                    </div>
                    <div className="notification-content">
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <small>{new Date(notif.timestamp).toLocaleString()}</small>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notification-footer">
                <button onClick={clearAll} className="btn-clear">
                  Clear All
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationCenter;
