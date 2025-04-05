




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
    totalAmount: { type: Number, required: true },
    originalAmount: { type: Number, required: true },
    shippingCost: { type: Number, default: 0, min: 0 }, 
    gstAmount: { 
        type: Number,
        default: 0,
        min: 0
    },
    orderStatus: {
        type: String,
        enum: ['Confirmed', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned', "Partially Delivered"],
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
    refundedAmount: { 
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });



orderSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('products') || this.isModified('appliedCoupon') || 
        this.isModified('totalOfferDiscount') || this.isModified('shippingCost')) {
        
        this.totalOfferDiscount = this.products.reduce((sum, product) => {
            return sum + (product.appliedOffer?.discountAmount || 0);
        }, 0);
        
        const baseAmount = this.originalAmount - 
                          (this.totalOfferDiscount + 
                          (this.appliedCoupon?.discountAmount || 0));
        
        this.gstAmount = baseAmount * 0.12;
        
        this.totalAmount = baseAmount + 
                          this.gstAmount + 
                          (this.shippingCost || 0);
    }
    
    if (this.totalAmount < 0) {
        this.totalAmount = 0;
    }
    
    if (this.orderStatus !== 'Cancelled' && this.orderStatus !== 'Returned') {
        if (this.totalAmount < this.refundedAmount) {
            throw new Error("Total amount cannot be less than refunded amount");
        }
    }
    
    next();
});

module.exports = mongoose.model('Order', orderSchema);