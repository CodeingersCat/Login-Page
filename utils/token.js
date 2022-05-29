const jwt = require("jsonwebtoken");

//generates token
const tokenise = (data) => {
    const token = jwt.sign({data}, process.env.SECRET, {expiresIn: '5d'})
    return token;
}

//verifies auth token
const isValidToken = (token) => {
    try {
        return jwt.verify(token, process.env.SECRET)
    }catch(err){
        return false
    }
}

const decode = (token) => {
    return jwt.decode(token)
}

module.exports = {tokenise, isValidToken, decode}
