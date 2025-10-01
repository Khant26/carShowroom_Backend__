const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads');
const carsUploadDir = path.join(uploadDir, 'cars');
const brandsUploadDir = path.join(uploadDir, 'brands');
const bannersUploadDir = path.join(uploadDir, 'banners');
const rentalsUploadDir = path.join(uploadDir, 'rentals');

// Create all upload directories
[uploadDir, carsUploadDir, brandsUploadDir, bannersUploadDir, rentalsUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Dynamic storage configuration
const createStorage = (uploadType = 'cars') => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const typeDir = path.join(uploadDir, uploadType);
      cb(null, typeDir);
    },
    filename: function (req, file, cb) {
      // Generate unique filename with type prefix
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const prefix = uploadType.slice(0, -1); // Remove 's' from end (cars -> car, brands -> brand)
      cb(null, prefix + '-' + uniqueSuffix + ext);
    }
  });
};

// File filter
const fileFilter = (req, file, cb) => {
  // Check if the file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create upload instances for different types
const createUpload = (uploadType = 'cars') => {
  return multer({
    storage: createStorage(uploadType),
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  });
};

// Default car upload (for backward compatibility)
const upload = createUpload('cars');
const uploadSingle = upload.single('image');
const uploadMultiple = upload.array('images', 10);

// Specific upload instances
const uploadCars = createUpload('cars');
const uploadBrands = createUpload('brands');
const uploadBanners = createUpload('banners');
const uploadRentals = createUpload('rentals');

module.exports = {
  uploadSingle,
  uploadMultiple,
  upload,
  uploadCars,
  uploadBrands,
  uploadBanners,
  uploadRentals,
  createUpload
};