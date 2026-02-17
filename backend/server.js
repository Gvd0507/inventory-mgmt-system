require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Import routes
const itemRoutes = require('./routes/items');
const saleRoutes = require('./routes/sales');
const authRoutes = require('./routes/auth');
const purchaseRoutes = require('./routes/purchases');

// Basic test route
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Inventory Management System API',
    status: 'Server is running',
    version: '1.0.0',
    endpoints: {
      items: '/api/items',
      sales: '/api/sales',
      purchases: '/api/purchases',
      auth: '/api/auth',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: 'Connected',
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/auth', authRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);
});
