const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const Wishlist = require("../../models/Wishlist");
const Address = require("../../models/Address")
const User =require('../../models/User')
const mongoose = require("mongoose");




// ✅ 1. Get Wishlist Page
exports.getWishlistPage = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login"); // Redirect if user is not logged in
        }

        const wishlistItems = await Wishlist.find({ user: req.session.user._id })
            .populate("product"); // Populate product details

        res.render("user/wishlist", { wishlistItems, user: req.session.user });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).send("Server Error");
    }
};

// ✅ 2. Add Product to Wishlist
exports.addToWishlist = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { productId } = req.body;

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if the item is already in the wishlist
        const existingItem = await Wishlist.findOne({
            user: req.session.user._id,
            product: productId,
        });

        if (existingItem) {
            return res.status(400).json({ message: "Product already in wishlist" });
        }

        // Add to wishlist
        const newWishlistItem = new Wishlist({
            user: req.session.user._id,
            product: productId,
        });

        await newWishlistItem.save();
        res.json({ message: "Added to wishlist successfully" });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ message: "Error adding to wishlist" });
    }
};

// ✅ 3. Remove Product from Wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { productId } = req.params;

        // Remove from wishlist
        const deletedItem = await Wishlist.findOneAndDelete({
            user: req.session.user._id,
            product: productId,
        });

        if (!deletedItem) {
            return res.status(404).json({ message: "Product not found in wishlist" });
        }

        res.json({ message: "Removed from wishlist" });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ message: "Error removing from wishlist" });
    }
};

