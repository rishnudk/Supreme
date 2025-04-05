const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    title: { type: String, required: false }, 
    description: { type: String },
    discountValue: { type: Number, required: true },
    applicableTo: { type: String, enum: ["product", "category"], required: true },
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: false 
    },
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Category", 
        required: false 
    },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema);