const { createOffice } = require("../Controllers/OfficeController")
const upload = require("../Middleware/Multer")

const officeRouter = require("express").Router()

officeRouter.post("/send-record", upload.fields([
    { name: "addressImage", maxCount: 2 },
    { name: "images", maxCount: 4 }
]), createOffice)

module.exports = officeRouter