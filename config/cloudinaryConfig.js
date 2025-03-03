// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const multer = require("multer");
// require("dotenv").config(); // Load env variables

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Configure multer storage with Cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "products", // Cloudinary folder where images will be stored
//     allowedFormats: ["jpg", "png", "jpeg"], // Allowed file formats
//   },
// });

// const upload = multer({ storage });

// module.exports = { cloudinary, upload };

// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const multer = require("multer");
// require("dotenv").config();

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: "products",
//         allowedFormats: ["jpg", "png", "jpeg"],
//     },
// });

// const upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//         console.log("🔍 Multer File:", file);
//         if (file.fieldname === "images") cb(null, true);
//         else cb(null, false);
//     },
//     limits: { files: 3 }
// }).array("images", 3);

// module.exports = { cloudinary, upload };


// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const multer = require("multer");
// require("dotenv").config();

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: "products",
//         allowedFormats: ["jpg", "png", "jpeg"],
//     },
// });

// const upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//         console.log("🔍 Multer File:", file);
//         if (file.fieldname === "images" || file.fieldname.startsWith("variantImages-")) {
//             cb(null, true);
//         } else {
//             cb(null, false);
//         }
//     },
//     limits: { files: 12 } // Max 4 product + 3 per variant (up to 2 variants for simplicity)
// }).any();

// module.exports = { cloudinary, upload };




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
    limits: { files: 4 } // Exactly 4 product images
}).array("images", 4);

module.exports = { cloudinary, upload };