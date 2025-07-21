// backend/routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const jwt = require('jsonwebtoken');

// Dummy middleware to get user from token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'your-secret'); // change this to your real JWT secret
    req.user = decoded;
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

// GET /api/cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) cart = await Cart.create({ user_id: req.user.id, items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// POST /api/cart
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: 'Invalid items' });

    const cart = await Cart.findOneAndUpdate(
      { user_id: req.user.id },
      { items, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to sync cart' });
  }
});

module.exports = router;
