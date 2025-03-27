const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const Wishlist = require("../../models/Wishlist");
const Cart = require("../../models/Cart");
const Offer = require("../../models/Offer");
const Address = require("../../models/Address")
const User =require('../../models/User')
const mongoose = require("mongoose");



// Add product to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: "You must be logged in to add to wishlist" });
        }

        const userId = req.session.user._id;
        const { productId } = req.body;

        // Check if product already exists in wishlist
        const existingWishlistItem = await Wishlist.findOne({ user: userId, product: productId });

        if (existingWishlistItem) {
            return res.status(400).json({ error: "Product is already in your wishlist" });
        }

        // Add new wishlist item
        const newWishlistItem = new Wishlist({
            user: userId,
            product: productId
        });

        await newWishlistItem.save();

        res.status(200).json({ message: "Product added to wishlist successfully" });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};






// // Get all wishlist items for the logged-in user
// exports.getWishlist = async (req, res) => {
//     try {
//         if (!req.session.user) {
//             return res.redirect("/login");
//         }

//         const userId = req.session.user._id;

//         const wishlistItems = await Wishlist.find({ user: userId }).populate("product");

//         res.render("user/wishlist", { wishlist: wishlistItems, user: req.session.user });
//     } catch (error) {
//         console.error("Error fetching wishlist:", error);
//         res.status(500).send("Server Error");
//     }
// };



// Get all wishlist items for the logged-in user
exports.getWishlist = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const userId = req.session.user._id;

        const wishlistItems = await Wishlist.find({ user: userId }).populate("product");

        // Process wishlist items for pricing
        const processedWishlist = await Promise.all(wishlistItems.map(async (item) => {
            item.originalPrice = item.product.price; // Base price
            item.discountedPrice = item.originalPrice; // Default to original
            item.discount = 0; // Default discount
            item.offerPercentage = 0; // Default percentage

            const offers = await Offer.find({
                isActive: true,
                expiryDate: { $gte: new Date() },
                $or: [
                    { applicableTo: "product", productId: item.product._id },
                    { applicableTo: "category", categoryId: item.product.category }
                ]
            });

            if (offers.length > 0) {
                const bestOffer = offers.reduce((max, offer) => 
                    offer.discountValue > max.discountValue ? offer : max, offers[0]);
                item.discount = Math.round(item.originalPrice * (bestOffer.discountValue / 100));
                item.discountedPrice = item.originalPrice - item.discount;
                item.offerPercentage = bestOffer.discountValue;
            }

            return item;
        }));

        res.render("user/wishlist", { wishlist: processedWishlist, user: req.session.user });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).send("Server Error");
    }
};




// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: "You must be logged in" });
        }

        const userId = req.session.user._id;
        const { productId } = req.body;

        await Wishlist.findOneAndDelete({ user: userId, product: productId });

        res.status(200).json({ message: "Product removed from wishlist" });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};










// exports.addToCartFromWishlist = async (req, res) => {
//     console.log("🛒 hellio addToCartFromWishlist API HIT 🚀");
//     console.log("Request Body:", req.body);
//     console.log("Session Data:", req.session);

//     try {
//         if (!req.session.user) {
//             return res.status(401).json({ success: false, message: "You must be logged in" });
//         }
//         const userId = req.session.user._id;
//         const { productId, quantity = 1, color } = req.body; // Default quantity to 1

//         // Fetch product
//         console.log(`Fetching product: ${productId}`);
//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).json({ success: false, message: "Product not found" });
//         }

//         // Check stock availability
//         if (!product.variant || product.variant.stock < quantity) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Insufficient stock for ${product.name}. Only ${product.variant.stock} left.`
//             });
//         }

//         // Fetch or create cart
//         console.log(`Fetching cart for user: ${userId}`);
//         let cart = await Cart.findOne({ user: userId });
//         if (!cart) {
//             console.log("Creating new cart");
//             cart = new Cart({ user: userId, items: [] });
//         }

//         // Check for existing item in cart
//         const existingItem = cart.items.find(item =>
//             item.product.toString() === productId && (!item.color || item.color === color)
//         );

//         const requestedQuantity = parseInt(quantity);
//         const maxQuantity = 3;

//         console.log(`Checking existing item: ${existingItem ? 'Found' : 'Not found'}`);
//         if (existingItem) {
//             const newQuantity = existingItem.quantity + requestedQuantity;
//             if (newQuantity > maxQuantity) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Cannot add more than ${maxQuantity} of this product to cart.`
//                 });
//             }
//             existingItem.quantity = newQuantity;
//         } else {
//             if (requestedQuantity > maxQuantity) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Cannot add more than ${maxQuantity} of this product to cart.`
//                 });
//             }
//             console.log("Adding new item to cart");
//             cart.items.push({
//                 product: productId,
//                 quantity: requestedQuantity,
//                 price: product.price,
//                 color: color || product.variant?.color || null // Use product color if available
//             });
//         }

//         // Save cart
//         console.log("Saving cart");
//         await cart.save();
//         console.log("Cart saved successfully");

//         // Remove from wishlist (always, since it's from wishlist)
//         console.log(`Removing from wishlist: ${productId}`);
//         await Wishlist.findOneAndDelete({ user: userId, product: productId });
//         console.log("Removed from wishlist");

//         res.json({ success: true, message: "Product added to cart from wishlist" });
//     } catch (error) {
//         console.error("Error adding to cart from wishlist:", error.message, error.stack);
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// };



exports.addToCartFromWishlist = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "You must be logged in" });
        }
        const userId = req.session.user._id;
        const { productId, quantity = 1, color } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (!product.variant || product.variant.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${product.name}. Only ${product.variant.stock} left.`
            });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check for existing item by productId only
        const existingItem = cart.items.find(item => item.product.toString() === productId);
        const requestedQuantity = parseInt(quantity);
        const maxQuantity = 3;

        if (existingItem) {
            const newQuantity = existingItem.quantity + requestedQuantity;
            if (newQuantity > maxQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more than ${maxQuantity} of this product to cart.`
                });
            }
            existingItem.quantity = newQuantity;
            // Update color if provided (optional)
            if (color) existingItem.color = color;
        } else {
            if (requestedQuantity > maxQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more than ${maxQuantity} of this product to cart.`
                });
            }
            cart.items.push({
                product: productId,
                quantity: requestedQuantity,
                price: product.price,
                color: color || product.variant?.color || null
            });
        }

        await cart.save();
        await Wishlist.findOneAndDelete({ user: userId, product: productId });

        res.json({ success: true, message: "Product added to cart from wishlist" });
    } catch (error) {
        console.error("Error adding to cart from wishlist:", error.message, error.stack);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


