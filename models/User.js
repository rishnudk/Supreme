const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String
    },
    phone: {
        type: String,
        required: false
    },
    googleId: {
        type: String,
        default: null
    },
    referralCode: {
        type: String,
        unique: true,
        default: () => uuidv4().slice(0, 8) 
    },
    referredBy: {
        type: String, 
        default: null
    },
    status: {
        type: String,
        default: "Active",
        required:false
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
