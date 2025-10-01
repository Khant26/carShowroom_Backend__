const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Car = require('../models/Car');
const Brand = require('../models/Brand');
const { protect, adminOnly } = require('../middleware/auth');

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      brand,
      category,
      minPrice,
      maxPrice,
      year,
      fuelType,
      transmission,
      status,
      featured,
      sort = 'createdAt'
    } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (brand) {
      query.brand = { $regex: new RegExp(brand, 'i') };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (year) {
      query.year = Number(year);
    }
    
    if (fuelType) {
      query['specifications.fuelType'] = fuelType;
    }
    
    if (transmission) {
      query['specifications.transmission'] = transmission;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (featured !== undefined) {
      query.isFeatured = featured === 'true';
    }

    // Build sort object
    let sortObj = {};
    if (sort === 'price-asc') sortObj.price = 1;
    else if (sort === 'price-desc') sortObj.price = -1;
    else if (sort === 'year-desc') sortObj.year = -1;
    else if (sort === 'year-asc') sortObj.year = 1;
    else if (sort === 'name') sortObj.name = 1;
    else sortObj.createdAt = -1;

    // Pagination
    const skip = (page - 1) * limit;
    
    const cars = await Car.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Car.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: cars.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: cars
    });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    // Increment views
    car.views += 1;
    await car.save();
    
    res.status(200).json({
      success: true,
      data: car
    });
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get featured cars
// @route   GET /api/cars/featured/list
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const cars = await Car.find({ 
      isFeatured: true,
      status: 'available'
    })
    .sort({ createdAt: -1 })
    .limit(Number(limit));
    
    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars
    });
  } catch (error) {
    console.error('Get featured cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create car
// @route   POST /api/cars
// @access  Private/Admin
router.post('/', protect, adminOnly, [
  body('name').notEmpty().withMessage('Car name is required'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900 }).withMessage('Valid year is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Pickup']).withMessage('Valid category is required'),
  body('specifications.engine').notEmpty().withMessage('Engine specification is required'),
  body('specifications.fuelType').isIn(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']).withMessage('Valid fuel type is required'),
  body('specifications.transmission').isIn(['Manual', 'Automatic', 'CVT']).withMessage('Valid transmission is required'),
  body('specifications.seating').isInt({ min: 1, max: 15 }).withMessage('Valid seating capacity is required'),
  body('specifications.color').notEmpty().withMessage('Color is required')
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

    // Validate that brand exists
    const brandExists = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${req.body.brand}$`, 'i') } 
    });
    
    if (!brandExists) {
      return res.status(400).json({
        success: false,
        message: 'Brand not found. Please create the brand first.'
      });
    }

    const car = await Car.create(req.body);
    
    // Update brand car count
    await Brand.findByIdAndUpdate(
      brandExists._id,
      { $inc: { carCount: 1 } }
    );
    
    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: car
    });
  } catch (error) {
    console.error('Create car error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during car creation'
    });
  }
});

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, [
  body('name').optional().notEmpty().withMessage('Car name cannot be empty'),
  body('brand').optional().notEmpty().withMessage('Brand cannot be empty'),
  body('year').optional().isInt({ min: 1900 }).withMessage('Valid year is required'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Valid price is required')
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

    // Get current car to check brand change
    const currentCar = await Car.findById(req.params.id);
    if (!currentCar) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // If brand is being changed, validate new brand exists
    if (req.body.brand && req.body.brand !== currentCar.brand) {
      const brandExists = await Brand.findOne({ 
        name: { $regex: new RegExp(`^${req.body.brand}$`, 'i') } 
      });
      
      if (!brandExists) {
        return res.status(400).json({
          success: false,
          message: 'Brand not found. Please create the brand first.'
        });
      }

      // Update car counts for old and new brands
      const oldBrand = await Brand.findOne({ 
        name: { $regex: new RegExp(`^${currentCar.brand}$`, 'i') } 
      });
      
      if (oldBrand) {
        await Brand.findByIdAndUpdate(oldBrand._id, { $inc: { carCount: -1 } });
      }
      
      await Brand.findByIdAndUpdate(brandExists._id, { $inc: { carCount: 1 } });
    }

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: car
    });
  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during car update'
    });
  }
});

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Update brand car count
    const brand = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${car.brand}$`, 'i') } 
    });
    
    if (brand) {
      await Brand.findByIdAndUpdate(brand._id, { $inc: { carCount: -1 } });
    }

    await Car.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during car deletion'
    });
  }
});

// @desc    Update car status
// @route   PATCH /api/cars/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['available', 'sold', 'reserved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be available, sold, or reserved'
      });
    }
    
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Car status updated to ${status}`,
      data: car
    });
  } catch (error) {
    console.error('Update car status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during status update'
    });
  }
});

// @desc    Toggle featured status
// @route   PATCH /api/cars/:id/featured
// @access  Private/Admin
router.patch('/:id/featured', protect, adminOnly, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    car.isFeatured = !car.isFeatured;
    await car.save();
    
    res.status(200).json({
      success: true,
      message: `Car ${car.isFeatured ? 'added to' : 'removed from'} featured list`,
      data: car
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during featured update'
    });
  }
});

// @desc    Get car statistics
// @route   GET /api/cars/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, adminOnly, async (req, res) => {
  try {
    const totalCars = await Car.countDocuments();
    const availableCars = await Car.countDocuments({ status: 'available' });
    const soldCars = await Car.countDocuments({ status: 'sold' });
    const featuredCars = await Car.countDocuments({ isFeatured: true });
    
    // Get cars by category
    const carsByCategory = await Car.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get cars by brand
    const carsByBrand = await Car.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalCars,
          availableCars,
          soldCars,
          featuredCars
        },
        carsByCategory,
        carsByBrand
      }
    });
  } catch (error) {
    console.error('Get car stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;