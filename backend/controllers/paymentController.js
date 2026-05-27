const crypto = require("crypto");
const Razorpay = require("razorpay");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing in .env");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

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
    const totalAmount = subTotal + deliveryCharge;

    const razorpay = getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        productId,
        quantity: String(orderQuantity),
      },
    });

    return res.status(201).json({
      key: process.env.RAZORPAY_KEY_ID,
      amount: totalAmount,
      razorpayOrder,
    });
  } catch (error) {
    return res.status(500).json({
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
    const totalAmount = subTotal + deliveryCharge;

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
      totalAmount,
      deliveryCharge,
      paymentMethod,
      shippingAddress,
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    return res.status(201).json({
      message: "Payment verified and order placed",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
};
