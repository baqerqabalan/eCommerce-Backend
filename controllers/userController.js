const express = require('express');
const User  = require('../models/userModel');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const {promisify} = require('util')

const signToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        }
    })
}
exports.signup = async(req, res) => {
    try {
        const emailCheck = await User.findOne({email: req.body.email});
        if(emailCheck){
            return res.status(409).json({message: "The email is already in use"});
        }
        if(!validator.isEmail(req.body.email)){
            return res.status(400).json({message: "Invalid Email"});
        }
        if(req.body.password !== req.body.passwordConfirm){
            return res.status(400).json({message: "Password and Password Confirm don't match"})
        }
        const newUser = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwerdConfirm: req.body.passwordConfirm,
            role: req.body.role
        });
        createSendToken(newUser, 201, res);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message})
    }
}

exports.login = async(req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        if(!(await user.checkPassword(password, user.password))){
            return res.status(401).json({message: "Invalid Credentials"})
        }
        createSendToken(user, 200, res);

    }catch(error){
        console.log(error);
    }
};

exports.protect = async(req, res, next) => {
    try{
        // 1-We should check if the token exists
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.header.authorization.split(" ")[1];
        }
        if(!token){
            return res.status(401).json({message: "You are not logged in"});
        }
        //2- token verification
        let decoded;
        try{
            decoded = await promisify(jwt.verify(token, process.env.JWT_SECRET));
        }catch(error){
            if(error.name === "JsonWebTokenError"){
                return res.status(401).json("Invalid Token");
            }
            else if(error.name === "TokenExpiredError"){
                return res.status(401).json({message: "Session token has expired !! Login again"})
            }
        }

        // 3-Check if the user still exists
        const currentUser = await User.findById(decoded.id);
        if(!currentUser){
            return res.status(401).json({message: "The token owner no longer exists"});
        }

        // 4- Check if the user changed the pass after taking the token
        if(currentUser.passwordChangedAfterTokenIssued(decoded.iat)){
            return res.status(401).json({message: "Your password has been changed, please log in again"})
        }

        //We add the user to all requests
        req.user = currentUser;
        next();
    }catch(error){
        console.log(error);
        
    }
}