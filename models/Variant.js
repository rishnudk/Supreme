const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VariantSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    color: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 },
    images: [{ type: String }], // Variant-specific images, optional
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Variant", VariantSchema);