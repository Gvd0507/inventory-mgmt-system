const mongoose = require('mongoose');

/**
 * Sale Schema - Records sales transactions
 * Based on DATABASE_DOCUMENTATION.md specifications
 * 
 * Note: itemName is denormalized for performance (see documentation)
 */
const saleSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item ID is required']
  },
  
  itemName: {
    type: String,
    required: [true, 'Item name is required']
  },
  
  quantitySold: {
    type: Number,
    required: [true, 'Quantity sold is required'],
    min: [1, 'Quantity sold must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity sold must be an integer'
    }
  },
  
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0, 'Price cannot be negative']
  },
  
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  
  saleDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false  // Using saleDate instead
});

// Indexes for better query performance (from DATABASE_DOCUMENTATION.md)
saleSchema.index({ saleDate: -1 });  // Descending for recent-first queries
saleSchema.index({ itemId: 1 });     // Fast lookups by item

// Calculate totalAmount automatically before saving
saleSchema.pre('save', function(next) {
  this.totalAmount = this.quantitySold * this.pricePerUnit;
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
