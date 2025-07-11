const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  location: {
    lat: Number,
    lng: Number
  },
  items: Array,
  status: {
    type: String,
    enum: ['pending', 'taken', 'delivered'],
    default: 'pending'
  },
  takenBy: {
    type: String, // delivery guy's ID or email
    default: null
  },
  // Remove or keep deliveryTime if you want, but now store deliveryEndTime
  deliveryTime: {
    type: String,
    default: null
  },

  deliveryEndTime: {
    type: Date,
    default: null
  },

  user_id: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
