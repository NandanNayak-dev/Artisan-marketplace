const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
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

    const totalAmount = cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const order = await Order.create({
      buyer,
      items: orderItems,
      totalAmount,
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

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

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
    const { buyer, productId, quantity } = req.body;

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

    const totalAmount = product.price * orderQuantity;

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
      paymentMethod: "Cash on Delivery",
    });

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
  updateOrderStatus,
  buyNow,
};
