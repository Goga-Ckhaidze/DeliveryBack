const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db')();
const connection = require('./db');
const userRouters = require('./routes/users');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/Order');

connection()

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRouters);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));