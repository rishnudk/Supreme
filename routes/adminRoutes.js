const express = require("express");
const router = express.Router();
const authController = require("../controllers/adminController/authController");
const adminUserController = require("../controllers/adminController/adminUserController");
const categoryRoutes = require("./categoryRoutes"); 
const productRoutes = require("./productRoutes")

console.log("Auth Controller:", authController);
console.log("Admin User Controller:", adminUserController);


router.get("/login", authController.renderAdminLogin);
router.post("/login", authController.adminLogin);
router.get("/dashboard", authController.dashboard);
router.get("/logout", authController.adminLogout);

router.get("/user", adminUserController.userManagement);
router.patch("/user/status/:userId", adminUserController.changeUserStatus);


router.use("/category", categoryRoutes);
router.use("/products", productRoutes) 

module.exports = router;
