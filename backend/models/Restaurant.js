const mongoose = require('mongoose');

const restaurantSchema = mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        description: { type: String },
        imageUrl: { type: String },
        address: { type: String, required: true },
        rating: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
