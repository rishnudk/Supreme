const Address = require("../../models/Address");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Cart = require("../../models/Cart");
const mongoose = require('mongoose')
const User =require('../../models/User')
const Order =require('../../models/Order')



// exports.placeOrder = async (req, res) => {
//     try {
//         console.log("Received Order Data:", req.body); // Log request data

//         const { addressId, paymentMethod, cartItems, subtotal, shippingCost, total } = req.body;

//         if (!addressId || !paymentMethod || !cartItems.length) {
//             throw new Error("Missing required fields");
//         }

//         const newOrder = new Order({
//             user: req.user?._id || "Guest", // Handle guest users
//             address: addressId,
//             paymentMethod: paymentMethod,
//             items: cartItems,
//             subtotal: subtotal,
//             shippingCost: shippingCost,
//             total: total,
//             status: "Pending",
//         });

//         await newOrder.save();
//         console.log("Order saved successfully");

//         res.json({ success: true, message: "Order placed successfully!" });
//     } catch (error) {
//         console.error("Order Placement Error:", error.message, error.stack);
//         res.status(500).json({ success: false, error: error.message });
//     }
// };



// exports.placeOrder = async (req, res) => {
//     try {
//         console.log("📩 Received Order Data:", req.body);

//         // Ensure user is authenticated
//         if (!req.session.user) {
//             return res.status(401).json({ success: false, error: "User not authenticated. Please log in." });
//         }

//         req.user = req.session.user; // Attach user to request

//         // Destructure required fields from request
//         const { addressId, paymentMethod, cart } = req.body;

//         // Validate required fields
//         if (!addressId || !paymentMethod || !cart) {
//             return res.status(400).json({ success: false, error: "Missing required fields: addressId, paymentMethod, or cart" });
//         }

//         if (!Array.isArray(cart.items) || cart.items.length === 0) {
//             return res.status(400).json({ success: false, error: "Cart items must be a non-empty array" });
//         }

//         if (!cart.total) {
//             return res.status(400).json({ success: false, error: "Total amount is required." });
//         }
//         if (!Array.isArray(cart.items) || cart.items.length === 0) {
//             return res.status(400).json({ success: false, error: "Cart items are missing or invalid." });
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

//         // ✅ Rename `cart.total` to `totalAmount`
//         const totalAmount = cart.total;

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

//         // ✅ Create new order
//         const newOrder = new Order({
//             user: req.user._id,
//             shippingAddress: shippingAddress,
//             paymentMethod: finalPaymentMethod,
//             products: cart.items.map(item => ({
//                 product: item.productId,
//                 name: item.name,
//                 price: item.price,
//                 quantity: item.quantity,
//                 image: item.image
//             })),
//             totalAmount: totalAmount,
//             orderStatus: "Pending"
//         });

//         await newOrder.save();
//         console.log("✅ Order saved successfully");

//         res.json({ success: true, message: "Order placed successfully!" });
//     } catch (error) {
//         console.error("🚨 Order Placement Error:", error.message, error.stack);
//         res.status(500).json({ success: false, error: error.message });
//     }
// };


exports.placeOrder = async (req, res) => {
    try {
        console.log("📩 Received Order Data:", req.body);

        // Ensure user is authenticated
        if (!req.session.user) {
            return res.status(401).json({ success: false, error: "User not authenticated. Please log in." });
        }

        req.user = req.session.user; // Attach user to request
        const userId = req.session.user._id;

        // ✅ Fetch the cart properly using `await`
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        // ❌ FIXED: Ensure the cart is found
        if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
            return res.status(400).json({ success: false, error: "Your cart is empty. Please add products before placing an order." });
        }

        const { addressId, paymentMethod } = req.body;

        // Validate required fields
        if (!addressId || !paymentMethod) {
            return res.status(400).json({ success: false, error: "Missing required fields: addressId or paymentMethod." });
        }

        console.log("Cart items received:", cart.items);

        // 🔥 Retrieve the full shipping address from the database
        const userAddress = await Address.findById(addressId);
        if (!userAddress) {
            return res.status(400).json({ success: false, error: "Invalid address selected." });
        }

        // ✅ Format `shippingAddress` as expected by the Order schema
        const shippingAddress = {
            fullName: userAddress.fullName,
            phone: userAddress.phone,
            address: userAddress.address,
            city: userAddress.city,
            state: userAddress.state,
            country: userAddress.country,
            pincode: userAddress.pincode
        };

        // ✅ Get totalAmount from the cart
        const totalAmount = cart.totalPrice;

        // ✅ Ensure `paymentMethod` matches the enum values
        const paymentMethodMap = {
            cod: "COD",
            razorpay: "Razorpay",
            wallet: "Wallet"
        };
        const finalPaymentMethod = paymentMethodMap[paymentMethod.toLowerCase()] || paymentMethod;

        if (!["COD", "Razorpay", "Wallet"].includes(finalPaymentMethod)) {
            return res.status(400).json({ success: false, error: `Invalid payment method: ${paymentMethod}` });
        }

        // ✅ Extract valid product details from cart items
        const products = cart.items.map(item => {
            if (!item.product || !item.product._id || !item.product.name || !item.product.price || !item.product.images?.length) {
                throw new Error(`Invalid cart item: ${JSON.stringify(item)}`);
            }

            return {
                product: item.product._id, // Extract `productId`
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                image: item.product.images[0] // Take the first image
            };
        });

        // ✅ Create new order
        const newOrder = new Order({
            user: req.user._id,
            shippingAddress: shippingAddress,
            paymentMethod: finalPaymentMethod,
            products: products,
            totalAmount: totalAmount,
            orderStatus: "Pending"
        });

        await newOrder.save();
        console.log("✅ Order saved successfully");

        // ✅ Clear user's cart after placing the order
        await Cart.findOneAndDelete({ user: userId });

        res.json({ success: true, message: "Order placed successfully!" });
    } catch (error) {
        console.error("🚨 Order Placement Error:", error.message, error.stack);
        res.status(500).json({ success: false, error: error.message });
    }
};
