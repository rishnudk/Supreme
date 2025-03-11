const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");
const { isAuthenticated } = require("../middlewares/authMiddleware");

// Controllers
const authController = require("../controllers/userController/authController");
const userController = require("../controllers/userController/userController");
const productController = require("../controllers/userController/productController");
const addressController = require("../controllers/userController/addressController");
const cartController = require("../controllers/userController/cartController")
const checkoutController = require("../controllers/userController/checkoutController")
const orderController = require("../controllers/userController/orderController")

// Models
const Category = require("../models/Category");
const Address = require("../models/Address");
const Product = require("../models/Product");

// ===============================
// 🔹 Authentication Routes
// ===============================

// User Login Page
router.get("/login", (req, res) => {
  res.render("user/userLogin");
});

// Handle User Login
router.post("/login", authController.login);

// User Signup Page
router.get("/signup", (req, res) => {
  res.render("user/signup", { title: "User Signup" });
});

// Handle User Signup
router.post("/signup", authController.signup);

// Google Authentication
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/user/login" }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/user/home");
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/user/home");
  });
});

// ===============================
// 🔹 User Home & Profile Routes
// ===============================

// User Home Page (After Login)
router.get("/home", (req, res) => {
  res.render("user/home", { user: req.session.user });
});

// User Profile

// ===============================
// 🔹 Forgot Password & OTP Verification
// ===============================

// Forgot Password (Request OTP)
router.get("/forgot-password", (req, res) => {
  res.render("user/forgotPassword");
});
router.post("/forgot-password", authController.requestOtp);

// Verify OTP Page
router.get("/verify-otp", (req, res) => {
  res.render("user/verifyOtp");
});
router.post("/verify-otp", authController.verifyOtp);

// Reset Password
router.post("/reset-password", authController.changeforgetpass);

// Verify OTP via Controller
router.get("/verifyOtp", authController.getVerifyOtp);

// ===============================
// 🔹 Product & Shopping Routes
// ===============================

// Shop Page (Product Listing) 
router.get("/shop", userController.getShopPage);

// Product Details Route
router.get("/product/category/:id", productController.getProductByCategory);
router.get("/product/:id", productController.getProductById);

router.post("/address", addressController.addAddress);
router.get("/address", addressController.getAddressPage);
router.put('/edit/:id', addressController.updateAddress)
router.get('/address/:id', addressController.getAddressById);
router.delete('/address/:id', addressController.deleteAddress);

// router.post("/add", authController.isAuthenticated, addressController.addAddress);

// Cart Routes 
router.get('/cart',  cartController.getCartPage);
router.post("/cart/add", cartController.addToCart);
router.post('/cart/update-quantity', cartController.updateCartQuantity);
router.post('/cart/remove', cartController.removeFromCart);


//checkout
router.get("/checkout", checkoutController.getCheckoutPage);
router.post('/checkout/address/add', checkoutController.addAddress)
router.put('/checkout/address/:id', checkoutController.updateAddress)
router.get('/checkout/address/:id', checkoutController.getAddress)


//order
router.post("/place-order", orderController.placeOrder)

//profile
router.get("/account", userController.getAccount);

router.get('/profile',  userController.renderUserProfile);
router.post('/change-password',  userController.changePassword);





module.exports = router;
