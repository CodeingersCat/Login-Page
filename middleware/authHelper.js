const Otp = require("../models/Otp");
const { isValidToken } = require("../utils/token");
const {OAuth2Client} = require('google-auth-library');

//Middleware function to check if user is already logged in
const isAuthenticated = async (req, res, next) => {
    if(req.cookies){
        if(req.cookies.token){
            req.valid = isValidToken(req.cookies.token)
            next()
        }else if(req.cookies.oauth_token){
            const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);
            const ticket = await client.verifyIdToken({
                idToken: req.cookies.oauth_token,
                audience: process.env.OAUTH_CLIENT_ID
            });
            if(ticket){
                const payload = ticket.getPayload();
                console.log(payload)
                req.valid = {data: payload['email']};
                if(req.path === '/resetpw'){
                    req.errors = "Invalid action for Google signed-in users"
                }
                next()
            }else res.redirect("/");
        }
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
