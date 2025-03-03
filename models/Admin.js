const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "admin" 
    }
   
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
