const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
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
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    required: true
  }],
  specifications: {
    engine: {
      type: String,
      required: true
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
      required: true
    },
    transmission: {
      type: String,
      enum: ['Manual', 'Automatic', 'CVT'],
      required: true
    },
    seating: {
      type: Number,
      required: true,
      min: [1, 'Seating must be at least 1'],
      max: [15, 'Seating cannot exceed 15']
    },
    fuelEconomy: {
      type: String,
      required: true
    },
    topSpeed: {
      type: String
    },
    acceleration: {
      type: String
    },
    color: {
      type: String,
      required: true
    },
    mileage: {
      type: Number,
      default: 0
    }
  },
  features: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Pickup'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  isRental: {
    type: Boolean,
    default: false
  },
  rentalPrice: {
    type: Number,
    min: [0, 'Rental price cannot be negative'],
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
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
carSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better search performance
carSchema.index({ name: 'text', brand: 'text', model: 'text', description: 'text' });
carSchema.index({ brand: 1, model: 1 });
carSchema.index({ price: 1 });
carSchema.index({ year: 1 });
carSchema.index({ status: 1 });
carSchema.index({ category: 1 });
carSchema.index({ isRental: 1 });

module.exports = mongoose.model('Car', carSchema);