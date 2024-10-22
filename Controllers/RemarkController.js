const RemarkModel = require("../Models/RemarkModel");
const fs = require("fs");
const { uploadImage, deleteImage } = require("../Utils/cloudinaryConfig");

// Create a new remark
const createRemark = async (req, res) => {
    try {
        // Handle addressImage uploads
        const addressImageUploads = req.files.addressImage
            ? req.files.addressImage.map(async (file) => {
                const imageUrl = await uploadImage(file.path);
                // Delete file from local storage after uploading to Cloudinary
                fs.unlink(file.path, (err) => {
                    if (err) {
                        console.error("Error deleting addressImage file:", err);
                    }
                });
                return imageUrl;
            })
            : [];

        const uploadedAddressImages = await Promise.all(addressImageUploads);

        // Handle other images uploads
        const imageUploads = req.files.images
            ? req.files.images.map(async (file) => {
                const imageUrl = await uploadImage(file.path);
                // Delete file from local storage after uploading to Cloudinary
                fs.unlink(file.path, (err) => {
                    if (err) {
                        console.error("Error deleting images file:", err);
                    }
                });
                return imageUrl;
            })
            : [];

        const uploadedImages = await Promise.all(imageUploads);

        // Create a new remark record with both addressImage and images
        const remarkData = new RemarkModel({
            ...req.body,
            addressImage: uploadedAddressImages, // Store addressImage URLs
            images: uploadedImages // Store other image URLs
        });

        const savedRemark = await remarkData.save();
        res.status(201).json({
            success: true,
            message: "Remark created successfully",
            data: savedRemark
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all remarks
const getAllRemarks = async (req, res) => {
    try {
        const remarks = await RemarkModel.find();
        if (!remarks || remarks.length === 0) {
            return res.status(404).json({ success: false, message: "No remarks found" });
        }
        res.status(200).json({
            success: true,
            data: remarks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single remark by ID
const getRemarkById = async (req, res) => {
    try {
        const remark = await RemarkModel.findById(req.params.id);
        if (!remark) {
            return res.status(404).json({ message: 'Remark not found' });
        }
        res.status(200).json({
            success: true,
            data: remark
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a remark by ID
const updateRemark = async (req, res) => {
    try {
        const remark = await RemarkModel.findById(req.params.id);
        if (!remark) {
            return res.status(404).json({ message: 'Remark not found' });
        }

        // Delete old images from Cloudinary if they exist
        if (remark.addressImage && remark.addressImage.length > 0) {
            for (const image of remark.addressImage) {
                const publicId = image.split("/").pop().split(".")[0]; // Extract the public ID
                await deleteImage(publicId);
            }
        }

        if (remark.images && remark.images.length > 0) {
            for (const image of remark.images) {
                const publicId = image.split("/").pop().split(".")[0]; // Extract the public ID
                await deleteImage(publicId);
            }
        }

        // Handle new addressImage uploads
        const addressImageUploads = req.files.addressImage
            ? req.files.addressImage.map(async (file) => {
                const imageUrl = await uploadImage(file.path);
                fs.unlink(file.path, (err) => {
                    if (err) {
                        console.error("Error deleting addressImage file:", err);
                    }
                });
                return imageUrl;
            })
            : [];

        const uploadedAddressImages = await Promise.all(addressImageUploads);

        // Handle new images uploads
        const imageUploads = req.files.images
            ? req.files.images.map(async (file) => {
                const imageUrl = await uploadImage(file.path);
                fs.unlink(file.path, (err) => {
                    if (err) {
                        console.error("Error deleting images file:", err);
                    }
                });
                return imageUrl;
            })
            : [];

        const uploadedImages = await Promise.all(imageUploads);

        // Update remark record with new data and images
        const updatedRemark = await RemarkModel.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                addressImage: uploadedAddressImages.length > 0 ? uploadedAddressImages : remark.addressImage,
                images: uploadedImages.length > 0 ? uploadedImages : remark.images
            },
            { new: true }
        );

        res.status(200).json(updatedRemark);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a remark by ID
const deleteRemark = async (req, res) => {
    try {
        const remark = await RemarkModel.findById(req.params.id);
        if (!remark) {
            return res.status(404).json({ message: 'Remark not found' });
        }

        // Delete images from Cloudinary
        if (remark.addressImage && remark.addressImage.length > 0) {
            for (const image of remark.addressImage) {
                const publicId = image.split("/").pop().split(".")[0]; // Extract the public ID
                await deleteImage(publicId);
            }
        }

        if (remark.images && remark.images.length > 0) {
            for (const image of remark.images) {
                const publicId = image.split("/").pop().split(".")[0]; // Extract the public ID
                await deleteImage(publicId);
            }
        }

        // Delete the remark record
        await RemarkModel.findByIdAndDelete(req.params.id);
        res.status(204).json({ message: "Remark deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export the controller functions
module.exports = {
    createRemark,
    getAllRemarks,
    getRemarkById,
    updateRemark,
    deleteRemark
};
