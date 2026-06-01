const crypto = require("crypto");
const Razorpay = require("razorpay");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing in .env");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const generateCouponCode = () => {
  const randomText = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SAVE10-${randomText}`;
};

const createRewardCoupon = async (buyer, subTotal) => {
  if (subTotal <= 500) {
    return null;
  }

  return Coupon.create({
    userId: buyer,
    code: generateCouponCode(),
    discountPercent: 10,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
};

const applyCouponToAmount = async ({ couponId, buyer, totalAmount }) => {
  if (!couponId) {
    return {
      finalAmount: totalAmount,
      discountAmount: 0,
      coupon: null,
    };
  }

  const coupon = await Coupon.findOne({
    _id: couponId,
    userId: buyer,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!coupon) {
    const error = new Error("Invalid, expired, or already used discount token");
    error.statusCode = 400;
    throw error;
  }

  const discountAmount = Math.round(
    (totalAmount * coupon.discountPercent) / 100,
  );

  return {
    finalAmount: totalAmount - discountAmount,
    discountAmount,
    coupon,
  };
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { productId, quantity, buyer, couponId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const orderQuantity = Number(quantity) || 1;

    if (product.stock < orderQuantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const subTotal = product.price * orderQuantity;
    const deliveryCharge = subTotal > 400 ? 50 : 0;
    const originalAmount = subTotal + deliveryCharge;
    const couponResult = await applyCouponToAmount({
      couponId,
      buyer,
      totalAmount: originalAmount,
    });

    const razorpay = getRazorpayInstance();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: couponResult.finalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        productId,
        quantity: String(orderQuantity),
        buyer,
        couponId: couponId || "",
      },
    });

    return res.status(201).json({
      key: process.env.RAZORPAY_KEY_ID,
      amount: couponResult.finalAmount,
      discountAmount: couponResult.discountAmount,
      razorpayOrder,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

const verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const {
      buyer,
      productId,
      quantity,
      shippingAddress,
      paymentMethod,
      couponId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const orderQuantity = Number(quantity) || 1;
    const subTotal = product.price * orderQuantity;
    const deliveryCharge = subTotal > 400 ? 50 : 0;
    const originalAmount = subTotal + deliveryCharge;
    const couponResult = await applyCouponToAmount({
      couponId,
      buyer,
      totalAmount: originalAmount,
    });

    const order = await Order.create({
      buyer,
      items: [
        {
          product: product._id,
          seller: product.seller,
          quantity: orderQuantity,
          price: product.price,
        },
      ],
      totalAmount: couponResult.finalAmount,
      originalAmount,
      discountAmount: couponResult.discountAmount,
      coupon: couponResult.coupon?._id,
      deliveryCharge,
      paymentMethod,
      shippingAddress,
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    product.stock -= orderQuantity;
    await product.save();

    if (couponResult.coupon) {
      couponResult.coupon.isUsed = true;
      await couponResult.coupon.save();
    }

    const rewardCoupon = await createRewardCoupon(buyer, subTotal);

    return res.status(201).json({
      message: "Payment verified and order placed",
      order,
      rewardCoupon,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
};
