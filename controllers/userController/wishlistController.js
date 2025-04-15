const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const Wishlist = require("../../models/Wishlist");
const Cart = require("../../models/Cart");
const Offer = require("../../models/Offer");
const Address = require("../../models/Address")
const User =require('../../models/User')
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs'); 



// Add product to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: "You must be logged in to add to wishlist" });
        }

        const userId = req.session.user._id;
        const { productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, products: [] });
        }

        if (wishlist.products.includes(productId)) {
            return res.status(400).json({ error: "Product is already in your wishlist" });
        }

        wishlist.products.push(productId);
        wishlist.addedAt = Date.now();
        await wishlist.save();

        console.log("❤️ Wishlist updated:", wishlist);

        res.status(200).json({
            message: "Product added to wishlist successfully",
            wishlistCount: wishlist.products.length,
        });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ error: "Internal server error" });
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

        const wishlist = await Wishlist.findOne({ user: userId });
        let wishlistCount = 0;
        if (wishlist && wishlist.products) {
            wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
            wishlist.addedAt = Date.now();
            await wishlist.save();
            wishlistCount = wishlist.products.length;
            console.log("🗑️ Wishlist updated:", wishlist);
        } else {
            console.log("🗑️ No wishlist or product not found");
        }

        res.status(200).json({
            message: "Product removed from wishlist",
            wishlistCount,
        });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Add to cart from wishlist
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
                message: `Insufficient stock for ${product.name}. Only ${product.variant.stock} left.`,
            });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingItem = cart.items.find(item => item.product.toString() === productId);
        const requestedQuantity = parseInt(quantity);
        const maxQuantity = 3;

        if (existingItem) {
            const newQuantity = existingItem.quantity + requestedQuantity;
            if (newQuantity > maxQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more than ${maxQuantity} of this product to cart.`,
                });
            }
            existingItem.quantity = newQuantity;
            if (color) existingItem.color = color;
        } else {
            if (requestedQuantity > maxQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more than ${maxQuantity} of this product to cart.`,
                });
            }
            cart.items.push({
                product: productId,
                quantity: requestedQuantity,
                price: product.price,
                color: color || product.variant?.color || null,
            });
        }

        await cart.save();

        const wishlist = await Wishlist.findOne({ user: userId });
        let wishlistCount = 0;
        let cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        if (wishlist && wishlist.products) {
            wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
            wishlist.addedAt = Date.now();
            await wishlist.save();
            wishlistCount = wishlist.products.length;
            console.log("🗑️ Wishlist updated after cart add:", wishlist);
        }

        res.json({
            success: true,
            message: "Product added to cart from wishlist",
            wishlistCount,
            cartCount,
        });
    } catch (error) {
        console.error("Error adding to cart from wishlist:", error.message, error.stack);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// getWishlist remains unchanged
exports.getWishlist = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const userId = req.session.user._id;

        const wishlist = await Wishlist.findOne({ user: userId }).populate("products");

        const processedWishlist = wishlist && wishlist.products.length > 0
            ? await Promise.all(wishlist.products.map(async (product) => {
                  const item = {
                      product,
                      originalPrice: product.price,
                      discountedPrice: product.price,
                      discount: 0,
                      offerPercentage: 0,
                  };

                  const offers = await Offer.find({
                      isActive: true,
                      expiryDate: { $gte: new Date() },
                      $or: [
                          { applicableTo: "product", productId: product._id },
                          { applicableTo: "category", categoryId: product.category },
                      ],
                  });

                  if (offers.length > 0) {
                      const bestOffer = offers.reduce((max, offer) =>
                          offer.discountValue > max.discountValue ? offer : max, offers[0]);
                      item.discount = Math.round(item.originalPrice * (bestOffer.discountValue / 100));
                      item.discountedPrice = item.originalPrice - item.discount;
                      item.offerPercentage = bestOffer.discountValue;
                  }

                  return item;
              }))
            : [];

        res.render("user/wishlist", {
            wishlist: processedWishlist,
            user: req.session.user,
        });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).send("Server Error");
    }
};