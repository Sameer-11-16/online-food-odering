// @desc    Upload an image
// @route   POST /api/upload
// @access  Public (or Private if middleware added)
const uploadImage = (req, res) => {
    if (req.file && req.file.path) {
        // Cloudinary returns the full URL in req.file.path
        res.send(req.file.path);
    } else {
        res.status(400).send({ message: 'No file uploaded' });
    }
};

module.exports = {
    uploadImage
};
