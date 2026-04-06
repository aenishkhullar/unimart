import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';


// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password)',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object
    const userRole = role && ['buyer', 'seller'].includes(role) ? role : 'buyer';
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    if (user) {
      // Return success response with user data (excluding password)
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data received',
      });
    }
  } catch (error) {
    console.error('Error in registerUser:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error: Could not register user',
      error: error.message,
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check if user exists using email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password using bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token using jsonwebtoken
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '30d' }
    );

    // Return JSON response with token + user data (exclude password)
    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in loginUser:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error: Could not log in user',
      error: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      return res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch user profile',
      error: error.message,
    });
  }
};

// @desc    Get seller profile
// @route   GET /api/users/:id/profile
// @access  Public
export const getSellerProfile = async (req, res) => {
  try {
    const sellerId = req.params.id;

    // Fetch seller: name, email, createdAt
    const seller = await User.findById(sellerId).select('name email createdAt');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    // Fetch all products by seller
    const products = await Product.find({ user: sellerId });

    // Fetch all reviews for this seller
    const reviews = await Review.find({ seller: sellerId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Calculate aggregated data
    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        seller,
        products,
        reviews,
        avgRating,
        totalReviews,
      },
    });
  } catch (error) {
    console.error('Error in getSellerProfile:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch seller profile',
      error: error.message,
    });
  }
};

