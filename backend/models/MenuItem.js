const mongoose = require('mongoose');

const menuItemSchema = mongoose.Schema(
    {
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        imageUrl: { type: String },
        category: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
