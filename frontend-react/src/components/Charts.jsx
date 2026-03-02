import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { itemsAPI, salesAPI, formatCurrency } from '../api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Chart.js default options
ChartJS.defaults.font.family = '"Helvetica Neue", Helvetica, Arial, sans-serif';
ChartJS.defaults.color = '#6B7280';

function Charts({ showToast }) {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, salesData] = await Promise.all([
        itemsAPI.getAll(),
        salesAPI.getAll(),
      ]);
      setItems(itemsData.data || []);
      setSales(salesData.data || []);
    } catch (error) {
      showToast('Failed to load chart data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sales Trend Chart Data (Line Chart)
  const getSalesTrendData = () => {
    if (sales.length === 0) return null;

    // Group sales by date
    const salesByDate = {};
    sales.forEach((sale) => {
      const date = new Date(sale.saleDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      salesByDate[date] = (salesByDate[date] || 0) + sale.totalAmount;
    });

    // Get last 7 days or all dates if less
    const dates = Object.keys(salesByDate).slice(-7);
    const revenues = dates.map((date) => salesByDate[date]);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Revenue',
          data: revenues,
          borderColor: '#6B7280',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#6B7280',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  // Items by Category Chart Data (Bar Chart)
  const getCategoryData = () => {
    if (items.length === 0) return null;

    const categoryCounts = {};
    items.forEach((item) => {
      const category = item.category || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const categories = Object.keys(categoryCounts);
    const counts = Object.values(categoryCounts);

    // Generate colors for each category
    const colors = categories.map((_, index) => {
      const hue = (index * 360) / categories.length;
      return `hsl(${hue}, 70%, 60%)`;
    });

    return {
      labels: categories,
      datasets: [
        {
          label: 'Items',
          data: counts,
          backgroundColor: colors,
          borderRadius: 6,
          borderWidth: 0,
        },
      ],
    };
  };

  // Top Items by Value Chart Data (Doughnut Chart)
  const getTopItemsData = () => {
    if (items.length === 0) return null;

    // Calculate value and sort
    const itemsWithValue = items.map((item) => ({
      name: item.name,
      value: item.price * item.quantity,
    }));

    itemsWithValue.sort((a, b) => b.value - a.value);
    const topItems = itemsWithValue.slice(0, 6);

    // If more than 6 items, group rest as "Others"
    if (items.length > 6) {
      const othersValue = itemsWithValue
        .slice(6)
        .reduce((sum, item) => sum + item.value, 0);
      topItems.push({ name: 'Others', value: othersValue });
    }

    const colors = [
      '#6B7280', // Slate Grey
      '#4B5563', // Dark Grey
      '#9CA3AF', // Medium Grey
      '#D1D5DB', // Light Grey
      '#374151', // Charcoal
      '#E5E7EB', // Very Light Grey
      '#1F2937', // Dark Charcoal
    ];

    return {
      labels: topItems.map((item) => item.name),
      datasets: [
        {
          data: topItems.map((item) => item.value),
          backgroundColor: colors,
          borderWidth: 0,
          borderRadius: 0,
        },
      ],
    };
  };

  // Low Stock Items Bar Chart
  const getLowStockData = () => {
    const lowStockItems = items.filter((item) => item.quantity < 10).slice(0, 5);

    if (lowStockItems.length === 0) return null;

    return {
      labels: lowStockItems.map((item) => item.name),
      datasets: [
        {
          label: 'Quantity',
          data: lowStockItems.map((item) => item.quantity),
          backgroundColor: lowStockItems.map((item) =>
            item.quantity < 5 ? '#EF4444' : '#F59E0B'
          ),
          borderRadius: 6,
          borderWidth: 0,
        },
      ],
    };
  };

  // Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context) => `Revenue: ${formatCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value) => formatCurrency(value),
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label}: ${formatCurrency(value)}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '65%',
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading charts...</p>
      </div>
    );
  }

  const salesTrendData = getSalesTrendData();
  const categoryData = getCategoryData();
  const topItemsData = getTopItemsData();
  const lowStockData = getLowStockData();

  return (
    <div className="charts-container">
      {/* Sales Trend Chart */}
      {salesTrendData && (
        <div className="chart-card">
          <h3 className="chart-title">💰 Sales Trend</h3>
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Line data={salesTrendData} options={lineOptions} />
          </div>
        </div>
      )}

      {/* Items by Category Chart */}
      {categoryData && (
        <div className="chart-card">
          <h3 className="chart-title">📊 Items by Category</h3>
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Bar data={categoryData} options={barOptions} />
          </div>
        </div>
      )}

      {/* Top Items by Value Chart */}
      {topItemsData && (
        <div className="chart-card">
          <h3 className="chart-title">🏆 Top Items by Stock Value</h3>
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Doughnut data={topItemsData} options={doughnutOptions} />
          </div>
        </div>
      )}

      {/* Low Stock Alert Chart */}
      {lowStockData && (
        <div className="chart-card">
          <h3 className="chart-title">⚠️ Low Stock Alert</h3>
          <div className="chart-wrapper" style={{ height: '250px' }}>
            <Bar data={lowStockData} options={barOptions} />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!salesTrendData && !categoryData && !topItemsData && !lowStockData && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Data Available</h3>
          <p>Add some items and make sales to see beautiful charts!</p>
        </div>
      )}
    </div>
  );
}

export default Charts;
