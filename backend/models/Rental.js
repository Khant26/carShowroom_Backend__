const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  // Car Information
  name: {
    type: String,
    required: [true, 'Car name is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  engine: {
    type: String,
    required: [true, 'Engine is required'],
    trim: true
  },
  fuel: {
    type: String,
    required: [true, 'Fuel type is required'],
    trim: true
  },
  topSpeed: {
    type: String,
    required: [true, 'Top speed is required'],
    trim: true
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    trim: true,
    default: ''
  },
  // Rental Information - Only essential fields
  availableDate: {
    type: Date,
    required: [true, 'Available date is required']
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: [0, 'Price per day cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
rentalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search and performance
rentalSchema.index({ availableDate: 1 });
rentalSchema.index({ pricePerDay: 1 });
rentalSchema.index({ brand: 1 });
rentalSchema.index({ name: 1 });

// Virtual field for backward compatibility
rentalSchema.virtual('dailyRate').get(function() {
  return this.pricePerDay;
});

// Ensure virtual fields are serialized
rentalSchema.set('toJSON', { virtuals: true });
rentalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Rental', rentalSchema);