const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Reference to the Product model
                required: true
            },
            name: { type: String, required: true }, // Furniture name
            price: { type: Number, required: true }, // Price at the time of order
            quantity: { type: Number, required: true, min: 1 }, // Ordered quantity
            image: { type: String, required: true } , 
            productStatus: {
                type: String,
                enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
                default: 'Pending',
            } , 
            productCancelreason : { type : String, required : false }, 
            productReturnReason : { type : String, required : false}
        }
    ],
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Razorpay', 'Wallet'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    transactionId: { type: String, default : null }, // Store transaction ID if payment is online
    totalAmount: { type: Number, required: true },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    orderDate: { type: Date, default: Date.now },
    orderID : {type : Number} ,
    orderCancelreason : { type : String, required : false },
});

module.exports = mongoose.model('Order', orderSchema);
