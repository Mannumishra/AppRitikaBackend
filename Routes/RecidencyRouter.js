const { createOffice, getAllOffices } = require("../Controllers/OfficeController")
const upload = require("../Middleware/Multer")

const recidenceRouter = require("express").Router()

recidenceRouter.post("/send-recidency-record", upload.fields([
    { name: "addressImage", maxCount: 2 },
    { name: "images", maxCount: 4 }
]), createOffice)
recidenceRouter.get("/get-recidency-record", getAllOffices)



module.exports = recidenceRouter