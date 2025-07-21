const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  location: {
    lat: Number,
    lng: Number
  },
items: [
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }  // price per unit at order time
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
  // Remove or keep deliveryTime if you want, but now store deliveryEndTime
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
