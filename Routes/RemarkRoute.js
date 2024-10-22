const express = require("express");
const upload = require("../Middleware/Multer");
const { createRemark, getAllRemarks, getRemarkById, updateRemark, deleteRemark } = require("../Controllers/RemarkController");
const RemarkRouter = express.Router();


RemarkRouter.post("/", upload.fields([{ name: 'addressImage', maxCount: 5 }, { name: 'images', maxCount: 5 }]), createRemark);
RemarkRouter.get("/", getAllRemarks);
RemarkRouter.get("/:id", getRemarkById);
RemarkRouter.put("/:id", upload.fields([{ name: 'addressImage', maxCount: 5 }, { name: 'images', maxCount: 5 }]), updateRemark);
RemarkRouter.delete("/:id", deleteRemark);

module.exports = RemarkRouter;
