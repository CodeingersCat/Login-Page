const { Schema, model } = require("mongoose")

//Schema for OTP model
const Otpschema = new Schema({
    email: {
        type: String,
        required: true
    },

    otp:{
        type: String,
        required: true
    },

    "expireAt": { 
        type: Date,
        default: new Date() 
    }

}, 

{
    
},

{timestamps: true})

const Otp = model('otp', Otpschema)

module.exports = Otp;