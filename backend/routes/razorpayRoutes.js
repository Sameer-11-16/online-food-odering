const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/razorpayController');
const { protect } = require('../middleware/authMiddleware');

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/config', (req, res) => res.send(process.env.RAZORPAY_KEY_ID));

module.exports = router;
