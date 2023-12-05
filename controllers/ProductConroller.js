// controllers/productController.js

const productService = require('../services/ProductService');


const productController = {
    async createProduct(req, res) {
        try {
            // Assuming 'featuredImage' and 'images' are the field names for the uploaded files
            const imageFiles = {
                featuredImage: req.file, // if there's a single featured image
                images: req.files.images // if there are multiple images
            };
            const product = await productService.createProduct(req.body, imageFiles);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getProduct(req, res) {
        try {
            const productId = req.params.id;
            const product = await productService.getProductById(productId);
            res.json(product);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async updateProduct(req, res) {
        try {
            const productId = req.params.id;
            const imageFiles = {
                featuredImage: req.file,
                images: req.files.images
            };

            const updatedProduct = await productService.updateProduct(productId, req.body, imageFiles);
            res.json(updatedProduct);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async deleteProduct(req, res) {
        try {
            const productId = req.params.id;
            const response = await productService.deleteProduct(productId);
            res.json(response);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getAllProducts(req, res) {
        try {
            const products = await productService.getAllProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = productController;