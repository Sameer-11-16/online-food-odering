const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();

// Set up Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'food_ordering_system',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
    if (req.file && req.file.path) {
        // Cloudinary returns the full URL in req.file.path
        res.send(req.file.path);
    } else {
        res.status(400).send({ message: 'No file uploaded' });
    }
});

module.exports = router;
