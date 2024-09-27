const { createAccount, getRecord, getSingleRecord, deleteRecord, login } = require("../Controllers/SignupController")

const SignupRouter = require("express").Router()

SignupRouter.post("/sign-up", createAccount)
SignupRouter.get("/get-all-users", getRecord)
SignupRouter.get("/get-single-user/:id", getSingleRecord)
SignupRouter.delete("/delete-user/:id", deleteRecord)
SignupRouter.post("/log-in", login)

module.exports = SignupRouter