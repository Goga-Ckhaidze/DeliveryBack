const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db')();

const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/Order');
const cartRoutes = require('./routes/cart');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);  // <-- THIS IS CORRECT!

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
