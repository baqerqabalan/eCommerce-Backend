const express = require('express');
const router  = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');

router.post("/create-product", userController.protect, productController.createProduct);
router.patch('/updateProduct:productID', userController.protect, productController.updateProduct);
router.delete('/deleteProduct:productID', userController.protect, productController.deleteProduct);
router.get('/allproducts', productController.getAllProducts);

module.exports = router;