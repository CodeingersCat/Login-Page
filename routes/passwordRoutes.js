const express = require("express");
const bcrypt = require("bcryptjs")
const User = require("../models/User");
const { tokenise } = require("../utils/token");
const Otp = require("../models/Otp");
const { isAuthenticated, hasOtp } = require("../middleware/authHelper");

const passwordRouter = express.Router();

//change password for registered users
const changePasswordRoute = passwordRouter
    //reset password route
    .route("/resetpw")
    //GET Request handler
    //Serves the reset password page
    .get(isAuthenticated, (req, res) => {
        res.render("gatekeep", {
            title: "Reset Password",
            errors: ""
        })
    })
    //POST request handler
    //Handles user input for password reset
    .post(isAuthenticated, async (req, res) => {
        if(req.errors){
            //handling invalid inputs
            res.render("gatekeep", {
                title: "Reset Password",
                errors: "Invalid inputs"
            })
        }else{
            //Generates new hash to store in db
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(req.body.password_field, salt);
            User.updateOne({email: req.valid.data}, {password: hash}, (err, data) => {
                if(err){
                    res
                    .status(500)
                    .render("gatekeep", {
                        title: "Reset Password",
                        errors: "Database error"
                    })      
                }else{
                    //sending updated auth token to client
                    res
                    .status(201)
                    .cookie('token', tokenise(req.valid.data), {sameSite: true, httpOnly: true, maxAge: 60*60*24*5000})
                    .redirect("/admin")
                }
            })    
        }
    })

//reset password for forgot-password requests 
const resetPasswordWithOtp = passwordRouter
    //reset password with otp
    .route("/resetpwotp/:otp")
    //GET Request handler
    //Serves the reset password page
    .get(hasOtp, (req, res) => {
        if(req.otp){
            res.render("gatekeep", {
                title: "Reset Password",
                errors: ""
            })
        } 
    })
    //POST Request handler
    //Handles OTP based password-reset
    .post(hasOtp, (req, res) => {
        if(req.errors){
            //handling invalid inputs
            res.render("gatekeep", {
                title: "Reset Password",
                errors: "Invalid inputs"
            })
        }else{
            //deleting OTP stored in database
            if(req.otp){
                Otp.findOneAndDelete({email: req.valid.data}, async (err, data) => {
                    if(err){
                        res
                        .status(500)
                        .render("gatekeep", {
                            title: "Verify OTP",
                            email: "",
                            errors: "Connection error"
                        })
                    }
                    if(!data){
                        res
                        .status(401)
                        .render("gatekeep", {
                            title: "Verify OTP",
                            email: "",
                            errors: "OTP invalid/expired"
                        })
                    }else{
                        //Generates new hash to store in db
                        const salt = await bcrypt.genSalt(10);
                        const hash = await bcrypt.hash(req.body.password_field, salt);
                        User.updateOne({email: req.valid.data}, {password: hash}, (err, data) => {
                            if(err){
                                res
                                .status(500)
                                .render("gatekeep", {
                                    title: "Reset Password",
                                    errors: "Database error"
                                })      
                            }else{
                                //sending updated auth token to client
                                res
                                .status(201)
                                .cookie('token', tokenise(data.email), {sameSite: true, httpOnly: true, maxAge: 60*60*24*5000})
                                .redirect("/admin")
                            }
                        })
                    }
                })
            }    
    }})


module.exports.passwordRouter = passwordRouter;