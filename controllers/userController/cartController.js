const Address = require("../../models/Address");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Cart = require("../../models/Cart");
const Offer = require("../../models/Offer");
const Wishlist = require("../../models/Wishlist");
const mongoose = require('mongoose')
const User =require('../../models/User')




//before gst



// exports.getCartPage = async (req, res) => {
//     try {
//         if (!req.session.user) {
//             console.log(`1 - User not authenticated`);
//             return res.redirect("/user/login");
//         }

//         const userId = req.session.user._id;
//         console.log(`2 - Fetching cart for User ID: ${userId}`);

//         const cart = await Cart.findOne({ user: userId }).populate("items.product");
//         let subtotal = 0;
//         let shippingCost = 15;
//         let offerDiscount = 0;



//         if (cart && cart.items.length > 0) {
//             cart.items = await Promise.all(cart.items.map(async (item) => {
//                 // Always set originalPrice
//                 item.originalPrice = item.product.price * item.quantity;
//                 item.discountedPrice = item.originalPrice; // Default to original if no offer
//                 item.discount = 0; // Default discount
//                 item.offerPercentage = 0; // Default percentage

//                 const offers = await Offer.find({
//                     isActive: true,
//                     expiryDate: { $gte: new Date() },
//                     $or: [
//                         { applicableTo: "product", productId: item.product._id },
//                         { applicableTo: "category", categoryId: item.product.category }
//                     ]
//                 });

//                 if (offers.length > 0) {
//                     const bestOffer = offers.reduce((max, offer) => 
//                         offer.discountValue > max.discountValue ? offer : max, offers[0]);
//                     item.discount = Math.round(item.originalPrice * (bestOffer.discountValue / 100));
//                     item.discountedPrice = item.originalPrice - item.discount;
//                     item.offerPercentage = bestOffer.discountValue;
//                     offerDiscount += item.discount;
//                     console.log(`3 - Offer applied to ${item.product.name}: ${bestOffer.discountValue}% off, Discount: ₹${item.discount}`);
//                 }
//                 return item;
//             }));
//             subtotal = cart.items.reduce((sum, item) => sum + item.originalPrice, 0);
//         } else {
//             shippingCost = 0;
//             console.log(`4 - Cart is empty, no shipping cost`);
//         }

//         const total = subtotal - offerDiscount + shippingCost;
//         console.log(`5 - Totals: Subtotal=₹${subtotal}, Offer Discount=₹${offerDiscount}, Shipping=₹${shippingCost}, Total=₹${total}`);

//         res.render("user/cart", { 
//             cart, 
//             user: req.session.user, 
//             subtotal, 
//             shippingCost, 
//             offerDiscount, 
//             total 
//         });
//     } catch (error) {
//         console.error(`6 - Error loading cart page: ${error.message}`, error.stack);
//         res.status(500).send("Internal Server Error");
//     }
// };




exports.getCartPage = async (req, res) => {
    try {
        if (!req.session.user) {
            console.log(`1 - User not authenticated`);
            return res.redirect("/user/login");
        }

        const userId = req.session.user._id;
        console.log(`2 - Fetching cart for User ID: ${userId}`);

        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        let subtotal = 0;
        let shippingCost = 15;
        let offerDiscount = 0;
        let gstAmount = 0; // New variable for GST

        if (cart && cart.items.length > 0) {
            cart.items = await Promise.all(cart.items.map(async (item) => {
                // Always set originalPrice
                item.originalPrice = item.product.price * item.quantity;
                item.discountedPrice = item.originalPrice; // Default to original if no offer
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
                    offerDiscount += item.discount;
                    console.log(`3 - Offer applied to ${item.product.name}: ${bestOffer.discountValue}% off, Discount: ₹${item.discount}`);
                }
                return item;
            }));
            subtotal = cart.items.reduce((sum, item) => sum + item.originalPrice, 0);
            
            // Calculate GST (12%) on subtotal after discount
            const baseAmount = subtotal - offerDiscount;
            gstAmount = Math.round(baseAmount * 0.12);
        } else {
            shippingCost = 0;
            console.log(`4 - Cart is empty, no shipping cost`);
        }

        const total = subtotal - offerDiscount + gstAmount + shippingCost;
        console.log(`5 - Totals: Subtotal=₹${subtotal}, Offer Discount=₹${offerDiscount}, GST=₹${gstAmount}, Shipping=₹${shippingCost}, Total=₹${total}`);

        res.render("user/cart", { 
            cart, 
            user: req.session.user, 
            subtotal, 
            shippingCost, 
            offerDiscount,
            gstAmount, // Pass GST amount to the view
            total 
        });
    } catch (error) {
        console.error(`6 - Error loading cart page: ${error.message}`, error.stack);
        res.status(500).send("Internal Server Error");
    }
};


// og for the product
//   exports.addToCart = async (req, res) => {
//     try {
//         if (!req.session.user) {
//             return res.status(401).json({ message: "User not logged in" });
//         }

//         const userId = req.session.user._id;
//         const { productId, quantity, color } = req.body;

//         let cart = await Cart.findOne({ user: userId });
//         const product = await Product.findById(productId);

//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         if (!cart) {
//             cart = new Cart({ user: userId, items: [] });
//         }

//         // Check if product already exists in cart
//         const existingItem = cart.items.find(item => 
//             item.product.toString() === productId && item.color === color
//         );

//         if (existingItem) {
//             existingItem.quantity += parseInt(quantity);
//         } else {
//             cart.items.push({
//                 product: productId,
//                 quantity: parseInt(quantity),
//                 price: product.price,
//                 color: color
//             });
//         }

//         await cart.save();
//         res.redirect("/user/cart"); 
//     } catch (error) {
//         console.error("Error adding to cart:", error);
//         res.status(500).json({ message: "Internal Server Error", error }); 
//     }
// };



// exports.addToCart = async (req, res) => {
//     console.log("🛒 addToCart API HIT 🚀"); // ✅ Debugging log
//     console.log("Request Body:", req.body); // ✅ Check incoming data
//     console.log("Session Data:", req.session); // Add this in `addToCart`


//     try {
//         if (!req.session.user) {
//             return res.redirect("/user/login");
//         }
//         const userId = req.session.user._id;
//         const { productId, quantity, color, fromWishlist } = req.body; // ✅ Added `fromWishlist`

//         let cart = await Cart.findOne({ user: userId });
//         const product = await Product.findById(productId);

//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         if (!cart) {
//             cart = new Cart({ user: userId, items: [] });
//         }

//         // 🔹 Check if product already exists in cart
//         const existingItem = cart.items.find(item =>
//             item.product.toString() === productId && item.color === color
//         );

//         if (existingItem) {
//             existingItem.quantity += parseInt(quantity);
//         } else {
//             cart.items.push({
//                 product: productId,
//                 quantity: parseInt(quantity),
//                 price: product.price,
//                 color: color
//             });
//         }

//         await cart.save();

//         // ✅ If added from wishlist, remove from wishlist
//         if (fromWishlist) {
//             await Wishlist.findOneAndDelete({ user: userId, product: productId });
//         }

//         res.json({ success: true, message: "Product added to cart successfully" });

//     } catch (error) {
//         console.error("Error adding to cart:", error);
//         res.status(500).json({ message: "Internal Server Error", error });
//     }
// };


// exports.addToCart = async (req, res) => {
//     console.log("🛒 addToCart API HIT 🚀");
//     console.log("Request Body:", req.body);
//     console.log("Session Data:", req.session);

//     try {
//         if (!req.session.user) {
//             return res.redirect("/user/login");
//         }
//         const userId = req.session.user._id;
//         const { productId, quantity = 1, color, fromWishlist } = req.body; // Default quantity to 1 if not provided

//         let cart = await Cart.findOne({ user: userId });
//         const product = await Product.findById(productId);

//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         if (!cart) {
//             cart = new Cart({ user: userId, items: [] });
//         }

//         // 🔹 Check if product already exists in cart
//         const existingItem = cart.items.find(item =>
//             item.product.toString() === productId && item.color === color
//         );

//         const requestedQuantity = parseInt(quantity); // Quantity from request
//         const maxQuantity = 3; // Set max limit

//         if (existingItem) {
//             // Check if adding the requested quantity exceeds the limit
//             const newQuantity = existingItem.quantity + requestedQuantity;
//             if (newQuantity > maxQuantity) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Cannot add more than ${maxQuantity} of this product to cart.`
//                 });
//             }
//             existingItem.quantity = newQuantity;
//         } else {
//             // If product isn't in cart yet, ensure the initial quantity doesn't exceed limit
//             if (requestedQuantity > maxQuantity) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Cannot add more than ${maxQuantity} of this product to cart.`
//                 });
//             }
//             cart.items.push({
//                 product: productId,
//                 quantity: requestedQuantity,
//                 price: product.price,
//                 color: color
//             });
//         }

//         await cart.save();

//         // Remove from wishlist if applicable
//         if (fromWishlist) {
//             await Wishlist.findOneAndDelete({ user: userId, product: productId });
//         }

//         res.json({ success: true, message: "Product added to cart successfully" });

//     } catch (error) {
//         console.error("Error adding to cart:", error);
//         res.status(500).json({ message: "Internal Server Error", error });
//     }
// };












exports.addToCart = async (req, res) => {
    console.log("🛒 is this working cart??  API HIT 🚀");
    console.log("Request Body:", req.body);
    console.log("Session Data:", req.session);

    try {
        if (!req.session.user) {
            return res.redirect("/user/login");
        }
        const userId = req.session.user._id;
        const { productId, quantity = 1, color, fromWishlist } = req.body; // Default quantity to 1 if not provided

        let cart = await Cart.findOne({ user: userId });
        const product = await Product.findById(productId).populate("category");

        if (!product) {
          return res.status(404).json({ success: false, message: "Product not found" });
        }
    
        if (product.status === "Inactive") {
          return res.status(404).json({ success: false, message: "Product not available for now" });
        }
    
        if (product.category && product.category.isDeleted) {
          return res.status(404).json({ success: false, message: "Product category is no longer available" });
        }
    

        const requestedQuantity = parseInt(quantity);
        if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive number"
            });
        }

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // 🔹 Check if product already exists in cart
        const existingItem = cart.items.find(item =>
            item.product.toString() === productId && item.color === color
        );

        const maxQuantity = 3; // Set max limit

        if (existingItem) {
            // 🔹 Check current quantity and max limit
            if (existingItem.quantity >= maxQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `This product already has the maximum quantity of ${maxQuantity} in your cart`
                });
            }

            // Check if adding the requested quantity exceeds the limit
            const newQuantity = existingItem.quantity + requestedQuantity;
            if (newQuantity > maxQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more than ${maxQuantity} of this product to cart. You already have ${existingItem.quantity}.`
                });
            }
            existingItem.quantity = newQuantity;
        } else {
            // 🔹 If product isn't in cart yet, ensure the initial quantity doesn't exceed limit
            if (requestedQuantity > maxQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more than ${maxQuantity} of this product to cart`
                });
            }
            cart.items.push({
                product: productId,
                quantity: requestedQuantity,
                price: product.price,
                color: color || null // Default to null if no color
            });
        }

        await cart.save();

        // Remove from wishlist if applicable
        if (fromWishlist) {
            await Wishlist.findOneAndDelete({ user: userId, product: productId });
        }

        res.json({ success: true, message: "Product added to cart successfully" });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};









//og

// exports.updateCartQuantity = async (req, res) => {
//     try {
//         if (!req.session.user) {
//             return res.status(401).json({ success: false, message: "Please login" });
//         }

//         const userId = req.session.user._id;
//         const { productId, action } = req.body;

//         const cart = await Cart.findOne({ user: userId }).populate("items.product");
//         if (!cart) {
//             return res.status(404).json({ success: false, message: "Cart not found" });
//         }

//         const itemIndex = cart.items.findIndex(item => item.product._id.toString() === productId);
//         if (itemIndex === -1) {
//             return res.status(404).json({ success: false, message: "Item not found in cart" });
//         }

//         const item = cart.items[itemIndex];
//         const productPrice = item.product.price;

//         if (action === "increase" && item.quantity < 3) {
//             item.quantity += 1;
//         } else if (action === "decrease" && item.quantity > 1) {
//             item.quantity -= 1;
//         } else {
//             return res.status(400).json({
//                 success: false,
//                 message: action === "increase" ? "Maximum quantity (3) reached" : "Minimum quantity (1) reached"
//             });
//         }

//         await cart.save();

//         // Recalculate totals
//         const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
//         const shippingCost = cart.items.length > 0 ? 15 : 0; // Match getCartPage logic
//         const total = subtotal + shippingCost;

//         res.json({
//             success: true,
//             quantity: item.quantity,
//             productPrice,
//             subtotal,
//             shippingCost,
//             total
//         });
//     } catch (error) {
//         console.error("Error updating quantity:", error.stack);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };




// exports.updateCartQuantity = async (req, res) => {
//     try {
//         if (!req.session.user) {
//             return res.status(401).json({ success: false, message: "Please login" });
//         }

//         const userId = req.session.user._id;
//         const { productId, action } = req.body;

//         const cart = await Cart.findOne({ user: userId }).populate("items.product");
//         if (!cart) {
//             return res.status(404).json({ success: false, message: "Cart not found" });
//         }

//         const itemIndex = cart.items.findIndex(item => item.product._id.toString() === productId);
//         if (itemIndex === -1) {
//             return res.status(404).json({ success: false, message: "Item not found in cart" });
//         }

//         const item = cart.items[itemIndex];
//         const productPrice = item.product.price;

//         if (action === "increase") {
//             const newQuantity = item.quantity + 1;
//             if (newQuantity > 3) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Maximum quantity (3) reached"
//                 });
//             }
//             if (item.product.variant.stock < newQuantity) {
//                 console.log(`Stock insufficient for ${item.product.name}: Required ${newQuantity}, Available ${item.product.variant.stock}`);
//                 return res.status(400).json({
//                     success: false,
//                     message: `Insufficient stock for ${item.product.name}. Only ${item.product.variant.stock} left.`
//                 });
//             }
//             item.quantity = newQuantity;
//         } else if (action === "decrease" && item.quantity > 1) {
//             item.quantity -= 1;
//         } else {
//             return res.status(400).json({
//                 success: false,
//                 message: "Minimum quantity (1) reached"
//             });
//         }
//         await cart.save();

//         // Recalculate totals with offer discount
//         let subtotal = 0;
//         let offerDiscount = 0;
//         for (const cartItem of cart.items) {
//             const originalPrice = cartItem.product.price * cartItem.quantity;
//             subtotal += originalPrice;

//             const offers = await Offer.find({
//                 isActive: true,
//                 expiryDate: { $gte: new Date() },
//                 $or: [
//                     { applicableTo: "product", productId: cartItem.product._id },
//                     { applicableTo: "category", categoryId: cartItem.product.category }
//                 ]
//             });

//             if (offers.length > 0) {
//                 const bestOffer = offers.reduce((max, offer) => 
//                     offer.discountValue > max.discountValue ? offer : max, offers[0]);
//                 const itemDiscount = Math.round(originalPrice * (bestOffer.discountValue / 100));
//                 offerDiscount += itemDiscount;
//             }
//         }

//         const shippingCost = cart.items.length > 0 ? 15 : 0; // Match getCartPage logic
//         const total = subtotal - offerDiscount + shippingCost;

//         res.json({
//             success: true,
//             quantity: item.quantity,
//             productPrice,
//             subtotal,
//             shippingCost,
//             offerDiscount,
//             total
//         });
//     } catch (error) {
//         console.error("Error updating quantity:", error.stack);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };






// Remove from cart route (for completeness)


// exports.removeFromCart = async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const { productId } = req.body;

//         const cart = await Cart.findOne({ user: userId });
//         cart.items = cart.items.filter(item => item.product.toString() !== productId);
        
//         await cart.save();
//         res.json({ success: true });
//     } catch (error) {
//         console.error("Error removing item:", error);
//         res.status(500).json({ success: false });
//     }
// };


exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const initialItemCount = cart.items.length;
        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        if (initialItemCount === cart.items.length) {
            return res.status(404).json({ success: false, message: "Product not found in cart" });
        }

        await cart.save();
        res.json({ 
            success: true, 
            message: "Product removed from cart", 
            isEmpty: cart.items.length === 0 
        });
    } catch (error) {
        console.error("Error removing item:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};





// bofore gst
// exports.updateCartQuantity = async (req, res) => {
//     try {
//         if (!req.session.user) {
//             return res.status(401).json({ success: false, message: "Please login" });
//         }

//         const userId = req.session.user._id;
//         const { productId, action } = req.body;

//         const cart = await Cart.findOne({ user: userId }).populate("items.product");
//         if (!cart) {
//             return res.status(404).json({ success: false, message: "Cart not found" });
//         }

//         const itemIndex = cart.items.findIndex(item => item.product._id.toString() === productId);
//         if (itemIndex === -1) {
//             return res.status(404).json({ success: false, message: "Item not found in cart" });
//         }

//         const item = cart.items[itemIndex];
//         const productPrice = item.product.price;

//         if (action === "increase") {
//             const newQuantity = item.quantity + 1;
//             if (newQuantity > 3) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Maximum quantity (3) reached"
//                 });
//             }
//             if (item.product.variant.stock < newQuantity) {
//                 console.log(`Stock insufficient for ${item.product.name}: Required ${newQuantity}, Available ${item.product.variant.stock}`);
//                 return res.status(400).json({
//                     success: false,
//                     message: `Insufficient stock for ${item.product.name}. Only ${item.product.variant.stock} left.`
//                 });
//             }
//             item.quantity = newQuantity;
//         } else if (action === "decrease" && item.quantity > 1) {
//             item.quantity -= 1;
//         } else {
//             return res.status(400).json({
//                 success: false,
//                 message: "Minimum quantity (1) reached"
//             });
//         }
//         await cart.save();

//         // Recalculate totals with offer discount
//         let subtotal = 0;
//         let offerDiscount = 0;
//         let discountedPrice = productPrice * item.quantity; // Default for the updated item
//         let offerPercentage = 0;

//         for (const cartItem of cart.items) {
//             const originalPrice = cartItem.product.price * cartItem.quantity;
//             subtotal += originalPrice;

//             const offers = await Offer.find({
//                 isActive: true,
//                 expiryDate: { $gte: new Date() },
//                 $or: [
//                     { applicableTo: "product", productId: cartItem.product._id },
//                     { applicableTo: "category", categoryId: cartItem.product.category }
//                 ]
//             });

//             if (offers.length > 0) {
//                 const bestOffer = offers.reduce((max, offer) => 
//                     offer.discountValue > max.discountValue ? offer : max, offers[0]);
//                 const itemDiscount = Math.round(originalPrice * (bestOffer.discountValue / 100));
//                 offerDiscount += itemDiscount;
//                 // If this is the updated item, calculate its discounted price
//                 if (cartItem.product._id.toString() === productId) {
//                     discountedPrice = originalPrice - itemDiscount;
//                     offerPercentage = bestOffer.discountValue;
//                 }
//             }
//         }

//         const shippingCost = cart.items.length > 0 ? 15 : 0;
//         const total = subtotal - offerDiscount + shippingCost;

//         res.json({
//             success: true,
//             quantity: item.quantity,
//             productPrice,
//             discountedPrice, // Add this
//             offerPercentage, // Add this
//             subtotal,
//             shippingCost,
//             offerDiscount,
//             total
//         });
//     } catch (error) {
//         console.error("Error updating quantity:", error.stack);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };



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

        if (action === "increase") {
            const newQuantity = item.quantity + 1;
            if (newQuantity > 3) {
                return res.status(400).json({
                    success: false,
                    message: "Maximum quantity (3) reached"
                });
            }
            if (item.product.variant.stock < newQuantity) {
                console.log(`Stock insufficient for ${item.product.name}: Required ${newQuantity}, Available ${item.product.variant.stock}`);
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.product.name}. Only ${item.product.variant.stock} left.`
                });
            }
            item.quantity = newQuantity;
        } else if (action === "decrease" && item.quantity > 1) {
            item.quantity -= 1;
        } else {
            return res.status(400).json({
                success: false,
                message: "Minimum quantity (1) reached"
            });
        }
        await cart.save();

        // Recalculate totals with offer discount and GST
        let subtotal = 0;
        let offerDiscount = 0;
        let discountedPrice = productPrice * item.quantity; // Default for the updated item
        let offerPercentage = 0;

        for (const cartItem of cart.items) {
            const originalPrice = cartItem.product.price * cartItem.quantity;
            subtotal += originalPrice;

            const offers = await Offer.find({
                isActive: true,
                expiryDate: { $gte: new Date() },
                $or: [
                    { applicableTo: "product", productId: cartItem.product._id },
                    { applicableTo: "category", categoryId: cartItem.product.category }
                ]
            });

            if (offers.length > 0) {
                const bestOffer = offers.reduce((max, offer) => 
                    offer.discountValue > max.discountValue ? offer : max, offers[0]);
                const itemDiscount = Math.round(originalPrice * (bestOffer.discountValue / 100));
                offerDiscount += itemDiscount;
                // If this is the updated item, calculate its discounted price
                if (cartItem.product._id.toString() === productId) {
                    discountedPrice = originalPrice - itemDiscount;
                    offerPercentage = bestOffer.discountValue;
                }
            }
        }

        const shippingCost = cart.items.length > 0 ? 15 : 0;
        const baseAmount = subtotal - offerDiscount; // Amount before GST and shipping
        const gstAmount = Math.round(baseAmount * 0.12); // 12% GST
        const total = baseAmount + gstAmount + shippingCost; // Final total including GST

        res.json({
            success: true,
            quantity: item.quantity,
            productPrice,
            discountedPrice,
            offerPercentage,
            subtotal,
            shippingCost,
            offerDiscount,
            gstAmount, // Added GST amount
            total
        });
    } catch (error) {
        console.error("Error updating quantity:", error.stack);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};