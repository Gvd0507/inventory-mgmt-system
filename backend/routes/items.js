const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

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
    const { name, description, category, price, quantity, sku, reorderPoint, preferredSupplier, totalCost } = req.body;

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

    // Derive per-unit cost price from total cost
    const costPrice = (totalCost && quantity > 0) ? parseFloat(totalCost) / parseInt(quantity) : 0;
    const profit = costPrice > 0 ? parseFloat(price) - costPrice : null;

    // Create new item
    const item = new Item({
      name,
      description,
      category,
      price,
      quantity,
      sku: sku || undefined, // Let model generate if not provided
      reorderPoint,
      preferredSupplier,
      costPrice,
      ...(profit !== null && { profit })
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
    const { name, description, category, price, quantity, sku, reorderPoint, preferredSupplier, totalCost } = req.body;

    // Derive per-unit cost and profit if totalCost provided
    const costPrice = (totalCost !== undefined && quantity > 0)
      ? parseFloat(totalCost) / parseInt(quantity)
      : undefined;
    const profit = (costPrice !== undefined && price !== undefined)
      ? parseFloat(price) - costPrice
      : undefined;

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
      { name, description, category, price, quantity, sku, reorderPoint, preferredSupplier,
        ...(costPrice !== undefined && { costPrice }),
        ...(profit !== undefined && { profit })
      },
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
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
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
 * @route   GET /api/items/low-stock
 * @desc    Get items where quantity <= their own reorderPoint
 * @access  Public
 */
router.get('/low-stock', async (req, res) => {
  try {
    const items = await Item.find({ $expr: { $lte: ['$quantity', '$reorderPoint'] } })
      .sort({ quantity: 1 });

    res.json({
      success: true,
      count: items.length,
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
 * @route   GET /api/items/low-stock/:threshold
 * @desc    Get items below a universal stock threshold (legacy / manual override)
 * @param   threshold - Number
 * @access  Public
 */
router.get('/low-stock/:threshold', async (req, res) => {
  try {
    const threshold = parseInt(req.params.threshold) || 2;
    
    const items = await Item.find({ quantity: { $lte: threshold } })
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

module.exports = router;
