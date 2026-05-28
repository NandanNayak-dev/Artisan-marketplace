const express = require("express");
const {
  placeOrder,
  getBuyerOrders,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus,
  buyNow,
  cancelOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", placeOrder);
router.get("/all", getAllOrders);
router.get("/buyer/:buyerId", getBuyerOrders);
router.get("/seller/:sellerId", getSellerOrders);
router.put("/:orderId/status", updateOrderStatus);
router.post("/buy-now", buyNow);
router.put("/:orderId/cancel", cancelOrder);
module.exports = router;
