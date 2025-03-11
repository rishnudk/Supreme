
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Address = require("../../models/Address")
const User =require('../../models/User')
const bcrypt = require('bcrypt');
const { default: mongoose } = require("mongoose");


exports.getShopPage = async (req, res) => {
  try {
    const user = req.session.user || null;
    let {
      search = "",
      category = "",
      price = "1000000",
      sort = "latest",
      page = "1",
    } = req.query;
    page = parseInt(page) || 1;

    const limit = 9;
    const skip = (page - 1) * limit;
    let filterQuery = {};

    if (category && category.trim() !== "") {
      const categories = category.split(",").map((cat) => cat.trim());

      const categoryDocs = await Category.find(
        { name: { $in: categories } },
        "_id"
      );
      const categoryIds = categoryDocs.map((cat) => cat._id);

      if (categoryIds.length > 0) {
        filterQuery.category = { $in: categoryIds };
      }
    }

    if (!isNaN(price) && parseInt(price) > 0) {
      filterQuery.price = { $lte: parseInt(price) };
    }

    if (search && search.trim() !== "") {
      filterQuery.name = { $regex: search, $options: "i" };
    }

    let sortQuery = {};
    if (sort === "low-to-high") {
      sortQuery.price = 1;
    } else if (sort === "high-to-low") {
      sortQuery.price = -1;
    } else if (sort === "name-asc") {
      sortQuery.name = 1;
    } else if (sort === "name-desc") {
      sortQuery.name = -1;
    } else {
      sortQuery.createdAt = -1;
    }

    console.log("Sorting by:", sort);
    console.log("Sort Query:", sortQuery);

    const products = await Product.find(filterQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    res.render("user/shop", {
      products,
      user,
      totalPages,
      currentPage: page,
      sort,
      search,
      category,
      price,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server Error");
  }
};




// controllers/userController.js

exports.getAccount = async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect("/user/login");
      }
  
      res.render("user/account", { user: req.session.user });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).send("Server Error");
    }
  };
  
 


  exports.renderUserProfile = async (req, res) => {
    try {
        // Debugging logs
       console.log("Session Data:", req.session);

        if (!req.session.user || !req.session.user._id) {
            console.error("User is not logged in or session expired.");
            // return res.status(401).render("errorPage", { message: "Unauthorized! Please log in." });
        }

        const userId = req.session.user._id;
        const user = await User.findById(userId);

        if (!user) {
            console.error("User not found in database!");
            // return res.status(404).render("errorPage", { message: "User not found" });
        }

        res.render("user/profile", { user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        // res.status(500).render("errorPage", { message: "Internal Server Error" });
    }
};

exports.changePassword = async (req, res) => {
  try {
   
    
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = new mongoose.Types.ObjectId(req.session.user._id);
     ; // Assuming session stores logged-in user ID
    
    console.log("Received request:", userId); // Debugging step 1
    // Fetch user from database

      const user = await User.findById(userId);
      if (!user) { 
        console.log("User not logged in!"); // Debugging step 2

          return res.status(404).json({ success: false, message: "User not found!" });
      }

      // Check if current password matches
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        console.log("Incorrect current password!"); // Debugging step 4

          return res.status(400).json({ success: false, message: "Incorrect current password!" });
      }

      // Validate new password
      if (newPassword !== confirmPassword) {
        console.log("New passwords do not match!"); // Debugging step 5

          return res.status(400).json({ success: false, message: "New passwords do not match!" });
      }

      // if (!validatePassword(newPassword)) {
      //   console.log("Password does not meet the requirements!"); // Debugging step 6

      //     return res.status(400).json({ success: false, message: "Password does not meet the requirements!" });
      // }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();


      console.log("Password updated successfully!"); // Debugging step 7


      res.status(200).json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
      console.error("Error changing password:", error); // debug 8
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
