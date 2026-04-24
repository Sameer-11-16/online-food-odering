const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    getMyOrders,
    updateOrderStatus,
    getRestaurantOrders,
    getOrders,
    verifyUpiPayment,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, updateOrderStatus);
router.route('/:id/verify-upi').put(protect, verifyUpiPayment);
router.route('/restaurant/:restaurantId').get(protect, getRestaurantOrders);

module.exports = router;

