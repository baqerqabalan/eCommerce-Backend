const Cart = require('../models/cartSchema');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

exports.createNewOrder = async(req, res) => {
    try{
        const cart = await Cart.findOne({_id: req.body.cartID});
        if(!cart){
            return res.status(404).json({message: "Cart not Found"});
        }
        const cartOwner = await User.findOne({_id: req.body.cartOwner});
        if(!cartOwner){
            return res.status(404).json({message: "User not found"});
        }
        
        const newOrder = new Order({
            orderOwner: cartOwner._id,
            items: cart.products,
            status: "pending",
        });

        await newOrder.save();
        cart.products= [];
        await cart.save();
        
        return res.status(200).json({message: "Order Created"});
    }catch(error){
        console.log(error);
        res.status(500).json({message: message.error})
    }
}