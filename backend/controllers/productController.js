const Product = require("../models/Product");
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, image, seller } =
      req.body;
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !stock ||
      !image ||
      !seller
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image,
      seller,
    });
    return res
      .status(201)
      .json({ message: "Product created successfully", product });
  } catch (error) {
    return res.status(500).json({ message: "Error creating product", error });
  }
};
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "fullName email")
      .sort({ createdAt: -1 });
      console.log(products);
    return res.status(200).json({
      products,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};
module.exports = { createProduct, getAllProducts };
