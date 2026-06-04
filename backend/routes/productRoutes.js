const express = require("express");
const {
  createProduct,
  getAllProducts,
  deleteProduct,
  getProductById,
  updateProduct,
} = require("../controllers/productController");
const upload = require("../middleware/upload");
const router = express.Router();

const productUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "behindTheScenesVideo", maxCount: 1 },
]);

router.post("/", productUpload, createProduct);
router.get("/", getAllProducts);
router.delete("/:id", deleteProduct);
router.put("/:id", productUpload, updateProduct);
router.get("/:id", getProductById);

module.exports = router;
