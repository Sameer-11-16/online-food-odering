const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User',
    },
    guestName: {
        type: String,
        required: function() { return !this.user; }
    },
    guestPhone: {
        type: String,
        required: function() { return !this.user; }
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Restaurant',
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true,
    },
    time: {
        type: String, // HH:MM
        required: true,
    },
    guests: {
        type: Number,
        required: true,
        min: 1,
    },
    specialRequests: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending',
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Reservation', reservationSchema);
