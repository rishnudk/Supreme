

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "products",
        allowedFormats: ["jpg", "png", "jpeg"], 
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log("🔍 Multer File:", file);
        if (file.fieldname === "images") {
            cb(null, true);
        } else {
            cb(null, false); 
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } 
}).array("images", 4); 

module.exports = { cloudinary, upload };