const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Rental = require('../models/Rental');
const { protect, adminOnly } = require('../middleware/auth');

// @desc    Get all rentals
// @route   GET /api/rentals
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      brand,
      search,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    if (brand) {
      query.brand = brand;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const rentals = await Rental.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Rental.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: rentals.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: rentals
    });
  } catch (error) {
    console.error('Get rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single rental
// @route   GET /api/rentals/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: rental
    });
  } catch (error) {
    console.error('Get rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create rental (Admin)
// @route   POST /api/rentals
// @access  Private/Admin
router.post('/', protect, adminOnly, [
  body('name').notEmpty().withMessage('Car name is required'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('engine').notEmpty().withMessage('Engine is required'),
  body('fuel').notEmpty().withMessage('Fuel type is required'),
  body('topSpeed').notEmpty().withMessage('Top speed is required'),
  body('color').notEmpty().withMessage('Color is required'),
  body('availableDate').isISO8601().withMessage('Valid available date is required'),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('Valid price per day is required')
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

    const rental = await Rental.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Rental created successfully',
      data: rental
    });
  } catch (error) {
    console.error('Create rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during rental creation'
    });
  }
});

// @desc    Update rental
// @route   PUT /api/rentals/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, [
  body('name').optional().notEmpty().withMessage('Car name cannot be empty'),
  body('brand').optional().notEmpty().withMessage('Brand cannot be empty'),
  body('model').optional().notEmpty().withMessage('Model cannot be empty'),
  body('pricePerDay').optional().isFloat({ min: 0 }).withMessage('Valid price per day is required'),
  body('availableDate').optional().isISO8601().withMessage('Valid available date is required')
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

    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Rental updated successfully',
      data: rental
    });
  } catch (error) {
    console.error('Update rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during rental update'
    });
  }
});

// @desc    Delete rental
// @route   DELETE /api/rentals/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const rental = await Rental.findByIdAndDelete(req.params.id);
    
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Rental deleted successfully'
    });
  } catch (error) {
    console.error('Delete rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during rental deletion'
    });
  }
});

// @desc    Get rental statistics
// @route   GET /api/rentals/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, adminOnly, async (req, res) => {
  try {
    const totalRentals = await Rental.countDocuments();
    
    // Get average price
    const priceStats = await Rental.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$pricePerDay' },
          minPrice: { $min: '$pricePerDay' },
          maxPrice: { $max: '$pricePerDay' }
        }
      }
    ]);
    
    // Get brand distribution
    const brandStats = await Rental.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Get monthly rental additions
    const monthlyStats = await Rental.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRentals,
          averagePrice: priceStats[0]?.avgPrice || 0,
          minPrice: priceStats[0]?.minPrice || 0,
          maxPrice: priceStats[0]?.maxPrice || 0
        },
        brandStats,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Get rental stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;