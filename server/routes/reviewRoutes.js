import express from "express";
import { addReview, getProductReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Publicly get reviews, but only authorized users can post
router.route("/:productId")
  .post(protect, addReview)
  .get(getProductReviews);

export default router;
