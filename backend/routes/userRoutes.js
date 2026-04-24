const express = require('express');
const router = express.Router();
const { getUsers, updateUserProfile, deleteUser, getUserActivity } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUsers);
router.get('/activity', protect, getUserActivity);
router.put('/profile', protect, updateUserProfile);
router.delete('/:id', protect, deleteUser);

module.exports = router;


