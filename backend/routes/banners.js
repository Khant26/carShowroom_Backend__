const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Banner = require('../models/Banner');
const { protect, adminOnly } = require('../middleware/auth');

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    
    let query = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    console.error('Get banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create banner
// @route   POST /api/banners
// @access  Private/Admin
router.post('/', protect, adminOnly, [
  body('title').notEmpty().withMessage('Title is required'),
  body('image').notEmpty().withMessage('Image is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const banner = await Banner.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during banner creation'
    });
  }
});

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('image').optional().notEmpty().withMessage('Image cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during banner update'
    });
  }
});

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during banner deletion'
    });
  }
});

// @desc    Update banner status
// @route   PATCH /api/banners/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Banner ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: banner
    });
  } catch (error) {
    console.error('Update banner status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during status update'
    });
  }
});

// @desc    Reorder banners
// @route   PATCH /api/banners/reorder
// @access  Private/Admin
router.patch('/reorder', protect, adminOnly, async (req, res) => {
  try {
    const { banners } = req.body; // Array of { id, order }
    
    if (!Array.isArray(banners)) {
      return res.status(400).json({
        success: false,
        message: 'Banners array is required'
      });
    }

    // Update each banner's order
    const updatePromises = banners.map(({ id, order }) =>
      Banner.findByIdAndUpdate(id, { order }, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Banners reordered successfully'
    });
  } catch (error) {
    console.error('Reorder banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during reordering'
    });
  }
});

module.exports = router;