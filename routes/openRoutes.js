const express = require("express")
const bcrypt = require("bcryptjs")
const { tokenise, isValidToken } = require("../utils/token")
const User = require("../models/User")

const openRouter = express.Router()

//PUBLIC ROUTES

const loginRoute = openRouter
    .route("/login")
    //GET Request handler
    //Serves the login/sign up pages
    .get((req, res) => {
        if(req.headers.cookie && isValidToken(req.headers.cookie.split('=')[1])) 
            res.status(200).render("admin")
        else{
            res
            .render("gatekeep", {
            title: "Log In",
            email: "",
            password: "",
            errors: "",
        });}
    })
    //POST request handler
    //accepts login data from front-end
    .post(async (req, res) => {
        if (req.errors) {
            //handling invalid inputs
            res.render("gatekeep", {
              title: "Log In",
              email: req.body.email_field,
              password: "",
              errors: req.errors,
            })
          } else {
            //searching user in db  
            const dbUser = await User.findOne({email: req.body.email_field})
            if(!dbUser){
              res
              .status(401)
              .render("gatekeep", {
                title: "Log In",
                email: "",
                password: "",
                errors: "No user found"
              });
            }else{
              //matching password with hash stored in db
              const valid = await bcrypt.compare(req.body.password_field, dbUser.password)
              if(valid){
                res
                .status(200)
                .cookie('token', tokenise(dbUser.email), {sameSite: true, httpOnly: true, maxAge: 60*60*24*5000})
                .redirect("/admin")
              }else{
                res
                .status(401)
                .render("gatekeep", {
                    title: "Log In",
                    email: req.body.email_field,
                    password: "",
                    errors: "Incorrect password"
                })
            }}}
    })
    
const signupRoute = openRouter
    .route("/signUp")
    .get((req, res) => {
        res.render("gatekeep", {
          title: "Sign Up",
          email: "",
          password: "",
          errors: "",
    })})
    .post(async (req, res) => {
        if (req.errors) {
          res.render("gatekeep", {
            title: "Sign Up",
            email: req.body.email_field,
            password: "",
            errors: req.errors
          });
        } else {
            const dbUser = await User.findOne({email: req.body.email_field});
            if(dbUser){
                res
                .status(401)
                .render("gatekeep", {
                    title: "Sign Up",
                    email: "",
                    password: "",
                    errors: "Email already registered"
                })
            }else{
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(req.body.password_field, salt);
                const user = await User.create({
                email: req.body.email_field,
                password: hash   
                })
                console.log(user)
                res
                .status(200)
                .cookie('token', tokenise(user.email), {sameSite: true, httpOnly: true, maxAge: 60*60*24*5000})
                .redirect("/admin")
            }
        };
    })


module.exports.openRouter = openRouter;