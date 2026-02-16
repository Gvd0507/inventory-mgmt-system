const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // There should only be one settings document
  _id: {
    type: String,
    default: 'app_settings'
  },
  
  // General Settings
  businessName: {
    type: String,
    default: 'Inventory Pro'
  },
  businessAddress: {
    type: String,
    default: ''
  },
  businessPhone: {
    type: String,
    default: ''
  },
  businessEmail: {
    type: String,
    default: ''
  },
  
  // Currency Settings
  currency: {
    type: String,
    default: '₹',
    enum: ['₹', '$', '€', '£', '¥']
  },
  currencyCode: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY']
  },
  
  // Alert Settings
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 1
  },
  enableEmailAlerts: {
    type: Boolean,
    default: false
  },
  alertEmail: {
    type: String,
    default: ''
  },
  
  // Display Settings
  itemsPerPage: {
    type: Number,
    default: 20,
    min: 10,
    max: 100
  },
  dateFormat: {
    type: String,
    default: 'MM/DD/YYYY',
    enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
