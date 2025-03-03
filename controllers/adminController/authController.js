const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const Admin = require('../../models/Admin')

// Render Admin Login Page
exports.renderAdminLogin = (req, res) => {
  res.render("admin/adminLogin", { title: "Admin Login" });
};

// Handle Admin Login
exports.adminLogin = async (req, res, next) => {

  const { email, password } = req.body; 
  console.log(email, password);

    if (!email || !password) {

    return res.redirect("/admin/login");
    }

    const admin = await Admin.findOne({role: "admin", email: email});
  

    if (admin){
      res.redirect('/admin/dashboard');
    }else{
      res.redirect('/admin/login');
    }

    }


exports.dashboard = (req, res) => {
  res.render("admin/dashboard", { title: "Admin Dashboard" });
};








// Admin Logout

exports.adminLogout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log("Error destroying session:", err);
        return res.redirect("/admin/login");
      }
      res.redirect("/admin/login"); // Redirect after logout
    });
  } catch (error) {
    console.log("Error logging out:", error);
    res.redirect("/admin/login");
  }
};
