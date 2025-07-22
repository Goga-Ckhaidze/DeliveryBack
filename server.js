const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db')(); // your db connection file
const connection = require('./db');
const userRouters = require('./routes/users');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/Order');  // note: check your folder name spelling (orders vs Order)
const cartRoutes = require('./routes/cart');

connection();

const app = express();
const PORT = process.env.PORT || 5000;
app.options('*', cors(corsOptions));  // enable pre-flight across-the-board

const corsOptions = {
  origin: 'https://delivery-x5b9.vercel.app', // your frontend URL
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // allow cookies and auth headers
  optionsSuccessStatus: 200
};

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
