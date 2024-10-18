const OfficeModel = require("../Models/ProfileModel");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");

// Create a new office record
const createOffice = async (req, res) => {
    try {
        // Upload images (addressImage and images)
        const addressImageUploads = req.files.addressImage
            ? req.files.addressImage.map(async (file) => {
                const imageUrl = file.path; // Directly use the file path since we are saving locally
                return imageUrl;
            })
            : [];
        const uploadedAddressImages = await Promise.all(addressImageUploads);

        const imageUploads = req.files.images
            ? req.files.images.map(async (file) => {
                const imageUrl = file.path; // Directly use the file path since we are saving locally
                return imageUrl;
            })
            : [];
        const uploadedImages = await Promise.all(imageUploads);

        // Create the office data
        const officeData = {
            ...req.body,
            addressImage: uploadedAddressImages,
            images: uploadedImages,
        };

        // Generate PDF from officeData
        const pdfDoc = new PDFDocument();
        const pdfFileName = `office_${Date.now()}.pdf`;
        const pdfPath = path.join(__dirname, "../Public", pdfFileName);
        console.log("PDF path:", pdfPath); // Debugging: Log PDF path
        const writeStream = fs.createWriteStream(pdfPath);
        pdfDoc.pipe(writeStream);

        // Add content to the PDF
        pdfDoc.fontSize(16).text("Office Data Report", { align: "center" });
        pdfDoc.moveDown();
        Object.keys(officeData).forEach((key) => {
            pdfDoc.fontSize(12).text(`${key}: ${officeData[key]}`, { align: "left" });
        });

        pdfDoc.end();

        // Wait for the PDF to be written to disk
        await new Promise((resolve, reject) => {
            writeStream.on("finish", resolve);
            writeStream.on("error", reject);
        });

        // No need to delete the PDF file since we want to keep it

        // Save the local PDF path (e.g., /Public/office_<timestamp>.pdf) in the database
        const officeRecord = new OfficeModel({
            ...officeData,
            pdfPath: `/Public/${pdfFileName}`, // Save the relative PDF path in the database
        });

        // Save the office data
        const savedOffice = await officeRecord.save();

        res.status(200).json({
            success: true,
            message: "Record saved successfully with PDF",
            data: savedOffice,
        });
    } catch (error) {
        console.error("Error in createOffice:", error); // Debugging: Log error
        res.status(400).json({ message: error.message });
    }
};



// Get all office records
const getAllOffices = async (req, res) => {
    try {
        const offices = await OfficeModel.find();
        if (!offices) {
            return res.status(404).json({
                success: false,
                message: "Office Not Found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Office Record found Successfull",
            data: offices
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single office record by ID
const getOfficeById = async (req, res) => {
    try {
        const office = await OfficeModel.findById(req.params.id);
        if (!office) {
            return res.status(404).json({ message: 'Office not found' });
        }
        res.status(200).json({
            success: true,
            message: "Office Record found Successfull",
            data: office
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOffice = async (req, res) => {
    try {
        const office = await OfficeModel.findById(req.params.id);
        if (!office) {
            return res.status(404).json({ message: 'Office not found' });
        }

        // Delete old images from Cloudinary if they exist
        if (office.addressImage && office.addressImage.length > 0) {
            for (const image of office.addressImage) {
                const publicId = image.split("/").pop().split(".")[0]; // Extract the public ID
                await deleteImage(publicId);
            }
        }

        if (office.images && office.images.length > 0) {
            for (const image of office.images) {
                const publicId = image.split("/").pop().split(".")[0]; // Extract the public ID
                await deleteImage(publicId);
            }
        }

        // Handling new addressImage uploads
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

        // Handling new images uploads
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

        // Update office record with both new addressImage and images
        const updatedOffice = await OfficeModel.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                addressImage: uploadedAddressImages.length > 0 ? uploadedAddressImages : office.addressImage,
                images: uploadedImages.length > 0 ? uploadedImages : office.images,
            },
            { new: true }
        );

        res.status(200).json(updatedOffice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an office record by ID
const deleteOffice = async (req, res) => {
    try {
        const office = await OfficeModel.findById(req.params.id);
        if (!office) {
            return res.status(404).json({ message: 'Office not found' });
        }

        // Delete images from Cloudinary
        if (office.addressImage && office.addressImage.length > 0) {
            for (const image of office.addressImage) {
                const publicId = image.split("/").pop().split(".")[0]; // Extract the public ID
                await deleteImage(publicId);
            }
        }

        if (office.images && office.images.length > 0) {
            for (const image of office.images) {
                const publicId = image.split("/").pop().split(".")[0]; // Extract the public ID
                await deleteImage(publicId);
            }
        }

        // Delete the office record
        await OfficeModel.findByIdAndDelete(req.params.id);
        res.status(204).json(); // No content to send back
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export the controller functions
module.exports = {
    createOffice,
    getAllOffices,
    getOfficeById,
    updateOffice,
    deleteOffice
};
