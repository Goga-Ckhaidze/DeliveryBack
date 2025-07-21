const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
});

const CartSchema = new mongoose.Schema({
  items: [CartItemSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', CartSchema);
