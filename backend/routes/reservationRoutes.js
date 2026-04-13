const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, async (req, res) => {
    try {
        const { restaurant, date, time, guests, specialRequests } = req.body;
        
        const reservation = new Reservation({
            user: req.user._id,
            restaurant,
            date,
            time,
            guests,
            specialRequests
        });

        const createdReservation = await reservation.save();
        
        // Notify restaurant owner
        const io = req.app.get('socketio');
        if (io) {
            io.to(restaurant.toString()).emit('newReservation', createdReservation);
        }

        res.status(201).json(createdReservation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/myreservations', protect, async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user._id }).populate('restaurant', 'name');
        res.json(reservations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/restaurant/:id', protect, async (req, res) => {
    try {
        const reservations = await Reservation.find({ restaurant: req.params.id }).populate('user', 'name phone').sort({ date: 1, time: 1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id/status', protect, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            reservation.status = req.body.status;
            const updated = await reservation.save();
            
            // Notify customer
            const io = req.app.get('socketio');
            if (io) {
                io.to(updated.user.toString()).emit('reservationStatusUpdate', updated);
            }

            res.json(updated);
        } else {
            res.status(404).json({ message: 'Reservation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
