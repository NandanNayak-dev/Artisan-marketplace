const Cart = require("../models/Cart");

const addToCart = async (req, res) => {
  try {
    const { buyer, product, quantity } = req.body;
    if (!buyer || !product) {
      return res
        .status(400)
        .json({ message: "Buyer and product are required" });
    }

    const existingCartItem = await Cart.findOne({ buyer, product });

    if (existingCartItem) {
      existingCartItem.quantity += Number(quantity) || 1;
      await existingCartItem.save();

      return res.status(200).json({
        message: "Cart quantity updated",
        cartItem: existingCartItem,
      });
    }
    const cartItem = await Cart.create({
      buyer,
      product,
      quantity: Number(quantity) || 1,
    });

    return res.status(201).json({
      message: "Product added to cart",
      cartItem,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCartItems = async (req, res) => {
  try {
    const { buyerId } = req.params;

    const cartItems = await Cart.find({ buyer: buyerId })
      .populate("product");

    return res.status(200).json({ cartItems });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch cart items",
      error: error.message,
    });
  }
};
