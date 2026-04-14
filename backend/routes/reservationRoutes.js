const express = require('express');
const router = express.Router();
const {
    createReservation,
    getMyReservations,
    getRestaurantReservations,
    updateReservationStatus
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReservation);
router.get('/myreservations', protect, getMyReservations);
router.get('/restaurant/:id', protect, getRestaurantReservations);
router.put('/:id/status', protect, updateReservationStatus);

module.exports = router;

