const express = require('express');
const path = require('path');
const fs = require('fs');
const { 
  uploadMultiple, 
  uploadSingle, 
  uploadCars, 
  uploadBrands, 
  uploadBanners, 
  uploadRentals 
} = require('../middleware/upload');

const router = express.Router();

// Helper function to get upload middleware based on type
const getUploadMiddleware = (type) => {
  switch (type) {
    case 'brands':
      return { single: uploadBrands.single('image'), multiple: uploadBrands.array('images', 10) };
    case 'banners':
      return { single: uploadBanners.single('image'), multiple: uploadBanners.array('images', 10) };
    case 'rentals':
      return { single: uploadRentals.single('image'), multiple: uploadRentals.array('images', 10) };
    case 'cars':
    default:
      return { single: uploadCars.single('image'), multiple: uploadCars.array('images', 10) };
  }
};

// Test route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Upload API is working',
    endpoints: {
      single: 'POST /api/upload/single?type=cars|brands|banners|rentals',
      multiple: 'POST /api/upload/multiple?type=cars|brands|banners|rentals',
      delete: 'DELETE /api/upload/:type/:filename',
      info: 'GET /api/upload/info/:type/:filename'
    }
  });
});

// Upload single image
router.post('/single', (req, res) => {
  const type = req.query.type || 'cars';
  const uploadMiddleware = getUploadMiddleware(type);
  
  uploadMiddleware.single(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/${type}/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: imageUrl,
        size: req.file.size,
        type: type
      }
    });
  });
});

// Upload multiple images
router.post('/multiple', (req, res) => {
  const type = req.query.type || 'cars';
  const uploadMiddleware = getUploadMiddleware(type);
  
  uploadMiddleware.multiple(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const images = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/${type}/${file.filename}`,
      size: file.size
    }));

    res.status(200).json({
      success: true,
      message: `${req.files.length} images uploaded successfully`,
      data: images,
      type: type
    });
  });
});

// Delete image
router.delete('/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', type, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: {
        filename: filename,
        type: type
      }
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

// Backward compatibility - delete from cars folder
router.delete('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/cars', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image'
    });
  }
});

// Get image info
router.get('/info/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', type, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const stats = fs.statSync(filePath);
    
    res.status(200).json({
      success: true,
      data: {
        filename,
        url: `/uploads/${type}/${filename}`,
        size: stats.size,
        type: type,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      }
    });
  } catch (error) {
    console.error('Error getting image info:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting image info'
    });
  }
});

// Backward compatibility - get info from cars folder
router.get('/info/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/cars', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const stats = fs.statSync(filePath);
    
    res.status(200).json({
      success: true,
      data: {
        filename,
        url: `/uploads/cars/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      }
    });
  } catch (error) {
    console.error('Error getting image info:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting image info'
    });
  }
});

module.exports = router;