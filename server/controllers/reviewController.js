import Review from "../models/Review.js";
import Product from "../models/Product.js";

/**
 * @desc    Add review to product
 * @route   POST /api/reviews/:productId
 * @access  Private
 */
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Prevent self review (seller cannot review their own product)
    if (product.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot review your own product",
      });
    }

    // Prevent duplicate review (one review per user per product)
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: req.params.productId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product",
      });
    }

    const review = new Review({
      user: req.user._id,
      seller: product.user,
      product: product._id,
      rating: Number(rating),
      comment,
    });

    const savedReview = await review.save();

    res.status(201).json({
      success: true,
      data: savedReview,
    });
  } catch (error) {
    console.error("Error in addReview:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get reviews for a product
 * @route   GET /api/reviews/:productId
 * @access  Public
 */
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const total = reviews.length;

    const avgRating =
      total > 0
        ? reviews.reduce((acc, item) => acc + item.rating, 0) / total
        : 0;

    res.json({
        success: true,
        reviews,
        avgRating: Number(avgRating.toFixed(1)),
        count: total,
    });
  } catch (error) {
    console.error("Error in getProductReviews:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
