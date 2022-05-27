const express = require("express");

const privateRouter = express.Router();

//PRIVATE ROUTES

const adminRoute = privateRouter
    //Admin page route
    .route("/admin")
    //GET Request handler
    //Serves the private page
    .get((req, res) => {
        //Checks for valid log in
        if(req.valid) res.render("admin");
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
        if(req.headers.cookie) 
            res
            .clearCookie('token', {sameSite: true, httpOnly: true})
            .redirect("/")
    })

module.exports.privateRouter = privateRouter