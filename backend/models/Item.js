const mongoose = require('mongoose');

/**
 * Item Schema - Represents inventory items
 * Based on DATABASE_DOCUMENTATION.md specifications
 */
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  category: {
    type: String,
    default: '',
    trim: true
  },
  
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  costPrice: {
    type: Number,
    default: 0,
    min: [0, 'Cost price cannot be negative']
  },
  
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer'
    }
  },
  
  // Per-item reorder point (when to restock this specific item)
  reorderPoint: {
    type: Number,
    default: 10,
    min: [0, 'Reorder point cannot be negative']
  },
  
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  // Preferred supplier for restocking (realistic feature)
  preferredSupplier: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true  // Automatically creates createdAt and updatedAt
});

// Indexes for better query performance (from DATABASE_DOCUMENTATION.md)
itemSchema.index({ name: 'text' });  // Text search on name
itemSchema.index({ sku: 1 }, { unique: true });  // Unique SKU lookup

// Generate SKU automatically if not provided
itemSchema.pre('save', function(next) {
  if (!this.sku) {
    // Generate SKU: CATEGORY-RANDOM-TIMESTAMP
    const category = this.category ? this.category.substring(0, 4).toUpperCase() : 'ITEM';
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const timestamp = Date.now().toString().slice(-4);
    this.sku = `${category}-${random}-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Item', itemSchema);
