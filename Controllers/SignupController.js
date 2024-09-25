const SignupModel = require("../Models/SignupModel")
const passwordValidator = require("password-validator")
const bcrypt = require('bcrypt');
const saltRounds = 12;

var schema = new passwordValidator();

// Add properties to it
schema
    .is().min(6)
    .is().max(10)
    .has().uppercase(1)
    .has().lowercase(1)
    .has().digits(1)
    .has().not().spaces()
const createAccount = async (req, res) => {
    try {
        console.log(req.body)
        const { fullName, email, address, password } = req.body
        const errorMessage = []
        if (!fullName) errorMessage.push("FullName is required");
        if (!email) errorMessage.push("Email is required");
        if (!address) errorMessage.push("Address is required");
        if (!password) errorMessage.push("Password is required");
        if (errorMessage.length > 0) {
            return res.status(400).json({
                success: false,
                message: errorMessage.join(",")
            })
        }

        const existingUser = await SignupModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered",
            });
        }

        if (!schema.validate(password)) {
            return res.status(400).json({
                success: false,
                "message": "Password validation failed: Password must be at least 6 characters long, Password must have at least 1 uppercase letter"
            })
        }
        const hashPassword = await bcrypt.hash(password, saltRounds)
        const data = new SignupModel({ fullName, email, address, password: hashPassword })
        await data.save()
        return res.status(200).json({
            success: true,
            message: "Signup Completed Successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

module.exports = {
    createAccount
}