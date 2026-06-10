const Product = require("../models/Product");
const Review = require("../models/Review");
const cloudinary = require("../config/cloudinary");
const { requireObjectId } = require("../utils/objectId");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      seller,
      originPlace,
      originState,
    } = req.body;

    if (!name || !description || !price || !category || !stock || !seller) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!requireObjectId(res, seller, "seller id")) return;

    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.behindTheScenesVideo?.[0];

    if (!imageFile) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
      folder: "artisan-products",
    });

    let videoUploadResult = null;
    if (videoFile) {
      videoUploadResult = await cloudinary.uploader.upload(videoFile.path, {
        folder: "artisan-product-videos",
        resource_type: "video",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      seller,
      image: uploadResult.secure_url,
      behindTheScenesVideo: videoUploadResult
        ? videoUploadResult.secure_url
        : undefined,
      originPlace,
      originState,
    });

    return res
      .status(201)
      .json({ message: "Product created successfully", product });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort } = req.query;

    const query = {};

    // 1. Text Search (matches name, description, originPlace, or originState)
    if (q && q.trim() !== "") {
      const searchRegex = { $regex: q.trim(), $options: "i" };
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { originPlace: searchRegex },
        { originState: searchRegex },
      ];
    }

    // 2. Category Filter
    if (category && category !== "All") {
      query.category = category;
    }

    // 3. Price Range Filter
    if ((minPrice !== undefined && minPrice !== "") || (maxPrice !== undefined && maxPrice !== "")) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== "") {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== "") {
        query.price.$lte = Number(maxPrice);
      }
    }

    // 4. Sorting logic
    let sortObj = { createdAt: -1 }; // Default: Latest
    if (sort === "price-low") {
      sortObj = { price: 1 };
    } else if (sort === "price-high") {
      sortObj = { price: -1 };
    } else if (sort === "latest") {
      sortObj = { createdAt: -1 };
    } else if (sort === "relevance") {
      sortObj = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .populate("seller", "fullName email")
      .sort(sortObj);

    const ratings = await Review.aggregate([
      { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const ratingsMap = {};
    ratings.forEach(r => {
      ratingsMap[r._id.toString()] = {
        avgRating: Number(r.avgRating.toFixed(1)),
        count: r.count
      };
    });

    const productsWithRatings = products.map(product => {
      const ratingInfo = ratingsMap[product._id.toString()] || { avgRating: 0, count: 0 };
      return {
        ...product.toObject(),
        avgRating: ratingInfo.avgRating,
        reviewCount: ratingInfo.count
      };
    });

    return res.status(200).json({ products: productsWithRatings });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!requireObjectId(res, id, "product id")) return;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      stock,
      originPlace,
      originState,
    } = req.body;

    if (!requireObjectId(res, id, "product id")) return;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (category) updateData.category = category;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (originPlace !== undefined) updateData.originPlace = originPlace;
    if (originState !== undefined) updateData.originState = originState;

    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.behindTheScenesVideo?.[0];

    if (imageFile) {
      const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
        folder: "artisan-products",
      });
      updateData.image = uploadResult.secure_url;
    }

    if (videoFile) {
      const videoUploadResult = await cloudinary.uploader.upload(
        videoFile.path,
        {
          folder: "artisan-product-videos",
          resource_type: "video",
        },
      );

      updateData.behindTheScenesVideo = videoUploadResult.secure_url;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("seller", "fullName email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res
      .status(200)
      .json({ message: "Product updated successfully", product });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!requireObjectId(res, id, "product id")) return;

    const product = await Product.findById(id).populate(
      "seller",
      "fullName email",
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ product: id })
      .populate("buyer", "fullName")
      .sort({ createdAt: -1 });

    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
      : 0;

    return res.status(200).json({
      product: {
        ...product.toObject(),
        avgRating,
        reviewCount,
      },
      reviews,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  deleteProduct,
  getProductById,
  updateProduct,
};
