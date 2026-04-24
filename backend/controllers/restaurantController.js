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

// @desc    Search food items globally
// @route   GET /api/restaurants/search/food?q=...
// @access  Public
const searchFood = async (req, res) => {
    try {
        const keyword = req.query.q ? {
            name: {
                $regex: req.query.q,
                $options: 'i',
            },
        } : {};

        const items = await MenuItem.find({ ...keyword }).populate('restaurant', 'name imageUrl rating address location');
        
        if (items.length === 0) {
            return res.status(404).json({ message: 'Food item not found' });
        }
        res.json(items);
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
    const { name, description, imageUrl, address, location } = req.body;

    try {
        const restaurant = new Restaurant({
            owner: req.user._id,
            name,
            description,
            imageUrl,
            address,
            location
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
    const { name, description, price, imageUrl, category, foodType } = req.body;

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
                foodType,
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
            restaurant.upiId = req.body.upiId !== undefined ? req.body.upiId : restaurant.upiId;
            if (req.body.location) {
                restaurant.location = {
                    lat: req.body.location.lat ?? restaurant.location?.lat,
                    lng: req.body.location.lng ?? restaurant.location?.lng,
                };
            }


            const updatedRestaurant = await restaurant.save();

            res.json(updatedRestaurant);
        } else {
            res.status(401).json({ message: 'Not authorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Create new review
// @route   POST /api/restaurants/:id/reviews
// @access  Private
const createRestaurantReview = async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (restaurant) {
            const alreadyReviewed = restaurant.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Restaurant already reviewed' });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            restaurant.reviews.push(review);

            restaurant.numReviews = restaurant.reviews.length;

            restaurant.rating =
                restaurant.reviews.reduce((acc, item) => item.rating + acc, 0) /
                restaurant.reviews.length;

            await restaurant.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new menu item review
// @route   POST /api/restaurants/:id/menu/:menuId/reviews
// @access  Private
const createMenuItemReview = async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const menuItem = await MenuItem.findById(req.params.menuId);

        if (menuItem) {
            const alreadyReviewed = menuItem.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Menu item already reviewed' });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            menuItem.reviews.push(review);

            menuItem.numReviews = menuItem.reviews.length;

            menuItem.rating =
                menuItem.reviews.reduce((acc, item) => item.rating + acc, 0) /
                menuItem.reviews.length;

            await menuItem.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a menu item
// @route   PUT /api/restaurants/:id/menu/:menuId
// @access  Private/RestaurantOwner
const updateMenuItem = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (restaurant && restaurant.owner.toString() === req.user._id.toString()) {
            const menuItem = await MenuItem.findById(req.params.menuId);
            if (menuItem) {
                menuItem.name = req.body.name || menuItem.name;
                menuItem.description = req.body.description || menuItem.description;
                menuItem.price = req.body.price || menuItem.price;
                menuItem.imageUrl = req.body.imageUrl || menuItem.imageUrl;
                menuItem.category = req.body.category || menuItem.category;
                menuItem.foodType = req.body.foodType || menuItem.foodType;

                const updatedMenuItem = await menuItem.save();
                res.json(updatedMenuItem);
            } else {
                res.status(404).json({ message: 'Menu item not found' });
            }
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
    updateMenuItem,
    createRestaurantReview,
    createMenuItemReview,
    searchFood
};
