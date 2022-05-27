const express = require("express")


const openRouter = express.Router()

const loginRoute = openRouter
    .route("/login")
    .get((req, res) => {
        if(req.headers.cookie && isValidToken(req.headers.cookie.split('=')[1])) 
            res.status(200).render("chats")
        else{
            res
            .render("gatekeep", {
            title: "Log In",
            username: "",
            password: "",
            errors: "",
        });}
    })
    
const signupRoute = openRouter
    .route("/signUp")
    .get((req, res) => {
        res.render("gatekeep", {
          title: "Sign Up",
          username: "",
          password: "",
          errors: "",
    })}
)


module.exports.openRouter = openRouter;