const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect, adminOnly } = require('../middleware/auth');

/**
 * @route   GET /api/items
 * @desc    Get all items with optional filters
 * @query   search, category, minPrice, maxPrice, minQuantity, maxQuantity, sortBy
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      minQuantity, 
      maxQuantity, 
      sortBy = 'createdAt' 
    } = req.query;
    
    let query = {};

    // Search by name (case-insensitive regex)
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by quantity/stock level
    if (minQuantity || maxQuantity) {
      query.quantity = {};
      if (minQuantity) query.quantity.$gte = parseInt(minQuantity);
      if (maxQuantity) query.quantity.$lte = parseInt(maxQuantity);
    }

    // Sorting
    let sortOption = {};
    switch (sortBy) {
      case 'name':
        sortOption.name = 1;
        break;
      case 'price':
        sortOption.price = 1;
        break;
      case 'quantity':
        sortOption.quantity = 1;
        break;
      case 'createdAt':
      default:
        sortOption.createdAt = -1;
    }

    const items = await Item.find(query).sort(sortOption);
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch items',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/items/:id
 * @desc    Get single item by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch item',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/items
 * @desc    Create new item
 * @body    { name, description, category, price, quantity, sku }
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, category, price, quantity, sku } = req.body;

    // Basic validation
    if (!name || !price || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, price, and quantity'
      });
    }

    if (price < 0 || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price and quantity cannot be negative'
      });
    }

    // Create new item
    const item = new Item({
      name,
      description,
      category,
      price,
      quantity,
      sku: sku || undefined // Let model generate if not provided
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item
    });
  } catch (error) {
    // Handle duplicate SKU error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'SKU already exists. Please use a unique SKU.'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: messages
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create item',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/items/:id
 * @desc    Update item by ID
 * @body    { name, description, category, price, quantity, sku }
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, category, price, quantity, sku } = req.body;

    // Validation
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price cannot be negative'
      });
    }

    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity cannot be negative'
      });
    }

    // Find and update
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description, category, price, quantity, sku },
      { 
        new: true,           // Return updated document
        runValidators: true  // Run schema validators
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    // Handle duplicate SKU error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'SKU already exists. Please use a unique SKU.'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: messages
      });
    }

    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update item',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete item by ID
 * @access  Private/Admin
 */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully',
      data: item
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete item',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/items/low-stock/:threshold
 * @desc    Get items below stock threshold
 * @param   threshold - Number (e.g., 10)
 * @access  Public
 */
router.get('/low-stock/:threshold', async (req, res) => {
  try {
    const threshold = parseInt(req.params.threshold) || 10;
    
    const items = await Item.find({ quantity: { $lt: threshold } })
      .sort({ quantity: 1 });

    res.json({
      success: true,
      count: items.length,
      threshold: threshold,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch low stock items',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/items/batch/update
 * @desc    Batch update multiple items
 * @body    { ids: [], updates: {} }
 * @access  Private
 */
router.put('/batch/update', protect, async (req, res) => {
  try {
    const { ids, updates } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of item IDs'
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide updates object'
      });
    }

    // Update multiple items
    const result = await Item.updateMany(
      { _id: { $in: ids } },
      { $set: updates },
      { runValidators: true }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} items updated successfully`,
      matched: result.matchedCount,
      modified: result.modifiedCount
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Batch update failed',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/items/batch/delete
 * @desc    Batch delete multiple items
 * @body    { ids: [] }
 * @access  Private/Admin
 */
router.delete('/batch/delete', protect, adminOnly, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of item IDs'
      });
    }

    // Delete multiple items
    const result = await Item.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} items deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Batch delete failed',
      message: error.message
    });
  }
});

module.exports = router;
