const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Order.deleteMany();
        await MenuItem.deleteMany();
        await Restaurant.deleteMany();
        await User.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const createdUsers = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
            },
            {
                name: 'Restaurant Owner 1',
                email: 'owner1@example.com',
                password: hashedPassword,
                role: 'restaurant_owner',
            },
            {
                name: 'Restaurant Owner 2',
                email: 'owner2@example.com',
                password: hashedPassword,
                role: 'restaurant_owner',
            }
        ]);

        const owner1 = createdUsers[1]._id;
        const owner2 = createdUsers[2]._id;

        const createdRestaurants = await Restaurant.insertMany([
            {
                owner: owner1,
                name: 'Gourmet Kitchen',
                description: 'Authentic Italian cuisine crafted with love and passion.',
                imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3',
                address: '123 Main St, NY',
                rating: 4.8,
                numReviews: 12
            },
            {
                owner: owner2,
                name: 'Tokyo Bites',
                description: 'Fresh sushi and authentic ramen bowls.',
                imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3',
                address: '456 Sushi Ave, NY',
                rating: 4.9,
                numReviews: 24
            },
            {
                owner: owner1,
                name: 'Burger Joint',
                description: 'Classic American smash burgers and fries.',
                imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3',
                address: '789 Burger Blvd, NY',
                rating: 4.5,
                numReviews: 8
            }
        ]);

        const rest1 = createdRestaurants[0]._id;
        const rest2 = createdRestaurants[1]._id;

        await MenuItem.insertMany([
            { restaurant: rest1, name: 'Margherita Pizza', description: 'Classic tomato, fresh mozzarella, and aromatic basil.', price: 14.99, category: 'Pizza' },
            { restaurant: rest1, name: 'Truffle Pasta', description: 'Handmade fettuccine enveloped in rich black truffle cream.', price: 19.50, category: 'Pasta' },
            { restaurant: rest1, name: 'Tiramisu', description: 'Traditional coffee-flavored Italian dessert.', price: 8.00, category: 'Dessert' },
            { restaurant: rest1, name: 'Garlic Bread', description: 'Toasted ciabatta with slow-roasted garlic herb butter.', price: 5.50, category: 'Starter' },
            
            { restaurant: rest2, name: 'Spicy Tuna Roll', description: 'Fresh tuna with spicy mayo and cucumber.', price: 12.99, category: 'Sushi' },
            { restaurant: rest2, name: 'Tonkotsu Ramen', description: 'Rich pork broth with noodles, egg, and chashu.', price: 16.50, category: 'Ramen' },
            { restaurant: rest2, name: 'Miso Soup', description: 'Warm miso broth with tofu and seaweed.', price: 4.00, category: 'Appetizer' }
        ]);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
