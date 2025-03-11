const Address = require("../../models/Address");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const mongoose = require('mongoose')
const User =require('../../models/User')



exports.getAddressPage = async (req, res) => {
    try {
        if (!req.session.user) {
            console.log("Debug: No user in session");
            return res.redirect("/login"); 
        }

        const userId = req.session.user._id; 
        const addresses = await Address.find({ user: userId }); 

        res.render("user/address", { addresses, user: req.session.user });
    } catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).send("Server Error");
    }
};



exports.addAddress = async (req, res) => {
    try {
        const { fullName, phone, address, city, state, country, pincode, addressType, isDefault } = req.body;

        if (!fullName || !phone || !address || !city || !state || !country || !pincode) {
            return res.status(400).json({ message: "All fields are required" });
        }
        

        if (isDefault) {
            await Address.updateMany(
                { user: req.session.user._id, isDefault: true }, 
                { $set: { isDefault: false } } 
            );
        }

        const newAddress = new Address({
            user: req.session.user._id,  
            fullName,
            phone,
            address,
            city,
            state,
            country,
            pincode,
            addressType: addressType || "Home",
            isDefault: isDefault || false
        });

        await newAddress.save();

        return res.status(201).json({ message: "Address added successfully", address: newAddress });

    } catch (error) {
        console.error("Error adding address:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};



exports.getAddressById = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        res.json({ success: true, address });
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};





exports.updateAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const {
            fullName,
            phone,
            address,
            city,
            state,
            country,
            pincode,
            addressType,
            isDefault
        } = req.body;

        if (isDefault) {
            await Address.updateMany(
                { user: req.session.user._id, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            {
                fullName,
                phone,
                address,
                city,
                state,
                country,
                pincode,
                addressType,
                isDefault: isDefault || false 
            },
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        res.json({ success: true, message: "Address updated successfully", data: updatedAddress });
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};






exports.deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const deletedAddress = await Address.findByIdAndDelete(addressId);
        if (!deletedAddress) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        res.json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};