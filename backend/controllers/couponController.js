const Coupon = require("../models/Coupon");

const validateCoupon = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;
    const userId = req.user.id;

    if (!code || !totalAmount) {
      return res.status(400).json({
        message: "Token code and total amount are required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      userId,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid discount token" });
    }

    if (coupon.isUsed) {
      return res.status(400).json({ message: "This token is already used" });
    }

    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: "This token has expired" });
    }

    const discountAmount = Math.round(
      (Number(totalAmount) * coupon.discountPercent) / 100,
    );
    const finalAmount = Number(totalAmount) - discountAmount;

    res.status(200).json({
      message: "Discount token applied successfully",
      couponId: coupon._id,
      discountPercent: coupon.discountPercent,
      discountAmount,
      finalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: "Coupon validation failed", error });
  }
};

const getMyCoupons = async (req, res) => {
  try {
    const userId = req.user.id;

    const coupons = await Coupon.find({
      userId,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coupons", error });
  }
};

module.exports = {
  validateCoupon,
  getMyCoupons,
};
