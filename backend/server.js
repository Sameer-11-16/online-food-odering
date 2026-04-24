const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const razorpayRoutes = require('./routes/razorpayRoutes');

const http = require('http');
const { Server } = require('socket.io');




connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Make io accessible in routes
app.set('socketio', io);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/users', require('./routes/userRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

io.on('connection', (socket) => {
    socket.on('join', (room) => {
        socket.join(room);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
