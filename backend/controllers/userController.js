const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized as an admin' });
    }
    const users = await User.find({}).select('-password');
    res.json(users);
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, phone } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { name, phone } },
            { new: true, runValidators: true }
        ).select('-password');

        if (updatedUser) {
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                token: req.token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('SECURE_UPDATE_ERROR:', error);
        res.status(500).json({ message: error.message || 'Update error' });
    }
};

// @desc    Get user activity (reviews, etc.)
// @route   GET /api/users/activity
// @access  Private
const getUserActivity = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find delivered orders to identify pending reviews
        const deliveredOrders = await Order.find({ user: userId, status: 'Delivered' }).populate('restaurant', 'name imageUrl reviews');
        
        const pendingReviews = deliveredOrders.filter(order => {
            if (!order.restaurant) return false;
            const hasReviewed = order.restaurant.reviews.some(rev => rev.user.toString() === userId.toString());
            return !hasReviewed;
        }).map(order => ({
            _id: order._id,
            targetId: order.restaurant._id,
            targetName: order.restaurant.name,
            image: order.restaurant.imageUrl,
            purchasedAt: order.createdAt,
            deliveredAt: order.deliveredAt
        }));

        // Find restaurant reviews (already done)
        const restaurants = await Restaurant.find({ "reviews.user": userId });
        const restaurantReviews = restaurants.flatMap(r => 
            r.reviews
                .filter(rev => rev.user.toString() === userId.toString())
                .map(rev => ({ 
                    ...rev.toObject(), 
                    type: 'Restaurant', 
                    targetName: r.name, 
                    targetId: r._id,
                    image: r.imageUrl
                }))
        );

        // Find menu item reviews (already done)
        const menuItems = await MenuItem.find({ "reviews.user": userId });
        const itemReviews = menuItems.flatMap(m => 
            m.reviews
                .filter(rev => rev.user.toString() === userId.toString())
                .map(rev => ({ 
                    ...rev.toObject(), 
                    type: 'Food Item', 
                    targetName: m.name, 
                    targetId: m._id,
                    image: m.imageUrl
                }))
        );

        const allReviews = [...restaurantReviews, ...itemReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            pendingReviews,
            reviews: allReviews,
            count: allReviews.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    updateUserProfile,
    deleteUser,
    getUserActivity
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
async function deleteUser(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized as an admin' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin user' });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

