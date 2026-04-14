const User = require('../models/User');

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

module.exports = {
    getUsers,
    updateUserProfile
};
