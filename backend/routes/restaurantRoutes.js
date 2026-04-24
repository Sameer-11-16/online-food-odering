const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/restaurantController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getRestaurants).post(protect, createRestaurant);
router.route('/:id/reviews').post(protect, createRestaurantReview);
router.route('/:id').get(getRestaurantById).put(protect, updateRestaurant);

router.route('/:id/menu').get(getRestaurantMenu).post(protect, createMenuItem);
router.route('/:id/menu/:menuId').delete(protect, deleteMenuItem).put(protect, updateMenuItem);

router.route('/:id/menu/:menuId/reviews').post(protect, createMenuItemReview);


module.exports = router;
