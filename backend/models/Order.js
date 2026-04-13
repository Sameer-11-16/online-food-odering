const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        orderItems: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true },
                image: { type: String },
                price: { type: Number, required: true },
                menuItem: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'MenuItem',
                },
            },
        ],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: { type: String, required: true },
        totalPrice: { type: Number, required: true, default: 0.0 },
        isPaid: { type: Boolean, required: true, default: false },
        paidAt: { type: Date },
        status: { 
            type: String, 
            enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'], 
            default: 'Pending' 
        },
        deliveredAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
