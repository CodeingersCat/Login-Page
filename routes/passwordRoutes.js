const express = require("express");
const bcrypt = require("bcryptjs")
const User = require("../models/User");
const { tokenise } = require("../utils/token");

const passwordRouter = express.Router();

//Change password for authenticated users
const changePasswordRoute = passwordRouter
    //reset password route
    .route("/resetpw")
    //GET Request handler
    //Serves the reset password page
    .get((req, res) => {
        res.render("gatekeep", {
            title: "Reset Password",
            errors: ""
        })
    })
    //POST request handler
    //Handles user input for password reset
    .post(async (req, res) => {
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
                    .cookie('token', tokenise(data.email), {sameSite: true, httpOnly: true, maxAge: 60*60*24*5000})
                    .redirect("/admin")
                }
            })    
        }
    })


module.exports.passwordRouter = passwordRouter;