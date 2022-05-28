const Otp = require("../models/Otp");
const { isValidToken } = require("../utils/token")

//Middleware function to check if user is already logged in
const isAuthenticated = async (req, res, next) => {
    if(req.headers.cookie){
        const token = req.headers.cookie.split('=')[1]
        req.valid = isValidToken(token)
        next()
    }else{
        res
        .status(401)
        .redirect("/login");
    }
} 

//Middleware to handle OTP verification based password reset requests
const hasOtp = async (req, res, next) => {
    if(req.params.otp){
        Otp.findOne({otp: req.params.otp}, (err, dbOtp) => {
            if(dbOtp){
                req.otp = req.params.otp;
                req.valid = {"data": dbOtp.email}
                next()
            }else {
                res.redirect("/forgotpw");
                return;
            }
        })
    }else res
        .render("gatekeep", {
            title: "Verify OTP",
            email: "",
            errors: "Invalid OTP"
    })
}

module.exports.isAuthenticated = isAuthenticated
module.exports.hasOtp = hasOtp
