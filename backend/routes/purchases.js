const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/purchases
 * @desc    Record a purchase (restock inventory)
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { itemId, supplier, quantityPurchased, costPerUnit, notes } = req.body;

    // Validation
    if (!itemId || !supplier || !quantityPurchased || costPerUnit === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide itemId, supplier, quantityPurchased, and costPerUnit'
      });
    }

    if (quantityPurchased < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1'
      });
    }

    if (costPerUnit < 0) {
      return res.status(400).json({
        success: false,
        error: 'Cost cannot be negative'
      });
    }

    // Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Calculate total cost
    const totalCost = costPerUnit * quantityPurchased;

    // Create purchase record
    const purchase = new Purchase({
      itemId,
      itemName: item.name,
      supplier: supplier.trim(),
      quantityPurchased,
      costPerUnit,
      totalCost,
      notes: notes || ''
    });

    await purchase.save();

    // Atomically increment item stock and update cost price (opposite of sale)
    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { 
        $inc: { quantity: quantityPurchased },
        $set: { costPrice: costPerUnit }
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Purchase recorded successfully',
      purchase,
      newStock: updatedItem.quantity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to record purchase',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/purchases
 * @desc    Get all purchases (with optional filters)
 * @query   supplier, itemId, startDate, endDate, limit
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { supplier, itemId, startDate, endDate, limit = 100 } = req.query;
    
    let query = {};

    // Filter by supplier
    if (supplier) {
      query.supplier = { $regex: supplier, $options: 'i' };
    }

    // Filter by item
    if (itemId) {
      query.itemId = itemId;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) query.purchaseDate.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(query)
      .sort({ purchaseDate: -1 })
      .limit(parseInt(limit))
      .populate('itemId', 'name category sku');

    res.json({
      success: true,
      count: purchases.length,
      purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchases',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/purchases/stats
 * @desc    Get purchase statistics
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalCost' },
          totalQuantity: { $sum: '$quantityPurchased' },
          totalPurchases: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats.length > 0 ? stats[0] : {
        totalSpent: 0,
        totalQuantity: 0,
        totalPurchases: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchase statistics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/purchases/suppliers
 * @desc    Get list of unique suppliers
 * @access  Private
 */
router.get('/suppliers', protect, async (req, res) => {
  try {
    const suppliers = await Purchase.distinct('supplier');
    
    res.json({
      success: true,
      count: suppliers.length,
      suppliers: suppliers.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suppliers',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/purchases/:id
 * @desc    Get single purchase by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('itemId', 'name category sku price');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchase',
      message: error.message
    });
  }
});

module.exports = router;
