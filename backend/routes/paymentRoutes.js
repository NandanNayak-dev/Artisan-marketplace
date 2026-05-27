const express = require("express");
const {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-order", createRazorpayOrder);
router.post("/verify", verifyPaymentAndCreateOrder);

module.exports = router;
