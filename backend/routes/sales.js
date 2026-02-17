const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/sales
 * @desc    Create new sale (sell item)
 * @body    { itemId, quantitySold }
 * @access  Private
 * 
 * CRITICAL: Uses atomic operations to prevent race conditions
 * Based on DATABASE_DOCUMENTATION.md Query 3
 */
router.post('/', protect, async (req, res) => {
  try {
    const { itemId, quantitySold } = req.body;

    // Validation
    if (!itemId || !quantitySold) {
      return res.status(400).json({
        success: false,
        error: 'Please provide itemId and quantitySold'
      });
    }

    if (quantitySold < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity sold must be at least 1'
      });
    }

    if (!Number.isInteger(quantitySold)) {
      return res.status(400).json({
        success: false,
        error: 'Quantity sold must be an integer'
      });
    }

    // Step 1: Find item and check stock availability
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    if (item.quantity < quantitySold) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Available: ${item.quantity}, Requested: ${quantitySold}`
      });
    }

    // Step 2: Atomically decrement stock using $inc
    // This prevents race conditions if two sales happen simultaneously
    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { $inc: { quantity: -quantitySold } },
      { new: true }
    );

    // Step 3: Create sale record
    const sale = new Sale({
      itemId: item._id,
      itemName: item.name, // Denormalized for performance
      quantitySold,
      pricePerUnit: item.price,
      totalAmount: item.price * quantitySold // Auto-calculated by model
    });

    await sale.save();

    res.status(201).json({
      success: true,
      message: 'Sale completed successfully',
      data: {
        sale,
        remainingStock: updatedItem.quantity
      }
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Invalid item ID'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process sale',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/sales
 * @desc    Get all sales (sorted by date, newest first)
 * @query   limit - Optional number of results (default: all)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;

    const sales = await Sale.find()
      .sort({ saleDate: -1 }) // Descending order (newest first)
      .limit(limit);

    res.json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/sales/stats
 * @desc    Get sales statistics
 * @access  Public
 * 
 * Based on DATABASE_DOCUMENTATION.md Query 5
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalItemsSold: { $sum: '$quantitySold' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    // If no sales exist, return zeros
    const result = stats.length > 0 ? stats[0] : {
      totalRevenue: 0,
      totalItemsSold: 0,
      totalTransactions: 0
    };

    // Remove _id field
    delete result._id;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/sales/item/:itemId
 * @desc    Get all sales for a specific item
 * @access  Public
 */
router.get('/item/:itemId', async (req, res) => {
  try {
    const sales = await Sale.find({ itemId: req.params.itemId })
      .sort({ saleDate: -1 });

    res.json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Invalid item ID'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales for item',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/sales/:id
 * @desc    Get single sale by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Sale not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch sale',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/sales
 * @desc    Delete all sales
 * @access  Private
 */
router.delete('/', protect, async (req, res) => {
  try {
    const result = await Sale.deleteMany({});
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} sales`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete sales',
      message: error.message
    });
  }
});

module.exports = router;
