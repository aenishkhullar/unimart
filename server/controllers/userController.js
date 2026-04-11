import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { sendOtpEmail } from '../utils/sendEmail.js';


// Helper: generate a 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
    const { name, email, password, collegeName, collegeIdNumber, acceptedTerms } = req.body;

    // Validate required fields
    if (!name || !email || !password || !collegeName || !collegeIdNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password, collegeName, collegeIdNumber)',
      });
    }

    if (acceptedTerms !== true) {
      return res.status(400).json({
        success: false,
        message: 'You must accept Terms & Privacy Policy',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      // If user exists but email is not verified, allow re-registration
      if (!userExists.emailVerified) {
        // Update the existing unverified user with new data
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        userExists.name = name;
        userExists.password = hashedPassword;
        userExists.collegeName = collegeName;
        userExists.collegeIdNumber = collegeIdNumber;
        userExists.acceptedTerms = acceptedTerms;
        await userExists.save();

        // Generate and send OTP
        await Otp.deleteMany({ email }); // clear old OTPs
        const otp = generateOtp();
        await Otp.create({ email, otp });
        await sendOtpEmail(email, otp);

        return res.status(200).json({
          success: true,
          message: 'Registration updated. A verification OTP has been sent to your email.',
          data: {
            _id: userExists._id,
            email: userExists.email,
            emailVerified: false,
          },
        });
      }

      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (email not yet verified)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      collegeName,
      collegeIdNumber,
      role: 'user',
      acceptedTerms,
      emailVerified: false,
    });

    if (user) {
      // Generate and send OTP
      const otp = generateOtp();
      await Otp.create({ email, otp });
      await sendOtpEmail(email, otp);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! A verification OTP has been sent to your email.',
        data: {
          _id: user._id,
          email: user.email,
          emailVerified: false,
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

// @desc    Verify email OTP
// @route   POST /api/users/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP',
      });
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.',
      });
    }

    // Mark user as verified
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.emailVerified = true;
    await user.save();

    // Delete all OTPs for this email (single-use)
    await Otp.deleteMany({ email });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error: Could not verify OTP',
      error: error.message,
    });
  }
};

// @desc    Resend email OTP
// @route   POST /api/users/resend-otp
// @access  Public
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    // Check user exists and is unverified
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Delete old OTPs and generate new one
    await Otp.deleteMany({ email });
    const otp = generateOtp();
    await Otp.create({ email, otp });
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your email.',
    });
  } catch (error) {
    console.error('Error in resendOtp:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error: Could not resend OTP',
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

    // Block login if email is not verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the OTP.',
        emailNotVerified: true,
        email: user.email,
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked. Contact support."
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

    let badge = null;

    if (avgRating >= 4 && totalReviews >= 3) {
      badge = "Top Rated Seller";
    } else if (totalReviews >= 1) {
      badge = "Trusted Seller";
    }

    return res.status(200).json({
      success: true,
      data: {
        seller,
        products,
        reviews,
        avgRating,
        totalReviews,
        badge,
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

// @desc    Toggle wishlist item
// @route   POST /api/users/wishlist/:productId
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isWishlisted = user.wishlist.includes(productId);

    if (isWishlisted) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      data: user.wishlist,
      message: isWishlisted ? 'Removed from saved items' : 'Added to saved items',
    });
  } catch (error) {
    console.error('Error in toggleWishlist:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error: Could not update wishlist',
      error: error.message,
    });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: user.wishlist,
    });
  } catch (error) {
    console.error('Error in getWishlist:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch wishlist',
      error: error.message,
    });
  }
};
