const Address = require("../../models/Address");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Cart = require("../../models/Cart");
const mongoose = require('mongoose')
const User =require('../../models/User')






exports.getCheckoutPage = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/user/login");
        }
        const userId = new mongoose.Types.ObjectId(req.session.user._id);
        console.log("User ID:", userId); // Debugging

        // Fetch all addresses instead of just the default one
        const addresses = await Address.find({ user: userId });

        console.log("Fetched Addresses:", addresses); // Debugging

        const cart = await Cart.findOne({ user: userId }).populate("items.product");


     if (!cart || cart.items.length === 0) {
     return res.redirect('/user/cart'); 
     }


        let subtotal = 0;
        let shippingCost = 15;

        if (cart && cart.items.length > 0) {
            subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        } else {
            shippingCost = 0;
        }

        const total = subtotal + shippingCost;

        res.render("user/checkout", { 
            cart, 
            user: req.session.user,
            addresses, 
            subtotal, 
            shippingCost, 
            total 
        });
    } catch (error) {
        console.error("Error loading checkout page:", error);
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