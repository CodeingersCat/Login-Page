const express = require("express");

const privateRouter = express.Router();

//PRIVATE ROUTES

const getEmail = privateRouter
    .route("/user")
    .get((req, res) => {
        if(req.valid) res.status(200).json({email: req.valid})
        else 
        res
        .status(401)
        .json({error: "Unauthorised"});
    })

const adminRoute = privateRouter
    //Admin page route
    .route("/")
    //GET Request handler
    //Serves the private page
    .get((req, res) => {
        //Checks for valid log in
        if(req.valid) res.render("admin", {email: req.valid.data, type: (req.cookies.oauth_token ? "oauth" : "")});
        else 
        res
        .status(401)
        .render("gatekeep", {
            title: "Log In",
            email: "",
            password: "",
            errors: "Please log in",
        })
    })

const logoutRoute = privateRouter
    //Logout route
    .route("/logout")
    //GET Request handler
    //clears auth token and redirects to index page 
    .get((req, res) => {
        if(req.cookies.token || req.cookies.oauth_token) 
            res
            .clearCookie('oauth_token', {sameSite: true, httpOnly: true})
            .clearCookie('token', {sameSite: true, httpOnly: true})
            .redirect("/")
    })

module.exports.privateRouter = privateRouter