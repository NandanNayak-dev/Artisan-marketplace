const express = require('express');
const { createProduct, getAllProducts, deleteProduct } = require('../controllers/productController');
const upload = require('../middleware/upload');
const router = express.Router();


router.post('/', upload.single('image'), createProduct);
router.get('/',getAllProducts);
router.delete('/:id', deleteProduct);

module.exports = router;