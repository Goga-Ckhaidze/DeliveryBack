// routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/cart'); // Your Cart model

// Create new cart
router.post('/', async (req, res) => {
  try {
    const newCart = new Cart({
      items: req.body.items || [],
    });

    const savedCart = await newCart.save();
    res.status(201).json(savedCart);
  } catch (error) {
    console.error("Error creating cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get cart by ID
router.get('/:id', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(cart);
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update cart by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      { items: req.body.items },
      { new: true }
    );
    if (!updatedCart) return res.status(404).json({ message: "Cart not found" });
    res.json(updatedCart);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
