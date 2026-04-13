const express = require('express');
const router = express.Router();
const { registerUser, authUser, sendOTP } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/send-otp', sendOTP);

module.exports = router;
