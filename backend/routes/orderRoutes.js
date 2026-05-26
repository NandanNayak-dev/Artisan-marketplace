const express = require("express");
const {
  placeOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,
  buyNow,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", placeOrder);
router.get("/buyer/:buyerId", getBuyerOrders);
router.get("/seller/:sellerId", getSellerOrders);
router.put("/:orderId/status", updateOrderStatus);
router.post("/buy-now", buyNow);
module.exports = router;
