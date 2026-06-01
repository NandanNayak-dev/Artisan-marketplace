const express = require("express");
const router = express.Router();

const {
  validateCoupon,
  getMyCoupons,
} = require("../controllers/couponController");

const protect = require("../middleware/authMiddleware");

router.post("/validate", protect, validateCoupon);
router.get("/my-coupons", protect, getMyCoupons);

module.exports = router;