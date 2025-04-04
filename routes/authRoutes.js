const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcryptjs = require("bcryptjs");
const bcrypt = require("bcrypt");


// Google OAuth Login Route
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth Callback Route
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

module.exports = router; 
