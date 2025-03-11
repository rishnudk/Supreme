// const express = require("express");
// const router = express.Router();
// const productController = require("../controllers/adminController/productController");
// const { upload } = require("../config/cloudinaryConfig"); 


// router.get("/", productController.getProducts);
// router.get("/add", productController.GetaddProduct); 
// router.get("/edit/:id", productController.getProductById);
// router.put("/update/:id", upload.array("images", 3), productController.updateProduct);
// router.post("/add",upload.array("images", 3),productController.addProduct); 


// module.exports = router;


const express = require("express"); 
const router = express.Router();
const adminProductController = require("../controllers/adminController/productController");
const userProductController = require("../controllers/userController/productController");
const { upload } = require("../config/cloudinaryConfig");


//admin routes
router.get("/", adminProductController.getProducts);
router.get("/add", adminProductController.GetaddProduct);
router.get("/edit/:id", adminProductController.getProductById);
// router.put("/update/:id", upload, adminProductController.updateProduct);


router.put("/update/:id", upload, async (req, res) => {
  console.log("🔍 Files received by Multer:", req.files); // Existing debug
  console.log("🔍 All Form Fields:", req.body); // Debug all fields
  console.log("🔍 Total Files Attempted:", req.files ? req.files.length : 0);
  await adminProductController.updateProduct(req, res);
});

router.post("/add", upload, adminProductController.addProduct);





module.exports = router;