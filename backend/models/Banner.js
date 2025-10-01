const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxLength: [200, 'Subtitle cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Banner image is required']
  },
  buttonText: {
    type: String,
    default: 'Learn More',
    maxLength: [50, 'Button text cannot exceed 50 characters']
  },
  buttonLink: {
    type: String,
    default: '/cars'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  backgroundColor: {
    type: String,
    default: '#f8f9fa'
  },
  textColor: {
    type: String,
    default: '#333333'
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
bannerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for ordering
bannerSchema.index({ order: 1, isActive: 1 });

module.exports = mongoose.model('Banner', bannerSchema);