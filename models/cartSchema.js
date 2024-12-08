const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new mongoose.Schema({
    cartOwner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product",
        }
    ],
    totalPrice:{
        type: Schema.Types.Decimal128,
        default: 0.0,
    },

},
{
    timestamps: true
},
);

module.exports = mongoose.model("Cart", cartSchema);