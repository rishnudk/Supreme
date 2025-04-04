const Address = require("../../models/Address");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Cart = require("../../models/Cart");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Order = require("../../models/Order");
const Coupon = require("../../models/Coupon");
const Offer = require("../../models/Offer");
const Wallet = require("../../models/Wallet");
const Razorpay = require("razorpay");
const bcrypt = require('bcryptjs'); 




const CouponUsage = require("../../models/CouponUsage");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


//works
// exports.placeOrder = async (req, res) => {
//     try {
//         console.log("📩 Received Order Data:", req.body);

//         // Ensure user is authenticated
//         if (!req.session.user) {
//             return res.status(401).json({ success: false, error: "User not authenticated. Please log in." });
//         }

//         req.user = req.session.user; // Attach user to request
//         const userId = req.session.user._id;

//         // ✅ Fetch the cart properly using `await`
//         const cart = await Cart.findOne({ user: userId }).populate("items.product");

//         // ❌ FIXED: Ensure the cart is found
//         if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
//             return res.status(400).json({ success: false, error: "Your cart is empty. Please add products before placing an order." });
//         }

//         const { addressId, paymentMethod } = req.body;

//         // Validate required fields
//         if (!addressId || !paymentMethod) {
//             return res.status(400).json({ success: false, error: "Missing required fields: addressId or paymentMethod." });
//         }

//         console.log("Cart items received:", cart.items);

//         // 🔥 Retrieve the full shipping address from the database
//         const userAddress = await Address.findById(addressId);
//         if (!userAddress) {
//             return res.status(400).json({ success: false, error: "Invalid address selected." });
//         }

//         // ✅ Format `shippingAddress` as expected by the Order schema
//         const shippingAddress = {
//             fullName: userAddress.fullName,
//             phone: userAddress.phone,
//             address: userAddress.address,
//             city: userAddress.city,
//             state: userAddress.state,
//             country: userAddress.country,
//             pincode: userAddress.pincode
//         };

//         // ✅ Get totalAmount from the cart
//         const totalAmount = cart.totalPrice;

//         // ✅ Ensure `paymentMethod` matches the enum values
//         const paymentMethodMap = {
//             cod: "COD",
//             razorpay: "Razorpay",
//             wallet: "Wallet"
//         };
//         const finalPaymentMethod = paymentMethodMap[paymentMethod.toLowerCase()] || paymentMethod;

//         if (!["COD", "Razorpay", "Wallet"].includes(finalPaymentMethod)) {
//             return res.status(400).json({ success: false, error: `Invalid payment method: ${paymentMethod}` });
//         }

//         // ✅ Extract valid product details from cart items
//         const products = cart.items.map(item => {
//             if (!item.product || !item.product._id || !item.product.name || !item.product.price || !item.product.images?.length) {
//                 throw new Error(`Invalid cart item: ${JSON.stringify(item)}`);
//             }

//             return {
//                 product: item.product._id,
//                 name: item.product.name,
//                 price: item.product.price,
//                 quantity: item.quantity,
//                 image: item.product.images[0],
//                  productStatus: "Pending"
//             };
//         });

//         const generateOrderID = () => {
//             return Math.floor(100000 + Math.random() * 900000);
//           };

//         const newOrder = new Order({
//             user: req.user._id,
//             shippingAddress: shippingAddress,
//             paymentMethod: finalPaymentMethod,
//             products: products,
//             totalAmount: totalAmount,
//             orderStatus: "Pending",
//             orderID : generateOrderID()
//         });

//         await newOrder.save();

//         await Promise.all(cart.items.map(async (item) => {
//             await Product.findByIdAndUpdate(
//                 item.product,
//                 { $inc: { "variant.stock": -item.quantity } },
//                 { new: true }
//             );
//         }));

//         await Cart.findOneAndDelete({ user: userId });

//         res.json({ success: true, message: "Order placed successfully!" });
//     } catch (error) {
//         console.error("🚨 Order Placement Error:", error.message, error.stack);
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// exports.placeOrder = async (req, res) => {
//     try {
//         console.log("📩 Received Order Data:", req.body);

//         if (!req.session.user) {
//             console.log("placeOrder - User not authenticated");
//             return res.status(401).json({ success: false, error: "User not authenticated" });
//         }

//         req.user = req.session.user;
//         const userId = req.session.user._id;

//         const cart = await Cart.findOne({ user: userId }).populate("items.product");
//         if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
//             console.log("placeOrder - Cart is empty");
//             return res.status(400).json({ success: false, error: "Your cart is empty" });
//         }

//         const { addressId, paymentMethod } = req.body;
//         if (!addressId || !paymentMethod) {
//             console.log("placeOrder - Missing fields");
//             return res.status(400).json({ success: false, error: "Missing required fields" });
//         }

//         if (paymentMethod.toLowerCase() !== "cod") {
//             console.log("placeOrder - Invalid payment method:", paymentMethod);
//             return res.status(400).json({ success: false, error: "This endpoint is for COD only" });
//         }

//         const userAddress = await Address.findById(addressId);
//         if (!userAddress) {
//             console.log("placeOrder - Invalid address");
//             return res.status(400).json({ success: false, error: "Invalid address selected" });
//         }

//         const shippingAddress = {
//             fullName: userAddress.fullName,
//             phone: userAddress.phone,
//             address: userAddress.address,
//             city: userAddress.city,
//             state: userAddress.state,
//             country: userAddress.country,
//             pincode: userAddress.pincode,
//         };

//         const subtotal = cart.totalPrice;
//         const shippingCost = 15;
//         const totalAmount = subtotal + shippingCost;

//         const products = cart.items.map(item => ({
//             product: item.product._id,
//             name: item.product.name,
//             price: item.product.price,
//             quantity: item.quantity,
//             image: item.product.images[0],
//             productStatus: "Pending",
//         }));

//         const generateOrderID = () => Math.floor(100000 + Math.random() * 900000);

//         const newOrder = new Order({
//             user: userId,
//             shippingAddress,
//             paymentMethod: "COD",
//             paymentStatus: "Pending",
//             products,
//             totalAmount,
//             orderStatus: "Pending",
//             orderID: generateOrderID(),
//         });

//         await newOrder.save();
//         console.log("placeOrder - Order saved:", newOrder);

//         await Promise.all(cart.items.map(async (item) => {
//             await Product.findByIdAndUpdate(
//                 item.product._id,
//                 { $inc: { "variant.stock": -item.quantity } },
//                 { new: true }
//             );
//         }));

//         await Cart.findOneAndDelete({ user: userId });
//         console.log("placeOrder - Cart cleared");

//         res.json({ success: true, message: "Order placed successfully", orderId: newOrder._id });
//     } catch (error) {
//         console.error("🚨 placeOrder Error:", error.message, error.stack);
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// exports.placeOrder = async (req, res) => {
//     try {
//         console.log(`1 - Received Order Data:`, req.body);

//         if (!req.session.user) {
//             console.log(`2 - User not authenticated`);
//             return res.status(401).json({ success: false, error: "User not authenticated" });
//         }

//         const userId = req.session.user._id;
//         console.log(`3 - User ID: ${userId}`);

//         const cart = await Cart.findOne({ user: userId }).populate("items.product");
//         if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
//             console.log(`4 - Cart is empty`);
//             return res.status(400).json({ success: false, error: "Your cart is empty" });
//         }

//         const { addressId, paymentMethod } = req.body;
//         if (!addressId || !paymentMethod) {
//             console.log(`5 - Missing fields: addressId=${addressId}, paymentMethod=${paymentMethod}`);
//             return res.status(400).json({ success: false, error: "Missing required fields" });
//         }

//         const validPaymentMethods = ["cod", "razorpay"];
//         if (!validPaymentMethods.includes(paymentMethod.toLowerCase())) {
//             console.log(`6 - Invalid payment method: ${paymentMethod}`);
//             return res.status(400).json({ success: false, error: "Invalid payment method" });
//         }

//         const userAddress = await Address.findById(addressId);
//         if (!userAddress) {
//             console.log(`7 - Invalid address ID: ${addressId}`);
//             return res.status(400).json({ success: false, error: "Invalid address selected" });
//         }

//         const shippingAddress = {
//             fullName: userAddress.fullName,
//             phone: userAddress.phone,
//             address: userAddress.address,
//             city: userAddress.city,
//             state: userAddress.state,
//             country: userAddress.country,
//             pincode: userAddress.pincode,
//         };

//         // Calculate totals with offer and coupon discounts
//         let subtotal = 0;
//         let offerDiscount = 0;
//         for (const item of cart.items) {
//             const originalPrice = item.product.price * item.quantity;
//             subtotal += originalPrice;

//             const offers = await Offer.find({
//                 isActive: true,
//                 expiryDate: { $gte: new Date() },
//                 $or: [
//                     { applicableTo: "product", productId: item.product._id },
//                     { applicableTo: "category", categoryId: item.product.category }
//                 ]
//             });

//             if (offers.length > 0) {
//                 const bestOffer = offers.reduce((max, offer) =>
//                     offer.discountValue > max.discountValue ? offer : max, offers[0]);
//                 const itemDiscount = Math.round(originalPrice * (bestOffer.discountValue / 100));
//                 offerDiscount += itemDiscount;
//                 console.log(`8 - Offer applied to ${item.product.name}: ${bestOffer.discountValue}% off, Discount: ₹${itemDiscount}`);
//             }
//         }

//         const shippingCost = 15;
//         let couponDiscount = 0;

//         if (req.session.appliedCoupon) {
//             const coupon = await Coupon.findOne({
//                 code: req.session.appliedCoupon,
//                 isActive: true,
//                 expiryDate: { $gte: new Date() },
//                 minOrderValue: { $lte: subtotal }
//             });
//             if (coupon) {
//                 couponDiscount = Math.round(subtotal * (coupon.discountValue / 100));
//                 console.log(`9 - Coupon applied: ${req.session.appliedCoupon}, Discount: ₹${couponDiscount} (${coupon.discountValue}%)`);
//             } else {
//                 req.session.appliedCoupon = null;
//                 console.log(`10 - Invalid session coupon, cleared`);
//             }
//         }

//         const totalAmount = subtotal + shippingCost - offerDiscount - couponDiscount;
//         console.log(`11 - Totals: Subtotal=₹${subtotal}, Shipping=₹${shippingCost}, Offer Discount=₹${offerDiscount}, Coupon Discount=₹${couponDiscount}, Total=₹${totalAmount}`);

//         const products = cart.items.map(item => ({
//             product: item.product._id,
//             name: item.product.name,
//             price: item.product.price,
//             quantity: item.quantity,
//             image: item.product.images[0],
//             productStatus: "Pending",
//         }));

//         const generateOrderID = () => Math.floor(100000 + Math.random() * 900000);

//         const newOrder = new Order({
//             user: userId,
//             shippingAddress,
//             paymentMethod: paymentMethod.toLowerCase(),
//             paymentStatus: paymentMethod === "cod" ? "Pending" : "Pending", // Razorpay will update later
//             products,
//             subtotal,
//             shippingCost,
//             offerDiscount,  // Added to Order schema
//             couponDiscount, // Renamed from discount
//             totalAmount,
//             orderStatus: "Pending",
//             orderID: generateOrderID(),
//         });

//         await newOrder.save();
//         console.log(`12 - Order saved: ${newOrder._id}`);

//         // Update stock
//         await Promise.all(cart.items.map(async (item) => {
//             const updatedProduct = await Product.findByIdAndUpdate(
//                 item.product._id,
//                 { $inc: { "variant.stock": -item.quantity } },
//                 { new: true }
//             );
//             console.log(`13 - Stock updated for product ${item.product._id}: ${updatedProduct.variant?.stock}`);
//         }));

//         await Cart.findOneAndDelete({ user: userId });
//         console.log(`14 - Cart cleared`);

//         // Clear coupon for COD, keep for Razorpay until payment is verified
//         if (paymentMethod === "cod") {
//             req.session.appliedCoupon = null;
//             console.log(`15 - Coupon cleared for COD`);
//         }

//         res.json({
//             user: req.session.user,
//             success: true,
//             message: "Order placed successfully",
//             orderId: newOrder._id,
//             totalAmount // Include for Razorpay to use
//         });
//     } catch (error) {
//         console.error(`16 - placeOrder Error: ${error.message}`, error.stack);
//         res.status(500).json({ success: false, error: error.message });
//     }
// };




// exports.placeOrder = async (req, res) => {
//   try {
//     console.log(`1 - Received Order Data:`, req.body);

//     if (!req.session.user) {
//       console.log(`2 - User not authenticated`);
//       return res
//         .status(401)
//         .json({ success: false, error: "User not authenticated" });
//     }

//     const userId = req.session.user._id;
//     console.log(`3 - User ID: ${userId}`);

//     const cart = await Cart.findOne({ user: userId }).populate("items.product");
//     if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
//       console.log(`4 - Cart is empty`);
//       return res
//         .status(400)
//         .json({ success: false, error: "Your cart is empty" });
//     }

//     const { addressId, paymentMethod } = req.body;
//     if (!addressId || !paymentMethod) {
//       console.log(
//         `5 - Missing fields: addressId=${addressId}, paymentMethod=${paymentMethod}`
//       );
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing required fields" });
//     }

//     const validPaymentMethods = ["cod", "razorpay"];
//     if (!validPaymentMethods.includes(paymentMethod.toLowerCase())) {
//       console.log(`6 - Invalid payment method: ${paymentMethod}`);
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid payment method" });
//     }

//     const userAddress = await Address.findById(addressId);
//     if (!userAddress) {
//       console.log(`7 - Invalid address ID: ${addressId}`);
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid address selected" });
//     }

//     const shippingAddress = {
//       fullName: userAddress.fullName,
//       phone: userAddress.phone,
//       address: userAddress.address,
//       city: userAddress.city,
//       state: userAddress.state,
//       country: userAddress.country,
//       pincode: userAddress.pincode,
//     };

//     // Calculate totals with offer and coupon discounts
//     let subtotal = 0;
//     let offerDiscount = 0;
//     for (const item of cart.items) {
//       const originalPrice = item.product.price * item.quantity;
//       subtotal += originalPrice;

//       const offers = await Offer.find({
//         isActive: true,
//         expiryDate: { $gte: new Date() },
//         $or: [
//           { applicableTo: "product", productId: item.product._id },
//           { applicableTo: "category", categoryId: item.product.category },
//         ],
//       });

//       if (offers.length > 0) {
//         const bestOffer = offers.reduce(
//           (max, offer) =>
//             offer.discountValue > max.discountValue ? offer : max,
//           offers[0]
//         );
//         const itemDiscount = Math.round(
//           originalPrice * (bestOffer.discountValue / 100)
//         );
//         offerDiscount += itemDiscount;
//         console.log(
//           `8 - Offer applied to ${item.product.name}: ${bestOffer.discountValue}% off, Discount: ₹${itemDiscount}`
//         );
//       }
//     }

//     const shippingCost = 15;
//     let couponDiscount = 0;

//     if (req.session.appliedCoupon) {
//       const coupon = await Coupon.findOne({
//         code: req.session.appliedCoupon,
//         isActive: true,
//         expiryDate: { $gte: new Date() },
//         minOrderValue: { $lte: subtotal },
//       });
//       if (coupon) {
//         couponDiscount = Math.round(subtotal * (coupon.discountValue / 100));
//         console.log(
//           `9 - Coupon applied: ${req.session.appliedCoupon}, Discount: ₹${couponDiscount} (${coupon.discountValue}%)`
//         );
//       } else {
//         req.session.appliedCoupon = null;
//         console.log(`10 - Invalid session coupon, cleared`);
//       }
//     }

//     const totalAmount =
//       subtotal + shippingCost - offerDiscount - couponDiscount;
//     console.log(
//       `11 - Totals: Subtotal=₹${subtotal}, Shipping=₹${shippingCost}, Offer Discount=₹${offerDiscount}, Coupon Discount=₹${couponDiscount}, Total=₹${totalAmount}`
//     );

//     const products = cart.items.map((item) => ({
//       product: item.product._id,
//       name: item.product.name,
//       price: item.product.price,
//       quantity: item.quantity,
//       image: item.product.images[0],
//       productStatus: "Pending",

//       appliedOffer: {
//         offer: offers.length > 0 ? offers[0]._id : null,
//         discountAmount:
//           offers.length > 0
//             ? Math.round(
//                 item.product.price *
//                   item.quantity *
//                   (offers[0].discountValue / 100)
//               )
//             : 0,
//       },
//     }));

//     const generateOrderID = () => Math.floor(100000 + Math.random() * 900000);

//     const newOrder = new Order({
//         user: userId,
//         shippingAddress,
//         paymentMethod: paymentMethod.toLowerCase(),
//         paymentStatus: paymentMethod === "cod" ? "Pending" : "Pending",
//         products,
//         totalAmount,
//         originalAmount, // Required by the second schema
//         orderStatus: "Pending",
//         orderID: generateOrderID(),
//         appliedCoupon: req.session.appliedCoupon ? {
//             coupon: coupon ? coupon._id : null,
//             code: req.session.appliedCoupon,
//             discountAmount: couponDiscount
//         } : undefined,
//         totalOfferDiscount: offerDiscount // Map to schema field
//     });

//     await newOrder.save();
//     console.log(`12 - Order saved: ${newOrder._id}`);

//     // Update stock
//     await Promise.all(
//       cart.items.map(async (item) => {
//         const updatedProduct = await Product.findByIdAndUpdate(
//           item.product._id,
//           { $inc: { "variant.stock": -item.quantity } },
//           { new: true }
//         );
//         console.log(
//           `13 - Stock updated for product ${item.product._id}: ${updatedProduct.variant?.stock}`
//         );
//       })
//     );

//     await Cart.findOneAndDelete({ user: userId });
//     console.log(`14 - Cart cleared`);

//     // Clear coupon for COD, keep for Razorpay until payment is verified
//     if (paymentMethod === "cod") {
//       req.session.appliedCoupon = null;
//       console.log(`15 - Coupon cleared for COD`);
//     }

//     res.json({
//       user: req.session.user,
//       success: true,
//       message: "Order placed successfully",
//       orderId: newOrder._id,
//       totalAmount // Include for Razorpay to use
//     });
//   } catch (error) {
//     console.error(`16 - placeOrder Error: ${error.message}`, error.stack);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };



//works




// exports.placeOrder = async (req, res) => {
//     try {
//         console.log(`1 - Received Order Data:`, req.body);

//         if (!req.session.user) {
//             console.log(`2 - User not authenticated`);
//             return res.status(401).json({ success: false, error: "User not authenticated" });
//         }

//         const userId = req.session.user._id;
//         console.log(`3 - User ID: ${userId}`);

//         const cart = await Cart.findOne({ user: userId })
//         .populate({
//             path: "items.product",
//             populate: { path: "category" }
//         });
    
//     if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
//         console.log(`4 - Cart is empty`);
//         return res.status(400).json({ success: false, error: "Your cart is empty" });
//     }
    
//     for (const item of cart.items) {
//         if (!item.product) {
//             return res.status(404).json({ success: false, message: "One or more products in your cart are no longer available" });
//         }
    
//         if (item.product.status === "Inactive") {
//             return res.status(404).json({ success: false, message: `Product "${item.product.name}" is not available for now` });
//         }
    
//         if (item.product.category && item.product.category.isDeleted) {
//             return res.status(404).json({ success: false, message: `Product "${item.product.name}" is not available for now` });
//         }
//     }
    
      


//         for (const item of cart.items) {
//             if (item.product.variant.stock < item.quantity) {
//                 console.log(`Stock insufficient for ${item.product.name}: Required ${item.quantity}, Available ${item.product.variant.stock}`);
//                 return res.status(400).json({
//                     success: false,
//                     error: `Insufficient stock for ${item.product.name}. Only ${item.product.variant.stock} left.`
//                 });
//             }
//         }




//         const { addressId, paymentMethod } = req.body;
//         if (!addressId || !paymentMethod) {
//             console.log(`5 - Missing fields: addressId=${addressId}, paymentMethod=${paymentMethod}`);
//             return res.status(400).json({ success: false, error: "Missing required fields" });
//         }

//         const validPaymentMethods = ["cod", "razorpay", "wallet"];
//         if (!validPaymentMethods.includes(paymentMethod.toLowerCase())) {
//             console.log(`6 - Invalid payment method: ${paymentMethod}`);
//             return res.status(400).json({ success: false, error: "Invalid payment method" });
//         }

//         const userAddress = await Address.findById(addressId);
//         if (!userAddress) {
//             console.log(`7 - Invalid address ID: ${addressId}`);
//             return res.status(400).json({ success: false, error: "Invalid address selected" });
//         }

//         const shippingAddress = {
//             fullName: userAddress.fullName,
//             phone: userAddress.phone,
//             address: userAddress.address,
//             city: userAddress.city,
//             state: userAddress.state,
//             country: userAddress.country,
//             pincode: userAddress.pincode,
//         };

//         // Calculate totals and store offer data
//         let subtotal = 0;
//         let offerDiscount = 0;
//         const itemOffers = new Map(); // Store offers for each item

//         for (const item of cart.items) {
//             const originalPrice = item.product.price * item.quantity;
//             subtotal += originalPrice;

//             const offers = await Offer.find({
//                 isActive: true,
//                 expiryDate: { $gte: new Date() },
//                 $or: [
//                     { applicableTo: "product", productId: item.product._id },
//                     { applicableTo: "category", categoryId: item.product.category }
//                 ]
//             });

//             if (offers.length > 0) {
//                 const bestOffer = offers.reduce((max, offer) => 
//                     offer.discountValue > max.discountValue ? offer : max, offers[0]);
//                 const itemDiscount = Math.round(originalPrice * (bestOffer.discountValue / 100));
//                 offerDiscount += itemDiscount;
//                 console.log(`8 - Offer applied to ${item.product.name}: ${bestOffer.discountValue}% off, Discount: ₹${itemDiscount}`);
//                 itemOffers.set(item.product._id.toString(), {
//                     offerId: bestOffer._id,
//                     discountAmount: itemDiscount,
//                 });
//             }
//         }

//         const shippingCost = 15;
//         let afterOfferSubtotal = subtotal - offerDiscount; // Subtotal after offer discount
//         let couponDiscount = 0;
//         let coupon = null;

//         if (req.session.appliedCoupon) {
//             coupon = await Coupon.findOne({
//                 code: req.session.appliedCoupon,
//                 isActive: true,
//                 expiryDate: { $gte: new Date() },
//                 minOrderValue: { $lte: subtotal } // Still check against original subtotal for eligibility
//             });

//             if (coupon) {
//                 // Check if user has already used this coupon
//                 const couponUsage = await CouponUsage.findOne({ user: userId, coupon: coupon._id });
//                 if (couponUsage) {
//                     console.log(`9 - Coupon ${req.session.appliedCoupon} already used by user ${userId}`);
//                     return res.status(400).json({
//                         success: false,
//                         error: "You have already used this coupon"
//                     });
//                 }
//                 couponDiscount = Math.round(afterOfferSubtotal * (coupon.discountValue / 100));
//                 console.log(`10 - Coupon applied: ${req.session.appliedCoupon}, Discount: ₹${couponDiscount} (${coupon.discountValue}%) on after-offer subtotal ₹${afterOfferSubtotal}`);
//             } else {
//                 req.session.appliedCoupon = null;
//                 console.log(`11 - Invalid session coupon, cleared`);
//             }
//         }

//         const originalAmount = subtotal + shippingCost; // Before any discounts
//         const totalAmount = (afterOfferSubtotal - couponDiscount) + shippingCost; // Sequential: offer, then coupon, then shipping
//         console.log(`11 - Totals: Subtotal=₹${subtotal}, After Offer Subtotal=₹${afterOfferSubtotal}, Shipping=₹${shippingCost}, Offer Discount=₹${offerDiscount}, Coupon Discount=₹${couponDiscount}, Total=₹${totalAmount}`);

//         // Optional: Ensure totalAmount is non-negative
//         if (totalAmount < 0) {
//             console.log(`Warning: Total amount was negative, setting to 0`);
//             totalAmount = 0;
//         }

//         const products = cart.items.map(item => ({
//             product: item.product._id,
//             name: item.product.name,
//             price: item.product.price,
//             quantity: item.quantity,
//             image: item.product.images[0],
//             productStatus: "Pending",
//             appliedOffer: itemOffers.has(item.product._id.toString()) ? {
//                 offer: itemOffers.get(item.product._id.toString()).offerId,
//                 discountAmount: itemOffers.get(item.product._id.toString()).discountAmount
//             } : { offer: null, discountAmount: 0 }
//         }));

//         const generateOrderID = () => Math.floor(100000 + Math.random() * 900000);

//         const newOrder = new Order({
//             user: userId,
//             shippingAddress,
//             paymentMethod: paymentMethod.toLowerCase(),
//             paymentStatus: paymentMethod === "cod" ? "Pending" : "Pending",
//             products,
//             totalAmount,
//             originalAmount,
//             orderStatus: "Pending",
//             orderID: generateOrderID(),
//             appliedCoupon: req.session.appliedCoupon ? {
//                 coupon: coupon ? coupon._id : null,
//                 code: req.session.appliedCoupon,
//                 discountAmount: couponDiscount
//             } : undefined,
//             totalOfferDiscount: offerDiscount
//         });

//         await newOrder.save();
//         console.log(`12 - Order saved: ${newOrder._id}`);




// // Record coupon usage if a coupon was applied
// if (coupon) {
//     await CouponUsage.create({
//         user: userId,
//         coupon: coupon._id
//     });
//     console.log(`14 - Coupon usage recorded for ${req.session.appliedCoupon}`);
// }




//         // Update stock
//         await Promise.all(cart.items.map(async (item) => {
//             const updatedProduct = await Product.findByIdAndUpdate(
//                 item.product._id,
//                 { $inc: { "variant.stock": -item.quantity } },
//                 { new: true }
//             );
//             console.log(`13 - Stock updated for product ${item.product._id}: ${updatedProduct.variant?.stock}`);
//         }));

//         await Cart.findOneAndDelete({ user: userId });
//         console.log(`14 - Cart cleared`);

//         if (paymentMethod === "cod") {
//             req.session.appliedCoupon = null;
//             console.log(`15 - Coupon cleared for COD`);
//         }

//         res.json({ 
//             user: req.session.user,
//             success: true, 
//             message: "Order placed successfully", 
//             orderId: newOrder._id,
//             totalAmount
//         });
//     } catch (error) {
//         console.error(`16 - placeOrder Error: ${error.message}`, error.stack);
//         res.status(500).json({ success: false, error: error.message });
//     }
// };







//og

// exports.payLater = async (req, res) => {
//   try {
//     console.log("📩 Received Pay Later Data:", req.body);

//     if (!req.session.user) {
//       console.log("payLater - User not authenticated");
//       return res
//         .status(401)
//         .json({ success: false, error: "User not authenticated" });
//     }

//     const userId = req.session.user._id;
//     const { orderId } = req.body;

//     if (!orderId) {
//       console.log("payLater - Missing orderId");
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing order ID" });
//     }

//     let order;
//     if (/^[0-9a-fA-F]{24}$/.test(orderId)) {
//       order = await Order.findById(orderId);
//     } else {
//       order = await Order.findOne({ transactionId: orderId });
//     }

//     if (!order || order.user.toString() !== userId) {
//       console.log("payLater - Order not found or unauthorized");
//       console.log("payLater - Query result:", order);
//       return res
//         .status(404)
//         .json({ success: false, error: "Order not found or unauthorized" });
//     }

//     if (order.paymentStatus !== "Pending") {
//       console.log("payLater - Payment already completed:", order.paymentStatus);
//       return res
//         .status(400)
//         .json({ success: false, error: "Payment already completed" });
//     }

//     order.paymentMethod = "razorpay";
//     await order.save();
//     console.log("payLater - Order updated to COD:", order._id);

//     res.json({
//       success: true,
//       message: "Order updated to Pay Later (COD)",
//       orderId: order._id,
//     });
//   } catch (error) {
//     console.error("🚨 payLater Error:", error.message, error.stack);
//     res
//       .status(500)
//       .json({ success: false, error: error.message || "Server error" });
//   }
// };




exports.payLater = async (req, res) => {
  try {
      console.log("📩 Received Pay Later Data:", req.body);

      if (!req.session.user) {
          console.log("payLater - User not authenticated");
          return res.status(401).json({ success: false, error: "User not authenticated" });
      }

      const userId = req.session.user._id;
      const { orderId } = req.body;

      if (!orderId) {
          console.log("payLater - Missing orderId");
          return res.status(400).json({ success: false, error: "Missing order ID" });
      }

      let order;
      if (/^[0-9a-fA-F]{24}$/.test(orderId)) {
          order = await Order.findById(orderId);
      } else {
          order = await Order.findOne({ transactionId: orderId });
      }

      if (!order || order.user.toString() !== userId) {
          console.log("payLater - Order not found or unauthorized");
          console.log("payLater - Query result:", order);
          return res.status(404).json({ success: false, error: "Order not found or unauthorized" });
      }

      if (order.paymentStatus !== "Pending") {
          console.log("payLater - Payment already completed:", order.paymentStatus);
          return res.status(400).json({ success: false, error: "Payment already completed" });
      }

      order.paymentMethod = "paylater"; // Use a distinct method
      await order.save();
      console.log("payLater - Order updated to Pay Later:", order._id);

      res.json({
          success: true,
          message: "Order updated to Pay Later",
          orderId: order._id,
      });
  } catch (error) {
      console.error("🚨 payLater Error:", error.message, error.stack);
      res.status(500).json({ success: false, error: error.message || "Server error" });
  }
};




exports.getUserOrders = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user._id);

    console.log("Fetching orders for user:", userId);

    const orders = await Order.find({ user: userId }).sort({ orderDate: -1 });

    res.render("user/account", { orders }); // Pass orders to EJS template
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Internal Server Error");
  }
};




//   // ✅ Cancel the Entire Order (Single or Multi-Product)
// exports.cancelEntireOrder = async (req, res) => {
//     console.log('workiiiiiiiiiiiiiiiiiiiiiinnnnnnnnnnnnnnnnnggggggggggg',req.body)
//     try {
//         const { orderId, cancelReason } = req.body;
//         const userId = new mongoose.Types.ObjectId(req.session.user._id);

//         console.log(`Cancelling entire order ${orderId} for user ${userId}`);

//         // Find the order belonging to the user
//         const order = await Order.findOne({ _id: orderId });

//         if (!order) {
//             return res.status(404).json({ message: "Order not found or unauthorized" });
//         }

//         await Promise.all(order.products.map(async (item) => {
//             await Product.findByIdAndUpdate(
//                 item.product,
//                 { $inc: { "variant.stock": item.quantity } }, // Increase stock
//                 { new: true }
//             );
//         }));

//         // ✅ Mark the entire order as cancelled
//         order.orderStatus = "Cancelled";
//         order.orderCancelreason = cancelReason || "No reason provided";

//         // ✅ Cancel each product inside the order
//         order.products.forEach(product => {
//             product.productStatus = "Cancelled";
//             product.productCancelreason = cancelReason || "No reason provided";
//         });

//         await order.save();

//         res.json({ message: "Entire order cancelled successfully" });
//     } catch (error) {
//         console.error("Error canceling entire order:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };

// // ✅ Cancel a Single Product from a Multi-Product Order
// exports.cancelSingleProduct = async (req, res) => {

// console.log(req.body)

//   try {
//       const { orderId, productId, cancelReason } = req.body;
//       const userId = new mongoose.Types.ObjectId(req.session.user._id);

//       console.log(`Cancelling product ${productId} in order ${orderId} for user ${userId}`);

//       // Find the order and check if it belongs to the user
//       const order = await Order.findOne({ _id: orderId, user: userId });

//       if (!order) {
//           return res.status(404).json({ message: "Order not found or unauthorized" });
//       }

//       // ✅ Find the product in the order and update its status
//       const productIndex = order.products.findIndex(p => p.product.toString() === productId);

//       if (productIndex === -1) {
//           return res.status(404).json({ message: "Product not found in order" });
//       }

//       order.products[productIndex].productStatus = "Cancelled";
//       order.products[productIndex].productCancelreason = cancelReason || "No reason provided";

//       const quantity = order.products[productIndex].quantity;

//       // ✅ If all products are cancelled, update the entire order status
//       const allCancelled = order.products.every(p => p.productStatus === "Cancelled");
//       if (allCancelled) {
//           order.orderStatus = "Cancelled";
//       }

//       await order.save();

//       await Product.findByIdAndUpdate(
//         productId,
//         { $inc: { "variant.stock": quantity } },
//         { new: true }
//     );

//       res.json({ message: "Product cancelled successfully" });
//   } catch (error) {
//       console.error("Error canceling product:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//   }
// };






//og

// exports.getOrderDetails = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     console.log("Fetching order details for Order ID:", orderId);

//     const order = await Order.findById(orderId)
//       .populate("products.product")
//       .populate("user", "name email")
//       .lean();

//     if (!order || order.user._id.toString() !== req.session.user._id) {
//       console.log("Order not found or unauthorized for ID:", orderId);
//       return res
//         .status(404)
//         .send("Order not found or you are not authorized to view it");
//     }

//     const response = {
//       _id: order._id,
//       orderID: order.orderID,
//       user: order.user,
//       orderDate: order.orderDate,
//       totalAmount: order.totalAmount,
//       subtotal: order.totalAmount - 15,
//       shipping: 15,
//       tax: 0,
//       orderStatus: order.orderStatus,
//       paymentMethod: order.paymentMethod,
//       paymentStatus: order.paymentStatus,
//       transactionId: order.transactionId || "N/A",
//       shippingAddress: order.shippingAddress,
//       addressId: order.addressId || "",
//       products: order.products.map((p) => ({
//         _id: p.product._id,
//         name: p.product.name,
//         price: p.product.price,
//         image: p.product.images ? p.product.images[0] : p.product.image,
//         quantity: p.quantity,
//         productStatus: p.productStatus,
//       })),
//       timeline: [
//         {
//           title: "Order Placed",
//           date: order.orderDate,
//           text: "Your order has been received.",
//           completed: true,
//         },
//         {
//           title: "Order Processing",
//           date: null,
//           text: "Your order is being prepared for shipping.",
//           completed: order.orderStatus !== "Pending",
//         },
//         {
//           title: "Order Shipped",
//           date: null,
//           text: "Your order has been shipped.",
//           completed:
//             order.orderStatus === "Shipped" ||
//             order.orderStatus === "Delivered",
//         },
//         {
//           title: "Order Delivered",
//           date: order.deliveredAt,
//           text: "Your order has been delivered.",
//           completed: order.orderStatus === "Delivered",
//         },
//       ],
//     };

//     console.log("getOrderDetails - Response object sent to EJS:", response); // Debug log
//     res.render("user/orderDetails", {
//       order: response,
//       user: req.session.user,
//     });
//   } catch (error) {
//     console.error("Error fetching order details:", error.message, error.stack);
//     res.status(500).send("Internal Server Error");
//   }
// };








// // Instant Cancel Entire Order (Pending)
// exports.instantCancelEntireOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { cancelReason } = req.body;
//     const userId = new mongoose.Types.ObjectId(req.session.user._id);

//     const order = await Order.findOne({ _id: orderId, user: userId });
//     if (!order) {
//       return res
//         .status(404)
//         .json({ message: "Order not found or unauthorized" });
//     }

//     if (order.orderStatus !== "Pending") {
//       return res
//         .status(400)
//         .json({ message: "Only Pending orders can be cancelled instantly" });
//     }

//     await Promise.all(
//       order.products.map(async (item) => {
//         await Product.findByIdAndUpdate(item.product, {
//           $inc: { "variant.stock": item.quantity },
//         });
//         item.productStatus = "Cancelled";
//         item.productCancelreason = cancelReason || "User cancelled (Pending)";
//       })
//     );

//     order.orderStatus = "Cancelled";
//     order.orderCancelreason = cancelReason || "User cancelled (Pending)";
//     await order.save();

//     res.json({ message: "Order cancelled successfully" });
//   } catch (error) {
//     console.error("Error instant cancelling order:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };





// // Instant Cancel Single Product (Pending)
// exports.instantCancelSingleProduct = async (req, res) => {
//   try {
//     const { orderId, productId } = req.params;
//     const { cancelReason } = req.body;
//     const userId = new mongoose.Types.ObjectId(req.session.user._id);

//     const order = await Order.findOne({ _id: orderId, user: userId });
//     if (!order) {
//       return res
//         .status(404)
//         .json({ message: "Order not found or unauthorized" });
//     }

//     const productIndex = order.products.findIndex(
//       (p) => p.product.toString() === productId
//     );
//     if (productIndex === -1) {
//       return res.status(404).json({ message: "Product not found in order" });
//     }

//     if (order.products[productIndex].productStatus !== "Pending") {
//       return res
//         .status(400)
//         .json({ message: "Only Pending products can be cancelled instantly" });
//     }

//     order.products[productIndex].productStatus = "Cancelled";
//     order.products[productIndex].productCancelreason =
//       cancelReason || "User cancelled (Pending)";

//     await Product.findByIdAndUpdate(productId, {
//       $inc: { "variant.stock": order.products[productIndex].quantity },
//     });

//     const allCancelled = order.products.every(
//       (p) => p.productStatus === "Cancelled"
//     );
//     if (allCancelled) {
//       order.orderStatus = "Cancelled";
//       order.orderCancelreason = cancelReason || "User cancelled (Pending)";
//     }

//     await order.save();
//     res.json({ message: "Product cancelled successfully" });
//   } catch (error) {
//     console.error("Error instant cancelling product:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };





exports.renderReturnPage = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { name, orderID } = req.query;

    console.log("Rendering return page:", {
      orderId,
      productId,
      name,
      orderID,
    });

    if (!orderId || !productId || !name || !orderID) {
      return res.status(400).send("Invalid request parameters");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    const product = order.products.find(
      (p) => p.product.toString() === productId
    );
    if (!product || product.productStatus !== "Delivered") {
      return res.status(400).send("Product not eligible for return");
    }

    res.render("user/return", {
      orderId,
      productId,
      productName: decodeURIComponent(name),
      orderID,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error rendering return page:", error);
    res.status(500).send("Server error");
  }
};

exports.submitReturnRequest = async (req, res) => {
  try {
    const { orderId, productId, returnReason, returnOtherReason } = req.body;

    console.log("Submitting return request:", {
      orderId,
      productId,
      returnReason,
      returnOtherReason,
    });

    if (!orderId || !productId || !returnReason) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const productIndex = order.products.findIndex(
      (p) => p.product.toString() === productId
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in order" });
    }

    if (order.products[productIndex].productStatus !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered products can be returned",
      });
    }

    order.products[productIndex].productStatus = "Return Requested";
    order.products[productIndex].productReturnReason =
      returnReason === "Other" ? returnOtherReason : returnReason;

    order.return = {
      requested: true,
      reason: returnReason === "Other" ? returnOtherReason : returnReason,
      requestedAt: new Date(),
      approved: false,
    };
    order.orderStatus = "Return Requested";

    await order.save();

    console.log("Return request saved successfully for order:", order.orderID);

    res.json({
      success: true,
      message: "Return request submitted successfully",
      orderId: order.orderID,
    });
  } catch (error) {
    console.error(
      "Error submitting return request:",
      error.message,
      error.stack
    );
    res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
};


//og
// exports.getOrderDetails = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     console.log("Fetching order details for Order ID:", orderId);

//     const order = await Order.findById(orderId)
//       .populate("products.product")
//       .populate("user", "name email")
//       .populate("products.appliedOffer.offer") // Populate offer details
//       .populate("appliedCoupon.coupon") // Populate coupon details
//       .lean();

//     if (!order || order.user._id.toString() !== req.session.user._id) {
//       console.log("Order not found or unauthorized for ID:", orderId);
//       return res
//         .status(404)
//         .send("Order not found or you are not authorized to view it");
//     }

//     const response = {
//       _id: order._id,
//       orderID: order.orderID,
//       user: order.user,
//       orderDate: order.orderDate,
//       totalAmount: order.totalAmount,
//       originalAmount: order.originalAmount, // Before discounts
//       subtotal: order.originalAmount - 15, // Before shipping, after discounts
//       shipping: 15,
//       tax: 0,
//       orderStatus: order.orderStatus,
//       paymentMethod: order.paymentMethod,
//       paymentStatus: order.paymentStatus,
//       transactionId: order.transactionId || "N/A",
//       shippingAddress: order.shippingAddress,
//       addressId: order.addressId || "",
//       offerDiscount: order.totalOfferDiscount, // Total offer discount
//       couponCode: order.appliedCoupon?.code || "N/A",
//       couponDiscount: order.appliedCoupon?.discountAmount || 0,
//       products: order.products.map((p) => ({
//         _id: p.product._id,
//         name: p.name, // From Order, not Product
//         price: p.price, // From Order, not Product
//         image: p.image, // From Order
//         quantity: p.quantity,
//         productStatus: p.productStatus,
//         offerName: p.appliedOffer?.offer?.name || "None", // Offer name if applied
//         offerDiscount: p.appliedOffer?.discountAmount || 0, // Per-product discount
//       })),
//       timeline: [
//         {
//           title: "Order Placed",
//           date: order.orderDate,
//           text: "Your order has been received.",
//           completed: true,
//         },
//         {
//           title: "Order Processing",
//           date: order.orderStatus === "Processing" ? order.updatedAt : null, // Example, adjust if you track this
//           text: "Your order is being prepared for shipping.",
//           completed: order.orderStatus !== "Pending",
//         },
//         {
//           title: "Order Shipped",
//           date: order.orderStatus === "Shipped" ? order.updatedAt : null, // Example, adjust if you track this
//           text: "Your order has been shipped.",
//           completed: order.orderStatus === "Shipped" || order.orderStatus === "Delivered",
//         },
//         {
//           title: "Order Delivered",
//           date: order.deliveredAt,
//           text: "Your order has been delivered.",
//           completed: order.orderStatus === "Delivered",
//         },
//       ],
//     };

//     console.log("getOrderDetails - Response object sent to EJS:", response);
//     res.render("user/orderDetails", {
//       order: response,
//       user: req.session.user,
//     });
//   } catch (error) {
//     console.error("Error fetching order details:", error.message, error.stack);
//     res.status(500).send("Internal Server Error");
//   }
// };




// exports.placeOrder = async (req, res) => {
//   try {
//       console.log(`1 - Received Order Data:`, req.body);

//       if (!req.session.user) {
//           console.log(`2 - User not authenticated`);
//           return res.status(401).json({ success: false, error: "User not authenticated" });
//       }

//       const userId = req.session.user._id;
//       console.log(`3 - User ID: ${userId}`);

//       const cart = await Cart.findOne({ user: userId }).populate({
//           path: "items.product",
//           populate: { path: "category" },
//       });

//       if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
//           console.log(`4 - Cart is empty`);
//           return res.status(400).json({ success: false, error: "Your cart is empty" });
//       }

//       for (const item of cart.items) {
//           if (!item.product) {
//               return res.status(404).json({
//                   success: false,
//                   error: `Product not found in cart`,
//               });
//           }
//           if (item.product.status === "Inactive") {
//               return res.status(404).json({
//                   success: false,
//                   error: `Product "${item.product.name}" is not available for now`,
//               });
//           }
//           if (item.product.category && item.product.category.isDeleted) {
//               return res.status(404).json({
//                   success: false,
//                   error: `Category for "${item.product.name}" is not available`,
//               });
//           }
//           if (item.product.variant.stock < item.quantity) {
//               console.log(`Stock insufficient for ${item.product.name}`);
//               return res.status(400).json({
//                   success: false,
//                   error: `Insufficient stock for ${item.product.name}. Only ${item.product.variant.stock} left.`,
//               });
//           }
//       }

//       const { addressId, paymentMethod } = req.body;
//       if (!addressId || !paymentMethod) {
//           console.log(`5 - Missing fields: addressId=${addressId}, paymentMethod=${paymentMethod}`);
//           return res.status(400).json({ success: false, error: "Missing required fields" });
//       }

//       const validPaymentMethods = ["cod", "razorpay", "wallet"];
//       if (!validPaymentMethods.includes(paymentMethod.toLowerCase())) {
//           console.log(`6 - Invalid payment method: ${paymentMethod}`);
//           return res.status(400).json({ success: false, error: "Invalid payment method" });
//       }

//       const userAddress = await Address.findById(addressId);
//       if (!userAddress) {
//           console.log(`7 - Invalid address ID: ${addressId}`);
//           return res.status(400).json({ success: false, error: "Invalid address selected" });
//       }

//       const shippingAddress = {
//           fullName: userAddress.fullName,
//           phone: userAddress.phone,
//           address: userAddress.address,
//           city: userAddress.city,
//           state: userAddress.state,
//           country: userAddress.country,
//           pincode: userAddress.pincode,
//       };

//       let subtotal = 0;
//       let offerDiscount = 0;
//       const itemOffers = new Map();

//       for (const item of cart.items) {
//           const originalPrice = item.product.price * item.quantity;
//           subtotal += originalPrice;

//           const offers = await Offer.find({
//               isActive: true,
//               expiryDate: { $gte: new Date() },
//               $or: [
//                   { applicableTo: "product", productId: item.product._id },
//                   { applicableTo: "category", categoryId: item.product.category },
//               ],
//           });

//           if (offers.length > 0) {
//               const bestOffer = offers.reduce((max, offer) =>
//                   offer.discountValue > max.discountValue ? offer : max, offers[0]);
//               const itemDiscount = Math.round(originalPrice * (bestOffer.discountValue / 100));
//               offerDiscount += itemDiscount;
//               itemOffers.set(item.product._id.toString(), {
//                   offerId: bestOffer._id,
//                   discountAmount: itemDiscount,
//               });
//           }
//       }

//       const shippingCost = 15;
//       let afterOfferSubtotal = subtotal - offerDiscount;
//       let couponDiscount = 0;
//       let coupon = null;

//       if (req.session.appliedCoupon) {
//           coupon = await Coupon.findOne({
//               code: req.session.appliedCoupon,
//               isActive: true,
//               expiryDate: { $gte: new Date() },
//               minOrderValue: { $lte: subtotal },
//           });

//           if (coupon) {
//               const couponUsage = await CouponUsage.findOne({ user: userId, coupon: coupon._id });
//               if (couponUsage) {
//                   return res.status(400).json({
//                       success: false,
//                       error: "You have already used this coupon",
//                   });
//               }
//               couponDiscount = Math.round(afterOfferSubtotal * (coupon.discountValue / 100));
//           } else {
//               req.session.appliedCoupon = null;
//           }
//       }





//       console.log(`7.0 - Subtotal: ${subtotal}, Offer Discount: ${offerDiscount}, Coupon Discount: ${couponDiscount}, Shipping: ${shippingCost}`);
//       const totalAmount = Math.max(0, (afterOfferSubtotal - couponDiscount) + shippingCost);
//       console.log(`7.1 - Calculated totalAmount: ${totalAmount}`);
//       console.log(`7.2 - Payment method: "${normalizedPaymentMethod}"`);

      
//       console.log(`7.1 - Calculated totalAmount: ${totalAmount}`);
//       console.log(`7.2 - Payment method received: "${paymentMethod}" (normalized: "${paymentMethod.toLowerCase()}")`);
      
//       // Check COD restriction: Orders above Rs 1000 not allowed for COD
//       if (paymentMethod.toLowerCase() === "cod" && totalAmount > 1000) {
//           console.log(`8 - COD not allowed for order above Rs 1000: Total=${totalAmount}`);
//           return res.status(400).json({
//               success: false,
//               error: "Cash on Delivery is not available for orders above Rs 1000",
//           });
//       }



//       const products = cart.items.map(item => ({
//           product: item.product._id,
//           name: item.product.name,
//           price: item.product.price,
//           quantity: item.quantity,
//           image: item.product.images[0],
//           productStatus: "Pending",
//           appliedOffer: itemOffers.get(item.product._id.toString()) || { offer: null, discountAmount: 0 },
//       }));

//       const generateOrderID = () => Math.floor(100000 + Math.random() * 900000);

//       const newOrder = new Order({
//           user: userId,
//           shippingAddress,
//           paymentMethod: paymentMethod.toLowerCase(),
//           paymentStatus: paymentMethod === "cod" ? "Pending" : "Pending",
//           products,
//           totalAmount,
//           originalAmount: subtotal + shippingCost,
//           orderStatus: "Pending",
//           orderID: generateOrderID(),
//           appliedCoupon: coupon ? { coupon: coupon._id, code: coupon.code, discountAmount: couponDiscount } : undefined,
//           totalOfferDiscount: offerDiscount,
//       });

//       if (paymentMethod.toLowerCase() === "razorpay") {
//           const amountInPaise = Math.round(totalAmount * 100);
//           const shortOrderId = newOrder._id.toString().slice(-8);
//           const shortTimestamp = Date.now().toString().slice(-6);
//           const receipt = `ord_${shortOrderId}_${shortTimestamp}`;

//           const options = {
//               amount: amountInPaise,
//               currency: "INR",
//               receipt: receipt,
//           };

//           const razorpayOrder = await razorpay.orders.create(options);
//           newOrder.transactionId = razorpayOrder.id;
//       }

//       await newOrder.save();
//       console.log(`12 - Order saved: ${newOrder._id}`);

//       if (coupon) {
//           await CouponUsage.create({ user: userId, coupon: coupon._id });
//       }

//       await Promise.all(cart.items.map(async (item) => {
//           await Product.findByIdAndUpdate(item.product._id, {
//               $inc: { "variant.stock": -item.quantity },
//           });
//       }));

//       await Cart.findOneAndDelete({ user: userId });
//       if (paymentMethod === "cod") {
//           req.session.appliedCoupon = null;
//       }

//       res.json({
//           success: true,
//           message: "Order placed successfully",
//           orderId: newOrder._id,
//           totalAmount,
//           razorpayOrderId: paymentMethod.toLowerCase() === "razorpay" ? newOrder.transactionId : undefined,
//       });
//   } catch (error) {
//       console.error(`16 - placeOrder Error: ${error.message}`, error.stack);
//       res.status(500).json({ success: false, error: error.message });
//   }
// };







// before gst

// exports.getOrderDetails = async (req, res) => {
//   try {
//     console.log('cheksssssssssssssssssssssss')
//     const orderId = req.params.orderId;
//     console.log("Fetching order details for Order ID:", orderId);

//     const order = await Order.findById(orderId)
//       .populate("products.product")
//       .populate("user", "name email")
//       .populate("products.appliedOffer.offer")
//       .populate("appliedCoupon.coupon")
//       .lean();


//       console.log("Raw order data from DB:", order);

//     if (!order || order.user._id.toString() !== req.session.user._id) {
//       console.log("Order not found or unauthorized for ID:", orderId);
//       return res.status(404).send("Order not found or you are not authorized to view it");
//     }

//     const response = {
//       _id: order._id,
//       orderID: order.orderID,
//       user: order.user,
//       orderDate: order.orderDate,
//       totalAmount: order.totalAmount,
//       originalAmount: order.originalAmount,
//       shippingCost: order.shippingCost || 15, // Use schema field, default to 15 if not set
//       subtotal: order.originalAmount - order.totalOfferDiscount - (order.appliedCoupon?.discountAmount || 0), // Correct calculation
//       tax: 0,
//       orderStatus: order.orderStatus,
//       paymentMethod: order.paymentMethod,
//       paymentStatus: order.paymentStatus,
//       transactionId: order.transactionId || "N/A",
//       shippingAddress: order.shippingAddress,
//       addressId: order.addressId || "",
//       totalOfferDiscount: order.totalOfferDiscount, // Keep schema name
//       appliedCoupon: {
//         code: order.appliedCoupon?.code || "N/A",
//         discountAmount: order.appliedCoupon?.discountAmount || 0
//       },
//       refundedAmount: order.refundedAmount || 0, // Add refunded amount
//       products: order.products.map((p) => ({
//         _id: p.product._id,
//         name: p.name,
//         price: p.price,
//         image: p.image,
//         quantity: p.quantity,
//         productStatus: p.productStatus,
//         offerName: p.appliedOffer?.offer?.name || "None",
//         offerDiscount: p.appliedOffer?.discountAmount || 0
//       })),
//       timeline: [
//         { title: "Order Placed", date: order.orderDate, text: "Your order has been received.", completed: true },
//         { title: "Order Processing", date: order.orderStatus === "Processing" ? order.updatedAt : null, text: "Your order is being prepared for shipping.", completed: order.orderStatus !== "Pending" },
//         { title: "Order Shipped", date: order.orderStatus === "Shipped" ? order.updatedAt : null, text: "Your order has been shipped.", completed: order.orderStatus === "Shipped" || order.orderStatus === "Delivered" },
//         { title: "Order Delivered", date: order.deliveredAt, text: "Your order has been delivered.", completed: order.orderStatus === "Delivered" }
//       ]
//     };

//     res.render("user/orderDetails", {
//       order: response,
//       user: req.session.user
//     });
//   } catch (error) {
//     console.error("Error fetching order details:", error.message, error.stack);
//     res.status(500).send("Internal Server Error");
//   }
// };


exports.getOrderDetails = async (req, res) => {
  try {
      console.log('cheksssssssssssssssssssssss');
      const orderId = req.params.orderId;
      console.log("Fetching order details for Order ID:", orderId);

      const order = await Order.findById(orderId)
          .populate("products.product")
          .populate("user", "name email")
          .populate("products.appliedOffer.offer")
          .populate("appliedCoupon.coupon")
          .lean();

      console.log("Raw order data from DB:", order);

      if (!order || order.user._id.toString() !== req.session.user._id) {
          console.log("Order not found or unauthorized for ID:", orderId);
          return res.status(404).send("Order not found or you are not authorized to view it");
      }

      const response = {
          _id: order._id,
          orderID: order.orderID,
          user: order.user,
          orderDate: order.orderDate,
          totalAmount: order.totalAmount,
          originalAmount: order.originalAmount,
          shippingCost: order.shippingCost || 15, // Use schema field, default to 15 if not set
          gstAmount: order.gstAmount || 0, // Added GST field
          subtotal: order.originalAmount - order.totalOfferDiscount - (order.appliedCoupon?.discountAmount || 0), // Pre-GST subtotal
          orderStatus: order.orderStatus,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          transactionId: order.transactionId || "N/A",
          shippingAddress: order.shippingAddress,
          addressId: order.addressId || "",
          totalOfferDiscount: order.totalOfferDiscount,
          appliedCoupon: {
              code: order.appliedCoupon?.code || "N/A",
              discountAmount: order.appliedCoupon?.discountAmount || 0
          },
          refundedAmount: order.refundedAmount || 0,
          products: order.products.map((p) => ({
              _id: p.product._id,
              name: p.name,
              price: p.price,
              image: p.image,
              quantity: p.quantity,
              productStatus: p.productStatus,
              offerName: p.appliedOffer?.offer?.name || "None",
              offerDiscount: p.appliedOffer?.discountAmount || 0
          })),
          timeline: [
              { title: "Order Placed", date: order.orderDate, text: "Your order has been received.", completed: true },
              { title: "Order Processing", date: order.orderStatus === "Processing" ? order.updatedAt : null, text: "Your order is being prepared for shipping.", completed: order.orderStatus !== "Pending" },
              { title: "Order Shipped", date: order.orderStatus === "Shipped" ? order.updatedAt : null, text: "Your order has been shipped.", completed: order.orderStatus === "Shipped" || order.orderStatus === "Delivered" },
              { title: "Order Delivered", date: order.deliveredAt, text: "Your order has been delivered.", completed: order.orderStatus === "Delivered" }
          ]
      };

      res.render("user/orderDetails", {
          order: response,
          user: req.session.user
      });
  } catch (error) {
      console.error("Error fetching order details:", error.message, error.stack);
      res.status(500).send("Internal Server Error");
  }
};










// before gst

// exports.placeOrder = async (req, res) => {
//   try {
//       console.log(`1 - Received Order Data:`, req.body);

//       if (!req.session.user) {
//           console.log(`2 - User not authenticated`);
//           return res.status(401).json({ success: false, error: "User not authenticated" });
//       }

//       const userId = req.session.user._id;
//       console.log(`3 - User ID: ${userId}`);

//       const cart = await Cart.findOne({ user: userId }).populate({
//           path: "items.product",
//           populate: { path: "category" },
//       });

//       if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
//           console.log(`4 - Cart is empty`);
//           return res.status(400).json({ success: false, error: "Your cart is empty" });
//       }

//       for (const item of cart.items) {
//           if (!item.product) {
//               return res.status(404).json({
//                   success: false,
//                   error: `Product not found in cart`,
//               });
//           }
//           if (item.product.status === "Inactive") {
//               return res.status(404).json({
//                   success: false,
//                   error: `Product "${item.product.name}" is not available for now`,
//               });
//           }
//           if (item.product.category && item.product.category.isDeleted) {
//               return res.status(404).json({
//                   success: false,
//                   error: `Category for "${item.product.name}" is not available`,
//               });
//           }
//           if (item.product.variant.stock < item.quantity) {
//               console.log(`Stock insufficient for ${item.product.name}`);
//               return res.status(400).json({
//                   success: false,
//                   error: `Insufficient stock for ${item.product.name}. Only ${item.product.variant.stock} left.`,
//               });
//           }
//       }

//       const { addressId, paymentMethod } = req.body;
//       const normalizedPaymentMethod = paymentMethod.toLowerCase().trim(); // Define here
//       if (!addressId || !paymentMethod) {
//           console.log(`5 - Missing fields: addressId=${addressId}, paymentMethod=${paymentMethod}`);
//           return res.status(400).json({ success: false, error: "Missing required fields" });
//       }

//       const validPaymentMethods = ["cod", "razorpay", "wallet"];
//       if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
//           console.log(`6 - Invalid payment method: ${paymentMethod}`);
//           return res.status(400).json({ success: false, error: "Invalid payment method" });
//       }

//       const userAddress = await Address.findById(addressId);
//       if (!userAddress) {
//           console.log(`7 - Invalid address ID: ${addressId}`);
//           return res.status(400).json({ success: false, error: "Invalid address selected" });
//       }

//       const shippingAddress = {
//           fullName: userAddress.fullName,
//           phone: userAddress.phone,
//           address: userAddress.address,
//           city: userAddress.city,
//           state: userAddress.state,
//           country: userAddress.country,
//           pincode: userAddress.pincode,
//       };

//       let subtotal = 0;
//       let offerDiscount = 0;
//       const itemOffers = new Map();

//       for (const item of cart.items) {
//           const originalPrice = item.product.price * item.quantity;
//           subtotal += originalPrice;

//           const offers = await Offer.find({
//               isActive: true,
//               expiryDate: { $gte: new Date() },
//               $or: [
//                   { applicableTo: "product", productId: item.product._id },
//                   { applicableTo: "category", categoryId: item.product.category },
//               ],
//           });

//           if (offers.length > 0) {
//               const bestOffer = offers.reduce((max, offer) =>
//                   offer.discountValue > max.discountValue ? offer : max, offers[0]);
//               const itemDiscount = Math.round(originalPrice * (bestOffer.discountValue / 100));
//               offerDiscount += itemDiscount;
//               itemOffers.set(item.product._id.toString(), {
//                   offerId: bestOffer._id,
//                   discountAmount: itemDiscount,
//               });
//           }
//       }

//       const shippingCost = 15;
//       let afterOfferSubtotal = subtotal - offerDiscount;
//       let couponDiscount = 0;
//       let coupon = null;

//       if (req.session.appliedCoupon) {
//           coupon = await Coupon.findOne({
//               code: req.session.appliedCoupon,
//               isActive: true,
//               expiryDate: { $gte: new Date() },
//               minOrderValue: { $lte: subtotal },
//           });

//           if (coupon) {
//               const couponUsage = await CouponUsage.findOne({ user: userId, coupon: coupon._id });
//               if (couponUsage) {
//                   return res.status(400).json({
//                       success: false,
//                       error: "You have already used this coupon",
//                   });
//               }
//               couponDiscount = Math.round(afterOfferSubtotal * (coupon.discountValue / 100));
//           } else {
//               req.session.appliedCoupon = null;
//           }
//       }

//       console.log(`7.0 - Subtotal: ${subtotal}, Offer Discount: ${offerDiscount}, Coupon Discount: ${couponDiscount}, Shipping: ${shippingCost}`);
//       const totalAmount = Math.max(0, (afterOfferSubtotal - couponDiscount) + shippingCost);
//       console.log(`7.1 - Calculated totalAmount: ${totalAmount}`);
//       console.log(`7.2 - Payment method: "${normalizedPaymentMethod}"`);
//       console.log(`111Checking COD Restriction: Method=${normalizedPaymentMethod}, Total=${totalAmount}`);


//       if (normalizedPaymentMethod === "cod" && totalAmount > 1000) {
//           console.log(`8 - COD not allowed for order above Rs 1000: Total=${totalAmount}`);
//           return res.status(400).json({
//               success: false,
//               error: "Cash on Delivery is not available for orders above Rs 1000",
//           });
//       }
//       console.log(`222Checking COD Restriction: Method=${normalizedPaymentMethod}, Total=${totalAmount}`);

//       const products = cart.items.map(item => ({
//           product: item.product._id,
//           name: item.product.name,
//           price: item.product.price,
//           quantity: item.quantity,
//           image: item.product.images[0],
//           productStatus: "Pending",
//           appliedOffer: itemOffers.get(item.product._id.toString()) || { offer: null, discountAmount: 0 },
//       }));

//       const generateOrderID = () => Math.floor(100000 + Math.random() * 900000);

//       const newOrder = new Order({
//           user: userId,
//           shippingAddress,
//           paymentMethod: normalizedPaymentMethod, // Use normalized value
//           paymentStatus: normalizedPaymentMethod === "cod" ? "Pending" : "Pending",
//           products,
//           totalAmount,
//           originalAmount: subtotal + shippingCost,
//           deliveryCharge: shippingCost,
//           orderID: generateOrderID(),
//           appliedCoupon: coupon ? { coupon: coupon._id, code: coupon.code, discountAmount: couponDiscount } : undefined,
//           totalOfferDiscount: offerDiscount,
//       });




// // Wallet Payment Logic
// if (normalizedPaymentMethod === "wallet") {
//   let wallet = await Wallet.findOne({ user: userId });
//   if (!wallet) {
//       wallet = new Wallet({ user: userId, balance: 0 });
//       await wallet.save();
//   }

//   console.log(`9 - Wallet balance check: Balance=${wallet.balance}, Required=${totalAmount}`);
//   if (wallet.balance < totalAmount) {
//       console.log(`10 - Insufficient wallet balance`);
//       return res.status(400).json({
//           success: false,
//           error: "Insufficient wallet balance",
//           requiredAmount: totalAmount,
//           currentBalance: wallet.balance
//       });
//   }

//   // Deduct from wallet
//   wallet.balance -= totalAmount;
//   wallet.transactions.push({
//       type: "debit",
//       amount: totalAmount,
//       description: `Payment for order #${newOrder.orderID}`,
//       orderId: newOrder._id,
//       date: new Date()
//   });
//   await wallet.save();
//   newOrder.paymentStatus = "Paid"; // Mark as paid immediately
//   console.log(`11 - Wallet payment processed: New balance=${wallet.balance}`);
// }


//       if (normalizedPaymentMethod === "razorpay") {
//           const amountInPaise = Math.round(totalAmount * 100);
//           const shortOrderId = newOrder._id.toString().slice(-8);
//           const shortTimestamp = Date.now().toString().slice(-6);
//           const receipt = `ord_${shortOrderId}_${shortTimestamp}`;

//           const options = {
//               amount: amountInPaise,
//               currency: "INR",
//               receipt: receipt,
//           };



//           const razorpayOrder = await razorpay.orders.create(options);
//           newOrder.transactionId = razorpayOrder.id;
//           razorpayOrderId = razorpayOrder.id;
//           console.log(`11 - Razorpay order created: ${razorpayOrder.id}`);
//       }

//       await newOrder.save();
//       console.log(`12 - Order saved: ${newOrder._id}, TransactionId: ${newOrder.transactionId || "N/A"}`);

//       if (coupon) await CouponUsage.create({ user: userId, coupon: coupon._id });

//       await Promise.all(cart.items.map(async (item) => {
//           await Product.findByIdAndUpdate(item.product._id, {
//               $inc: { "variant.stock": -item.quantity },
//           });
//       }));

//       await Cart.findOneAndDelete({ user: userId });
//       req.session.appliedCoupon = null;

//       res.json({
//           success: true,
//           message: "Order placed successfully",
//           orderId: newOrder._id,
//           totalAmount,
//           razorpayOrderId: normalizedPaymentMethod === "razorpay" ? razorpayOrderId : undefined,
//       });
//   } catch (error) {
//       console.error(`16 - placeOrder Error: ${error.message}`, error.stack);
//       res.status(500).json({ success: false, error: error.message });
//   }
// };



exports.placeOrder = async (req, res) => {
  try {
      console.log(`1 - Received Order Data:`, req.body);

      if (!req.session.user) {
          console.log(`2 - User not authenticated`);
          return res.status(401).json({ success: false, error: "User not authenticated" });
      }

      const userId = req.session.user._id;
      console.log(`3 - User ID: ${userId}`);

      const cart = await Cart.findOne({ user: userId }).populate({
          path: "items.product",
          populate: { path: "category" },
      });

      if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
          console.log(`4 - Cart is empty`);
          return res.status(400).json({ success: false, error: "Your cart is empty" });
      }

      for (const item of cart.items) {
          if (!item.product) {
              return res.status(404).json({
                  success: false,
                  error: `Product not found in cart`,
              });
          }
          if (item.product.status === "Inactive") {
              return res.status(404).json({
                  success: false,
                  error: `Product "${item.product.name}" is not available for now`,
              });
          }
          if (item.product.category && item.product.category.isDeleted) {
              return res.status(404).json({
                  success: false,
                  error: `Category for "${item.product.name}" is not available`,
              });
          }
          if (item.product.variant.stock < item.quantity) {
              console.log(`Stock insufficient for ${item.product.name}`);
              return res.status(400).json({
                  success: false,
                  error: `Insufficient stock for ${item.product.name}. Only ${item.product.variant.stock} left.`,
              });
          }
      }

      const { addressId, paymentMethod } = req.body;
      const normalizedPaymentMethod = paymentMethod.toLowerCase().trim();
      if (!addressId || !paymentMethod) {
          console.log(`5 - Missing fields: addressId=${addressId}, paymentMethod=${paymentMethod}`);
          return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      const validPaymentMethods = ["cod", "razorpay", "wallet"];
      if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
          console.log(`6 - Invalid payment method: ${paymentMethod}`);
          return res.status(400).json({ success: false, error: "Invalid payment method" });
      }

      const userAddress = await Address.findById(addressId);
      if (!userAddress) {
          console.log(`7 - Invalid address ID: ${addressId}`);
          return res.status(400).json({ success: false, error: "Invalid address selected" });
      }

      const shippingAddress = {
          fullName: userAddress.fullName,
          phone: userAddress.phone,
          address: userAddress.address,
          city: userAddress.city,
          state: userAddress.state,
          country: userAddress.country,
          pincode: userAddress.pincode,
      };

      let subtotal = 0;
      let offerDiscount = 0;
      const itemOffers = new Map();

      for (const item of cart.items) {
          const originalPrice = item.product.price * item.quantity;
          subtotal += originalPrice;

          const offers = await Offer.find({
              isActive: true,
              expiryDate: { $gte: new Date() },
              $or: [
                  { applicableTo: "product", productId: item.product._id },
                  { applicableTo: "category", categoryId: item.product.category },
              ],
          });

          if (offers.length > 0) {
              const bestOffer = offers.reduce((max, offer) =>
                  offer.discountValue > max.discountValue ? offer : max, offers[0]);
              const itemDiscount = Math.round(originalPrice * (bestOffer.discountValue / 100));
              offerDiscount += itemDiscount;
              itemOffers.set(item.product._id.toString(), {
                  offerId: bestOffer._id,
                  discountAmount: itemDiscount,
              });
          }
      }

      const shippingCost = 15;
      let afterOfferSubtotal = subtotal - offerDiscount;
      let couponDiscount = 0;
      let coupon = null;

      if (req.session.appliedCoupon) {
          coupon = await Coupon.findOne({
              code: req.session.appliedCoupon,
              isActive: true,
              expiryDate: { $gte: new Date() },
              minOrderValue: { $lte: subtotal },
          });

          if (coupon) {
              const couponUsage = await CouponUsage.findOne({ user: userId, coupon: coupon._id });
              if (couponUsage) {
                  return res.status(400).json({
                      success: false,
                      error: "You have already used this coupon",
                  });
              }
              couponDiscount = Math.round(afterOfferSubtotal * (coupon.discountValue / 100));
          } else {
              req.session.appliedCoupon = null;
          }
      }

      const baseAmount = afterOfferSubtotal - couponDiscount; // Amount before GST and shipping
      const gstAmount = Math.round(baseAmount * 0.12); // 12% GST
      const totalAmount = Math.max(0, baseAmount + gstAmount + shippingCost); // Final total including GST

      console.log(`7.0 - Subtotal: ${subtotal}, Offer Discount: ${offerDiscount}, Coupon Discount: ${couponDiscount}, GST: ${gstAmount}, Shipping: ${shippingCost}, Total: ${totalAmount}`);
      console.log(`7.1 - Calculated totalAmount: ${totalAmount}`);
      console.log(`7.2 - Payment method: "${normalizedPaymentMethod}"`);
      console.log(`111Checking COD Restriction: Method=${normalizedPaymentMethod}, Total=${totalAmount}`);

      if (normalizedPaymentMethod === "cod" && totalAmount > 1000) {
          console.log(`8 - COD not allowed for order above Rs 1000: Total=${totalAmount}`);
          return res.status(400).json({
              success: false,
              error: "Cash on Delivery is not available for orders above Rs 1000",
          });
      }
      console.log(`222Checking COD Restriction: Method=${normalizedPaymentMethod}, Total=${totalAmount}`);

      const products = cart.items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0],
          productStatus: "Pending",
          appliedOffer: itemOffers.get(item.product._id.toString()) || { offer: null, discountAmount: 0 },
      }));

      const generateOrderID = () => Math.floor(100000 + Math.random() * 900000);

      const newOrder = new Order({
          user: userId,
          shippingAddress,
          paymentMethod: normalizedPaymentMethod,
          paymentStatus: normalizedPaymentMethod === "cod" ? "Pending" : "Pending",
          products,
          totalAmount,
          originalAmount: subtotal, // Before discounts, GST, and shipping
          shippingCost, // Renamed from deliveryCharge to match schema
          gstAmount, // Added GST field
          orderID: generateOrderID(),
          appliedCoupon: coupon ? { coupon: coupon._id, code: coupon.code, discountAmount: couponDiscount } : undefined,
          totalOfferDiscount: offerDiscount,
      });

      // Wallet Payment Logic
      if (normalizedPaymentMethod === "wallet") {
          let wallet = await Wallet.findOne({ user: userId });
          if (!wallet) {
              wallet = new Wallet({ user: userId, balance: 0 });
              await wallet.save();
          }

          console.log(`9 - Wallet balance check: Balance=${wallet.balance}, Required=${totalAmount}`);
          if (wallet.balance < totalAmount) {
              console.log(`10 - Insufficient wallet balance`);
              return res.status(400).json({
                  success: false,
                  error: "Insufficient wallet balance",
                  requiredAmount: totalAmount,
                  currentBalance: wallet.balance
              });
          }

          wallet.balance -= totalAmount;
          wallet.transactions.push({
              type: "debit",
              amount: totalAmount,
              description: `Payment for order #${newOrder.orderID}`,
              orderId: newOrder._id,
              date: new Date()
          });
          await wallet.save();
          newOrder.paymentStatus = "Paid";
          console.log(`11 - Wallet payment processed: New balance=${wallet.balance}`);
      }

      let razorpayOrderId;
      if (normalizedPaymentMethod === "razorpay") {
          const amountInPaise = Math.round(totalAmount * 100);
          const shortOrderId = newOrder._id.toString().slice(-8);
          const shortTimestamp = Date.now().toString().slice(-6);
          const receipt = `ord_${shortOrderId}_${shortTimestamp}`;

          const options = {
              amount: amountInPaise,
              currency: "INR",
              receipt: receipt,
          };

          const razorpayOrder = await razorpay.orders.create(options);
          newOrder.transactionId = razorpayOrder.id;
          razorpayOrderId = razorpayOrder.id;
          console.log(`11 - Razorpay order created: ${razorpayOrder.id}`);
      }

      await newOrder.save();
      console.log(`12 - Order saved: ${newOrder._id}, TransactionId: ${newOrder.transactionId || "N/A"}`);

      if (coupon) await CouponUsage.create({ user: userId, coupon: coupon._id });

      await Promise.all(cart.items.map(async (item) => {
          await Product.findByIdAndUpdate(item.product._id, {
              $inc: { "variant.stock": -item.quantity },
          });
      }));

      await Cart.findOneAndDelete({ user: userId });
      req.session.appliedCoupon = null;

      res.json({
          success: true,
          message: "Order placed successfully",
          orderId: newOrder._id,
          totalAmount,
          gstAmount, // Added for client-side reference
          razorpayOrderId: normalizedPaymentMethod === "razorpay" ? razorpayOrderId : undefined,
      });
  } catch (error) {
      console.error(`16 - placeOrder Error: ${error.message}`, error.stack);
      res.status(500).json({ success: false, error: error.message });
  }
};














// exports.placeOrder = async (req, res) => {
//   try {
//       console.log(`1 - Received Order Data:`, req.body);

//       if (!req.session.user) {
//           console.log(`2 - User not authenticated`);
//           return res.status(401).json({ success: false, error: "User not authenticated" });
//       }

//       const userId = req.session.user._id;
//       console.log(`3 - User ID: ${userId}`);

//       const cart = await Cart.findOne({ user: userId }).populate({
//           path: "items.product",
//           populate: { path: "category" },
//       });

//       if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
//           console.log(`4 - Cart is empty`);
//           return res.status(400).json({ success: false, error: "Your cart is empty" });
//       }

//       // Check product availability
//       for (const item of cart.items) {
//           if (!item.product) {
//               return res.status(404).json({
//                   success: false,
//                   error: `Product not found in cart`,
//               });
//           }
//           if (item.product.status === "Inactive") {
//               return res.status(404).json({
//                   success: false,
//                   error: `Product "${item.product.name}" is not available for now`,
//               });
//           }
//           if (item.product.category && item.product.category.isDeleted) {
//               return res.status(404).json({
//                   success: false,
//                   error: `Category for "${item.product.name}" is not available`,
//               });
//           }
//           if (item.product.variant.stock < item.quantity) {
//               console.log(`Stock insufficient for ${item.product.name}`);
//               return res.status(400).json({
//                   success: false,
//                   error: `Insufficient stock for ${item.product.name}. Only ${item.product.variant.stock} left.`,
//               });
//           }
//       }

//       const { addressId, paymentMethod } = req.body;
//       if (!addressId || !paymentMethod) {
//           console.log(`5 - Missing fields: addressId=${addressId}, paymentMethod=${paymentMethod}`);
//           return res.status(400).json({ success: false, error: "Missing required fields" });
//       }

//       const validPaymentMethods = ["cod", "razorpay", "wallet"];
//       if (!validPaymentMethods.includes(paymentMethod.toLowerCase())) {
//           console.log(`6 - Invalid payment method: ${paymentMethod}`);
//           return res.status(400).json({ success: false, error: "Invalid payment method" });
//       }

//       const userAddress = await Address.findById(addressId);
//       if (!userAddress) {
//           console.log(`7 - Invalid address ID: ${addressId}`);
//           return res.status(400).json({ success: false, error: "Invalid address selected" });
//       }

//       const shippingAddress = {
//           fullName: userAddress.fullName,
//           phone: userAddress.phone,
//           address: userAddress.address,
//           city: userAddress.city,
//           state: userAddress.state,
//           country: userAddress.country,
//           pincode: userAddress.pincode,
//       };

//       // Calculate totals
//       let subtotal = 0;
//       let offerDiscount = 0;
//       const itemOffers = new Map();

//       for (const item of cart.items) {
//           const originalPrice = item.product.price * item.quantity;
//           subtotal += originalPrice;

//           const offers = await Offer.find({
//               isActive: true,
//               expiryDate: { $gte: new Date() },
//               $or: [
//                   { applicableTo: "product", productId: item.product._id },
//                   { applicableTo: "category", categoryId: item.product.category },
//               ],
//           });

//           if (offers.length > 0) {
//               const bestOffer = offers.reduce((max, offer) =>
//                   offer.discountValue > max.discountValue ? offer : max, offers[0]);
//               const itemDiscount = Math.round(originalPrice * (bestOffer.discountValue / 100));
//               offerDiscount += itemDiscount;
//               itemOffers.set(item.product._id.toString(), {
//                   offerId: bestOffer._id,
//                   discountAmount: itemDiscount,
//               });
//           }
//       }

//       const shippingCost = 15;
//       let afterOfferSubtotal = subtotal - offerDiscount;
//       let couponDiscount = 0;
//       let coupon = null;

//       if (req.session.appliedCoupon) {
//           coupon = await Coupon.findOne({
//               code: req.session.appliedCoupon,
//               isActive: true,
//               expiryDate: { $gte: new Date() },
//               minOrderValue: { $lte: subtotal },
//           });

//           if (coupon) {
//               const couponUsage = await CouponUsage.findOne({ user: userId, coupon: coupon._id });
//               if (couponUsage) {
//                   return res.status(400).json({
//                       success: false,
//                       error: "You have already used this coupon",
//                   });
//               }
//               couponDiscount = Math.round(afterOfferSubtotal * (coupon.discountValue / 100));
//           } else {
//               req.session.appliedCoupon = null;
//           }
//       }

//       const totalAmount = Math.max(0, (afterOfferSubtotal - couponDiscount) + shippingCost);

//       if (paymentMethod.toLowerCase() === "cod" && totalAmount > 1000) {
//         console.log(`8 - COD not allowed for order above Rs 1000: Total=${totalAmount}`);
//         return res.status(400).json({
//             success: false,
//             error: "Cash on Delivery is not available for orders above Rs 1000",
//         });
//     }

//       const products = cart.items.map(item => ({
//           product: item.product._id,
//           name: item.product.name,
//           price: item.product.price,
//           quantity: item.quantity,
//           image: item.product.images[0],
//           productStatus: "Pending",
//           appliedOffer: itemOffers.get(item.product._id.toString()) || { offer: null, discountAmount: 0 },
//       }));

//       const generateOrderID = () => Math.floor(100000 + Math.random() * 900000);

//       const newOrder = new Order({
//           user: userId,
//           shippingAddress,
//           paymentMethod: paymentMethod.toLowerCase(),
//           paymentStatus: paymentMethod === "cod" ? "Pending" : "Pending",
//           products,
//           totalAmount,
//           originalAmount: subtotal + shippingCost,
//           orderStatus: "Pending",
//           orderID: generateOrderID(),
//           appliedCoupon: coupon ? { coupon: coupon._id, code: coupon.code, discountAmount: couponDiscount } : undefined,
//           totalOfferDiscount: offerDiscount,
//       });

//       await newOrder.save();
//       console.log(`12 - Order saved: ${newOrder._id}`);

//       // Record coupon usage
//       if (coupon) {
//           await CouponUsage.create({ user: userId, coupon: coupon._id });
//       }

//       // Update stock
//       await Promise.all(cart.items.map(async (item) => {
//           await Product.findByIdAndUpdate(item.product._id, {
//               $inc: { "variant.stock": -item.quantity },
//           });
//       }));

//       // Clear cart and session coupon
//       await Cart.findOneAndDelete({ user: userId });
//       if (paymentMethod === "cod") {
//           req.session.appliedCoupon = null;
//       }

//       res.json({
//           success: true,
//           message: "Order placed successfully",
//           orderId: newOrder._id, // Use MongoDB _id here for consistency
//           totalAmount,
//       });
//   } catch (error) {
//       console.error(`16 - placeOrder Error: ${error.mssage}`, error.stack);
//       res.status(500).json({ success: false, error: error.message });
//   }
// };










// Instant Cancel Entire Order



exports.instantCancelEntireOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancelReason } = req.body;
    const userId = new mongoose.Types.ObjectId(req.session.user._id);

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return res.status(404).json({ message: "Order not found or unauthorized" });
    if (order.orderStatus !== "Pending") return res.status(400).json({ message: "Only Pending orders can be cancelled instantly" });

    if (order.paymentStatus === "Paid" && 
        (order.paymentMethod.toLowerCase() === "razorpay" || /pay_|order_/.test(order.transactionId))) {
      const refundAmount = order.totalAmount;
      await Wallet.findOneAndUpdate(
        { user: userId },
        {
          $inc: { balance: refundAmount },
          $push: {
            transactions: {
              type: "credit",
              amount: refundAmount,
              description: `Refund for cancelled order #${order.orderID} (Razorpay)`,
              orderId: order._id
            }
          }
        },
        { upsert: true }
      );
      order.paymentStatus = "Refunded";
    }

    await Promise.all(order.products.map(async (item) => {
      await Product.findByIdAndUpdate(item.product, { $inc: { "variant.stock": item.quantity } });
      item.productStatus = "Cancelled";
      item.productCancelreason = cancelReason || "User cancelled (Pending)";
    }));

    order.orderStatus = "Cancelled";
    order.orderCancelreason = cancelReason || "User cancelled (Pending)";
    await order.save();

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error instant cancelling order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};








// exports.instantCancelSingleProduct = async (req, res) => {
//   try {
//     const { orderId, productId } = req.params;
//     const { cancelReason } = req.body;
//     const userId = new mongoose.Types.ObjectId(req.session.user._id);

//     const order = await Order.findOne({ _id: orderId, user: userId });
//     if (!order) return res.status(404).json({ message: "Order not found or unauthorized" });

//     const productIndex = order.products.findIndex((p) => p.product.toString() === productId);
//     if (productIndex === -1) return res.status(404).json({ message: "Product not found in order" });
//     if (order.products[productIndex].productStatus !== "Pending") return res.status(400).json({ message: "Only Pending products can be cancelled instantly" });

//     let refundAmount = 0;
//     if (order.paymentStatus === "Paid" && 
//         (order.paymentMethod.toLowerCase() === "razorpay" || /pay_|order_/.test(order.transactionId))) {
//       const totalDiscountedPrice = order.products.reduce((sum, p) => {
//         return sum + (p.price - (p.appliedOffer?.discountAmount || 0));
//       }, 0);
//       const productDiscountedPrice = order.products[productIndex].price - 
//                                     (order.products[productIndex].appliedOffer?.discountAmount || 0);
      
//       const remainingProducts = order.products.filter((p, idx) => idx !== productIndex && p.productStatus !== "Cancelled");
//       if (remainingProducts.length === 0) {
//         refundAmount = order.totalAmount - (order.refundedAmount || 0);
//       } else {
//         refundAmount = Math.round((productDiscountedPrice / totalDiscountedPrice) * order.totalAmount);
//       }

//       if (refundAmount > 0) {
//         await Wallet.findOneAndUpdate(
//           { user: userId },
//           {
//             $inc: { balance: refundAmount },
//             $push: {
//               transactions: {
//                 type: "credit",
//                 amount: refundAmount,
//                 description: `Refund for cancelled product in order #${order.orderID} (Razorpay)`,
//                 orderId: order._id
//               }
//             }
//           },
//           { upsert: true }
//         );
//         order.refundedAmount = (order.refundedAmount || 0) + refundAmount;
//       }
//     }

//     order.products[productIndex].productStatus = "Cancelled";
//     order.products[productIndex].productCancelreason = cancelReason || "User cancelled (Pending)";

//     await Product.findByIdAndUpdate(productId, {
//       $inc: { "variant.stock": order.products[productIndex].quantity }
//     });

//     const allCancelled = order.products.every((p) => p.productStatus === "Cancelled");
//     if (allCancelled) {
//       order.orderStatus = "Cancelled";
//       order.orderCancelreason = cancelReason || "User cancelled (Pending)";
//       if (order.paymentStatus === "Paid") {
//         order.paymentStatus = "Refunded";
//         order.totalAmount = 0; 
//       }
//     } else if (refundAmount > 0) {
//       order.totalAmount -= refundAmount; 
//     }

//     await order.save();
//     res.json({ message: "Product cancelled successfully" });
//   } catch (error) {
//     console.error("Error instant cancelling product:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };






// exports.instantCancelSingleProduct = async (req, res) => {
//   try {
//     const { orderId, productId } = req.params;
//     const { cancelReason } = req.body;
//     const userId = new mongoose.Types.ObjectId(req.session.user._id);

//     console.log("DEBUG: Starting cancellation - Order ID:", orderId, "Product ID:", productId, "User ID:", userId);

//     const order = await Order.findOne({ _id: orderId, user: userId });
//     if (!order) return res.status(404).json({ message: "Order not found or unauthorized" });
//     console.log("DEBUG: Order found -", JSON.stringify(order, null, 2));

//     const productIndex = order.products.findIndex((p) => p.product.toString() === productId);
//     if (productIndex === -1) return res.status(404).json({ message: "Product not found in order" });
//     if (order.products[productIndex].productStatus !== "Pending") return res.status(400).json({ message: "Only Pending products can be cancelled instantly" });
//     console.log("DEBUG: Product to cancel -", order.products[productIndex]);

//     let refundAmount = 0;
//     if (order.paymentStatus === "Paid" && 
//         (order.paymentMethod.toLowerCase() === "razorpay" || /pay_|order_/.test(order.transactionId))) {
//       const totalDiscountedPrice = order.products.reduce((sum, p) => {
//         return sum + (p.price - (p.appliedOffer?.discountAmount || 0));
//       }, 0);
//       const productDiscountedPrice = order.products[productIndex].price - 
//                                     (order.products[productIndex].appliedOffer?.discountAmount || 0);
      
//       console.log("DEBUG: Total Discounted Price:", totalDiscountedPrice);
//       console.log("DEBUG: Product Discounted Price:", productDiscountedPrice);

//       const remainingProducts = order.products.filter((p, idx) => idx !== productIndex && p.productStatus !== "Cancelled");
//       console.log("DEBUG: Remaining Products Count:", remainingProducts.length, "Details:", remainingProducts);

//       const effectiveTotal = order.totalAmount; // Use current totalAmount
//       if (remainingProducts.length === 0) {
//         refundAmount = order.totalAmount - (order.refundedAmount || 0);
//         console.log("DEBUG: All products canceled, full refund - Refund Amount:", refundAmount);
//       } else {
//         refundAmount = Math.round((productDiscountedPrice / totalDiscountedPrice) * effectiveTotal);
//         refundAmount = Math.min(refundAmount, productDiscountedPrice); // Cap at product value
//         console.log("DEBUG: Partial refund calculated - Refund Amount:", refundAmount);
//       }

//       console.log("DEBUG: Order Total Amount Before Refund:", order.totalAmount);
//       console.log("DEBUG: Refunded Amount So Far:", order.refundedAmount || 0);

//       if (refundAmount > 0) {
//         await Wallet.findOneAndUpdate(
//           { user: userId },
//           {
//             $inc: { balance: refundAmount },
//             $push: {
//               transactions: {
//                 type: "credit",
//                 amount: refundAmount,
//                 description: `Refund for cancelled product in order #${order.orderID} (Razorpay)`,
//                 orderId: order._id
//               }
//             }
//           },
//           { upsert: true }
//         );
//         order.refundedAmount = (order.refundedAmount || 0) + refundAmount;
//         console.log("DEBUG: Wallet updated - Refund Amount Added:", refundAmount);
//       }
//     }

//     order.products[productIndex].productStatus = "Cancelled";
//     order.products[productIndex].productCancelreason = cancelReason || "User cancelled (Pending)";
//     console.log("DEBUG: Product status updated to Cancelled");

//     await Product.findByIdAndUpdate(productId, {
//       $inc: { "variant.stock": order.products[productIndex].quantity }
//     });
//     console.log("DEBUG: Product stock incremented");

//     const allCancelled = order.products.every((p) => p.productStatus === "Cancelled");
//     console.log("DEBUG: All products cancelled?", allCancelled);

//     if (allCancelled) {
//       order.orderStatus = "Cancelled";
//       order.orderCancelreason = cancelReason || "User cancelled (Pending)";
//       if (order.paymentStatus === "Paid") {
//         order.paymentStatus = "Refunded";
//         order.totalAmount = 0; 
//       }
//       console.log("DEBUG: Entire order cancelled - New Total Amount:", order.totalAmount);
//     } else if (refundAmount > 0) {
//       order.totalAmount -= refundAmount; 
//       console.log("DEBUG: Partial cancellation - Updated Total Amount:", order.totalAmount);
//     }

//     console.log("DEBUG: Total Amount Before Save:", order.totalAmount);
//     order.markModified("totalAmount"); // Ensure Mongoose detects the change
//     await order.save();
//     const savedOrder = await Order.findOne({ _id: orderId });
//     console.log("DEBUG: Total Amount After Save:", savedOrder.totalAmount);
//     if (savedOrder.totalAmount !== order.totalAmount) {
//       console.error("DEBUG: Save failed - Expected:", order.totalAmount, "Got:", savedOrder.totalAmount);
//       throw new Error("Failed to update totalAmount in database");
//     }

//     res.json({ message: "Product cancelled successfully" });
//   } catch (error) {
//     console.error("Error instant cancelling product:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };










exports.instantCancelSingleProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { cancelReason } = req.body;
    const userId = new mongoose.Types.ObjectId(req.session.user._id);

    console.log("DEBUG: Starting cancellation - Order ID:", orderId, "Product ID:", productId, "User ID:", userId);

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return res.status(404).json({ message: "Order not found or unauthorized" });
    console.log("DEBUG: Order found -", JSON.stringify(order, null, 2));

    const productIndex = order.products.findIndex((p) => p.product.toString() === productId);
    if (productIndex === -1) return res.status(404).json({ message: "Product not found in order" });
    if (order.products[productIndex].productStatus !== "Pending") return res.status(400).json({ message: "Only Pending products can be cancelled instantly" });
    console.log("DEBUG: Product to cancel -", order.products[productIndex]);

    let refundAmount = 0;
    if (order.paymentStatus === "Paid" && 
        (order.paymentMethod.toLowerCase() === "razorpay" || /pay_|order_/.test(order.transactionId))) {
      const totalDiscountedPrice = order.products.reduce((sum, p) => {
        return sum + (p.price - (p.appliedOffer?.discountAmount || 0));
      }, 0);
      const productDiscountedPrice = order.products[productIndex].price - 
                                    (order.products[productIndex].appliedOffer?.discountAmount || 0);
      
      console.log("DEBUG: Total Discounted Price:", totalDiscountedPrice);
      console.log("DEBUG: Product Discounted Price:", productDiscountedPrice);

      const remainingProducts = order.products.filter((p, idx) => idx !== productIndex && p.productStatus !== "Cancelled");
      console.log("DEBUG: Remaining Products Count:", remainingProducts.length, "Details:", remainingProducts);

      const effectiveTotal = order.totalAmount;
      if (remainingProducts.length === 0) {
        refundAmount = order.totalAmount - (order.refundedAmount || 0);
        console.log("DEBUG: All products canceled, full refund - Refund Amount:", refundAmount);
      } else {
        refundAmount = Math.round((productDiscountedPrice / totalDiscountedPrice) * effectiveTotal);
        refundAmount = Math.min(refundAmount, productDiscountedPrice);
        console.log("DEBUG: Partial refund calculated - Refund Amount:", refundAmount);
      }

      console.log("DEBUG: Order Total Amount Before Refund:", order.totalAmount);
      console.log("DEBUG: Refunded Amount So Far:", order.refundedAmount || 0);

      if (refundAmount > 0) {
        await Wallet.findOneAndUpdate(
          { user: userId },
          {
            $inc: { balance: refundAmount },
            $push: {
              transactions: {
                type: "credit",
                amount: refundAmount,
                description: `Refund for cancelled product in order #${order.orderID} (Razorpay)`,
                orderId: order._id
              }
            }
          },
          { upsert: true }
        );
        order.refundedAmount = (order.refundedAmount || 0) + refundAmount;
        console.log("DEBUG: Wallet updated - Refund Amount Added:", refundAmount);
      }
    }

    order.products[productIndex].productStatus = "Cancelled";
    order.products[productIndex].productCancelreason = cancelReason || "User cancelled (Pending)";
    console.log("DEBUG: Product status updated to Cancelled");

    await Product.findByIdAndUpdate(productId, {
      $inc: { "variant.stock": order.products[productIndex].quantity }
    });
    console.log("DEBUG: Product stock incremented");

    const allCancelled = order.products.every((p) => p.productStatus === "Cancelled");
    console.log("DEBUG: All products cancelled?", allCancelled);

    const updateFields = {
      [`products.${productIndex}.productStatus`]: "Cancelled",
      [`products.${productIndex}.productCancelreason`]: cancelReason || "User cancelled (Pending)",
      refundedAmount: order.refundedAmount // Ensure cumulative refund
    };

    if (allCancelled) {
      updateFields.orderStatus = "Cancelled";
      updateFields.orderCancelreason = cancelReason || "User cancelled (Pending)";
      if (order.paymentStatus === "Paid") {
        updateFields.paymentStatus = "Refunded";
        updateFields.totalAmount = 0;
      }
      console.log("DEBUG: Entire order cancelled - New Total Amount:", 0);
    } else if (refundAmount > 0) {
      updateFields.totalAmount = order.totalAmount - refundAmount;
      console.log("DEBUG: Partial cancellation - Updated Total Amount:", updateFields.totalAmount);
    }

    console.log("DEBUG: Update Fields:", updateFields);
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, user: userId },
      { $set: updateFields },
      { new: true }
    );
    if (!updatedOrder) {
      throw new Error("Failed to update order in database");
    }
    console.log("DEBUG: Total Amount After Update:", updatedOrder.totalAmount);
    console.log("DEBUG: Refunded Amount After Update:", updatedOrder.refundedAmount);

    res.json({ message: "Product cancelled successfully" });
  } catch (error) {
    console.error("Error instant cancelling product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};