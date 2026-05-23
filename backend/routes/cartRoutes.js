const express = require("express");
const { addToCart, getCartItems } = require("../controllers/cartController");

const router = express.Router();

router.post("/add", addToCart);
router.get("/:buyerId", getCartItems);

module.exports = router;
