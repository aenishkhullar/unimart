import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { createNotification } from './notificationController.js';

// Reusable population configuration for Orders
const orderPopulate = [
  {
    path: 'product',
    select: 'title price category type image',
    populate: {
      path: 'user',
      select: 'name email',
    },
  },
  {
    path: 'user',
    select: 'name email',
  },
];

// Helper to handle null products (safely handle deleted products)
const mapSafeOrders = (orders) => {
  return orders.map((order) => ({
    ...order,
    product: order.product || {
      title: 'Product Unavailable',
      price: 0,
      category: 'N/A',
      type: 'buy',
      image: null,
    },
  }));
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { productId, rentStartDate, rentEndDate, licenseNumber } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required',
      });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Block "sell" for Transport category
    if (product.category === 'Transport' && product.type === 'sell') {
      return res.status(400).json({
        success: false,
        message: 'Transport items can only be rented, not sold.',
      });
    }

    // Require licenseNumber for Transport category orders
    if (product.category === 'Transport') {
      if (!licenseNumber || !licenseNumber.trim()) {
        return res.status(400).json({
          success: false,
          message: 'A valid driving license number is required for renting Transport items.',
        });
      }
    }

    // Determine type from the product (sell → buy, rent → rent)
    const type = product.type === 'sell' ? 'buy' : 'rent';

    // Build order data
    const orderData = {
      user: req.user._id,
      product: product._id,
      type,
      price: product.type === 'sell' ? product.price : product.rentPrice,
    };

    // Attach license number for Transport category
    if (product.category === 'Transport' && licenseNumber) {
      orderData.licenseNumber = licenseNumber.trim();
    }

    // Calculation logic based on product type
    if (type === 'rent') {
      if (!rentStartDate || !rentEndDate) {
        return res.status(400).json({
          success: false,
          message: 'Rent start and end dates are required',
        });
      }

      const start = new Date(rentStartDate);
      const end = new Date(rentEndDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Validate inputs
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid rent dates provided',
        });
      }

      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'Rent end date must be after start date',
        });
      }

      if (start < today) {
        return res.status(400).json({
          success: false,
          message: 'Rent start date cannot be in the past',
        });
      }

      // Check for overlapping bookings: existingS < newE AND newS < existingE
      const overlappingOrder = await Order.findOne({
        product: product._id,
        type: 'rent',
        status: { $ne: 'cancelled' },
        rentStartDate: { $lt: end },
        rentEndDate: { $gt: start },
      });

      if (overlappingOrder) {
        return res.status(400).json({
          success: false,
          message: 'Product already rented for selected dates',
        });
      }

      // Calculate rent duration in days
      const diffTime = Math.abs(end - start);
      const rentDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Pricing logic for Rent
      const rentTotal = (product.rentPrice || 0) * rentDays;
      const deposit = product.deposit || 0;
      
      orderData.rentDuration = rentDays;
      orderData.rentTotal = rentTotal;
      orderData.deposit = deposit;
      orderData.totalAmount = rentTotal + deposit;
      orderData.rentStartDate = start;
      orderData.rentEndDate = end;
    } else {
      // Pricing logic for Sell
      orderData.totalAmount = product.price;
    }

    const order = await Order.create(orderData);

    await createNotification(
      product.user,
      `New order request for ${product.title}`,
      'order',
      '/seller-dashboard'
    );

    // Fetch fully populated order for response
    const populatedOrder = await Order.findById(order._id)
      .populate(orderPopulate)
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder,
    });
  } catch (error) {
    console.error('Error in createOrder:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating order',
    });
  }
};

// @desc    Get all orders for the logged-in user
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate(orderPopulate)
      .sort({ createdAt: -1 })
      .lean();

    const safeOrders = mapSafeOrders(orders);

    // Optimized review check: fetch all reviews for these products by this user
    const productIds = safeOrders.map(o => o.product?._id).filter(Boolean);
    const reviews = await Review.find({
      user: req.user._id,
      product: { $in: productIds }
    });

    // Create a map: productId -> review
    const reviewMap = {};
    reviews.forEach(r => {
      reviewMap[r.product.toString()] = r;
    });

    const ordersWithReviewFlag = safeOrders.map(order => {
      const productId = order.product?._id?.toString();
      const review = productId ? reviewMap[productId] : null;
      return {
        ...order,
        isReviewed: !!review,
        review: review || null
      };
    });

    return res.status(200).json({
      success: true,
      count: ordersWithReviewFlag.length,
      orders: ordersWithReviewFlag,
    });
  } catch (error) {
    console.error('Error in getMyOrders:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided',
      });
    }

    // Find order and populate product to check ownership
    const order = await Order.findById(id).populate('product');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify ownership: only the product owner (seller) can update status
    if (order.product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order status',
      });
    }

    // Transition logic:
    // pending -> confirmed
    // pending -> cancelled
    // confirmed -> completed
    // confirmed -> cancelled
    // no change from completed or cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
        return res.status(400).json({
            success: false,
            message: `Cannot change status from ${order.status}`,
        });
    }

    if (order.status === 'pending') {
        if (status !== 'confirmed' && status !== 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Pending orders can only be confirmed or cancelled',
            });
        }
    } else if (order.status === 'confirmed') {
        if (status !== 'completed' && status !== 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Confirmed orders can only be completed or cancelled',
            });
        }

        // Enforce license verification for Transport category before completion
        if (status === 'completed' && order.product.category === 'Transport' && !order.isLicenseVerified) {
            return res.status(400).json({
                success: false,
                message: 'License must be verified before completing order',
            });
        }
    }

    order.status = status;
    await order.save();

    let notificationText = '';
    if (status === 'confirmed') {
      notificationText = `Your order for ${order.product.title} has been confirmed.`;
    } else if (status === 'completed') {
      notificationText = `Your order for ${order.product.title} has been completed.`;
    } else if (status === 'cancelled') {
      notificationText = `Your order for ${order.product.title} was cancelled.`;
    }

    if (notificationText) {
      await createNotification(
        order.user,
        notificationText,
        'order',
        '/my-orders'
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated',
      order,
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating order status',
    });
  }
};

// @desc    Get all orders for a specific product (for seller view)
// @route   GET /api/orders/product/:productId
// @access  Private
export const getProductOrders = async (req, res) => {
    try {
      const { productId } = req.params;
  
      // Find the product first to check ownership
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
  
      // Only the product owner (seller) can see the orders for their product
      if (product.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view orders for this product',
        });
      }
  
      const orders = await Order.find({ product: productId, status: 'pending' })
        .populate(orderPopulate)
        .sort({ createdAt: -1 })
        .lean();

      const safeOrders = mapSafeOrders(orders);
  
      return res.status(200).json({
        success: true,
        count: safeOrders.length,
        orders: safeOrders,
      });
    } catch (error) {
      console.error('Error in getProductOrders:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching product orders',
      });
    }
  };

// @desc    Get all orders for products owned by the logged-in seller
// @route   GET /api/orders/seller-orders
// @access  Private
export const getSellerOrders = async (req, res) => {
  try {
    // 1. Find all products owned by the logged-in seller
    const products = await Product.find({ user: req.user._id }).select('_id');
    
    // 2. Handle edge case: If no products, return empty orders early
    if (!products || products.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        orders: [],
      });
    }

    const productIds = products.map((p) => p._id);

    // 3. Find all orders for these products
    const orders = await Order.find({ product: { $in: productIds } })
      .populate(orderPopulate)
      .sort({ createdAt: -1 })
      .lean();

    const safeOrders = mapSafeOrders(orders);

    let totalEarnings = 0;
    safeOrders.forEach(order => {
        if (order.status === 'completed') {
            if (order.type === 'buy' || order.type === 'sell') {
                totalEarnings += order.price || 0;
            } else if (order.type === 'rent') {
                totalEarnings += order.rentTotal || 0;
            }
        }
    });

    return res.status(200).json({
      success: true,
      count: safeOrders.length,
      orders: safeOrders,
      totalEarnings,
    });
  } catch (error) {
    console.error('Error in getSellerOrders:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching seller orders',
    });
  }
};

// @desc    Verify a buyer's license for a Transport order
// @route   PUT /api/orders/:id/verify-license
// @access  Private (Seller only)
export const verifyLicense = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('product');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Only the product owner (seller) can verify license
    if (order.product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this license',
      });
    }

    if (!order.licenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'No license number associated with this order',
      });
    }

    order.isLicenseVerified = true;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'License verified successfully',
      order,
    });
  } catch (error) {
    console.error('Error in verifyLicense:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying license',
    });
  }
};
