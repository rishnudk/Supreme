// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User', // Reference to the User model
//         required: true
//     },
//     products: [
//         {
//             product: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'Product', // Reference to the Product model
//                 required: true
//             },
//             name: { type: String, required: true }, // Furniture name
//             price: { type: Number, required: true }, // Price at the time of order
//             quantity: { type: Number, required: true, min: 1 }, // Ordered quantity
//             image: { type: String, required: true } , 
//             productStatus: {
//                 type: String,
//                 enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
//                 default: 'Pending',
//             } , 
//             productCancelreason : { type : String, required : false }, 
//             productReturnReason : { type : String, required : false}
//         }
//     ],
//     shippingAddress: {
//         fullName: { type: String, required: true },
//         phone: { type: String, required: true },
//         address: { type: String, required: true },
//         city: { type: String, required: true },
//         state: { type: String, required: true },
//         country: { type: String, required: true },
//         pincode: { type: String, required: true }
//     },
//     paymentMethod: {
//         type: String,
//         enum: ['COD', 'Razorpay', 'Wallet', 'cod', 'razorpay', 'wallet'],
//         required: true
//     },
//     paymentStatus: {
//         type: String,
//         enum: ['Pending', 'Paid', 'Failed'],
//         default: 'Pending'
//     },
//     transactionId: { type: String, default : null }, // Store transaction ID if payment is online
//     totalAmount: { type: Number, required: true },
//     orderStatus: {
//         type: String,
//         enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
//         default: 'Pending'
//     },
//     isDelivered: { type: Boolean, default: false },
//     deliveredAt: { type: Date },
//     orderDate: { type: Date, default: Date.now },
//     orderID : {type : Number} ,
//     orderCancelreason : { type : String, required : false },
// });

// module.exports = mongoose.model('Order', orderSchema);








// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     products: [
//         {
//             product: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'Product',
//                 required: true
//             },
//             name: { type: String, required: true },
//             price: { type: Number, required: true },
//             quantity: { type: Number, required: true, min: 1 },
//             image: { type: String, required: true },
//             productStatus: {
//                 type: String,
//                 enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled' ,'Cancellation Requested', 'Return Requested', 'Returned'],
//                 default: 'Pending'
//             },
//             productCancelreason: { type: String, required: false },
//             productReturnReason: { type: String, required: false }
//         }
//     ],
//     shippingAddress: {
//         fullName: { type: String, required: true },
//         phone: { type: String, required: true },
//         address: { type: String, required: true },
//         city: { type: String, required: true },
//         state: { type: String, required: true },
//         country: { type: String, required: true },
//         pincode: { type: String, required: true }
//     },
//     paymentMethod: {
//         type: String,
//         enum: ['COD', 'Razorpay', 'Wallet', 'cod', 'razorpay', 'wallet'],
//         required: true
//     },
//     paymentStatus: {
//         type: String,
//         enum: ['Pending', 'Paid', 'Failed'],
//         default: 'Pending'
//     },
//     transactionId: { type: String, default: null },
//     totalAmount: { type: Number, required: true },
//     orderStatus: {
//         type: String,
//         enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled',  'Return Requested', 'Returned' ],
//         default: 'Pending'
//     },
//     isDelivered: { type: Boolean, default: false },
//     deliveredAt: { type: Date },
//     orderDate: { type: Date, default: Date.now },
//     orderID: { type: Number },

//     return: {
//         requested: { type: Boolean, default: false },
//         reason: { type: String }, // Replace orderCancelreason
//         requestedAt: { type: Date },
//         approved: { type: Boolean, default: false },
//         approvedAt: { type: Date }
//     },
//     refundStatus: {
//         type: String,
//         enum: ['Pending', 'Processed', 'Failed', 'Refunded'],
//         default: 'Pending'
//     }
// }, { timestamps: true });

// module.exports = mongoose.model('Order', orderSchema);





// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     products: [
//         {
//             product: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'Product',
//                 required: true
//             },
//             name: { type: String, required: true },
//             price: { type: Number, required: true },
//             quantity: { type: Number, required: true, min: 1 },
//             image: { type: String, required: true },
//             productStatus: {
//                 type: String,
//                 enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Cancellation Requested', 'Return Requested', 'Returned'],
//                 default: 'Pending'
//             },
//             productCancelreason: { type: String, required: false },
//             productReturnReason: { type: String, required: false },
//             appliedOffer: {
//                 offer: {
//                     type: mongoose.Schema.Types.ObjectId,
//                     ref: 'Offer',
//                     default: null
//                 },
//                 discountAmount: { type: Number, default: 0 }
//             }
//         }
//     ],
//     shippingAddress: {
//         fullName: { type: String, required: true },
//         phone: { type: String, required: true },
//         address: { type: String, required: true },
//         city: { type: String, required: true },
//         state: { type: String, required: true },
//         country: { type: String, required: true },
//         pincode: { type: String, required: true }
//     },
//     paymentMethod: {
//         type: String,
//         enum: ['COD', 'Razorpay', 'Wallet', 'cod', 'razorpay', 'wallet', 'paylater'],
//         required: true
//     },
//     paymentStatus: {
//         type: String,
//         enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
//         default: 'Pending'
//     },
//     transactionId: { type: String, default: null },
//     totalAmount: { type: Number, required: true }, // After all discounts
//     originalAmount: { type: Number, required: true }, // Before discounts
//     orderStatus: {
//         type: String,
//         enum: ['Confirmed' , 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'],
//         default: 'Pending'
//     },
//     isDelivered: { type: Boolean, default: false },
//     deliveredAt: { type: Date },
//     orderDate: { type: Date, default: Date.now },
//     orderID: { type: Number },
    
//     appliedCoupon: {
//         coupon: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Coupon',
//             default: null
//         },
//         code: { type: String, default: null },
//         discountAmount: { type: Number, default: 0 }
//     },
    
//     totalOfferDiscount: { 
//         type: Number, 
//         default: 0 
//     },
    
//     return: {
//         requested: { type: Boolean, default: false },
//         reason: { type: String },
//         requestedAt: { type: Date },
//         approved: { type: Boolean, default: false },
//         approvedAt: { type: Date }
//     },
//     refundStatus: {
//         type: String,
//         enum: ['Pending', 'Processed', 'Failed', 'Refunded'],
//         default: 'Pending'
//     }
// }, { timestamps: true });

// // Pre-save middleware to calculate totals
// orderSchema.pre('save', function(next) {
//     this.totalOfferDiscount = this.products.reduce((sum, product) => {
//         return sum + (product.appliedOffer?.discountAmount || 0);
//     }, 0);
    
//     this.totalAmount = this.originalAmount - 
//                       (this.totalOfferDiscount + 
//                        (this.appliedCoupon?.discountAmount || 0));
    
//     next();
// });

// module.exports = mongoose.model('Order', orderSchema);



















const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true, min: 1 },
            image: { type: String, required: true },
            productStatus: {
                type: String,
                enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Cancellation Requested', 'Return Requested', 'Returned'],
                default: 'Pending'
            },
            productCancelreason: { type: String, required: false },
            productReturnReason: { type: String, required: false },
            appliedOffer: {
                offer: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Offer',
                    default: null
                },
                discountAmount: { type: Number, default: 0 }
            }
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
        enum: ['COD', 'Razorpay', 'Wallet', 'cod', 'razorpay', 'wallet', 'paylater'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    transactionId: { type: String, default: null },
    totalAmount: { type: Number, required: true }, // After all discounts
    originalAmount: { type: Number, required: true }, // Before discounts
    orderStatus: {
        type: String,
        enum: ['Confirmed', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'],
        default: 'Pending'
    },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    orderDate: { type: Date, default: Date.now },
    orderID: { type: Number },
    appliedCoupon: {
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
            default: null
        },
        code: { type: String, default: null },
        discountAmount: { type: Number, default: 0 }
    },
    totalOfferDiscount: { 
        type: Number, 
        default: 0 
    },
    return: {
        requested: { type: Boolean, default: false },
        reason: { type: String },
        requestedAt: { type: Date },
        approved: { type: Boolean, default: false },
        approvedAt: { type: Date }
    },
    refundStatus: {
        type: String,
        enum: ['Pending', 'Processed', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    refundedAmount: { // New field
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
    this.totalOfferDiscount = this.products.reduce((sum, product) => {
        return sum + (product.appliedOffer?.discountAmount || 0);
    }, 0);
    
    this.totalAmount = this.originalAmount - 
                      (this.totalOfferDiscount + 
                       (this.appliedCoupon?.discountAmount || 0));
    
    next();
});

module.exports = mongoose.model('Order', orderSchema);