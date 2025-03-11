const mongoose = require("mongoose"); 
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // User who added the product
    product: { 
        type: Schema.Types.ObjectId, 
        ref: "Product", 
        required: true 
    }, // Referencing the Product model
    addedAt: { type: Date, default: Date.now }, // Timestamp for when the product was added
});

module.exports = mongoose.model("Wishlist", WishlistSchema);
