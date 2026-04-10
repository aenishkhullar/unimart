import express from 'express';
import { createOrder, getMyOrders, updateOrderStatus, getProductOrders, getSellerOrders, verifyLicense } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/orders       → create a new order (protected)
router.post('/', protect, createOrder);

// GET  /api/orders/my    → get logged-in user's orders (protected)
router.get('/my', protect, getMyOrders);

// GET  /api/orders/seller-orders → get orders for products owned by seller (protected)
router.get('/seller-orders', protect, getSellerOrders);

// PUT /api/orders/:id/status → update order status (protected, seller only)
router.put('/:id/status', protect, updateOrderStatus);

// PUT /api/orders/:id/verify-license → seller verifies buyer's license (protected)
router.put('/:id/verify-license', protect, verifyLicense);

// GET /api/orders/product/:productId → get orders for a specific product (protected, seller only)
router.get('/product/:productId', protect, getProductOrders);

export default router;
