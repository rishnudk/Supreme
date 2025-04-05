const Address = require("../../models/Address");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Cart = require("../../models/Cart");
const Coupon = require("../../models/Coupon");
const Offer = require("../../models/Offer");
const CouponUsage = require("../../models/CouponUsage");

const bcrypt = require('bcryptjs'); 





const mongoose = require('mongoose')
const User =require('../../models/User')







exports.getCheckoutPage = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/user/login");
        }
        const userId = new mongoose.Types.ObjectId(req.session.user._id);
        console.log(`1 - User ID: ${userId}`);

        // Fetch the two latest addresses
        const latestAddresses = await Address.find({ user: userId })
            .sort({ createdAt: -1 }) 
            .limit(2)
            .lean();
        console.log(`2 - Latest Addresses: ${latestAddresses.length}`);

        // Fetch the default address
        const defaultAddress = await Address.findOne({ user: userId, isDefault: true }).lean();
        console.log(`3 - Default Address: ${defaultAddress ? defaultAddress._id : 'None'}`);

        // Combine, avoiding duplicates
        let addresses = [...latestAddresses];
        if (defaultAddress) {
            const isDefaultInLatest = latestAddresses.some(addr => addr._id.toString() === defaultAddress._id.toString());
            if (!isDefaultInLatest) {
                addresses.push(defaultAddress);
            }
        }
        console.log(`4 - Final Addresses: ${addresses.length}`);

        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return res.redirect('/user/cart');
        }

        const validItems = cart.items.filter(item => item.product.variant.stock >= item.quantity);
        if (validItems.length < cart.items.length) {
            cart.items = validItems;
            await cart.save();
            console.log(`5 - Removed out-of-stock items from cart. Updated items: ${cart.items.length}`);
            if (cart.items.length === 0) {
                return res.redirect('/user/cart');
            }
        }

        console.log(`6 - Cart items: ${cart.items.length}`);

        let subtotal = 0;
        let offerDiscount = 0;
        for (const item of cart.items) {
            const originalPrice = item.product.price * item.quantity;
            subtotal += originalPrice;

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
                const itemDiscount = Math.round(originalPrice * (bestOffer.discountValue / 100));
                offerDiscount += itemDiscount;
                console.log(`7 - Offer applied to ${item.product.name}: ${bestOffer.discountValue}% off, Discount: ₹${itemDiscount}`);
            }
        }

        let afterOfferSubtotal = subtotal - offerDiscount;
        let shippingCost = subtotal > 0 ? 15 : 0;
        let couponDiscount = 0;
        let couponCode = req.query.coupon || req.session.appliedCoupon || '';
        let couponError = null;

        if (req.query.removeCoupon) {
            req.session.appliedCoupon = null;
            couponCode = '';
            console.log(`8 - Coupon removed`);
        }

        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode,
                isActive: true,
                expiryDate: { $gte: new Date() },
                minOrderValue: { $lte: subtotal }
            });

            if (coupon) {
                const couponUsage = await CouponUsage.findOne({ user: userId, coupon: coupon._id });
                if (couponUsage) {
                    couponError = "You have already used this coupon";
                    console.log(`9 - Coupon ${couponCode} already used by user ${userId}`);
                } else {
                    couponDiscount = Math.round(afterOfferSubtotal * (coupon.discountValue / 100));
                    if (!req.session.appliedCoupon) {
                        req.session.appliedCoupon = couponCode;
                    }
                    console.log(`10 - Coupon applied: ${couponCode}, Discount: ₹${couponDiscount} (${coupon.discountValue}%)`);
                }
            } else if (!req.session.appliedCoupon) {
                couponError = "Invalid or expired coupon";
                console.log(`11 - Invalid coupon: ${couponCode}`);
            } else {
                req.session.appliedCoupon = null;
                console.log(`12 - Session coupon invalid, cleared`);
            }
        } else if (req.session.appliedCoupon) {
            const coupon = await Coupon.findOne({
                code: req.session.appliedCoupon,
                isActive: true,
                expiryDate: { $gte: new Date() },
                minOrderValue: { $lte: subtotal }
            });
            if (coupon) {
                const couponUsage = await CouponUsage.findOne({ user: userId, coupon: coupon._id });
                if (couponUsage) {
                    req.session.appliedCoupon = null;
                    couponError = "You have already used this coupon";
                    console.log(`13 - Session coupon ${req.session.appliedCoupon} already used, cleared`);
                } else {
                    couponDiscount = Math.round(afterOfferSubtotal * (coupon.discountValue / 100));
                    couponCode = req.session.appliedCoupon;
                    console.log(`14 - Session coupon reapplied: ${couponCode}, Discount: ₹${couponDiscount}`);
                }
            } else {
                req.session.appliedCoupon = null;
                console.log(`15 - Session coupon invalid, cleared`);
            }
        }

        const baseAmount = afterOfferSubtotal - couponDiscount; 
        const gstAmount = Math.round(baseAmount * 0.12); 
        const total = baseAmount + gstAmount + shippingCost; 
        console.log(`16 - Totals: Subtotal=₹${subtotal}, After Offer Subtotal=₹${afterOfferSubtotal}, Offer Discount=₹${offerDiscount}, Coupon Discount=₹${couponDiscount}, GST=₹${gstAmount}, Shipping=₹${shippingCost}, Total=₹${total}`);

        const availableCoupons = await Coupon.find({
            isActive: true,
            expiryDate: { $gte: new Date() }
        })
            .sort({ createdAt: -1 }) 
            .limit(3);
        console.log(`17 - Available coupons fetched: ${availableCoupons.length}`);

        res.render("user/checkout", {
            cart,
            user: req.session.user,
            addresses,
            subtotal,
            shippingCost,
            offerDiscount,
            couponDiscount,
            gstAmount, 
            total,
            couponCode,
            couponError,
            availableCoupons,
            appliedCoupon: req.session.appliedCoupon
        });
    } catch (error) {
        console.error(`18 - Error loading checkout page: ${error}`);
        res.status(500).send("Internal Server Error");
    }
};




exports.addAddress = async (req, res) => {
    try {
        if (!req.session.user) {
            console.log("Debug: No user in session");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = new mongoose.Types.ObjectId(req.session.user._id);
        console.log("Debug: User ID:", userId.toString());

        const { fullName, address, city, pincode, phone, state, country, addressType, isDefault } = req.body;
        console.log("Debug: Request Body:", req.body);

        // Validate required fields
        const requiredFields = { fullName, address, city, pincode, phone, state, country };
        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value) {
                console.log(`Debug: Missing required field - ${field}`);
                return res.status(400).json({ message: `Missing required field: ${field}` });
            }
        }

        // Validate addressType
        if (addressType && !["Home", "Work"].includes(addressType)) {
            console.log("Debug: Invalid addressType:", addressType);
            return res.status(400).json({ message: "Invalid addressType. Must be 'Home' or 'Work'" });
        }

        const newAddress = new Address({
            user: userId,
            fullName,
            address,
            city,
            state,
            country,
            pincode,
            phone,
            addressType: addressType || "Home", // Default to "Home" if not provided
            isDefault: isDefault === "on" || isDefault === true // Ensure boolean conversion
        });

        console.log("Debug: New Address before save:", newAddress.toObject());

        if (newAddress.isDefault) {
            console.log("Debug: Setting as default, unsetting others");
            await Address.updateMany({ user: userId, isDefault: true }, { isDefault: false });
        }

        await newAddress.save();
        console.log("Debug: Address saved successfully:", newAddress.toObject());

        res.status(201).json({ message: "Address added successfully", address: newAddress });
    } catch (error) {
        console.error("Debug: Error adding address:", {
            message: error.message,
            stack: error.stack,
            code: error.code,
            name: error.name
        });
        res.status(500).json({ 
            message: "Error adding address", 
            error: {
                message: error.message,
                stack: error.stack,
                code: error.code
            }
        });
    }
};



exports.updateAddress = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const addressId = req.params.id;
        const { fullName, address, city, pincode, phone, isDefault } = req.body;
        const userId = new mongoose.Types.ObjectId(req.session.user._id);

        const updatedAddress = await Address.findOneAndUpdate(
            { _id: addressId, user: userId },
            { fullName, address, city, state: req.body.state, pincode, phone, isDefault },
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ message: "Address not found" });
        }

        if (isDefault) {
            // If this is set as default, unset other defaults
            await Address.updateMany(
                { user: userId, _id: { $ne: addressId }, isDefault: true }, 
                { isDefault: false }
            );
        }

        res.json({ message: "Address updated successfully", address: updatedAddress });
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ message: "Error updating address" });
    }
};







exports.getAddress = async (req, res) => {
    try {
        if (!req.session.user) {
            console.log("Debug: No user in session");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = new mongoose.Types.ObjectId(req.session.user._id);
        const addressId = req.params.id;

        console.log("Debug: Fetching address for User ID:", userId.toString(), "Address ID:", addressId);

        const address = await Address.findOne({ _id: addressId, user: userId });
        if (!address) {
            console.log("Debug: Address not found");
            return res.status(404).json({ message: "Address not found" });
        }

        console.log("Debug: Address fetched:", address.toObject());
        res.json(address);
    } catch (error) {
        console.error("Debug: Error fetching address:", {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ message: "Error fetching address", error: error.message });
    }
};










exports.getAddresses = async (req, res) => {
    try {
        if (!req.session.user) {
            console.log("Debug: No user in session");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = new mongoose.Types.ObjectId(req.session.user._id);
        console.log("Debug: Fetching addresses for User ID:", userId.toString());

        // Fetch the two latest addresses
        const latestAddresses = await Address.find({ user: userId })
            .sort({ createdAt: -1 }) 
            .limit(2)
            .lean();

        console.log("Debug: Latest addresses fetched:", latestAddresses);

        // Fetch the default address
        const defaultAddress = await Address.findOne({ user: userId, isDefault: true }).lean();
        console.log("Debug: Default address fetched:", defaultAddress);

        // Combine, avoiding duplicates
        let resultAddresses = [...latestAddresses];
        if (defaultAddress) {
            const isDefaultInLatest = latestAddresses.some(addr => addr._id.toString() === defaultAddress._id.toString());
            if (!isDefaultInLatest) {
                resultAddresses.push(defaultAddress);
            }
        }

        console.log("Debug: Final addresses to return:", resultAddresses);

        res.json({
            success: true,
            addresses: resultAddresses
        });
    } catch (error) {
        console.error("Debug: Error fetching addresses:", {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ message: "Error fetching addresses", error: error.message });
    }
};

