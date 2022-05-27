const { body, validationResult } = require("express-validator")

//Middleware to validate form data
const validateEntry = (
    body('email_field').isLength({max: 20}),
    body('password_field').isLength({min: 8}).isAlphanumeric(),
    body('repassword_field').matches(body('password_field')),
    (req, res, next) => {
    const {errors} = validationResult(req)
    if(errors.length !== 0) req.errors = errors.array()
    next()
})

module.exports.validateEntry = validateEntry

