const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db')();
const connection = require('./db');
const userRouters = require('./routes/users');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/Order');
const cartRoutes = require('./routes/cart');

connection();

const app = express();
const PORT = process.env.PORT || 5000;

// Declare corsOptions first
const corsOptions = {
  origin: 'https://delivery-x5b9.vercel.app',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Use options before routes
app.options('*', cors(corsOptions));  // enable pre-flight across-the-board

// Use cors middleware with options
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/users', userRouters);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
