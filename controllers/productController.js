const Product = require("../models/productModel");
const User = require("../models/userModel");

const checkAdmin = async (req) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (!user || user.role !== "admin") {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
};
exports.createProduct = async (req, res) => {
  try {
    const user = await checkAdmin(req);
    if (user === false) {
      return res
        .status(404)
        .json({ message: "A product should be added by an admin" });
    }
    const newProduct = await Product.create({
      productName: req.body.productName,
      productDescription: req.body.productDescription,
      productPrice: req.body.productPrice,
      productQuantity: req.body.productQuantity,
      createdBy: req.user._id,
    });
    return res
      .status(201)
      .json({
        message: "Product has been added successfully",
        product: newProduct,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const user = await checkAdmin(req);
    if (user !== true) {
      return res
        .status(401)
        .json({ message: "Only admin can update this product" });
    }
    const product = await Product.findByIdAndUpdate(req.params.productID, req.body, 
        {new: true}
);
if(!product){
    return res.status(404).json({message: "Product not found"});
}
return res.status(200).json({message: "Product updated successfully"});
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.deleteProduct = async(req, res) => {
    try{
        const user = await checkAdmin(req);
        if (user !== true) {
          return res
            .status(401)
            .json({ message: "Only admin can delete this product" });
        }
        const product = await Product.findByIdAndDelete(req.params.productID);
    if(!product){
        return res.status(404).json({message: "Product not found"});
    }
    return res.status(200).json({message: "Product deleted successfully"});
     
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

exports.getAllProducts  = async(req, res) => {
    try{
        const products = await Product.find();
        if(products.length <=0){
            return res.status(404).json({message: "No available products"});
        }
        return res.status(200).json(products);
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}