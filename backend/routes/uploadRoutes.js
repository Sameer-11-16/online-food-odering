const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { uploadImage } = require('../controllers/uploadController');
const router = express.Router();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'food_ordering_system',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

router.post('/', upload.single('image'), uploadImage);

module.exports = router;

