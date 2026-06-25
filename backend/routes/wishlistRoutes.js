const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getWishlist,
  getWishlistProductIds,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const router = express.Router();

router.get("/", protect, getWishlist);
router.get("/ids", protect, getWishlistProductIds);
router.post("/", protect, addToWishlist);
router.delete("/:productId", protect, removeFromWishlist);

module.exports = router;
