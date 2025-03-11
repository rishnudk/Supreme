const express = require("express");
const router = express.Router();
const authController = require("../controllers/adminController/authController");
const adminUserController = require("../controllers/adminController/adminUserController");
const orderController = require("../controllers/adminController/orderController");
const categoryRoutes = require("./categoryRoutes"); 
const productRoutes = require("./productRoutes")
const { adminAuth } = require("../middlewares/authMiddleware");



 


router.get("/login", authController.renderAdminLogin);
router.post("/login", authController.adminLogin);
router.get("/dashboard",adminAuth, authController.dashboard);
router.get("/logout", authController.adminLogout);

router.get("/user"   ,adminAuth,adminUserController.userManagement);
router.patch("/user/status/:userId"   ,adminAuth,adminUserController.changeUserStatus);


router.use("/category"   ,adminAuth,categoryRoutes);
router.use("/products"   ,adminAuth,productRoutes) 


router.get("/orders"   ,adminAuth, orderController.renderOrderManage);
router.get("/order/:orderId"  ,adminAuth, orderController.getOrderById);
router.patch("/order/update-status"   ,adminAuth,orderController.updateOrderStatus);








module.exports = router;
