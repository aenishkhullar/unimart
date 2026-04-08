import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  type: {
    type: String,
    enum: ['buy', 'rent'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  rentDuration: {
    type: Number,
  },
  rentTotal: {
    type: Number,
  },
  deposit: {
    type: Number,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  rentStartDate: {
    type: Date,
  },
  rentEndDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
