const express = require("express");

const passwordRouter = express.Router();

const changePasswordRoute = passwordRouter
    .route("/changePassword")



module.exports.passwordRouter = passwordRouter;