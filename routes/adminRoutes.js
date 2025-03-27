const express = require("express");
const router = express.Router();
const authController = require("../controllers/adminController/authController");
const adminUserController = require("../controllers/adminController/adminUserController");
const salesReportController = require("../controllers/adminController/salesReportController");
const couponController = require("../controllers/adminController/couponController");
const orderController = require("../controllers/adminController/orderController");
const ProductController = require("../controllers/adminController/productController");
const offerController = require("../controllers/adminController/offerController");
const walletController = require("../controllers/adminController/walletController");
const categoryRoutes = require("./categoryRoutes"); 
const productRoutes = require("./productRoutes")
const { adminAuth } = require("../middlewares/authMiddleware");
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');



 


router.get("/login", authController.renderAdminLogin);
router.post("/login", authController.adminLogin);
router.get("/dashboard",adminAuth, authController.dashboard);

router.get("/logout", authController.adminLogout);

router.get("/user"   ,adminAuth,adminUserController.userManagement);
router.patch("/user/status/:userId"   ,adminAuth,adminUserController.changeUserStatus);


router.use("/category"   ,adminAuth,categoryRoutes);
router.use("/products"   ,adminAuth,productRoutes) 

//order routes
router.get("/orders"   ,adminAuth, orderController.renderOrderManage);
router.get("/order/:orderId"  ,adminAuth, orderController.getOrderById);
router.patch("/order/update-status"   ,adminAuth,orderController.updateOrderStatus);
router.post('/orders/accept-return',adminAuth, orderController.acceptReturnRequest);

router.get('/return-requests', adminAuth, orderController.renderReturnRequestsList);
router.put('/:orderId/update-product-status',adminAuth, orderController.updateProductStatus);




//coupon routes
router.get("/coupons", adminAuth, couponController.getCouponManagePage);
router.post("/coupons/add", adminAuth, couponController.addCoupon)
router.put('/coupons/update/:id', couponController.updateCoupon);
router.get('/coupons/:id', couponController.getCouponById);
router.delete('/coupons/delete/:id', couponController.deleteCoupon);


//offer routes

router.get("/offers", adminAuth, offerController.getOfferManagePage);
router.post("/offers/add", adminAuth, offerController.addOffer);
router.post("/offers/update/:id", adminAuth, offerController.updateOffer);
router.post('/offers/delete/:id',adminAuth, offerController.deleteOffer);


//sales report

router.get('/salesReport', adminAuth,salesReportController.getSalesReport);

//wallet

router.get('/wallet', adminAuth,  walletController.getWalletManagement);
router.get('/wallet-order/:orderId', adminAuth, walletController.getWalletOrderDetails);





module.exports = router;
