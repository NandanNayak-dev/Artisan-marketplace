const express = require('express');
const { createProduct, getAllProducts, deleteProduct, getProductById, updateProduct} = require('../controllers/productController');
const upload = require('../middleware/upload');
const router = express.Router();


router.post('/', upload.single('image'), createProduct);
router.get('/',getAllProducts);
router.delete('/:id', deleteProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.get('/:id', getProductById);

module.exports = router;
