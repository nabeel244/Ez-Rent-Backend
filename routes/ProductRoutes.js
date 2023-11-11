// routes/productRoutes.js

const express = require('express');
const productController = require('../controllers/ProductConroller');

const router = express.Router();

// POST request to create a new product
router.post('/products', productController.createProduct);

router.get('/products/:id', productController.getProduct);

router.put('/products/:id', productController.updateProduct);

router.delete('/products/:id', productController.deleteProduct);

router.get('/products', productController.getAllProducts);

module.exports = router;