const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// GET /api/cart/:id
router.get('/:id', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// POST /api/cart
router.post('/', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid items' });
    }
    const newCart = new Cart({ items });
    const savedCart = await newCart.save();
    res.status(201).json(savedCart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create cart' });
  }
});

// PUT /api/cart/:id
router.put('/:id', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid items' });
    }
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      { items, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedCart) return res.status(404).json({ message: 'Cart not found' });
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

module.exports = router;
