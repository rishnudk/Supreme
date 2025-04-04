
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const Offer = require('../../models/Offer');
const Coupon = require('../../models/Coupon');
const Address = require("../../models/Address")
const User =require('../../models/User')
const Wallet =require('../../models/Wallet')
const bcrypt = require('bcryptjs'); 


const mongoose = require("mongoose");



//before offer

// exports.getShopPage = async (req, res) => {
//   try {
//     const user = req.session.user || null;
//     let {
//       search = "",
//       category = "",
//       price = "1000000",
//       sort = "latest",
//       page = "1",
//     } = req.query;
//     page = parseInt(page) || 1;

//     const limit = 9;
//     const skip = (page - 1) * limit;
//     let filterQuery = {};

//     if (category && category.trim() !== "") {
//       const categories = category.split(",").map((cat) => cat.trim());

//       const categoryDocs = await Category.find(
//         { name: { $in: categories } },
//         "_id"
//       );
//       const categoryIds = categoryDocs.map((cat) => cat._id);

//       if (categoryIds.length > 0) {
//         filterQuery.category = { $in: categoryIds };
//       }
//     }

//     if (!isNaN(price) && parseInt(price) > 0) {
//       filterQuery.price = { $lte: parseInt(price) };
//     }

//     if (search && search.trim() !== "") {
//       filterQuery.name = { $regex: search, $options: "i" };
//     }

//    filterQuery.status = "Active";


//     let sortQuery = {};
//     if (sort === "low-to-high") {
//       sortQuery.price = 1;
//     } else if (sort === "high-to-low") {
//       sortQuery.price = -1;
//     } else if (sort === "name-asc") {
//       sortQuery.name = 1;
//     } else if (sort === "name-desc") {
//       sortQuery.name = -1;
//     } else {
//       sortQuery.createdAt = -1;
//     }

//     console.log("Sorting by:", sort);
//     console.log("Sort Query:", sortQuery);

//     const productsFetched = await Product.find(filterQuery)
//     .populate({
//       path: "category",
//       match: { isDeleted: false }, 
//     })
//     .sort(sortQuery)
//     .skip(skip)
//     .limit(limit);

   
//     const products = productsFetched.filter(product => product.category);

//     const totalProducts = await Product.countDocuments(filterQuery);
//     const totalPages = Math.ceil(totalProducts / limit);

//     res.render("user/shop", {
//       products,
//       user,
//       totalPages,
//       currentPage: page,
//       sort,
//       search,
//       category,
//       price,
//     });
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).send("Server Error");
//   }
// };



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

    // Fetch active offers
    const currentDate = new Date();
    const activeOffers = await Offer.find({
      isActive: true,
      expiryDate: { $gte: currentDate }
    });

    const productsFetched = await Product.find(filterQuery)
      .populate({
        path: "category",
        match: { isDeleted: false },
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const products = productsFetched.filter(product => product.category).map(product => {
      // Find applicable offers for this product
      const productOffers = activeOffers.filter(offer => 
        (offer.applicableTo === "product" && offer.productId?.toString() === product._id.toString()) ||
        (offer.applicableTo === "category" && offer.categoryId?.toString() === product.category?._id.toString())
      );
      
      return {
        ...product.toObject(),
        offers: productOffers
      };
    });

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




// exports.getAccount = async (req, res) => {
//   try {
//       if (!req.session.user) {
//           console.log("User not logged in, redirecting to login...");
//           return res.redirect("/user/login");
//       }

//       const userId = req.session.user._id;
//       console.log("User ID from session:", userId);

//       if (!mongoose.Types.ObjectId.isValid(userId)) {
//           console.log("Invalid ObjectId format:", userId);
//           return res.status(400).send("Invalid user ID");
//       }

//       const objectId = new mongoose.Types.ObjectId(userId);
//       console.log("Converted ObjectId:", objectId);

//       // Fetch orders
//       const orders = await Order.find({ user: objectId }).sort({ orderDate: -1 });

//       console.log("Orders fetched:", orders.length);

//       res.render("user/account", { user: req.session.user, orders });
//   } catch (error) {
//       console.error("Error fetching account details:", error);
//       res.status(500).send("Internal Server Errorxdd");
//   }
// };
 



//og


// exports.getAccount = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       console.log("User not logged in, redirecting to login...");
//       return res.redirect("/user/login");
//     }

//     const userId = req.session.user._id;
//     console.log("User ID from session:", userId);

//     const objectId = new mongoose.Types.ObjectId(userId);
//     console.log("Converted ObjectId:", objectId);

//     // Fetch orders
//     const orders = await Order.find({ user: objectId }).sort({ orderDate: -1 });
//     console.log("Orders fetched:", orders.length);

//     res.render("user/account", { user: req.session.user, orders });
//   } catch (error) {
//     console.error("Error fetching account details:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };



// exports.getAccount = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       console.log("Debug: No user in session");
//       return res.redirect("/login");
//   }

//     const userId = req.session.user._id;
//     console.log("User ID from session:", userId);

//     const objectId = new mongoose.Types.ObjectId(userId);
//     console.log("Converted ObjectId:", objectId);

//     // Pagination parameters
//     const page = parseInt(req.query.page) || 1;
//     const limit = 6;
//     const skip = (page - 1) * limit;

//     // Fetch total orders for pagination
//     const totalOrders = await Order.countDocuments({ user: objectId });
//     console.log("Total orders:", totalOrders);

//     // Fetch orders with pagination
//     const orders = await Order
//       .find({ user: objectId })
//       .sort({ orderDate: -1 }) // Newest first
//       .skip(skip)
//       .limit(limit);
//     console.log("Orders fetched for page", page, ":", orders.length);

//     // Calculate pagination details
//     const totalPages = Math.ceil(totalOrders / limit);
//     const hasNextPage = page < totalPages;
//     const hasPrevPage = page > 1;

//     // Debug log
//     console.log("Rendering data:", {
//       ordersCount: orders.length,
//       currentPage: page,
//       totalPages,
//       hasNextPage,
//       hasPrevPage,
//       totalOrders
//     });

//     res.render("user/account", { 
//       user: req.session.user,
//       orders,
//       currentPage: page,
//       totalPages,
//       hasNextPage,
//       hasPrevPage,
//       totalOrders
//     });
//   } catch (error) {
//     console.error("Error fetching account details:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };



exports.getAccount = async (req, res) => {
    try {
        if (!req.session.user) {
            console.log("Debug: No user in session");
            return res.redirect("/login");
        }

        const userId = req.session.user._id;
        console.log("User ID from session:", userId);

        const objectId = new mongoose.Types.ObjectId(userId);
        console.log("Converted ObjectId:", objectId);

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        // Status filter from query (e.g., ?status=Pending)
        const status = req.query.status || "All Orders"; // Default to all orders
        console.log("Filter status:", status);

        // Build query
        const query = { user: objectId };
        if (status !== "All Orders") {
            query.orderStatus = status;
        }

        // Fetch total orders for pagination
        const totalOrders = await Order.countDocuments(query);
        console.log("Total orders:", totalOrders);

        // Fetch orders with pagination and filter
        const orders = await Order
            .find(query)
            .sort({ orderDate: -1 }) // Newest first
            .skip(skip)
            .limit(limit);
        console.log("Orders fetched for page", page, ":", orders.length);

        // Calculate pagination details
        const totalPages = Math.ceil(totalOrders / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        // Debug log
        console.log("Rendering data:", {
            ordersCount: orders.length,
            currentPage: page,
            totalPages,
            hasNextPage,
            hasPrevPage,
            totalOrders,
            status
        });

        res.render("user/account", { 
            user: req.session.user,
            orders,
            currentPage: page,
            totalPages,
            hasNextPage,
            hasPrevPage,
            totalOrders,
            selectedStatus: status // Pass current filter to template
        });
    } catch (error) {
        console.error("Error fetching account details:", error);
        res.status(500).send("Internal Server Error");
    }
};














exports.renderReferral = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.session.user || !req.session.user._id) {
            console.error("User is not logged in or session expired.");
            return res.status(401).redirect("/user/login?error=" + encodeURIComponent("Please log in to view your referral dashboard"));
        }

        const userId = req.session.user._id;
        console.log("Fetching referral data for User ID:", userId);

        const page = parseInt(req.query.page) || 1; // Get page from query, default to 1
        const limit = 5; // Number of referrals per page
        const skip = (page - 1) * limit;

        // Fetch the current user
        const user = await User.findById(userId);
        if (!user) {
            console.error("User not found in database for ID:", userId);
            return res.status(404).render("user/error", {
                message: "User not found",
                title: "Error"
            });
        }

        // Fetch the user's wallet (main balance)
        let wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            wallet = new Wallet({
                user: userId,
                currency: 'INR'
            });
            await wallet.save();
        }

        // Fetch referred users (those who used this user's referralCode)
        const referredUsersQuery = User.find({ referredBy: user.referralCode })
            .select('name email createdAt status') // Only fetch needed fields
            .sort({ createdAt: -1 }); // Newest first

        const totalReferrals = await User.countDocuments({ referredBy: user.referralCode });
        const referredUsers = await referredUsersQuery
            .skip(skip)
            .limit(limit);

        // Update session data for consistency
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            referralCode: user.referralCode,
            wallet: user.wallet // Referral earnings
        };

        // Render the referral page
        res.render('user/referral', {
            title: 'Your Referral Dashboard',
            referralCode: user.referralCode,
            wallet: user.wallet, // Referral earnings from User.wallet
            mainBalance: wallet.balance, // Main wallet balance from Wallet.balance
            name: user.name,
            user: req.session.user,
            referredUsers: referredUsers, // List of referred users
            totalReferrals: totalReferrals, // Total number of referrals
            currentPage: page, // Current page for pagination
            hasMore: (page * limit) < totalReferrals, // Flag for "Load More" button
            errorMessage: req.query.error || null, // Pass error from query (e.g., login redirect)
            successMessage: req.flash('success') || req.query.success || null // Support flash or query success
        });
    } catch (error) {
        console.error('Error rendering referral page:', error.message, error.stack);
        res.status(500).render("user/error", {
            message: "Internal Server Error",
            title: "Error"
        });
    }
};















exports.transferReferralBalance = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { amount } = req.body; // Amount from the frontend
        const transferAmount = parseInt(amount);

        // Validate input
        if (!transferAmount || transferAmount < 100) {
            return res.status(400).json({ success: false, error: 'Amount must be at least 100 INR' });
        }

        // Fetch user and wallet
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (transferAmount > user.wallet) {
            return res.status(400).json({ success: false, error: 'Insufficient referral earnings' });
        }

        let wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            wallet = new Wallet({
                user: userId,
                currency: 'INR'
            });
        }

        // Perform the transfer
        wallet.balance += transferAmount;
        user.wallet -= transferAmount;

        // Log the transaction
        wallet.transactions.push({
            type: 'credit',
            amount: transferAmount,
            description: 'Referral balance transfer'
        });

        // Save both documents
        await Promise.all([wallet.save(), user.save()]);

        // Update session
        req.session.user.wallet = user.wallet;

        console.log(`Transferred ${transferAmount} INR from User.wallet to Wallet.balance for user ${userId}`);
        res.json({ success: true, message: `Transferred ₹${transferAmount} to your main wallet!` });
    } catch (error) {
        console.error('Error transferring referral balance:', error.message, error.stack);
        res.status(500).json({ success: false, error: 'Server error during transfer' });
    }
};









exports.renderUserProfile = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.session.user || !req.session.user._id) {
            console.error("User is not logged in or session expired.");
            return res.status(401).redirect("/user/login?error=" + encodeURIComponent("Please log in to edit your profile"));
        }

        const userId = req.session.user._id;
        console.log("Fetching profile for User ID:", userId);

        // Fetch only name, email, and phone (password isn’t fetched for security)
        const user = await User.findById(userId)
            .select("name email phone")
            .lean();

        if (!user) {
            console.error("User not found in database for ID:", userId);
            return res.status(404).render("user/error", {
                message: "User not found",
                title: "Error"
            });
        }

        // Render the profile edit page
        res.render("user/profile", {
            user,
            title: "Edit Profile",
            errorMessage: req.query.error || null,
            successMessage: req.query.success || null // For success feedback after update
        });
    } catch (error) {
        console.error("Error fetching user profile:", error.message, error.stack);
        res.status(500).render("user/error", {
            message: "Internal Server Error",
            title: "Error"
        });
    }
};



exports.updateProfile = async (req, res) => {
  try {
      if (!req.session.user || !req.session.user._id) {
          return res.status(401).json({ success: false, message: "Please log in to update your profile" });
      }

      const userId = req.session.user._id;
      const { name, phone } = req.body;

      // Check if phone is already in use by another user
      const phoneExists = await User.findOne({ phone, _id: { $ne: userId } });
      if (phoneExists) {
          return res.status(400).json({ success: false, message: "Phone number already registered" });
      }

      const user = await User.findByIdAndUpdate(
          userId,
          { name, phone },
          { new: true, runValidators: true }
      );

      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      req.session.user.name = user.name;
      req.session.user.phone = user.phone;

      res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
      console.error("Error updating profile:", error.message, error.stack);
      res.status(500).json({ success: false, message: error.message || "Failed to update profile" });
  }
};




exports.updatePassword = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user._id) {
            return res.status(401).json({ success: false, message: "Please log in to update your password" });
        }

        const userId = req.session.user._id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error.message, error.stack);
        res.status(500).json({ success: false, message: error.message || "Failed to update password" });
    }
};