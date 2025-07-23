const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  items: [
    {
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      image: { type: String }
    }
  ],
  status: {
    type: String,
    enum: ['pending', 'taken', 'delivered'],
    default: 'pending'
  },
  takenBy: {
    type: String, // delivery guy's ID or email
    default: null
  },
  deliveryTime: {
    type: String,
    default: null
  },
  deliveryEndTime: {
    type: Date,
    default: null
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  user_id: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
