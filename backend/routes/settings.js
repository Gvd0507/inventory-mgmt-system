const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/auth');

/**
 * @route   GET /api/settings
 * @desc    Get application settings
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    let settings = await Settings.findById('app_settings');
    
    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({ _id: 'app_settings' });
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/settings
 * @desc    Update application settings
 * @access  Private/Admin
 */
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const updates = req.body;
    
    // Find and update settings, or create if doesn't exist
    let settings = await Settings.findByIdAndUpdate(
      'app_settings',
      { $set: updates },
      { 
        new: true, 
        upsert: true, 
        runValidators: true,
        setDefaultsOnInsert: true 
      }
    );
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update settings',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/settings/reset
 * @desc    Reset settings to defaults
 * @access  Private/Admin
 */
router.post('/reset', protect, adminOnly, async (req, res) => {
  try {
    // Delete existing settings
    await Settings.findByIdAndDelete('app_settings');
    
    // Create new default settings
    const settings = await Settings.create({ _id: 'app_settings' });
    
    res.json({
      success: true,
      message: 'Settings reset to defaults',
      data: settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to reset settings',
      message: error.message
    });
  }
});

module.exports = router;
