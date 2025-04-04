const User = require("../../models/User");
const bcrypt = require("bcrypt");
const bcryptjs = require("bcryptjs");

const passport = require("passport");
const Admin = require('../../models/Admin')
const Order = require('../../models/Order')


exports.renderAdminLogin = (req, res) => {
  if (req.session.admin) {
      return res.redirect("/admin/salesReport"); // Redirect logged-in admins
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

    res.redirect('/admin/salesReport');
  } else {
    res.redirect('/admin/login');
  }
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







exports.dashboard = async (req, res) => {
    try {
        // Get query parameters
        const period = req.query.period || 'daily';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Basic counts
        const totalOrders = await Order.countDocuments({ status: "Delivered" });
        const totalUsers = await User.countDocuments();
        const totalProducts = await Order.aggregate([
            { $match: { status: "Delivered" } },
            { $unwind: "$orderedItems" },
            { $group: { _id: "$orderedItems.product" } },
            { $count: "totalProducts" }
        ]);

        // Set date range based on period
        const current = new Date();
        const matchStage = {};
        
        switch (period) {
            case 'daily':
                matchStage.createdAt = {
                    $gte: new Date(current.setHours(0, 0, 0, 0)),
                    $lte: new Date(current.setHours(23, 59, 59, 999))
                };
                break;
            case 'weekly':
                const startOfWeek = new Date(current);
                startOfWeek.setDate(current.getDate() - current.getDay());
                matchStage.createdAt = {
                    $gte: new Date(startOfWeek.setHours(0, 0, 0, 0)),
                    $lte: new Date(current.setHours(23, 59, 59, 999))
                };
                break;
            case 'monthly':
                matchStage.createdAt = {
                    $gte: new Date(current.getFullYear(), current.getMonth(), 1),
                    $lte: new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999)
                };
                break;
            case 'yearly':
                matchStage.createdAt = {
                    $gte: new Date(current.getFullYear(), 0, 1),
                    $lte: new Date(current.getFullYear(), 11, 31, 23, 59, 59, 999)
                };
                break;
        }

        // Get total pages for pagination
        const totalItems = await Order.countDocuments({
            status: "Delivered",
            createdAt: matchStage.createdAt
        });
        const totalPages = Math.ceil(totalItems / limit);

        // Fetch dashboard data including detailed sales data
        const [salesDataAgg, topSellingProducts, topSellingCategories, topSellingBrands] = await Promise.all([
            Order.aggregate([
                { $match: { ...matchStage, status: "Delivered" } },
                { $unwind: "$orderedItems" },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: period === 'daily' ? { $dayOfMonth: "$createdAt" } : null
                        },
                        totalSales: { $sum: "$orderedItems.totalPrice" },
                        totalOrders: { $sum: 1 },
                        totalCustomers: { $addToSet: "$userId" },
                        productDetails: {
                            $push: {
                                name: "$orderedItems.product", // You'll need a lookup for actual names
                                quantity: "$orderedItems.quantity"
                            }
                        }
                    }
                },
                {
                    $project: {
                        period: {
                            $concat: [
                                { $toString: "$_id.year" },
                                period === 'daily' || period === 'monthly' ? "-" : "",
                                period === 'daily' || period === 'monthly' ? { $toString: "$_id.month" } : "",
                                period === 'daily' ? "-" : "",
                                period === 'daily' ? { $toString: "$_id.day" } : ""
                            ]
                        },
                        totalSales: 1,
                        totalOrders: 1,
                        totalCustomers: { $size: "$totalCustomers" },
                        products: "$productDetails",
                        avgOrderValue: { $divide: ["$totalSales", "$totalOrders"] }
                    }
                },
                { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
                { $skip: skip },
                { $limit: limit }
            ]),
            Order.aggregate([
                { $match: matchStage },
                { $unwind: "$orderedItems" },
                { $match: { status: "Delivered" } },
                {
                    $group: {
                        _id: "$orderedItems.product",
                        totalQuantity: { $sum: "$orderedItems.quantity" },
                        totalRevenue: { $sum: "$orderedItems.totalPrice" }
                    }
                },
                { $sort: { totalQuantity: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                { $unwind: "$productDetails" },
                {
                    $project: {
                        name: "$productDetails.name",
                        totalQuantity: 1,
                        totalRevenue: 1
                    }
                }
            ]),
            Order.aggregate([
                { $match: matchStage },
                { $unwind: "$orderedItems" },
                { $match: { status: "Delivered" } },
                {
                    $lookup: {
                        from: "products",
                        localField: "orderedItems.product",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                { $unwind: "$productDetails" },
                {
                    $group: {
                        _id: "$productDetails.category",
                        totalSales: { $sum: "$orderedItems.quantity" },
                        totalRevenue: { $sum: "$orderedItems.totalPrice" }
                    }
                },
                { $sort: { totalSales: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "categories",
                        localField: "_id",
                        foreignField: "_id",
                        as: "categoryDetails"
                    }
                },
                { $unwind: "$categoryDetails" },
                {
                    $project: {
                        categoryName: "$categoryDetails.name",
                        totalSales: 1,
                        totalRevenue: 1
                    }
                }
            ]),
            Order.aggregate([
                { $match: matchStage },
                { $unwind: "$orderedItems" },
                { $match: { status: "Delivered" } },
                {
                    $group: {
                        _id: "$orderedItems.brand",
                        totalSales: { $sum: "$orderedItems.quantity" },
                        totalRevenue: { $sum: "$orderedItems.totalPrice" }
                    }
                },
                { $sort: { totalSales: -1 } },
                { $limit: 5 },
                {
                    $project: {
                        brand: "$_id",
                        totalSales: 1,
                        totalRevenue: 1
                    }
                }
            ])
        ]);

        const SaleTotal = salesDataAgg.reduce((sum, item) => sum + item.totalSales, 0);
        const salesData = salesDataAgg.map(item => ({
            period: item.period,
            sales: item.totalSales,
            orders: item.totalOrders,
            customers: item.totalCustomers,
            avgOrderValue: item.avgOrderValue.toFixed(2),
            products: item.products.map(p => ({
                name: p.name, // Note: this is product ID unless you add a lookup
                quantity: p.quantity
            }))
        }));

        // Render the dashboard
        res.render('admin/dashboard', {
            period,
            SaleTotal,
            totalOrders: totalOrders || 0,
            totalUsers: totalUsers || 0,
            totalProducts: totalProducts.length > 0 ? totalProducts : [{ totalProducts: 0 }],
            topSellingProducts,
            topSellingCategories,
            topSellingBrands,
            errorMessage: null,
            page,
            totalPages,
            periodForPage: period,
            limit,
            salesData // Added sales data for the table
        });

    } catch (error) {
        console.error('Error in dashboard:', error);
        res.render('admin/dashboard', {
            period: 'daily',
            SaleTotal: 0,
            totalOrders: 0,
            totalUsers: 0,
            totalProducts: [{ totalProducts: 0 }],
            topSellingProducts: [],
            topSellingCategories: [],
            topSellingBrands: [],
            errorMessage: 'Failed to load dashboard data',
            page: 1,
            totalPages: 1,
            periodForPage: 'daily',
            limit: 10,
            salesData: []
        });
    }
};