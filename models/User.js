const { Schema, model } = require("mongoose")

//Schema for user model
const Userschema = new Schema({
    email: {
        type: String,
        required: true
    },

    password:{
        type: String,
        required: true
    },

    otp:{
        type: Number,
        required: false
    }
}, {timestamps: true}
)

const User = model('user', Userschema)

module.exports = User;