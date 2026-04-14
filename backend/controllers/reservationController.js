const Reservation = require('../models/Reservation');

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = async (req, res) => {
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
};

// @desc    Get logged in user reservations
// @route   GET /api/reservations/myreservations
// @access  Private
const getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user._id }).populate('restaurant', 'name');
        res.json(reservations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get restaurant reservations
// @route   GET /api/reservations/restaurant/:id
// @access  Private
const getRestaurantReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ restaurant: req.params.id }).populate('user', 'name phone').sort({ date: 1, time: 1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private
const updateReservationStatus = async (req, res) => {
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
};

module.exports = {
    createReservation,
    getMyReservations,
    getRestaurantReservations,
    updateReservationStatus
};
