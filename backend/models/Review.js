const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate reviews by the same buyer for a product
reviewSchema.index({ buyer: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
