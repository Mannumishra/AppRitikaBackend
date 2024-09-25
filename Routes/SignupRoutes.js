const { createAccount } = require("../Controllers/SignupController")

const SignupRouter = require("express").Router()

SignupRouter.post("/sign-up" ,createAccount)

module.exports = SignupRouter