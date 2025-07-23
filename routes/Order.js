const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Helper to extract token from Authorization header or request body (for flexibility)
function getToken(req) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.body.token) {
    return req.body.token;
  }
  return null;
}

// POST new order
router.post('/', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "User isn't authenticated" });

  const { name, phone, location, items } = req.body;

  console.log(token);
  console.log(req.body)
  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    if (!decoded) return res.status(401).json({ message: "User isn't authenticated" });

    if (!name || !phone || !location || !items || !items.length) {
      return res.status(400).json({ message: 'Missing required fields or items' });
    }

    // Calculate total price from client data (optional: you may want to validate server-side)
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = new Order({
      name,
      phone,
      location,
      items,
      totalPrice,
      user_id: decoded._id,
    });

    await order.save();

    res.status(201).json({ message: 'Order saved successfully', order });
console.log(decoded);
console.log(order)
  } catch (err) {
    
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "User isn't authenticated" });
    }
    res.status(500).json({ message: 'Server error while saving order' });
    
  }
});

// GET all orders (admin or general)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// POST user orders by token
router.post('/my-orders', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "User isn't authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
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

// PATCH take order (delivery guy)
router.patch('/:id/take', async (req, res) => {
  const orderId = req.params.id;
  const { deliveryGuyID, deliveryEndTime } = req.body;

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

// PATCH mark order delivered by user
router.patch('/:id/mark-delivered', async (req, res) => {
  const orderId = req.params.id;
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "User isn't authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user_id.toString() !== decoded._id) {
      return res.status(403).json({ message: "You can't update this order" });
    }

    if (order.status !== 'taken') {
      return res.status(400).json({ message: "Order can't be marked delivered now" });
    }

    order.status = 'delivered';
    await order.save();

    res.json({ message: 'Order marked as delivered', order });
  } catch (err) {
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "User isn't authenticated" });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE order by user
router.delete('/:id', async (req, res) => {
  const orderId = req.params.id;
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    const userId = decoded._id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user_id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: Not your order' });
    }

    await Order.deleteOne({ _id: orderId });
    res.status(200).json({ message: 'Successfully Deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Token error or failed to delete order' });
  }
});

module.exports = router;
