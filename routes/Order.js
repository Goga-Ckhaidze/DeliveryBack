// routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Create new order
router.post('/', async (req, res) => {
  const { name, phone, location, items, token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);

    if (!decoded) {
      return res.status(401).json({ message: "User isn't authenticated" });
    }

    if (!name || !phone || !location || !items || !items.length) {
      return res.status(400).json({ message: 'Missing required fields or items' });
    }

    const order = new Order({ name, phone, location, items, user_id: decoded._id });
    await order.save();

    res.status(201).json({ message: 'Order saved successfully' });
  } catch (err) {
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "User isn't authenticated" });
    }
    res.status(500).json({ message: 'Server error while saving order' });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get orders of logged user
router.post('/my-orders', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);

    if (!decoded) {
      return res.status(401).json({ message: "User isn't authenticated" });
    }

    const data = await Order.find({ user_id: decoded._id });
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "User isn't authenticated" });
    }
    res.status(500).json({ message: 'Server error fetching user orders' });
  }
});

// Delivery guy takes an order
router.patch('/:id/take', async (req, res) => {
  const orderId = req.params.id;
  const deliveryGuyID = req.body.deliveryGuyID;
  const deliveryEndTime = req.body.deliveryEndTime; // expect timestamp ms

  if (!deliveryGuyID || !deliveryEndTime) {
    return res.status(400).json({ message: 'Missing deliveryGuyID or deliveryEndTime' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'pending') {
      order.status = 'taken';
      order.takenBy = deliveryGuyID;
      order.deliveryEndTime = new Date(deliveryEndTime);
      await order.save();

      return res.json({ message: 'Order taken successfully', order });
    } else {
      return res.status(400).json({ message: 'Order already taken' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while taking order' });
  }
});

router.delete('/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  await Order.deleteOne({ _id: orderId })
  res.status(200).json({ message: 'Sucessfully Deleted'})
})

module.exports = router;
