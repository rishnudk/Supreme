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
      ...dateFilter
    })
      .populate("user", "name email")
      .populate("products.product")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);
    
    // Fetch all orders for totals and downloads (only Delivered orders)
    const totalOrders = await Order.countDocuments({
      ...dateFilter,
      "products.productStatus": "Delivered",
    });
    const allOrders = await Order.find({
      ...dateFilter
    })
      .populate("user", "name email")
      .populate("products.product")
      .sort({ orderDate: -1 });

   
const totalDeliveredProducts = allOrders.reduce((sum, order) => {
  const deliveredProducts = order.products.filter(p => p.productStatus === "Delivered");
  return sum + deliveredProducts.reduce((subSum, p) => subSum + p.quantity, 0);
}, 0);



      const topProductsAggregation = await Order.aggregate([
        { $match: { ...dateFilter } }, // Match date range only
        { $unwind: "$products" },
        { $match: { "products.productStatus": "Delivered" } }, 
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
            totalRevenue: { $sum: { $multiply: ["$products.quantity", "$productDetails.price"] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]);
   




    
    
    
    
    // Top Categories Aggregation (only Delivered products)
const topCategoriesAggregation = await Order.aggregate([
  { $match: { ...dateFilter } },
  { $unwind: "$products" },
  { $match: { "products.productStatus": "Delivered" } },
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
  { $unwind: "$categoryDetails" },
  {
    $group: {
      _id: "$categoryDetails._id",
      name: { $first: "$categoryDetails.name" },
      totalSold: { $sum: "$products.quantity" },
      totalRevenue: { $sum: { $multiply: ["$products.quantity", "$productDetails.price"] } },
    },
  },
  { $sort: { totalSold: -1 } },
  { $limit: 10 },
]);

// Top Brands Aggregation (only Delivered products)
const topBrandsAggregation = await Order.aggregate([
  { $match: { ...dateFilter } },
  { $unwind: "$products" },
  { $match: { "products.productStatus": "Delivered" } },
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
      totalRevenue: { $sum: { $multiply: ["$productDetails.price", "$products.quantity"] } },
    },
  },
  { $sort: { totalSold: -1 } },
  { $limit: 10 },
]);





console.log("Total Delivered Products:", totalDeliveredProducts);
console.log("Orders with Delivered Products:", allOrders
  .filter(o => o.products.some(p => p.productStatus === "Delivered"))
  .map(o => ({
    orderId: o.orderID,
    deliveredCount: o.products.filter(p => p.productStatus === "Delivered").reduce((sum, p) => sum + p.quantity, 0),
    products: o.products.filter(p => p.productStatus === "Delivered").map(p => ({ name: p.name, quantity: p.quantity })),
  })));


const reportData = {
  totalOrders,
  totalAmount: allOrders.reduce((sum, order) => {
    const deliveredProducts = order.products.filter(p => p.productStatus === "Delivered");
    return sum + deliveredProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  }, 0),
  totalDiscount: allOrders.reduce((sum, order) => {
    const deliveredProducts = order.products.filter(p => p.productStatus === "Delivered");
    const totalSubtotal = order.products.reduce((acc, p) => acc + p.price * p.quantity, 0);
    const deliveredSubtotal = deliveredProducts.reduce((acc, p) => acc + p.price * p.quantity, 0);
    const offerDiscount = totalSubtotal ? (order.totalOfferDiscount || 0) * (deliveredSubtotal / totalSubtotal) : 0;
    const couponDiscount = totalSubtotal ? (order.appliedCoupon?.discountAmount || 0) * (deliveredSubtotal / totalSubtotal) : 0;
    return sum + offerDiscount + couponDiscount;
  }, 0),
  totalCouponDiscount: allOrders.reduce((sum, order) => {
    const deliveredProducts = order.products.filter(p => p.productStatus === "Delivered");
    const totalSubtotal = order.products.reduce((acc, p) => acc + p.price * p.quantity, 0);
    const deliveredSubtotal = deliveredProducts.reduce((acc, p) => acc + p.price * p.quantity, 0);
    return sum + (totalSubtotal ? (order.appliedCoupon?.discountAmount || 0) * (deliveredSubtotal / totalSubtotal) : 0);
  }, 0),
  totalOfferDiscount: allOrders.reduce((sum, order) => {
    const deliveredProducts = order.products.filter(p => p.productStatus === "Delivered");
    const totalSubtotal = order.products.reduce((acc, p) => acc + p.price * p.quantity, 0);
    const deliveredSubtotal = deliveredProducts.reduce((acc, p) => acc + p.price * p.quantity, 0);
    return sum + (totalSubtotal ? (order.totalOfferDiscount || 0) * (deliveredSubtotal / totalSubtotal) : 0);
  }, 0),
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
    const deliveredProducts = order.products.filter(p => p.productStatus === "Delivered");
    const subtotal = deliveredProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    return {
      orderId: order.orderID,
      date: order.orderDate,
      user: order.user,
      products: deliveredProducts,
      originalAmount: subtotal,
      totalAmount: subtotal - (order.totalOfferDiscount || 0) - (order.appliedCoupon?.discountAmount || 0),
     couponCode: order.appliedCoupon?.code || "None",
      couponDiscount: order.appliedCoupon?.discountAmount || 0,
      offerDiscount: order.totalOfferDiscount || 0,
      paymentMethod: order.paymentMethod,
      status: order.orderStatus,
    };
  }).filter(order => order.products.length > 0), 
  allOrders: allOrders.map((order) => {
    const deliveredProducts = order.products.filter(p => p.productStatus === "Delivered");
    const subtotal = deliveredProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    return {
      orderId: order.orderID,
      date: order.orderDate,
      user: order.user,
      products: deliveredProducts,
      originalAmount: subtotal,
      totalAmount: subtotal - (order.totalOfferDiscount || 0) - (order.appliedCoupon?.discountAmount || 0),
      couponCode: order.appliedCoupon?.code || "None",
      couponDiscount: order.appliedCoupon?.discountAmount || 0,
      offerDiscount: order.totalOfferDiscount || 0,
      paymentMethod: order.paymentMethod,
      status: order.orderStatus,
      totalDeliveredProducts: totalDeliveredProducts,
    };
  }).filter(order => order.products.length > 0),
  totalDeliveredProducts: totalDeliveredProducts, 
  totalOrders: totalOrders, 
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
     
// 🔹 Summary Section
doc
  .fillColor("#4A4A4A") // Modern dark grey
  .fontSize(14)
  .font("Helvetica-Bold")
  .text("Summary", 30, doc.y);
doc
  .moveTo(30, doc.y + 5)
  .lineTo(200, doc.y + 5)
  .lineWidth(1)
  .strokeColor("#4A4A4A")
  .stroke();
doc.moveDown(0.5);

doc
  .fillColor("#000000")
  .fontSize(12)
  .font("Helvetica")
  .text(`Total Orders: ${reportData.totalOrders || 0}`, 30)
  .text(`Total Amount: INR ${(reportData.totalAmount || 0).toFixed(2)}`, 30)
  .text(`Total Discount: INR ${(reportData.totalDiscount || 0).toFixed(2)}`, 30)
  .text(`Coupon Discount: INR ${(reportData.totalCouponDiscount || 0).toFixed(2)}`, 30)
  .text(`Offer Discount: INR ${(reportData.totalOfferDiscount || 0).toFixed(2)}`, 30);
doc.moveDown(2);



      // 🔹 Top Selling Products
doc
.fillColor("#4A4A4A") // Modern dark grey
.fontSize(14)
.font("Helvetica-Bold")
.text("Top Selling Products", 30, doc.y); 
doc
.moveTo(30, doc.y + 5)
.lineTo(200, doc.y + 5)
.lineWidth(1)
.strokeColor("#4A4A4A")
.stroke(); 
doc.moveDown(0.5);

reportData.topProducts.forEach((product, index) => {
doc
  .fillColor("#000000")
  .fontSize(10)
  .font("Helvetica")
  .text(
    `${index + 1}. ${product.name}: ${product.sales} units, Revenue: INR ${product.totalRevenue.toFixed(2)}`,
    30 
  );
});
doc.moveDown();

// 🔹 Top Selling Categories
doc
.fillColor("#4A4A4A") 
.fontSize(14)
.font("Helvetica-Bold")
.text("Top Selling Categories", 30, doc.y);
doc
.moveTo(30, doc.y + 5)
.lineTo(200, doc.y + 5)
.lineWidth(1)
.strokeColor("#4A4A4A")
.stroke();
doc.moveDown(0.5);

reportData.topCategories.forEach((category, index) => {
doc
  .fillColor("#000000")
  .fontSize(10)
  .font("Helvetica")
  .text(
    `${index + 1}. ${category.name}: ${category.sales} units, Revenue: INR ${category.totalRevenue.toFixed(2)}`,
    30
  );
});
doc.moveDown();



      // 🔹 Top Selling Brands
      
      doc
  .fillColor("#4A4A4A") // Modern dark grey
  .fontSize(14)
  .font("Helvetica-Bold")
  .text("Top Selling Brands", 30, doc.y);
doc
  .moveTo(30, doc.y + 5)
  .lineTo(200, doc.y + 5)
  .lineWidth(1)
  .strokeColor("#4A4A4A")
  .stroke();
doc.moveDown(0.5);

reportData.topBrands.forEach((brand, index) => {
  doc
    .fillColor("#000000")
    .fontSize(10)
    .font("Helvetica")
    .text(
      `${index + 1}. ${brand.brand}: ${brand.totalSold} units, Revenue: INR ${brand.totalRevenue.toFixed(2)}`,
      30
    );
});
doc.moveDown();

     







// const tableTop = doc.y;
// const rowHeight = 30; // Increased to accommodate two lines
// const colWidths = [60, 50, 80, 90, 70, 90, 135];
// const colPositions = [30, 90, 140, 220, 310, 410, 500];

// doc.fillColor("#000000").fontSize(10).font("Helvetica-Bold");
// colPositions.forEach((pos, i) => {
//   doc.text(
//     [
//       "Order ID",
//       "Date",
//       "Customer",
//       "Product Name",
//       "Original Price",
//       "Offer Discount",
//       "Coupon Discount",
//     ][i],
//     pos,
//     tableTop,
//     { width: colWidths[i], align: "left" }
//   );
// });

// doc.moveDown();
// doc.lineWidth(1).strokeColor("black");
// doc.moveTo(30, tableTop + rowHeight).lineTo(620, tableTop + rowHeight).stroke();

// let yPosition = tableTop + rowHeight + 5;

// doc.font("Helvetica");
// reportData.allOrders.forEach((order) => {
//   const deliveredProducts = order.products.filter(p => p.productStatus === "Delivered");

//   deliveredProducts.forEach((product, index) => {
//     if (yPosition > 700) {
//       doc.addPage();
//       yPosition = 30;
//       colPositions.forEach((pos, i) => {
//         doc.text(
//           [
//             "Order ID",
//             "Date",
//             "Customer",
//             "Product Name",
//             "Original Price",
//             "Offer Discount",
//             "Coupon Discount",
//           ][i],
//           pos,
//           yPosition,
//           { width: colWidths[i], align: "left" }
//         );
//       });
//       doc.moveDown();
//       doc.moveTo(30, yPosition + rowHeight).lineTo(620, yPosition + rowHeight).stroke();
//       yPosition += rowHeight + 5;
//     }





// const dateStr = new Date(order.date).toLocaleDateString();
//     const originalPrice = (product.price * product.quantity).toFixed(2);
//     const offerDiscount = (product.appliedOffer?.discountAmount || 0).toFixed(2);
//     const totalOrderSubtotal = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
//     const couponDiscount = totalOrderSubtotal
//       ? ((order.couponDiscount || 0) * (product.price * product.quantity) / totalOrderSubtotal).toFixed(2)
//       : "0.00";

//     colPositions.forEach((pos, i) => {
//       const data = [
//         index === 0 ? `#${order.orderId || "N/A"}` : "",
//         index === 0 ? dateStr : "",
//         index === 0 ? order.user?.name || "Unknown" : "",
//         product.name || "Unknown Product",
//         `INR ${originalPrice}`,
//         `INR ${offerDiscount}`,
//         "",
//       ][i];

//       if (i < 6) {
//         doc.text(data, pos, yPosition, { width: colWidths[i], align: "left" });
//       } else if (i === 6) {
//         const couponText = order.couponCode || "None";
//         const discountText = couponDiscount !== "0.00" ? `(-INR ${couponDiscount})` : "";
//         doc.text(couponText, pos, yPosition, { width: colWidths[i], align: "left" });
//         if (discountText) {
//           doc.text(discountText, pos, yPosition + 10, { width: colWidths[i], align: "left" });
//         }
//       }
//     });

//     doc.moveTo(30, yPosition + rowHeight - 5).lineTo(620, yPosition + rowHeight - 5).stroke();
//     yPosition += rowHeight;
//   });
// });

// doc.end();
// return;



const tableTop = doc.y;
const rowHeight = 30; // Increased to accommodate two lines
const colWidths = [60, 50, 80, 90, 70, 90, 135];
const colPositions = [30, 90, 140, 220, 310, 410, 500];

doc.fillColor("#000000").fontSize(10).font("Helvetica-Bold");
colPositions.forEach((pos, i) => {
  doc.text(
    [
      "Order ID",
      "Date",
      "Customer",
      "Product Name",
      "Original Price",
      "Offer Discount",
      "Coupon Discount",
    ][i],
    pos,
    tableTop,
    { width: colWidths[i], align: "left" }
  );
});

doc.moveDown();
doc.lineWidth(1).strokeColor("black");
doc.moveTo(30, tableTop + rowHeight).lineTo(620, tableTop + rowHeight).stroke();

let yPosition = tableTop + rowHeight + 5;

doc.font("Helvetica");
reportData.allOrders.forEach((order) => {
  // Aggregate products by name
  const productMap = new Map();
  const deliveredProducts = order.products.filter(p => p.productStatus === "Delivered");
  
  deliveredProducts.forEach((product) => {
    const key = product.name;
    if (productMap.has(key)) {
      const existing = productMap.get(key);
      existing.quantity += product.quantity;
      existing.totalPrice += product.price * product.quantity;
      existing.totalOfferDiscount += (product.appliedOffer?.discountAmount || 0);
    } else {
      productMap.set(key, {
        name: product.name,
        quantity: product.quantity,
        totalPrice: product.price * product.quantity,
        totalOfferDiscount: (product.appliedOffer?.discountAmount || 0),
      });
    }
  });

  // Convert Map to array for rendering
  const aggregatedProducts = Array.from(productMap.values());

  aggregatedProducts.forEach((product, index) => {
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 30;
      colPositions.forEach((pos, i) => {
        doc.text(
          [
            "Order ID",
            "Date",
            "Customer",
            "Product Name",
            "Original Price",
            "Offer Discount",
            "Coupon Discount",
          ][i],
          pos,
          yPosition,
          { width: colWidths[i], align: "left" }
        );
      });
      doc.moveDown();
      doc.moveTo(30, yPosition + rowHeight).lineTo(620, yPosition + rowHeight).stroke();
      yPosition += rowHeight + 5;
    }

    const dateStr = new Date(order.date).toLocaleDateString();
    const originalPrice = product.totalPrice.toFixed(2);
    const offerDiscount = product.totalOfferDiscount.toFixed(2);
    const totalOrderSubtotal = aggregatedProducts.reduce((sum, p) => sum + p.totalPrice, 0);
    const couponDiscount = totalOrderSubtotal
      ? ((order.couponDiscount || 0) * product.totalPrice / totalOrderSubtotal).toFixed(2)
      : "0.00";

    colPositions.forEach((pos, i) => {
      const data = [
        index === 0 ? `#${order.orderId || "N/A"}` : "",
        index === 0 ? dateStr : "",
        index === 0 ? order.user?.name || "Unknown" : "",
        `${product.name} (${product.quantity})`, // Show quantity in brackets
        `INR ${originalPrice}`,
        `INR ${offerDiscount}`,
        "",
      ][i];

      if (i < 6) {
        doc.text(data, pos, yPosition, { width: colWidths[i], align: "left" });
      } else if (i === 6) {
        const couponText = order.couponCode || "None";
        const discountText = couponDiscount !== "0.00" ? `(-INR ${couponDiscount})` : "";
        doc.text(couponText, pos, yPosition, { width: colWidths[i], align: "left" });
        if (discountText) {
          doc.text(discountText, pos, yPosition + 10, { width: colWidths[i], align: "left" });
        }
      }
    });

    doc.moveTo(30, yPosition + rowHeight - 5).lineTo(620, yPosition + rowHeight - 5).stroke();
    yPosition += rowHeight;
  });
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
      totalDeliveredProducts: totalDeliveredProducts,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).send("Server Error");
  }
};


