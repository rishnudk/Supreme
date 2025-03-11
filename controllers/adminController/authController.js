const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const Admin = require('../../models/Admin')


exports.renderAdminLogin = (req, res) => {
  if (req.session.admin) {
      return res.redirect("/admin/dashboard"); // Redirect logged-in admins
  }
  res.render("admin/adminLogin", { title: "Admin Login" });
};






exports.adminLogin = async (req, res, next) => {
  const { email, password } = req.body; 
  console.log(email, password);
  console.log("Admin Login Attempt:", email, password);
  console.log("Session Before Login:", req.session);

  if (!email || !password) {
    return res.redirect("/admin/login");
  }

  const admin = await Admin.findOne({ role: "admin", email: email });

  if (admin) {
    req.session.admin = admin; 
    req.session.adminId = admin._id; 
    console.log("Session After Login:", req.session);

    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login');
  }
};


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
      res.redirect("/admin/login"); 
    });
  } catch (error) {
    console.log("Error logging out:", error);
    res.redirect("/admin/login");
  }
};
