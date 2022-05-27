const { isValidToken } = require("../utils/token")

//Middleware function to check if user is already logged in
const isAuthenticated = (req, res, next) => {
    if(req.headers.cookie){
        const token = req.headers.cookie.split('=')[1]
        req.valid = isValidToken(token)
    }
    next()
} 

module.exports.isAuthenticated = isAuthenticated