const express = require("express");
const {OAuth2Client} = require('google-auth-library');

const oauthRouter = express.Router();

//Routes for Oauth operations

const validationRoute = oauthRouter
    //Route to receive ID Token
    .route("/check")
    .post(async (req, res) => {
        //Validating token
        const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: req.body.credential,
            audience: process.env.OAUTH_CLIENT_ID
        });
        if(ticket){
            res
            .status(201)
            .clearCookie('token', {sameSite: true, httpOnly: true})
            .cookie('oauth_token', req.body.credential, {sameSite: true, httpOnly: true, maxAge: 60*60*24*5000})
            .redirect("/admin");
        }else{
            res.redirect("/");
        }
        
    })

module.exports.oauthRouter = oauthRouter