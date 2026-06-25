const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { requireObjectId } = require("../utils/objectId");

const getBuyerId = (req) => req.user?.id || req.user?._id;

const getWishlist = async (req, res) => {
  try {
    const buyer = getBuyerId(req);
    if (!requireObjectId(res, buyer, "buyer id")) return;

    const items = await Wishlist.find({ buyer })
      .populate({
        path: "product",
        populate: {
          path: "seller",
          select: "fullName email",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

const getWishlistProductIds = async (req, res) => {
  try {
    const buyer = getBuyerId(req);
    if (!requireObjectId(res, buyer, "buyer id")) return;

    const items = await Wishlist.find({ buyer }).select("product");
    return res.status(200).json({
      productIds: items.map((item) => item.product.toString()),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch wishlist products",
      error: error.message,
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const buyer = getBuyerId(req);
    const { productId } = req.body;

    if (!requireObjectId(res, buyer, "buyer id")) return;
    if (!requireObjectId(res, productId, "product id")) return;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const wishlistItem = await Wishlist.findOneAndUpdate(
      { buyer, product: productId },
      { buyer, product: productId },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return res.status(201).json({
      message: "Product saved to wishlist",
      wishlistItem,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save product",
      error: error.message,
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const buyer = getBuyerId(req);
    const { productId } = req.params;

    if (!requireObjectId(res, buyer, "buyer id")) return;
    if (!requireObjectId(res, productId, "product id")) return;

    await Wishlist.findOneAndDelete({ buyer, product: productId });

    return res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove product",
      error: error.message,
    });
  }
};

module.exports = {
  getWishlist,
  getWishlistProductIds,
  addToWishlist,
  removeFromWishlist,
};
