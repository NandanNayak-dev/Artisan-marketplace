const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const Razorpay = require("razorpay");
const restoreOrderStock = async (order) => {
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }
};


const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing in .env");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        message: "Delivered orders cannot be cancelled",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Order is already cancelled",
      });
    }

    if (
      order.paymentStatus === "paid" &&
      order.razorpayPaymentId &&
      order.paymentMethod !== "Cash on Delivery"
    ) {
      const razorpay = getRazorpayInstance();

      const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: order.totalAmount * 100,
        speed: "normal",
        notes: {
          orderId: order._id.toString(),
          reason: reason || "Order cancelled by buyer",
        },
        receipt: `refund_${order._id}`,
      });

      order.status = "cancelled";
      order.paymentStatus = "refunded";
      order.refundStatus = "processed";
      order.razorpayRefundId = refund.id;
      order.cancelReason = reason || "Order cancelled by buyer";
      order.cancelledAt = new Date();

      await order.save();

      await restoreOrderStock(order);
      return res.status(200).json({
        message: "Order cancelled and refund initiated",
        order,
        refund,
      });
    }

    order.status = "cancelled";
    order.refundStatus = "not_applicable";
    order.cancelReason = reason || "Order cancelled by buyer";
    order.cancelledAt = new Date();

    await order.save();

    await restoreOrderStock(order);

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};
const placeOrder = async (req, res) => {
  try {
    const { buyer } = req.body;

    if (!buyer) {
      return res.status(400).json({ message: "Buyer is required" });
    }

    const cartItems = await Cart.find({ buyer }).populate("product");

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = cartItems.map((item) => ({
      product: item.product._id,
      seller: item.product.seller,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const subTotal = cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
    const deliveryCharge = subTotal > 400 ? 50 : 0;
    const totalAmount = subTotal + deliveryCharge;

    const order = await Order.create({
      buyer,
      items: orderItems,
      totalAmount,
      deliveryCharge,
      paymentMethod: "Cash on Delivery",
    });

    await Cart.deleteMany({ buyer });

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
};

const getBuyerOrders = async (req, res) => {
  try {
    const { buyerId } = req.params;

    const orders = await Order.find({ buyer: buyerId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch buyer orders",
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer", "fullName email role")
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const orders = await Order.find({ "items.seller": sellerId })
      .populate("buyer", "fullName email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch seller orders",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled orders cannot be updated",
      });
    }

    if (order.status === "delivered" && status !== "delivered") {
      return res.status(400).json({
        message: "Delivered orders cannot be moved backward",
      });
    }

    if (status === "cancelled") {
      return res.status(400).json({
        message: "Use the cancel order action to cancel and process refunds",
      });
    }

    const statusOrder = ["pending", "confirmed", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(order.status);
    const nextIndex = statusOrder.indexOf(status);

    if (nextIndex < currentIndex) {
      return res.status(400).json({
        message: "Order status cannot be moved backward",
      });
    }

    order.status = status;

    if (status === "delivered" && order.paymentMethod === "Cash on Delivery") {
      order.paymentStatus = "paid";
    }

    await order.save();

    return res.status(200).json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

const buyNow = async (req, res) => {
  try {
    const { buyer, productId, quantity, shippingAddress, paymentMethod } =
      req.body;

    if (!buyer || !productId) {
      return res.status(400).json({
        message: "Buyer and product are required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const orderQuantity = Number(quantity) || 1;

    if (product.stock < orderQuantity) {
      return res.status(400).json({
        message: "Not enough stock available",
      });
    }

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
    });

    product.stock -= orderQuantity;
    await product.save();

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
};

module.exports = {
  placeOrder,
  getBuyerOrders,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus,
  buyNow,
  cancelOrder,
};
