

const express = require("express"); 
const router = express.Router();
const adminProductController = require("../controllers/adminController/productController");
const userProductController = require("../controllers/userController/productController");
const { upload } = require("../config/cloudinaryConfig");
const { adminAuth } = require("../middlewares/authMiddleware");



//admin routes
router.get("/",adminAuth, adminProductController.getProducts);
router.get("/add",adminAuth, adminProductController.GetaddProduct);
router.get("/edit/:id",adminAuth, adminProductController.getProductById);
// router.put("/update/:id", upload, adminProductController.updateProduct);


router.put("/update/:id", upload,adminAuth,  adminProductController.updateProduct)


router.post("/add", upload, adminAuth, adminProductController.addProduct);


router.get('/inventory',adminAuth, adminProductController.getInventory);
router.put('/:id/stock',adminAuth, adminProductController.updateStock);





module.exports = router;