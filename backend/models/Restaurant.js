const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const restaurantSchema = mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        description: { type: String },
        imageUrl: { type: String },
        address: { type: String, required: true },
        reviews: [reviewSchema],
        rating: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
        upiId: { type: String, default: '' },
        location: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
        },

    },
    { timestamps: true }

);

module.exports = mongoose.model('Restaurant', restaurantSchema);

