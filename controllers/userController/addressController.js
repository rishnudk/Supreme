const Address = require("../../models/Address");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const mongoose = require('mongoose')
const User =require('../../models/User')




 
 exports.getAddressPage =async (req, res) => {
    try {
        const addresses = await Address.find(); // Fetch all addresses without user filter
        res.render("user/address", { addresses,   user: req.user  }); // Pass data to the template
    } catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).send("Server Error");
    }
}



exports.addAddress = async (req, res) => {
    try {
        const { fullName, phone, address, city, state, country, pincode, addressType, isDefault } = req.body;

        // Validate required fields
        if (!fullName || !phone || !address || !city || !state || !country || !pincode) {
            return res.status(400).json({ message: "All fields are required" });
        }
        

        if (isDefault) {
            await Address.updateMany(
                { user: req.session.user._id, isDefault: true }, // Find existing default address
                { $set: { isDefault: false } } // Change it to false
            );
        }

        // ✅ Temporarily remove `req.user._id`
        const newAddress = new Address({
            user: req.session.user._id,  // 🔹 Replace with a real user ID from your database
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

        // Save to database
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



// exports.updateAddress = async (req, res) => {
//     try {
//         const addressId = req.params.id;
//         const {
//             fullName,
//             phone,
//             address,
//             city,
//             state,
//             country,
//             pincode,
//             addressType,
//             isDefault // Changed from setDefault to isDefault
//         } = req.body;

//         // Find the address by ID and update it
//         const updatedAddress = await Address.findByIdAndUpdate(
//             addressId,
//             {
//                 fullName,
//                 phone,
//                 address,
//                 city,
//                 state,
//                 country,
//                 pincode,
//                 addressType,
//                 isDefault // Changed from setDefault to isDefault
//             },
//             { new: true } // Return the updated document
//         );

//         if (!updatedAddress) {
//             return res.status(404).json({ success: false, message: 'Address not found' });
//         }
        

//         res.json({ success: true, message: 'Address updated successfully', data: updatedAddress });
//     } catch (error) {
//         console.error('Error updating address:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };



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

        // **Check if isDefault is true before updating the address**
        if (isDefault) {
            // **Unset the current default address before setting a new one**
            await Address.updateMany(
                { user: req.session.user._id, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        // **Update the address after resetting the default address**
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
                isDefault: isDefault || false // Ensure it's false when not explicitly set
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