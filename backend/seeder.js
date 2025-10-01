const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Banner = require('./models/Banner');
const Brand = require('./models/Brand');
const Car = require('./models/Car');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carshowroom_new');
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample data
const adminUser = {
  name: 'Admin User',
  email: process.env.ADMIN_EMAIL || 'admin@carshowroom.com',
  password: process.env.ADMIN_PASSWORD || 'CarShowroom2024@AdminSecurePass',
  role: 'admin'
};

const banners = [
  {
    title: 'Welcome to Our Car Showroom',
    subtitle: 'Find Your Dream Car',
    description: 'Discover our extensive collection of premium vehicles from top brands worldwide.',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Explore Cars',
    buttonLink: '/cars',
    order: 1,
    isActive: true
  },
  {
    title: 'Luxury Meets Performance',
    subtitle: 'Premium Car Collection',
    description: 'Experience the perfect blend of luxury, comfort, and cutting-edge technology.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    buttonText: 'View Collection',
    buttonLink: '/cars',
    order: 2,
    isActive: true
  },
  {
    title: 'Rent Your Perfect Ride',
    subtitle: 'Car Rental Services',
    description: 'Short-term or long-term rentals available. Drive your dream car today!',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Rent Now',
    buttonLink: '/rental',
    order: 3,
    isActive: true
  }
];

const brands = [
  {
    name: 'Toyota',
    logo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    description: 'Japanese automotive manufacturer known for reliability and innovation.',
    website: 'https://www.toyota.com',
    country: 'Japan',
    foundedYear: 1937,
    order: 1
  },
  {
    name: 'BMW',
    logo: 'https://images.unsplash.com/photo-1617886322207-6c48c65f2700?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    description: 'German luxury vehicle manufacturer known for performance and luxury.',
    website: 'https://www.bmw.com',
    country: 'Germany',
    foundedYear: 1916,
    order: 2
  },
  {
    name: 'Mercedes-Benz',
    logo: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    description: 'German luxury automotive brand known for engineering excellence.',
    website: 'https://www.mercedes-benz.com',
    country: 'Germany',
    foundedYear: 1926,
    order: 3
  },
  {
    name: 'Audi',
    logo: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    description: 'German luxury automobile manufacturer known for innovation and design.',
    website: 'https://www.audi.com',
    country: 'Germany',
    foundedYear: 1909,
    order: 4
  },
  {
    name: 'Honda',
    logo: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    description: 'Japanese automotive manufacturer known for reliability and fuel efficiency.',
    website: 'https://www.honda.com',
    country: 'Japan',
    foundedYear: 1948,
    order: 5
  }
];

const cars = [
  {
    name: 'Toyota Camry 2024',
    brand: 'Toyota',
    model: 'Camry',
    year: 2024,
    price: 25000,
    description: 'The Toyota Camry combines style, efficiency, and reliability in a midsize sedan that offers exceptional value.',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      engine: '2.5L 4-Cylinder',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seating: 5,
      fuelEconomy: '28/39 mpg',
      topSpeed: '130 mph',
      acceleration: '0-60 in 8.4s',
      color: 'Silver',
      mileage: 0
    },
    features: ['Adaptive Cruise Control', 'Lane Departure Warning', 'Automatic Emergency Braking', 'Apple CarPlay', 'Android Auto'],
    category: 'Sedan',
    status: 'available',
    isRental: true,
    rentalPrice: 45,
    isFeatured: true
  },
  {
    name: 'BMW X5 2024',
    brand: 'BMW',
    model: 'X5',
    year: 2024,
    price: 65000,
    description: 'The BMW X5 is a luxury SUV that delivers exceptional performance and comfort for any adventure.',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494905998402-395d579af36f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      engine: '3.0L Twin-Turbo I6',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seating: 7,
      fuelEconomy: '21/26 mpg',
      topSpeed: '155 mph',
      acceleration: '0-60 in 5.8s',
      color: 'Black',
      mileage: 0
    },
    features: ['xDrive AWD', 'Panoramic Sunroof', 'Harman Kardon Audio', 'Wireless Charging', 'Gesture Control'],
    category: 'SUV',
    status: 'available',
    isRental: true,
    rentalPrice: 120,
    isFeatured: true
  },
  {
    name: 'Mercedes-Benz C-Class 2024',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2024,
    price: 45000,
    description: 'The Mercedes-Benz C-Class sets the standard for luxury sedans with its refined interior and advanced technology.',
    images: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      engine: '2.0L Turbo 4-Cylinder',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seating: 5,
      fuelEconomy: '23/32 mpg',
      topSpeed: '149 mph',
      acceleration: '0-60 in 6.0s',
      color: 'White',
      mileage: 0
    },
    features: ['MBUX Infotainment', 'Active Brake Assist', 'Blind Spot Assist', 'LED Headlights', 'Dual-Zone Climate'],
    category: 'Sedan',
    status: 'available',
    isRental: false,
    rentalPrice: 0,
    isFeatured: true
  },
  {
    name: 'Audi A4 2024',
    brand: 'Audi',
    model: 'A4',
    year: 2024,
    price: 40000,
    description: 'The Audi A4 delivers a perfect balance of performance, luxury, and technology in a compact executive car.',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      engine: '2.0L TFSI Turbo',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seating: 5,
      fuelEconomy: '24/31 mpg',
      topSpeed: '140 mph',
      acceleration: '0-60 in 5.7s',
      color: 'Blue',
      mileage: 0
    },
    features: ['Quattro AWD', 'Virtual Cockpit', 'MMI Navigation', 'Bang & Olufsen Audio', 'Audi Pre Sense'],
    category: 'Sedan',
    status: 'available',
    isRental: true,
    rentalPrice: 80,
    isFeatured: false
  },
  {
    name: 'Honda Civic 2024',
    brand: 'Honda',
    model: 'Civic',
    year: 2024,
    price: 23000,
    description: 'The Honda Civic offers exceptional fuel economy, reliability, and value in a compact sedan.',
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
      engine: '2.0L 4-Cylinder',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seating: 5,
      fuelEconomy: '31/40 mpg',
      topSpeed: '125 mph',
      acceleration: '0-60 in 8.2s',
      color: 'Red',
      mileage: 0
    },
    features: ['Honda Sensing', 'Apple CarPlay', 'Android Auto', 'Multi-Angle Rearview Camera', 'Remote Engine Start'],
    category: 'Sedan',
    status: 'available',
    isRental: true,
    rentalPrice: 35,
    isFeatured: false
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Banner.deleteMany({});
    await Brand.deleteMany({});
    await Car.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    console.log('👤 Creating admin user...');
    await User.create(adminUser);
    console.log('✅ Admin user created');

    // Create banners
    console.log('🖼️  Creating banners...');
    await Banner.insertMany(banners);
    console.log('✅ Banners created');

    // Create brands
    console.log('🏷️  Creating brands...');
    const createdBrands = await Brand.insertMany(brands);
    console.log('✅ Brands created');

    // Create cars and update brand car counts
    console.log('🚗 Creating cars...');
    const createdCars = await Car.insertMany(cars);
    
    // Update brand car counts
    for (const brand of createdBrands) {
      const carCount = await Car.countDocuments({ brand: brand.name });
      await Brand.findByIdAndUpdate(brand._id, { carCount });
    }
    
    console.log('✅ Cars created and brand counts updated');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - 1 Admin user created`);
    console.log(`   - ${banners.length} Banners created`);
    console.log(`   - ${createdBrands.length} Brands created`);
    console.log(`   - ${createdCars.length} Cars created`);
    
    console.log('\n🔑 Admin Login Credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminUser.password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Connect and seed
connectDB().then(seedDatabase);