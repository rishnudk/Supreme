const Address = require("../../models/Address");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Cart = require("../../models/Cart");
const mongoose = require('mongoose')
const User =require('../../models/User')





exports.getCartPage = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/user/login");
        }
  
        const userId = req.session.user._id;
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
  
        let subtotal = 0;
        let shippingCost = 15; // Default shipping fee
  
        if (cart && cart.items.length > 0) {
            subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        } else {
            shippingCost = 0; // Free shipping for empty cart
        }
  
        const total = subtotal + shippingCost; // 🔹 Calculate total dynamically
  
        // 🔹 Pass all values to EJS
        res.render("user/cart", { cart, user: req.session.user, subtotal, shippingCost, total });
    } catch (error) {
        console.error("Error loading cart page:", error);
        res.status(500).send("Internal Server Error");
    }
  };
  


  exports.addToCart = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "User not logged in" });
        }

        const userId = req.session.user._id;
        const { productId, quantity, color } = req.body;

        let cart = await Cart.findOne({ user: userId });
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if product already exists in cart
        const existingItem = cart.items.find(item => 
            item.product.toString() === productId && item.color === color
        );

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            cart.items.push({
                product: productId,
                quantity: parseInt(quantity),
                price: product.price,
                color: color
            });
        }

        await cart.save();
        res.redirect("/user/cart"); 
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Internal Server Error", error }); 
    }
};





exports.updateCartQuantity = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Please login" });
        }

        const userId = req.session.user._id;
        const { productId, action } = req.body;

        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.product._id.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Item not found in cart" });
        }

        const item = cart.items[itemIndex];
        const productPrice = item.product.price;

        if (action === "increase" && item.quantity < 3) {
            item.quantity += 1;
        } else if (action === "decrease" && item.quantity > 1) {
            item.quantity -= 1;
        } else {
            return res.status(400).json({
                success: false,
                message: action === "increase" ? "Maximum quantity (3) reached" : "Minimum quantity (1) reached"
            });
        }

        await cart.save();

        // Recalculate totals
        const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const shippingCost = cart.items.length > 0 ? 15 : 0; // Match getCartPage logic
        const total = subtotal + shippingCost;

        res.json({
            success: true,
            quantity: item.quantity,
            productPrice,
            subtotal,
            shippingCost,
            total
        });
    } catch (error) {
        console.error("Error updating quantity:", error.stack);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Remove from cart route (for completeness)
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { productId } = req.body;

        const cart = await Cart.findOne({ user: userId });
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        
        await cart.save();
        res.json({ success: true });
    } catch (error) {
        console.error("Error removing item:", error);
        res.status(500).json({ success: false });
    }
};