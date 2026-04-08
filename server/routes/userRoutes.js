import express from 'express';
import { registerUser, loginUser, getUserProfile, getSellerProfile, toggleWishlist, getWishlist } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   GET /api/users/:id/profile
// @desc    Get seller profile
// @access  Public
router.get('/:id/profile', getSellerProfile);

// @route   POST /api/users/wishlist/:productId
// @desc    Toggle wishlist item
// @access  Private
router.post('/wishlist/:productId', protect, toggleWishlist);

// @route   GET /api/users/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/wishlist', protect, getWishlist);

export default router;
