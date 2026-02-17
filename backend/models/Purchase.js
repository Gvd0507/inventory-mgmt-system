const mongoose = require('mongoose');

/**
 * Purchase Schema - Represents inventory purchases/restocking
 * Every shop needs to record when they buy stock from suppliers
 */
const purchaseSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item ID is required'],
    index: true
  },
  
  // Denormalized for faster queries (same pattern as Sale model)
  itemName: {
    type: String,
    required: true
  },
  
  // Supplier/Vendor Information
  supplier: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true
  },
  
  // Purchase Quantities
  quantityPurchased: {
    type: Number,
    required: [true, 'Quantity purchased is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer'
    }
  },
  
  // Cost Information (what we paid)
  costPerUnit: {
    type: Number,
    required: [true, 'Cost per unit is required'],
    min: [0, 'Cost cannot be negative']
  },
  
  // Calculated total cost
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  
  // When the purchase was made
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  
  // Optional notes (delivery info, quality issues, etc.)
  notes: {
    type: String,
    default: '',
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for common queries
purchaseSchema.index({ purchaseDate: -1 });  // Recent purchases
purchaseSchema.index({ supplier: 1 });        // Filter by supplier

module.exports = mongoose.model('Purchase', purchaseSchema);
