const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const Address = require("../../models/Address")
const Cart = require("../../models/Cart")
const User =require('../../models/User')
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Coupon = require('../../models/Coupon');
const Offer = require('../../models/Offer');


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});



// exports.createOrder = async (req, res) => {
//     try {
//         const { addressId, paymentMethod } = req.body;
//         const userId = req.session.user?._id;

//         console.log("createOrder - Request body:", req.body);
//         console.log("createOrder - User ID:", userId);

//         if (!addressId || !paymentMethod) {
//             console.log("createOrder - Missing fields");
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         if (!userId) {
//             console.log("createOrder - User not authenticated");
//             return res.status(401).json({ message: "User not authenticated" });
//         }

//         if (paymentMethod.toLowerCase() !== "razorpay") {
//             console.log("createOrder - Invalid payment method:", paymentMethod);
//             return res.status(400).json({ message: "This endpoint is for Razorpay only" });
//         }

//         const cart = await Cart.findOne({ user: userId }).populate("items.product");
//         if (!cart || cart.items.length === 0) {
//             console.log("createOrder - Cart is empty");
//             return res.status(400).json({ message: "Cart is empty" });
//         }

//         const subtotal = cart.totalPrice;
//         const shippingCost = 15;
//         const totalAmount = subtotal + shippingCost;
//         const amountInPaise = Math.round(totalAmount * 100);

//         const options = {
//             amount: amountInPaise,
//             currency: "INR",
//             receipt: `order_rcptid_${Date.now()}`,
//         };

//         console.log("createOrder - Creating Razorpay order with options:", options);
//         const razorpayOrder = await razorpay.orders.create(options);
//         console.log("createOrder - Razorpay order created:", razorpayOrder);

//         res.status(200).json({
//             success: true,
//             orderId: razorpayOrder.id, // Used as a temporary ID for failure redirect
//             amount: razorpayOrder.amount,
//             currency: razorpayOrder.currency,
//             key: process.env.RAZORPAY_KEY_ID,
//             totalAmount,
//         });
//     } catch (error) {
//         console.error("createOrder - Error:", error.message, error.stack);
//         res.status(500).json({ message: error.message || "Server error" });
//     }
// };





exports.createOrder = async (req, res) => {
    try {
        const { orderId, totalAmount } = req.body;
        const userId = req.session.user?._id;
        console.log(`1 - createOrder - Request body:`, req.body);
        console.log(`2 - createOrder - User ID: ${userId}`);

        if (!orderId || !totalAmount) {
            console.log(`3 - createOrder - Missing fields: orderId=${orderId}, totalAmount=${totalAmount}`);
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!userId) {
            console.log(`4 - createOrder - User not authenticated`);
            return res.status(401).json({ message: "User not authenticated" });
        }

        const amountInPaise = Math.round(totalAmount * 100);
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `order_${orderId}`,
        };

        console.log(`5 - createOrder - Creating Razorpay order with options:`, options);
        const razorpayOrder = await razorpay.orders.create(options);
        console.log(`6 - createOrder - Razorpay order created:`, razorpayOrder);

        res.status(200).json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
            totalAmount,
        });
    } catch (error) {
        console.error(`7 - createOrder - Error: ${error.message}`, error.stack);
        res.status(500).json({ message: error.message || "Server error" });
    }
};




//og

// exports.verifyPayment = async (req, res) => {
//     try {
//         const { razorpay_order_id, razorpay_payment_id, razorpay_signature, addressId } = req.body;
//         const userId = req.session.user?._id;

//         console.log("verifyPayment - Request body:", req.body);
//         console.log("verifyPayment - User ID:", userId);

//         if (!userId) {
//             console.log("verifyPayment - User not authenticated");
//             return res.status(401).json({ message: "User not authenticated" });
//         }

//         const body = razorpay_order_id + "|" + razorpay_payment_id;
//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(body.toString())
//             .digest("hex");

//         if (expectedSignature === razorpay_signature) {
//             console.log("verifyPayment - Signature verified");
//             const cart = await Cart.findOne({ user: userId }).populate("items.product");
//             if (!cart) {
//                 console.log("verifyPayment - Cart not found");
//                 return res.status(400).json({ message: "Cart not found" });
//             }

//             const userAddress = await Address.findById(addressId);
//             if (!userAddress) {
//                 console.log("verifyPayment - Invalid address");
//                 return res.status(400).json({ message: "Invalid address" });
//             }

//             const shippingAddress = {
//                 fullName: userAddress.fullName,
//                 phone: userAddress.phone,
//                 address: userAddress.address,
//                 city: userAddress.city,
//                 state: userAddress.state,
//                 country: userAddress.country,
//                 pincode: userAddress.pincode,
//             };

//             const subtotal = cart.totalPrice;
//             const shippingCost = 15;
//             const totalAmount = subtotal + shippingCost;

//             const products = cart.items.map(item => ({
//                 product: item.product._id,
//                 name: item.product.name,
//                 price: item.product.price,
//                 quantity: item.quantity,
//                 image: item.product.images[0],
//                 productStatus: "Pending",
//             }));

//             const generateOrderID = () => Math.floor(100000 + Math.random() * 900000);

//             const newOrder = new Order({
//                 user: userId,
//                 shippingAddress,
//                 paymentMethod: "Razorpay",
//                 paymentStatus: "Paid",
//                 transactionId: razorpay_payment_id,
//                 products,
//                 totalAmount,
//                 orderStatus: "Pending",
//                 orderID: generateOrderID(),
//             });

//             await newOrder.save();
//             console.log("verifyPayment - Order saved:", newOrder);

//             await Promise.all(cart.items.map(async (item) => {
//                 await Product.findByIdAndUpdate(
//                     item.product._id,
//                     { $inc: { "variant.stock": -item.quantity } },
//                     { new: true }
//                 );
//             }));

//             await Cart.findOneAndDelete({ user: userId });
//             console.log("verifyPayment - Cart cleared");

//             res.status(200).json({
//                 success: true,
//                 message: "Payment verified successfully",
//                 orderId: newOrder._id, // Return actual order ID for redirect
//             });
//         } else {
//             console.log("verifyPayment - Signature verification failed");
//             return res.status(400).json({ message: "Payment verification failed" });
//         }
//     } catch (error) {
//         console.error("verifyPayment - Error:", error.message, error.stack);
//         res.status(500).json({ message: error.message || "Server error" });
//     }
// };




console.log("Razorpay initialized with:", {
    key_id: process.env.RAZORPAY_KEY_ID ? "Set" : "Undefined",
    key_secret: process.env.RAZORPAY_KEY_SECRET ? "Set" : "Undefined",
});




// exports.createOrderFromExisting = async (req, res) => {
//     try {
//         const { orderId } = req.body;
//         const userId = req.session.user?._id;

//         console.log("createOrderFromExisting 1 - Request body:", req.body);
//         console.log("createOrderFromExisting 2 - User ID:", userId);

//         if (!orderId) {
//             console.log("createOrderFromExisting 3 - Missing orderId");
//             return res.status(400).json({ message: "Missing order ID" });
//         }

//         const order = await Order.findById(orderId);
//         if (!order || order.user.toString() !== userId) {
//             console.log("createOrderFromExisting 4 - Order not found or unauthorized");
//             return res.status(404).json({ message: "Order not found or unauthorized" });
//         }

//         if (order.paymentStatus !== "Pending" || !["Razorpay", "COD", "razorpay", "cod"].includes(order.paymentMethod)) {
//             console.log("createOrderFromExisting 5 - Invalid payment status or method:", order.paymentStatus, order.paymentMethod);
//             return res.status(400).json({ message: "Payment already completed or invalid method" });
//         }

//         const amountInPaise = Math.round(order.totalAmount * 100);
//         // Shorten receipt to fit within 40 characters
//         const shortOrderId = order._id.toString().slice(-8); // Last 8 chars of order ID
//         const shortTimestamp = Date.now().toString().slice(-6); // Last 6 chars of timestamp
//         const receipt = `ord_${shortOrderId}_${shortTimestamp}`;
//         // Example: 'ord_60120f85_878045' (18 chars)

//         const options = {
//             amount: amountInPaise,
//             currency: "INR",
//             receipt: receipt,
//         };

//         console.log("createOrderFromExisting 6 - Creating Razorpay order with options:", options);
//         const razorpayOrder = await razorpay.orders.create(options).catch(err => {
//             throw new Error(`Razorpay API error: ${err.message || JSON.stringify(err)}`);
//         });
//         console.log("createOrderFromExisting 7 - Razorpay order created:", razorpayOrder);

//         if (!razorpayOrder || !razorpayOrder.id) {
//             console.log("createOrderFromExisting 8 - Invalid Razorpay order response:", razorpayOrder);
//             throw new Error("Failed to create Razorpay order - invalid response");
//         }

//         res.status(200).json({
//             success: true,
//             orderId: razorpayOrder.id,
//             amount: razorpayOrder.amount,
//             currency: razorpayOrder.currency,
//             key: process.env.RAZORPAY_KEY_ID,
//             totalAmount: order.totalAmount,
//         });
//     } catch (error) {
//         console.error("createOrderFromExisting 9 - Error details:", {
//             message: error.message,
//             stack: error.stack,
//             rawError: error
//         });
//         res.status(500).json({ message: error.message || "Server error" });
//     }
// };











// exports.createOrderFromExisting = async (req, res) => {
//     try {
//         const { orderId } = req.body;
//         const userId = req.session.user?._id;

//         console.log("createOrderFromExisting 1 - Request body:", req.body);
//         console.log("createOrderFromExisting 2 - User ID:", userId);

//         if (!orderId) {
//             console.log("createOrderFromExisting 3 - Missing orderId");
//             return res.status(400).json({ message: "Missing order ID" });
//         }

//         let order;
//         if (/^[0-9a-fA-F]{24}$/.test(orderId)) {
//             order = await Order.findById(orderId);
//         } else {
//             order = await Order.findOne({ transactionId: orderId });
//         }

//         if (!order || order.user.toString() !== userId) {
//             console.log("createOrderFromExisting 4 - Order not found or unauthorized");
//             console.log("createOrderFromExisting 4.1 - Query result:", order); // Debug log
//             return res.status(404).json({ message: "Order not found or unauthorized" });
//         }

//         const normalizedPaymentMethod = order.paymentMethod.trim().toLowerCase();
//         if (order.paymentStatus !== "Pending" || !["cod", "razorpay"].includes(normalizedPaymentMethod)) {
//             console.log("createOrderFromExisting 5 - Invalid payment status or method:", order.paymentStatus, order.paymentMethod);
//             return res.status(400).json({ message: "Payment already completed or invalid method" });
//         }

//         const amountInPaise = Math.round(order.totalAmount * 100);
//         const shortOrderId = order._id.toString().slice(-8);
//         const shortTimestamp = Date.now().toString().slice(-6);
//         const receipt = `ord_${shortOrderId}_${shortTimestamp}`;

//         const options = {
//             amount: amountInPaise,
//             currency: "INR",
//             receipt: receipt,
//         };

//         console.log("createOrderFromExisting 6 - Creating Razorpay order with options:", options);
//         const razorpayOrder = await razorpay.orders.create(options).catch(err => {
//             throw new Error(`Razorpay API error: ${err.message || JSON.stringify(err)}`);
//         });
//         console.log("createOrderFromExisting 7 - Razorpay order created:", razorpayOrder);

//         if (!razorpayOrder || !razorpayOrder.id) {
//             console.log("createOrderFromExisting 8 - Invalid Razorpay order response:", razorpayOrder);
//             throw new Error("Failed to create Razorpay order - invalid response");
//         }

//         // Store Razorpay orderId in transactionId
//         if (order.transactionId !== razorpayOrder.id) {
//             order.transactionId = razorpayOrder.id;
//             await order.save();
//             console.log("createOrderFromExisting 8.1 - Updated transactionId:", order.transactionId);
//         }

//         res.status(200).json({
//             success: true,
//             orderId: razorpayOrder.id,
//             amount: razorpayOrder.amount,
//             currency: razorpayOrder.currency,
//             key: process.env.RAZORPAY_KEY_ID,
//             totalAmount: order.totalAmount,
//         });
//     } catch (error) {
//         console.error("createOrderFromExisting 9 - Error details:", {
//             message: error.message,
//             stack: error.stack,
//             rawError: error
//         });
//         res.status(500).json({ message: error.message || "Server error" });
//     }
// };













exports.verifyPaymentFromExisting = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
        const userId = req.session.user?._id;

        console.log("verifyPaymentFromExisting11 - Request body:", req.body);
        console.log("verifyPaymentFromExisting12 - User ID:", userId);

        if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.log("verifyPaymentFromExisting13 - Missing fields");
            return res.status(400).json({ message: "Missing required fields" });
        }

        const order = await Order.findById(orderId);
        if (!order || order.user.toString() !== userId) {
            console.log("verifyPaymentFromExisting14 - Order not found or unauthorized");
            return res.status(404).json({ message: "Order not found or unauthorized" });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            console.log("verifyPaymentFromExisting15 - Signature verified");

            // Update order payment status
            order.paymentStatus = "Paid";
            order.transactionId = razorpay_payment_id;
            if (order.paymentMethod === "COD") {
                order.paymentMethod = "Razorpay"; // Switch COD to Razorpay if paid online
            }
            await order.save();
            console.log("verifyPaymentFromExisting16 - Order updated:", order);

            res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                orderId: order._id,
            });
        } else {
            console.log("verifyPaymentFromExisting 17- Signature verification failed");
            return res.status(400).json({ message: "Payment verification failed" });
        }
    } catch (error) {
        console.error("verifyPaymentFromExisting18 - Error:", error.message, error.stack);
        res.status(500).json({ message: error.message || "Server error" });
    }
};



exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        // Verify Razorpay signature (simplified, use your actual verification logic)
        const crypto = require("crypto");
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Update order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        order.paymentStatus = "Paid";
        order.orderStatus = "Pending";
        await order.save();

        res.json({ success: true, message: "Payment verified" });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};







exports.createOrderFromExisting = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.session.user?._id;

        console.log("createOrderFromExisting 0 - Session user:", req.session.user);
        console.log("createOrderFromExisting 1 - Request body:", req.body);
        console.log("createOrderFromExisting 2 - User ID:", userId);

        if (!userId) {
            console.log("createOrderFromExisting 2.1 - No user in session");
            return res.status(401).json({ message: "User not authenticated" });
        }

        if (!orderId) {
            console.log("createOrderFromExisting 3 - Missing orderId");
            return res.status(400).json({ message: "Missing order ID" });
        }

        let order;
        if (/^[0-9a-fA-F]{24}$/.test(orderId)) {
            order = await Order.findById(orderId);
        } else {
            order = await Order.findOne({ transactionId: orderId });
        }

        if (!order || order.user.toString() !== userId) {
            console.log("createOrderFromExisting 4 - Order not found or unauthorized");
            console.log("createOrderFromExisting 4.1 - Query result:", order);
            return res.status(404).json({ message: "Order not found or unauthorized" });
        }

        const normalizedPaymentMethod = order.paymentMethod.trim().toLowerCase();
        if (order.paymentStatus !== "Pending" || !["cod", "razorpay",'paylater'].includes(normalizedPaymentMethod)) {
            console.log("createOrderFromExisting 5 - Invalid payment status or method:", {
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod
            });
            return res.status(400).json({ message: "Payment already completed or invalid method" });
        }

        const amountInPaise = Math.round(order.totalAmount * 100);
        const shortOrderId = order._id.toString().slice(-8);
        const shortTimestamp = Date.now().toString().slice(-6);
        const receipt = `ord_${shortOrderId}_${shortTimestamp}`;

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: receipt,
        };

        console.log("createOrderFromExisting 6 - Creating Razorpay order with options:", options);
        const razorpayOrder = await razorpay.orders.create(options).catch(err => {
            throw new Error(`Razorpay API error: ${err.message || JSON.stringify(err)}`);
        });
        console.log("createOrderFromExisting 7 - Razorpay order created:", razorpayOrder);

        if (!razorpayOrder || !razorpayOrder.id) {
            console.log("createOrderFromExisting 8 - Invalid Razorpay order response:", razorpayOrder);
            throw new Error("Failed to create Razorpay order - invalid response");
        }

        if (order.transactionId !== razorpayOrder.id) {
            order.transactionId = razorpayOrder.id;
            await order.save();
            console.log("createOrderFromExisting 8.1 - Updated transactionId:", order.transactionId);
        }

        res.status(200).json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
            totalAmount: order.totalAmount,
        });
    } catch (error) {
        console.error("createOrderFromExisting 9 - Error details:", {
            message: error.message,
            stack: error.stack,
            rawError: error
        });
        res.status(500).json({ message: error.message || "Server error" });
    }
};