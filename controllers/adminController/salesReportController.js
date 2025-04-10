const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require('bcryptjs'); 



const Cart = require("../../models/Cart");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Order = require("../../models/Order");
const Wallet = require("../../models/Wallet");
const router = express.Router();
const Product = require("../../models/Product");
const Category = require("../../models/Category");

const Offer = require("../../models/Offer");
const Coupon = require("../../models/Coupon");

const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");










exports.getSalesReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      quickSelect,
      download,
      page = 1,
      limit = 10,
      format,
      debug,
    } = req.query;
    console.log("Query Params:", {
      startDate,
      endDate,
      quickSelect,
      download,
      page,
      limit,
      format,
      debug,
    });

    let dateFilter = {};
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (startDate && endDate && quickSelect === "custom") {
      dateFilter = {
        orderDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else if (quickSelect && quickSelect !== "custom") {
      switch (quickSelect) {



       



          case "today":
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0); // Start of today
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999); // End of today
  dateFilter.orderDate = {
    $gte: startOfDay,
    $lte: endOfDay,
  };



  break;
        case "last7days":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - 7);
          weekStart.setHours(0, 0, 0, 0);
          dateFilter.orderDate = { $gte: weekStart, $lte: today };
          break;
        case "last30days":
          const monthStart = new Date(today);
          monthStart.setDate(today.getDate() - 30);
          monthStart.setHours(0, 0, 0, 0);
          dateFilter.orderDate = { $gte: monthStart, $lte: today };
          break;
        case "year":
          const yearStart = new Date(today.getFullYear(), 0, 1);
          yearStart.setHours(0, 0, 0, 0);
          dateFilter.orderDate = { $gte: yearStart, $lte: today };
          break;
        default:
          const defaultStart = new Date(today);
          defaultStart.setDate(today.getDate() - 30);
          defaultStart.setHours(0, 0, 0, 0);
          dateFilter.orderDate = { $gte: defaultStart, $lte: today };
      }
    } else {
      const defaultStart = new Date(today);
      defaultStart.setDate(today.getDate() - 30);
      defaultStart.setHours(0, 0, 0, 0);
      dateFilter.orderDate = { $gte: defaultStart, $lte: today };
    }

    const skip = (page - 1) * limit;

    // Fetch paginated orders for display
    const orders = await Order.find({
      ...dateFilter,
      orderStatus: { $nin: ["Cancelled"] },
    })
      .populate("user", "name email")
      .populate("products.product")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch all orders for totals and downloads
    const totalOrders = await Order.countDocuments({
      ...dateFilter,
      orderStatus: { $nin: ["Cancelled"] },
    });
    const allOrders = await Order.find({
      ...dateFilter,
      orderStatus: { $nin: ["Cancelled"] },
    })
      .populate("user", "name email")
      .populate("products.product")
      .sort({ orderDate: -1 });

   

    const topProductsAggregation = await Order.aggregate([
      { $match: { ...dateFilter, orderStatus: { $nin: ["Cancelled"] } } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails._id", 
          name: { $first: "$productDetails.name" }, 
          totalSold: { $sum: "$products.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: ["$products.quantity", "$productDetails.price"],
            },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

   

    const topCategoriesAggregation = await Order.aggregate([
      { $match: { ...dateFilter, orderStatus: { $nin: ["Cancelled"] } } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "categories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" }, // Ensure category details exist
      {
        $group: {
          _id: "$categoryDetails._id", // Group by category ID
          name: { $first: "$categoryDetails.name" }, // Get category name
          totalSold: { $sum: "$products.quantity" }, // Count total items sold
          totalRevenue: {
            $sum: {
              $multiply: ["$products.quantity", "$productDetails.price"],
            },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

  
    const topBrandsAggregation = await Order.aggregate([
      { $match: { ...dateFilter, orderStatus: { $nin: ["Cancelled"] } } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" }, 
      {
        $group: {
          _id: "$productDetails.brand", 
          totalSold: { $sum: "$products.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: ["$productDetails.price", "$products.quantity"],
            }, 
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    const reportData = {
      totalOrders: totalOrders,
      totalAmount: allOrders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      ),
      totalDiscount: allOrders.reduce(
        (sum, order) =>
          sum +
          (order.totalOfferDiscount || 0) +
          (order.appliedCoupon?.discountAmount || 0),
        0
      ),
      totalCouponDiscount: allOrders.reduce(
        (sum, order) => sum + (order.appliedCoupon?.discountAmount || 0),
        0
      ),
      totalOfferDiscount: allOrders.reduce(
        (sum, order) => sum + (order.totalOfferDiscount || 0),
        0
      ),
      topProducts: topProductsAggregation.map((item) => ({
        name: item.name,
        sales: item.totalSold, 
        totalRevenue: item.totalRevenue,
      })),
      topCategories: topCategoriesAggregation.map((item) => ({
        name: item.name,
        sales: item.totalSold, 
        totalRevenue: item.totalRevenue,
      })),
      topBrands: topBrandsAggregation.map((item) => ({
        brand: item._id || "Unknown", 
        totalSold: item.totalSold,
        totalRevenue: item.totalRevenue,
      })),

      orders: orders.map((order) => {
        const subtotal = order.products.reduce(
          (sum, p) => sum + p.price * p.quantity,
          0
        );

        return {
          orderId: order.orderID,
          date: order.orderDate,
          user: order.user,
          products: order.products,
          originalAmount: order.originalAmount || subtotal,
          totalAmount: order.totalAmount || 0,
          couponCode: order.appliedCoupon?.code || "None",
          couponDiscount: order.appliedCoupon?.discountAmount || 0,
          offerDiscount: order.totalOfferDiscount || 0,
          offers: order.products
            .map((product) => {
              const offer = product.appliedOffer?.offer;
              return {
                type: offer?.applicableTo || "",
                title: offer?.title || "",
                discount: product.appliedOffer?.discountAmount || 0,
              };
            })
            .filter((o) => o.discount > 0),
          paymentMethod: order.paymentMethod,
          status: order.orderStatus,
        };
      }),
      allOrders: allOrders.map((order) => {
        const subtotal = order.products.reduce(
          (sum, p) => sum + p.price * p.quantity,
          0
        );
        return {
          orderId: order.orderID,
          date: order.orderDate,
          user: order.user,
          products: order.products,
          originalAmount: order.originalAmount || subtotal,
          totalAmount: order.totalAmount || 0,
          couponCode: order.appliedCoupon?.code || "None",
          couponDiscount: order.appliedCoupon?.discountAmount || 0,
          offerDiscount: order.totalOfferDiscount || 0,
          offers: order.products
            .map((product) => {
              const offer = product.appliedOffer?.offer;
              return {
                type: offer?.applicableTo || "",
                title: offer?.title || "",
                discount: product.appliedOffer?.discountAmount || 0,
              };
            })
            .filter((o) => o.discount > 0),
          paymentMethod: order.paymentMethod,
          status: order.orderStatus,
        };
      }),
    };

    if (format === "json") {
      return res.json({ report: reportData });
    }

    if (download === "pdf") {
      const doc = new PDFDocument({ size: "A4", margin: 30 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Supreme_sales_report.pdf"
      );
      doc.pipe(res);

      // ✅ Define Logo Path
      const logoPath = path.join(process.cwd(), "public/images/logoxxx.jpg");

      try {
        doc.image(logoPath, { width: 80, align: "left" }); 
      } catch (error) {
        console.log("Error loading logo:", error);
      }

      doc
        .fillColor("#003366")
        .fontSize(20)
        .text("Supreme - Sales Report", { align: "center" });
      doc.moveDown();

      doc
        .fillColor("#000000")
        .fontSize(12)
        .text(
          `Period: ${new Date(
            dateFilter.orderDate.$gte
          ).toLocaleDateString()} - ${new Date(
            dateFilter.orderDate.$lte
          ).toLocaleDateString()}`,
          { align: "center" }
        );
      doc.moveDown(2); 

      // 🔹 Summary Section
      doc
        .fillColor("#FF5733")
        .fontSize(14)
        .text("Summary", { underline: true });
      doc
        .fillColor("#000000")
        .fontSize(12)
        .text(`Total Orders: ${reportData.totalOrders || 0}`)
        .text(`Total Amount: INR ${(reportData.totalAmount || 0).toFixed(2)}`)
        .text(
          `Total Discount: INR ${(reportData.totalDiscount || 0).toFixed(2)}`
        )
        .text(
          `Coupon Discount: INR ${(reportData.totalCouponDiscount || 0).toFixed(
            2
          )}`
        )
        .text(
          `Offer Discount: INR ${(reportData.totalOfferDiscount || 0).toFixed(
            2
          )}`
        );
      doc.moveDown(2); // Extra spacing

      // 🔹 Top Selling Products
      doc
        .fillColor("#3366FF")
        .fontSize(14)
        .text("Top Selling Products", { underline: true });
      reportData.topProducts.forEach((product, index) => {
        doc
          .fillColor("#000000")
          .fontSize(10)
          .text(
            `${index + 1}. ${product.name}: ${
              product.totalSold
            } units, Revenue: INR ${product.totalRevenue.toFixed(2)}`
          );
      });
      doc.moveDown();

      // 🔹 Top Selling Categories
      doc
        .fillColor("#FF3366")
        .fontSize(14)
        .text("Top Selling Categories", { underline: true });
      reportData.topCategories.forEach((category, index) => {
        doc
          .fillColor("#000000")
          .fontSize(10)
          .text(
            `${index + 1}. ${category.name}: ${
              category.totalSold
            } units, Revenue: INR ${category.totalRevenue.toFixed(2)}`
          );
      });
      doc.moveDown();

      // 🔹 Top Selling Brands
      doc
        .fillColor("#33CC33")
        .fontSize(14)
        .text("Top Selling Brands", { underline: true });
      reportData.topBrands.forEach((brand, index) => {
        doc
          .fillColor("#000000")
          .fontSize(10)
          .text(
            `${index + 1}. ${brand.brand}: ${
              brand.totalSold
            } units, Revenue: INR ${brand.totalRevenue.toFixed(2)}`
          );
      });
      doc.moveDown(2);

      // 🔹 Orders Table Header
      const tableTop = doc.y;
      const rowHeight = 33;
      const colWidths = [70, 50, 100, 60, 70, 70, 80, 90];
      const colPositions = [30, 110, 190, 290, 360, 430, 500, 630];

      doc.fillColor("#000000").fontSize(10).font("Helvetica-Bold");
      colPositions.forEach((pos, i) => {
        doc.text(
          [
            "Order ID",
            "Date",
            "Customer",
            "Products",
            "Subtotal",
            "Discount",
            "Coupon",
            "Total",
          ][i],
          pos,
          tableTop,
          { width: colWidths[i], align: "left" }
        );
      });

      doc.moveDown();
      doc.lineWidth(1).strokeColor("black");
      doc
        .moveTo(30, tableTop + rowHeight)
        .lineTo(690, tableTop + rowHeight)
        .stroke();

      let yPosition = tableTop + rowHeight + 5;

      doc.font("Helvetica");
      reportData.allOrders.forEach((order) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 30;
          colPositions.forEach((pos, i) => {
            doc.text(
              [
                "Order ID",
                "Date",
                "Customer",
                "Products",
                "Subtotal",
                "Discount",
                "Coupon",
                "Total",
              ][i],
              pos,
              yPosition,
              { width: colWidths[i], align: "left" }
            );
          });
          doc.moveDown();
          doc
            .moveTo(30, yPosition + rowHeight)
            .lineTo(690, yPosition + rowHeight)
            .stroke();
          yPosition += rowHeight + 5;
        }

        const dateStr = new Date(order.date).toLocaleDateString();
        colPositions.forEach((pos, i) => {
          const data = [
            `#${order.orderId || "N/A"}`,
            dateStr,
            order.user?.name || "Unknown",
            `${order.products.length}`,
            `INR ${(order.originalAmount || 0).toFixed(2)}`,
            `INR ${(order.offerDiscount || 0).toFixed(2)}`,
            `${order.couponCode}${
              order.couponDiscount
                ? ` (-INR ${order.couponDiscount.toFixed(2)})`
                : ""
            }`,
            `INR ${(order.totalAmount || 0).toFixed(2)}`,
          ][i];
          doc.text(data, pos, yPosition, {
            width: colWidths[i],
            align: "left",
          });
        });

        doc
          .moveTo(30, yPosition + rowHeight - 5)
          .lineTo(690, yPosition + rowHeight - 5)
          .stroke();
        yPosition += rowHeight;
      });

      doc.end();
      return;
    } else if (download === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Supreme - Sales Report");

      worksheet.columns = [
        { header: "Order ID", key: "orderId", width: 15 },
        { header: "Date", key: "date", width: 20 },
        { header: "Customer", key: "customer", width: 20 },
        { header: "Products", key: "products", width: 15 },
        { header: "Original Amount", key: "originalAmount", width: 15 },
        { header: "Final Amount", key: "totalAmount", width: 15 },
        { header: "Coupon Code", key: "couponCode", width: 15 },
        { header: "Coupon Discount", key: "couponDiscount", width: 15 },
        { header: "Offer Discount", key: "offerDiscount", width: 15 },
        { header: "Payment Method", key: "paymentMethod", width: 20 },
        { header: "Status", key: "status", width: 15 },
      ];

      const excelData = reportData.allOrders.map((order) => ({
        orderId: order.orderId || "N/A",
        date: new Date(order.date).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        customer: order.user?.name || "Unknown",
        products: `${order.products.length} item${
          order.products.length !== 1 ? "s" : ""
        }`,
        originalAmount: order.originalAmount || 0,
        totalAmount: order.totalAmount || 0,
        couponCode: order.couponCode,
        couponDiscount: order.couponDiscount || 0,
        offerDiscount: order.offerDiscount || 0,
        paymentMethod: order.paymentMethod,
        status: order.status,
      }));

      worksheet.addRows(excelData);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Supreme  sales-report.xlsx"
      );
      await workbook.xlsx.write(res);
      return res.end();
    }

    res.render("admin/salesReport", {
      report: reportData,
      startDate: dateFilter.orderDate.$gte.toISOString().split("T")[0],
      endDate: dateFilter.orderDate.$lte.toISOString().split("T")[0],
      quickSelect: quickSelect || "last30days",
      currentPage: page,
      limit: limit,
      totalOrders: totalOrders,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).send("Server Error");
  }
};


