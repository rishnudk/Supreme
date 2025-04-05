const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const Address = require("../../models/Address")
const Cart = require("../../models/Cart")
const User =require('../../models/User')
const bcrypt = require('bcryptjs'); 



const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Coupon = require('../../models/Coupon');
const Offer = require('../../models/Offer');


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});






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
                totalAmount: order.totalAmount, // Added for client-side reference
                gstAmount: order.gstAmount // Added for client-side reference
            });
        } else {
            console.log("verifyPaymentFromExisting17 - Signature verification failed");
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

        // Verify Razorpay signature
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
        order.transactionId = razorpay_payment_id; // Added to track payment
        await order.save();

        res.json({
            success: true,
            message: "Payment verified",
            orderId: order._id,
            totalAmount: order.totalAmount, // Added for client-side reference
            gstAmount: order.gstAmount // Added for client-side reference
        });
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
            gstAmount: order.gstAmount
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