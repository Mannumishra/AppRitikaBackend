const multer = require('multer')
const fs = require("fs")
const path = require("path")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'Public'); // Use path.join for better path handling
        if (!fs.existsSync(dir)) { // Check if directory exists
            fs.mkdirSync(dir, { recursive: true }); // Create directory if it doesn't exist
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({ storage: storage })

module.exports = upload