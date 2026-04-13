const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @desc    Fetch all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({});
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (restaurant) {
            res.json(restaurant);
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch menu for a restaurant
// @route   GET /api/restaurants/:id/menu
// @access  Public
const getRestaurantMenu = async (req, res) => {
    try {
        const menu = await MenuItem.find({ restaurant: req.params.id });
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private/RestaurantOwner
const createRestaurant = async (req, res) => {
    const { name, description, imageUrl, address } = req.body;

    try {
        const restaurant = new Restaurant({
            owner: req.user._id,
            name,
            description,
            imageUrl,
            address,
        });

        const createdRestaurant = await restaurant.save();
        res.status(201).json(createdRestaurant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a menu item
// @route   DELETE /api/restaurants/:id/menu/:menuId
// @access  Private/RestaurantOwner
const deleteMenuItem = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (restaurant && restaurant.owner.toString() === req.user._id.toString()) {
            await MenuItem.findByIdAndDelete(req.params.menuId);
            res.json({ message: 'Menu item removed' });
        } else {
            res.status(401).json({ message: 'Not authorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a menu item
// @route   POST /api/restaurants/:id/menu
// @access  Private/RestaurantOwner
const createMenuItem = async (req, res) => {
    const { name, description, price, imageUrl, category } = req.body;

    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (restaurant && restaurant.owner.toString() === req.user._id.toString()) {
            const menuItem = new MenuItem({
                restaurant: restaurant._id,
                name,
                description,
                price,
                imageUrl,
                category,
            });

            const createdMenuItem = await menuItem.save();
            res.status(201).json(createdMenuItem);
        } else {
            res.status(401).json({ message: 'Not authorized to add menu to this restaurant' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/RestaurantOwner
const updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (restaurant && restaurant.owner.toString() === req.user._id.toString()) {
            restaurant.name = req.body.name || restaurant.name;
            restaurant.description = req.body.description || restaurant.description;
            restaurant.imageUrl = req.body.imageUrl || restaurant.imageUrl;
            restaurant.address = req.body.address || restaurant.address;

            const updatedRestaurant = await restaurant.save();
            res.json(updatedRestaurant);
        } else {
            res.status(401).json({ message: 'Not authorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRestaurants,
    getRestaurantById,
    getRestaurantMenu,
    createRestaurant,
    createMenuItem,
    deleteMenuItem,
    updateRestaurant,
};
