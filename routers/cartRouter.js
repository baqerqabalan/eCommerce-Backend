const express = require('express');
const router  = express.Router();
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');

router.post('/addtoCart', userController.protect, cartController.addToCart);

module.exports = router;