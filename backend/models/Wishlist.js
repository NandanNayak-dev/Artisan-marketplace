const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
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
  },
  { timestamps: true },
);

wishlistSchema.index({ buyer: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
