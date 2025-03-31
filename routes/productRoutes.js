const express = require('express');
const router = express.Router();
const { addProduct, updateProduct, deleteProduct, getPaginatedProducts2, getProductById, getProductsByIds } = require('../controllers/productController');

router.post('/', addProduct); // Add Product
router.put('/:product_id', updateProduct); // Update Product
router.delete('/:product_id', deleteProduct); // Delete Product

router.get("/:id", getProductById);
router.get("/by-ids", getProductsByIds);
router.get('/products/paginated2', getPaginatedProducts2);


module.exports = router;
