const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");

// Controllers
const authController = require("../controllers/userController/authController");
const userController = require("../controllers/userController/userController");
const productController = require("../controllers/userController/productController");

// Models
const Category = require("../models/Category");
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
router.get("/profile", userController.getProfile);
router.post("/profile", userController.updateProfile);

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
router.get("/product/:id", productController.getProductByCategory);

// Cart Routes
router.post("/cart/add", productController.addToCart);
router.get("/cart", productController.getCart);

module.exports = router;
