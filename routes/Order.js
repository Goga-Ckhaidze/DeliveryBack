const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const products = require('../data/product'); // Static trusted product list

// Helper to extract token
function getToken(req) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.body.token) return req.body.token;
  return null;
}

// POST new order - validate items and price from static products
router.post('/', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "User isn't authenticated" });

  const { name, phone, location, items } = req.body;
  if (!name || !phone || !location || !items?.length) {
    return res.status(400).json({ message: 'Missing required fields or items' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    if (!decoded) return res.status(401).json({ message: "User isn't authenticated" });

    // Validate and rebuild items using static product data
    const validatedItems = items.map(clientItem => {
      const product = products.find(p => p.title === clientItem.title);
      if (!product) throw new Error(`Invalid product: ${clientItem.title}`);

      return {
        title: product.title,
        price: product.price, // trust only backend product price
        image: product.image,
        quantity: clientItem.quantity > 0 ? clientItem.quantity : 1,
      };
    });

    const totalPrice = validatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = new Order({
      name,
      phone,
      location,
      items: validatedItems,
      totalPrice,
      user_id: decoded._id,
    });

    await order.save();
    res.status(201).json({ message: 'Order saved successfully', order });
  } catch (err) {
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "User isn't authenticated" });
    }
    res.status(400).json({ message: err.message || 'Failed to save order' });
  }
});

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// POST my orders (user only)
router.post('/my-orders', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    const userId = decoded._id;

    const userOrders = await Order.find({ user_id: userId });

    res.json(userOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// PATCH take order (delivery guy)
router.patch('/:id/take', async (req, res) => {
  const { id: orderId } = req.params;
  const { deliveryGuyID, deliveryEndTime } = req.body;

  if (!deliveryGuyID || !deliveryEndTime) {
    return res.status(400).json({ message: 'Missing deliveryGuyID or deliveryEndTime' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order already taken' });
    }

    order.status = 'taken';
    order.takenBy = deliveryGuyID;
    order.deliveryEndTime = new Date(deliveryEndTime);

    await order.save();

    res.json({ message: 'Order taken successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while taking order' });
  }
});

// PATCH mark order delivered (user only)
router.patch('/:id/mark-delivered', async (req, res) => {
  const { id: orderId } = req.params;
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
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE order by user
router.delete('/:id', async (req, res) => {
  const { id: orderId } = req.params;
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
