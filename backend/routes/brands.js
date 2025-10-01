const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Brand = require('../models/Brand');
const Car = require('../models/Car');
const { protect, adminOnly } = require('../middleware/auth');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { active, search } = req.query;
    
    let query = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const brands = await Brand.find(query).sort({ order: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    // Get cars count for this brand
    const carCount = await Car.countDocuments({ brand: brand.name });
    
    res.status(200).json({
      success: true,
      data: { ...brand.toObject(), carCount }
    });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get brand by name
// @route   GET /api/brands/name/:name
// @access  Public
router.get('/name/:name', async (req, res) => {
  try {
    const brand = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${req.params.name}$`, 'i') } 
    });
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    // Get cars for this brand
    const cars = await Car.find({ brand: brand.name }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: { ...brand.toObject(), cars }
    });
  } catch (error) {
    console.error('Get brand by name error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create brand
// @route   POST /api/brands
// @access  Private/Admin
router.post('/', protect, adminOnly, [
  body('name').notEmpty().withMessage('Brand name is required'),
  body('logo').notEmpty().withMessage('Brand logo is required')
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

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') } 
    });
    
    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: 'Brand with this name already exists'
      });
    }

    const brand = await Brand.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand
    });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during brand creation'
    });
  }
});

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, [
  body('name').optional().notEmpty().withMessage('Brand name cannot be empty'),
  body('logo').optional().notEmpty().withMessage('Logo cannot be empty')
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

    // Check if brand name already exists (if name is being updated)
    if (req.body.name) {
      const existingBrand = await Brand.findOne({ 
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingBrand) {
        return res.status(400).json({
          success: false,
          message: 'Brand with this name already exists'
        });
      }
    }

    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: brand
    });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during brand update'
    });
  }
});

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Check if there are cars associated with this brand
    const carCount = await Car.countDocuments({ brand: brand.name });
    
    if (carCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete brand. ${carCount} cars are associated with this brand.`
      });
    }

    await Brand.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during brand deletion'
    });
  }
});

// @desc    Update brand status
// @route   PATCH /api/brands/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Brand ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: brand
    });
  } catch (error) {
    console.error('Update brand status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during status update'
    });
  }
});

// @desc    Update car count for brand (utility endpoint)
// @route   PATCH /api/brands/:id/update-car-count
// @access  Private/Admin
router.patch('/:id/update-car-count', protect, adminOnly, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Count cars for this brand
    const carCount = await Car.countDocuments({ brand: brand.name });
    
    // Update brand with car count
    brand.carCount = carCount;
    await brand.save();
    
    res.status(200).json({
      success: true,
      message: 'Car count updated successfully',
      data: brand
    });
  } catch (error) {
    console.error('Update car count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during car count update'
    });
  }
});

module.exports = router;