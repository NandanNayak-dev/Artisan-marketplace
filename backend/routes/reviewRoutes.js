const express = require("express");
const {
  createReview,
  getProductReviews,
  checkReviewEligibility,
} = require("../controllers/reviewController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/product/:productId", getProductReviews);
router.get("/check-eligibility/:productId", protect, checkReviewEligibility);

module.exports = router;
