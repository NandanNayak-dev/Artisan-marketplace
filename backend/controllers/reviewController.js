const Review = require("../models/Review");
const Order = require("../models/Order");
const { requireObjectId } = require("../utils/objectId");

// @desc    Create or update a review
// @route   POST /api/reviews
// @access  Private (Buyer only)
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const buyerId = req.user.id;

    if (!productId || !rating) {
      return res.status(400).json({ message: "Product ID and rating are required" });
    }

    if (!requireObjectId(res, productId, "product id")) return;

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    }

    // Check if buyer has purchased this product and it was delivered
    const hasPurchased = await Order.findOne({
      buyer: buyerId,
      status: "delivered",
      "items.product": productId,
    });

    if (!hasPurchased) {
      return res.status(403).json({
        message: "You can only review products that have been delivered to you.",
      });
    }

    // Create or update review
    const review = await Review.findOneAndUpdate(
      { buyer: buyerId, product: productId },
      { rating: ratingNum, comment: comment || "" },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!requireObjectId(res, productId, "product id")) return;

    const reviews = await Review.find({ product: productId })
      .populate("buyer", "fullName")
      .sort({ createdAt: -1 });

    return res.status(200).json({ reviews });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// @desc    Check if current user is eligible to write a review
// @route   GET /api/reviews/check-eligibility/:productId
// @access  Private (Buyer only)
const checkReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;
    const buyerId = req.user.id;

    if (!requireObjectId(res, productId, "product id")) return;

    const hasPurchased = await Order.findOne({
      buyer: buyerId,
      status: "delivered",
      "items.product": productId,
    });

    if (!hasPurchased) {
      return res.status(200).json({ eligible: false, message: "You must purchase this product and have it delivered before reviewing." });
    }

    // Check if they've already reviewed
    const existingReview = await Review.findOne({ buyer: buyerId, product: productId });

    return res.status(200).json({
      eligible: true,
      hasReviewed: !!existingReview,
      existingReview,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to check review eligibility",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  checkReviewEligibility,
};
