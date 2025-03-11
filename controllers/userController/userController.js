
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const Address = require("../../models/Address")
const User =require('../../models/User')
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");





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

   filterQuery.status = "Active";


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

    const productsFetched = await Product.find(filterQuery)
    .populate({
      path: "category",
      match: { isDeleted: false }, 
    })
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

   
    const products = productsFetched.filter(product => product.category);

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






exports.getAccount = async (req, res) => {
  try {
      if (!req.session.user) {
          console.log("User not logged in, redirecting to login...");
          return res.redirect("/user/login");
      }

      const userId = req.session.user._id;
      console.log("User ID from session:", userId);

      if (!mongoose.Types.ObjectId.isValid(userId)) {
          console.log("Invalid ObjectId format:", userId);
          return res.status(400).send("Invalid user ID");
      }

      const objectId = new mongoose.Types.ObjectId(userId);
      console.log("Converted ObjectId:", objectId);

      // Fetch orders
      const orders = await Order.find({ user: objectId }).sort({ orderDate: -1 });

      console.log("Orders fetched:", orders.length);

      res.render("user/account", { user: req.session.user, orders });
  } catch (error) {
      console.error("Error fetching account details:", error);
      res.status(500).send("Internal Server Errorxdd");
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






exports.updateProfile = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user._id); 
    const { name, email, phone } = req.body;
    
    console.log("Updating profile for:", userId);

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found!");
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // Check if email already exists (excluding current user)
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use!" });
    }

    // Update user details (without modifying other fields)
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    await user.save();

    console.log("Profile updated successfully!");
    res.status(200).json({ success: true, message: "Profile updated successfully!", user });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};






