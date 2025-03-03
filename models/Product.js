

const mongoose = require("mongoose"); 
const Schema = mongoose.Schema;

const VariantSchema = new Schema({
    color: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 }
});

const ProductSchema = new Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: arr => arr.length === 4,
            message: "Exactly 4 images are required"
        }
    },
    variant: { type: VariantSchema, required: true }, // Single variant
    createdAt: { type: Date, required: true, default: Date.now },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    updatedAt: { type: Date, required: true, default: Date.now },
    status: { type: String, required: true, enum: ["Active", "Inactive"] },
});

module.exports = mongoose.model("Product", ProductSchema);
