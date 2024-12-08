const mongoose = require('mongoose');
const Schema  = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type:String,
        required: true,
        minLength: 3,
        trim:true
    },
    lastName: {
        type:String,
        required: true,
        minLength: 3,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: [true, "Please enter your email"]
    },
    username:{
        type: String,
        unique: true,
        trim: true,
        required: [true, "Please enter your username"]
    },
    password: {
        type: String,
        minLength: 8,
        required: [true, "Please enter your password"],
        trim: true,
    },
    passwordConfirm: {
        type:String,
        trim: true,
        minLength:8,
        required : [true, "Please confirm your password"]
    },
    passwordChangedAt: Date,

    role:{
        type:String,
        default: "user",
        enum: ["admin", "user"]
    },
    orders: [
        {
            type:Schema.Types.ObjectId,
            ref: "Order",
        },
    ]
},
{timestamps: true}
);

userSchema.pre("save", async function(next){
    try {
        if(!this.isModified("password")){
            return next();
        }
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
    } catch (error) {
        console.log(error);
        
    }
});

userSchema.methods.checkPassword = async function(
    candidatePassword, //Password inside the body
    userPassword, //Password inside the db
){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.passwordChangedAfterTokenIssued = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const passwordChangedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10
    );
    return passwordChangedTime > JWTTimestamp;
    }
    return false;
}
module.exports = mongoose.model("User", userSchema);


