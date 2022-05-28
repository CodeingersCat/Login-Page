const express = require("express")
const bcrypt = require("bcryptjs")
const mailer = require("nodemailer")
const { tokenise, isValidToken } = require("../utils/token")
const User = require("../models/User")
const Otp = require("../models/Otp")

const openRouter = express.Router()

//____PUBLIC ROUTES_____

//LOGIN route
const loginRoute = openRouter
    .route("/login")
    //GET Request handler
    //Serves the login/sign up pages
    .get((req, res) => {
        if(req.headers.cookie && isValidToken(req.headers.cookie.split('=')[1])) 
            res.status(200).redirect("admin")
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

//SIGNUP route
const signupRoute = openRouter
    .route("/signUp")
    //GET Request handler
    //Serves the login/sign up pages
    .get((req, res) => {
        res.render("gatekeep", {
          title: "Sign Up",
          email: "",
          password: "",
          errors: "",
    })})
    //POST Request handler
    //handles new user sign up data
    .post(async (req, res) => {
        if (req.errors) {
          res.render("gatekeep", {
            title: "Sign Up",
            email: req.body.email_field,
            password: "",
            errors: req.errors
          });
        } else {
            //Checks if email already exists
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
                //Creating new user in database
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(req.body.password_field, salt);
                const user = await User.create({
                email: req.body.email_field,
                password: hash   
                })
                //console.log(user)
                //Sending auth token as cookie to client 
                res
                .status(200)
                .cookie('token', tokenise(user.email), {sameSite: true, httpOnly: true, maxAge: 60*60*24*5000})
                .redirect("/admin")
            }
        };
    })

//FORGOT PASSWORD route
const forgotPassword = openRouter
    .route("/forgotpw")
    //GET Request handler
    //Serves the OTP page
    .get((req, res) => {
        res
        .render("gatekeep", {
            title: "Verify OTP",
            email: "",
            errors: "",
      })
    })
    //POST Request handler
    //Handles the user provided OTP value 
    .post(async (req, res) => {
        if(!req.body.email_field) 
        res
        .status(401)
        .render("gatekeep", {
            title: "Verify OTP",
            email: "",
            errors: "Invalid email"
        })
        else{
            //Checks for OTP in database
            const dbOtp = await Otp.findOne({email: req.body.email_field});
            if(!dbOtp)
                res
                .status(401)
                .render("gatekeep", {
                    title: "Verify OTP",
                    email: "",
                    errors: "Invalid OTP"
                })
            else{
                //Authenticating user sent OTP 
                if(dbOtp.otp === req.body.otp_field) {
                    //console.log("asdasd")
                    res.redirect("pw/resetpwotp/"+dbOtp.otp)
                }else{
                    res
                    .status(401)
                    .render("gatekeep", {
                        title: "Verify OTP",
                        email: "",
                        password: "",
                        errors: "Invalid OTP"
                    });
                }
            }

        }
    })

//SEND OTP route
const otpService = openRouter
    .route("/getOtp")
    //POST Request handler
    //Processes forgot password requests
    .post(async (req, res) => {
        //Checks validity of user
        const dbUser = await User.findOne({email: req.body.email_field})
        //Checks if an OTP already exists for the user
        const otpExist = await Otp.findOne({email: req.body.email_field})
            if(!dbUser){
              res
              .status(401)
              .render("gatekeep", {
                title: "Verify OTP",
                email: "",
                password: "",
                errors: "Email does not exist"
              });
            }else if(otpExist){
                res
                .status(401)
                .render("gatekeep", {
                    title: "Verify OTP",
                    email: "",
                    password: "",
                    errors: "You have an unexpired OTP. Please try after some time."
              });
            }else{
                //Calculating random OTP
                const otpPayload = Math.ceil(Math.random()*9999);
                
                //Creating mail transporter object
                var transport = mailer.createTransport({
                    host: "smtp-relay.sendinblue.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: "rocketpilot763@gmail.com",
                        pass: process.env.MAILER,
                    },
                    tls : { rejectUnauthorized: false }
                });

                //Email message body
                var message = {
                    from: "rocketpilot763@gmail.com",
                    to: req.body.email_field,
                    subject: "Verfication OTP",
                    text: "Your verification OTP to reset password is: "+otpPayload,
                    html: "<p>Your verification OTP to reset password is: <u>"+otpPayload+"</u></p>"
                };
                
                //Sending OTP email
                transport.sendMail(message, async (err, info) => {
                    if(err) {
                        //console.log(err)
                        res.status(500).json({error: "Error in connection"});
                    }
                    else {
                        //Setting new OTP in database
                        const newOtp = await Otp.create({email: req.body.email_field, otp: otpPayload})    
                        if(newOtp)
                        res
                        .status(201)
                        .json({message: "OTP Sent. Please check your spam and promotions folder if you can't find it in your inbox."});
                        else res.status(500).json({error: "Error in connection"});
                    }
                })
                

            }
    })
   

module.exports.openRouter = openRouter;