const express = require('express');
const router = express.Router();
const { getUsers, updateUserProfile, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUsers);
router.put('/profile', protect, updateUserProfile);
router.delete('/:id', protect, deleteUser);

module.exports = router;


