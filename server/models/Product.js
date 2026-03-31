import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a product title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a product price'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
    },
    type: {
      type: String,
      required: [true, 'Please select if this is for sell or rent'],
      enum: ['sell', 'rent'],
    },
    rentDuration: {
      type: String,
      default: null,
    },
    deposit: {
      type: Number,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
