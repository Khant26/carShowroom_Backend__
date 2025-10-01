const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true,
    maxLength: [50, 'Brand name cannot exceed 50 characters']
  },
  logo: {
    type: String,
    required: [true, 'Brand logo is required']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  website: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  foundedYear: {
    type: Number,
    min: [1800, 'Founded year must be after 1800'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  carCount: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
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

// Update the updatedAt field before saving
brandSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search and ordering
brandSchema.index({ name: 'text', description: 'text' });
brandSchema.index({ order: 1, isActive: 1 });

module.exports = mongoose.model('Brand', brandSchema);