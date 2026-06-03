const express = require("express");
const {
  getSellerAnalytics,
  getBuyerAnalytics,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/seller/:sellerId", getSellerAnalytics);
router.get("/buyer/:buyerId", getBuyerAnalytics);

module.exports = router;
