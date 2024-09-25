const dotenv = require("dotenv")
dotenv.config()
const express = require("express")

const app = express()

const cors = require("cors")
const { connectDatabase } = require("./DB/ConnectDataBase")
const SignupRouter = require("./Routes/SignupRoutes")

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Server Is Running")
})

app.use("/api", SignupRouter)


app.listen(process.env.PORT, () => {
    console.log(`Server Is Running At ${process.env.PORT}`)
})

connectDatabase()