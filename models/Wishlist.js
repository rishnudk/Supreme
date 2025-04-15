// const mongoose = require("mongoose"); 
// const Schema = mongoose.Schema;

// const WishlistSchema = new Schema({
//     user: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
//     product: { 
//         type: Schema.Types.ObjectId, 
//         ref: "Product", 
//         required: true 
//     }, 
//     addedAt: { type: Date, default: Date.now }, 
// });

// module.exports = mongoose.model("Wishlist", WishlistSchema);





const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }], // Array, no 'required'
    addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Wishlist", WishlistSchema);