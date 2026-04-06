import express from 'express';
import { registerUser, loginUser, getUserProfile, getSellerProfile } from '../controllers/userController.js';
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
// @route   GET /api/users/:id/profile
// @desc    Get seller profile
// @access  Public
router.get('/:id/profile', getSellerProfile);

export default router;
