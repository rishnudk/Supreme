

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


router.put("/update/:id", upload,  adminProductController.updateProduct)


router.post("/add", upload, adminProductController.addProduct);


router.get('/inventory', adminProductController.getInventory);
router.put('/:id/stock', adminProductController.updateStock);





module.exports = router;