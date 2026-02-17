const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // There should only be one settings document
  _id: {
    type: String,
    default: 'app_settings'
  },
  
  // Essential Settings for Small Shop
  businessName: {
    type: String,
    default: 'Inventory Pro'
  },
  
  // Currency (most shops use one currency)
  currency: {
    type: String,
    default: '₹',
    enum: ['₹', '$', '€', '£', '¥']
  },
  
  // Low Stock Alert Threshold
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 1
  },
  
  // Tax/GST Percentage (ESSENTIAL for Indian shops!)
  taxPercentage: {
    type: Number,
    default: 18,  // GST 18% common in India
    min: 0,
    max: 100
  },
  
  // Contact Information (for receipts/invoices)
  phoneNumber: {
    type: String,
    default: ''
  },
  
  // Receipt Footer (shop address, thank you message, etc.)
  receiptFooter: {
    type: String,
    default: 'Thank you for your business!'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
