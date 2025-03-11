const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
    fullName: { type: String, required: true, trim: true }, 
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true }, 
    city: { type: String, required: true, trim: true }, 
    state: { type: String, required: true, trim: true }, 
    country: { type: String, required: true, trim: true }, 
    pincode: { type: String, required: true, trim: true }, 
    addressType: { 
        type: String, 
        enum: ["Home", "Work"]       
    }, 
    isDefault: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now }, 
    updatedAt: { type: Date, default: Date.now } 
});

AddressSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("Address", AddressSchema);
