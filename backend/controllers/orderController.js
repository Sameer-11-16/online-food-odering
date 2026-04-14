const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, totalPrice, restaurant } = req.body;

    console.log('Incoming Order Data:', { restaurant, itemCount: orderItems?.length, totalPrice });

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    } else if (!restaurant) {
        return res.status(400).json({ message: 'Restaurant ID is required' });
    } else {
        try {
            const order = new Order({
                user: req.user._id,
                restaurant,
                orderItems,
                shippingAddress,
                paymentMethod,
                totalPrice,
            });

            const createdOrder = await order.save();
            
            // Notify the restaurant about the new order
            const io = req.app.get('socketio');
            if (io && restaurant) {
                io.to(restaurant.toString()).emit('newOrder', createdOrder);
            }

            res.status(201).json(createdOrder);
        } catch (error) {
            console.error('Order Creation Error:', error);
            res.status(500).json({ message: error.message || 'Order creation failed' });
        }
    }
};


// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('restaurant', 'name');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('restaurant', 'name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status || order.status;
            
            if (req.body.status === 'Delivered') {
                order.deliveredAt = Date.now();
            }

            const updatedOrder = await order.save();
            
            // Emit socket event
            const io = req.app.get('socketio');
            if (io) {
                // Notify the specific user about their order status update
                io.to(order.user.toString()).emit('orderStatusUpdate', updatedOrder);
                // Also notify the restaurant dashboard
                io.to(order.restaurant.toString()).emit('restaurantOrderUpdate', updatedOrder);
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders for a restaurant (Admin)
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private/Admin
const getRestaurantOrders = async (req, res) => {
    try {
        const orders = await Order.find({ restaurant: req.params.restaurantId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    getMyOrders,
    updateOrderStatus,
    getRestaurantOrders,
};
