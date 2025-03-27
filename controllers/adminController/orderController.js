const Cart = require("../../models/Cart");
const mongoose = require('mongoose')
const User =require('../../models/User')
const Order =require('../../models/Order')
const Wallet = require('../../models/Wallet')


const Offer = require('../../models/Offer');
const Coupon = require('../../models/Coupon');





exports.renderOrderManage = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1; // Current page
        let limit = 5; // Orders per page
        let skip = (page - 1) * limit; // Calculate the number of documents to skip


        const totalOrders = await Order.countDocuments();


        const orders = await Order.find()
            .populate("user")
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit);

        res.render("admin/orderManage", {
            orders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            admin: req.session.admin,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
};




// exports.updateOrderStatus = async (req, res) => {
//     try {
//         const { orderId, newStatus } = req.body;
//         console.log(req.body);

//         const order = await Order.findOne({ _id: orderId });        
//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         if (order.orderStatus === 'Returned' || order.orderStatus === 'Cancelled') {
//             return res.status(400).json({ success: false, message: 'Cannot change status of Returned or Cancelled orders' });
//         }
//         if (order.orderStatus === 'Shipped' && (newStatus === 'Processing' || newStatus === 'Pending')) {
//             return res.status(400).json({ success: false, message: 'Cannot change Shipped order to Processing or Pending' });
//         }
//         if (order.orderStatus === 'Processing' && newStatus === 'Pending') {
//             return res.status(400).json({ success: false, message: 'Cannot change Processing order to Pending' });
//         }

//         order.orderStatus = newStatus;
//         order.products.forEach((product) => {
//             product.productStatus = newStatus;
//         });

//         await order.save();
//         res.json({ success: true, message: "Order status updated successfully!" }); // Added success: true

//     } catch (error) {
//         console.error("Error updating order status:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };





exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate("products.product");
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.json({ success: true, order }); 
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};






exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, newStatus } = req.body;
        console.log('Request body:', req.body);

        const order = await Order.findOne({ _id: orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const currentStatus = order.orderStatus;

        // Final states: no changes allowed
        if (['Returned', 'Cancelled', 'Delivered'].includes(currentStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${currentStatus} - it is a final state`
            });
        }

        // Intermediate states with restrictions
        if (currentStatus === 'Shipped' && ['Processing', 'Pending'].includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot revert Shipped order to Processing or Pending'
            });
        }
        if (currentStatus === 'Processing' && newStatus === 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot revert Processing order to Pending'
            });
        }
        if (currentStatus === 'Cancellation Requested' && !['Cancelled', 'Cancellation Requested', 'Processing'].includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Cancellation Requested order can only be set to Cancelled, Cancellation Requested, or Processing'
            });
        }
        if (currentStatus === 'Return Requested' && !['Returned', 'Return Requested', 'Shipped'].includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Return Requested order can only be set to Returned, Return Requested, or Shipped'
            });
        }

        // Only update orderStatus, leave productStatus alone
        order.orderStatus = newStatus;

        // Optional: Update isDelivered based on all products
        const allDelivered = order.products.every(p => p.productStatus === 'Delivered');
        order.isDelivered = allDelivered;

        await order.save();
        res.json({ success: true, message: "Order status updated successfully!" });

    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};







// exports.acceptReturnRequest = async (req, res) => {
//     try {
//         const { orderId, productId } = req.body;

//         console.log('Accepting return request:', { orderId, productId });

//         if (!orderId || !productId) {
//             return res.status(400).json({ success: false, message: 'Order ID and Product ID are required' });
//         }

//         const order = await Order.findById(orderId).populate('user');
//         if (!order) {
//             return res.status(404).json({ success: false, message: 'Order not found' });
//         }

//         if (order.orderStatus !== 'Return Requested') {
//             return res.status(400).json({ success: false, message: 'No return request pending for this order' });
//         }

//         const productIndex = order.products.findIndex(p => p.product.toString() === productId);
//         if (productIndex === -1 || order.products[productIndex].productStatus !== 'Return Requested') {
//             return res.status(404).json({ success: false, message: 'Product not found or not requested for return' });
//         }

//         const product = order.products[productIndex];
//         const originalProductCost = product.price * product.quantity; // 999 * 3 = 2997
//         const totalOriginalCost = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0); // 2997

//         // Prorate refund based on totalAmount
//         const productShare = originalProductCost / totalOriginalCost; // 1 (single product)
//         const refundAmount = Math.round(order.totalAmount * productShare); // 1154 * 1 = 1154

//         // Update order
//         order.products[productIndex].productStatus = 'Returned';
//         order.orderStatus = 'Returned';
//         order.return.approved = true;
//         order.return.approvedAt = new Date();
//         order.refundStatus = 'Processed';
//         await order.save();

//         // Update or create wallet
//         let wallet = await Wallet.findOne({ user: order.user._id });
//         if (!wallet) {
//             wallet = new Wallet({ user: order.user._id });
//         }

//         wallet.balance += refundAmount;
//         wallet.transactions.push({
//             type: 'credit',
//             amount: refundAmount,
//             description: `Refund for returned product (Order #${order.orderID})`,
//             orderId: order._id,
//             date: new Date()
//         });
//         await wallet.save();

//         console.log('Return accepted and wallet updated:', {
//             userId: order.user._id,
//             refundAmount,
//             originalProductCost,
//             totalOriginalCost,
//             totalAmount: order.totalAmount,
//             productShare,
//             orderId: order.orderID
//         });

//         res.json({
//             success: true,
//             message: 'Return accepted and refund processed',
//             refundAmount
//         });
//     } catch (error) {
//         console.error('Error accepting return request:', error);
//         res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//     }
// };











// exports.acceptReturnRequest = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const { orderId, productId } = req.body;

//         console.log('Accepting return request:', { orderId, productId });

//         if (!orderId || !productId) {
//             return res.status(400).json({ success: false, message: 'Order ID and Product ID are required' });
//         }

//         const order = await Order.findById(orderId).populate('user').session(session);
//         if (!order) {
//             return res.status(404).json({ success: false, message: 'Order not found' });
//         }

//         if (order.orderStatus !== 'Return Requested') {
//             return res.status(400).json({ success: false, message: 'No return request pending for this order' });
//         }

//         const productIndex = order.products.findIndex(p => p.product.toString() === productId);
//         if (productIndex === -1 || order.products[productIndex].productStatus !== 'Return Requested') {
//             return res.status(404).json({ success: false, message: 'Product not found or not requested for return' });
//         }

//         const product = order.products[productIndex];
//         const originalProductCost = product.price * product.quantity;
//         const totalOriginalCost = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
//         const productShare = originalProductCost / totalOriginalCost;
//         const refundAmount = Math.round(order.totalAmount * productShare);

//         // Update product status
//         order.products[productIndex].productStatus = 'Returned';

//         // Check if all products are returned
//         const allReturned = order.products.every(p => p.productStatus === 'Returned');
//         if (allReturned) {
//             order.orderStatus = 'Returned';
//             order.return.approved = true;
//             order.return.approvedAt = new Date();
//             order.refundStatus = 'Refunded';
//         } else {
//             order.refundStatus = 'Processed'; // Partial refund processed
//         }

//         // Update or create wallet
//         let wallet = await Wallet.findOne({ user: order.user._id }).session(session);
//         if (!wallet) {
//             wallet = new Wallet({ user: order.user._id });
//         }

//         wallet.balance += refundAmount;
//         wallet.transactions.push({
//             type: 'credit',
//             amount: refundAmount,
//             description: `Refund for returned product (Order #${order.orderID}, Product: ${product.name})`,
//             orderId: order._id,
//             date: new Date()
//         });

//         // Save changes atomically
//         await order.save({ session });
//         await wallet.save({ session });

//         await session.commitTransaction();

//         console.log('Return accepted and wallet updated:', {
//             userId: order.user._id,
//             refundAmount,
//             originalProductCost,
//             totalOriginalCost,
//             totalAmount: order.totalAmount,
//             productShare,
//             orderId: order.orderID
//         });

//         res.json({
//             success: true,
//             message: 'Return accepted and refund processed',
//             refundAmount
//         });
//     } catch (error) {
//         await session.abortTransaction();
//         console.error('Error accepting return request:', error);
//         res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//     } finally {
//         session.endSession();
//     }
// };




// exports.acceptReturnRequest = async (req, res) => {
//     try {
//         const { orderId, productId } = req.body;

//         console.log('1 - Accepting return request:', { orderId, productId });

//         if (!orderId || !productId) {
//             return res.status(400).json({ success: false, message: 'Order ID and Product ID are required' });
//         }

//         const order = await Order.findById(orderId).populate('user');
//         if (!order) {
//             return res.status(404).json({ success: false, message: 'Order not found' });
//         }

//         if (order.orderStatus !== 'Return Requested' && order.orderStatus !== 'Returned') {
//             return res.status(400).json({ success: false, message: 'No return request pending for this order' });
//         }

//         const productIndex = order.products.findIndex(p => p.product.toString() === productId);
//         if (productIndex === -1 || order.products[productIndex].productStatus !== 'Return Requested') {
//             return res.status(404).json({ success: false, message: 'Product not found or not requested for return' });
//         }

//         const product = order.products[productIndex];

//         // Calculate refund
//         const originalProductCost = product.price * product.quantity;
//         const offerDiscount = product.appliedOffer.discountAmount || 0;
//         const amountBeforeCoupon = originalProductCost - offerDiscount;
//         const totalOriginalCost = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
//         const productShare = originalProductCost / totalOriginalCost;
//         const couponDiscount = (order.appliedCoupon?.discountAmount || 0) * productShare;
//         const deliveryChargeShare = (order.deliveryCharge || 15) * productShare;
//         let refundAmount = Math.round(amountBeforeCoupon - couponDiscount - deliveryChargeShare);

//         if (refundAmount < 0) refundAmount = 0;

//         // Check total refunded
//         let wallet = await Wallet.findOne({ user: order.user._id });
//         if (!wallet) wallet = new Wallet({ user: order.user._id });

//         const totalRefundedSoFar = wallet.transactions
//             .filter(t => t.orderId.toString() === order._id.toString())
//             .reduce((sum, t) => sum + t.amount, 0);
//         const maxRefundable = order.totalAmount - (order.deliveryCharge || 15);
//         console.log('Refund check:', { totalRefundedSoFar, maxRefundable, proposedRefund: refundAmount });

//         if (totalRefundedSoFar >= maxRefundable) {
//             refundAmount = 0;
//             console.log('No refund: Max already reached');
//         } else if (totalRefundedSoFar + refundAmount > maxRefundable) {
//             refundAmount = maxRefundable - totalRefundedSoFar;
//             console.log('Adjusted refund:', refundAmount);
//         }

//         // Update order
//         order.products[productIndex].productStatus = 'Returned';
//         const allReturned = order.products.every(p => p.productStatus === 'Returned');
//         if (allReturned) {
//             order.orderStatus = 'Returned';
//             order.return.approved = true;
//             order.return.approvedAt = new Date();
//             order.refundStatus = 'Refunded';
//         } else {
//             order.refundStatus = 'Processed';
//         }

//         wallet.balance += refundAmount;
//         if (refundAmount > 0) {
//             wallet.transactions.push({
//                 type: 'credit',
//                 amount: refundAmount,
//                 description: `Refund for returned product (Order #${order.orderID}, ${product.name})`,
//                 orderId: order._id,
//                 date: new Date()
//             });
//         }

//         await order.save();
//         await wallet.save();

//         console.log('Final:', { product: product.name, refundAmount, totalRefunded: totalRefundedSoFar + refundAmount });

//         res.json({
//             success: true,
//             message: 'Return accepted and refund processed',
//             refundAmount
//         });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//     }
// };




exports.acceptReturnRequest = async (req, res) => {
    try {
        const { orderId, productId } = req.body;

        console.log('1 - Accepting return request:', { orderId, productId });

        if (!orderId || !productId) {
            return res.status(400).json({ success: false, message: 'Order ID and Product ID are required' });
        }

        const order = await Order.findById(orderId).populate('user');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.orderStatus !== 'Return Requested' && order.orderStatus !== 'Returned') {
            return res.status(400).json({ success: false, message: 'No return request pending for this order' });
        }

        const productIndex = order.products.findIndex(p => p.product.toString() === productId);
        if (productIndex === -1 || order.products[productIndex].productStatus !== 'Return Requested') {
            return res.status(404).json({ success: false, message: 'Product not found or not requested for return' });
        }

        const product = order.products[productIndex];

        // Calculate refund
        const originalProductCost = product.price * product.quantity;
        const offerDiscount = product.appliedOffer?.discountAmount || 0;
        const amountBeforeCoupon = originalProductCost - offerDiscount;
        const totalOriginalCost = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const productShare = originalProductCost / totalOriginalCost;
        const couponDiscount = (order.appliedCoupon?.discountAmount || 0) * productShare;
        const deliveryChargeShare = (order.deliveryCharge || 15) * productShare;
        let refundAmount = Math.round(amountBeforeCoupon - couponDiscount - deliveryChargeShare);

        if (refundAmount < 0) refundAmount = 0;

        // Check total refunded
        let wallet = await Wallet.findOne({ user: order.user._id });
        if (!wallet) wallet = new Wallet({ user: order.user._id, transactions: [] }); // Ensure transactions array exists

        const totalRefundedSoFar = wallet.transactions
            .filter(t => t.orderId && t.orderId.toString() === order._id.toString()) // Safely handle undefined orderId
            .reduce((sum, t) => sum + t.amount, 0);
        const maxRefundable = order.totalAmount - (order.deliveryCharge || 15);
        console.log('Refund check:', { totalRefundedSoFar, maxRefundable, proposedRefund: refundAmount });

        if (totalRefundedSoFar >= maxRefundable) {
            refundAmount = 0;
            console.log('No refund: Max already reached');
        } else if (totalRefundedSoFar + refundAmount > maxRefundable) {
            refundAmount = maxRefundable - totalRefundedSoFar;
            console.log('Adjusted refund:', refundAmount);
        }

        // Update order
        order.products[productIndex].productStatus = 'Returned';
        const allReturned = order.products.every(p => p.productStatus === 'Returned');
        if (allReturned) {
            order.orderStatus = 'Returned';
            order.return.approved = true;
            order.return.approvedAt = new Date();
            order.refundStatus = 'Refunded';
        } else {
            order.refundStatus = 'Processed';
        }

        wallet.balance += refundAmount;
        if (refundAmount > 0) {
            wallet.transactions.push({
                type: 'credit',
                amount: refundAmount,
                description: `Refund for returned product (Order #${order.orderID}, ${product.name})`,
                orderId: order._id,
                date: new Date()
            });
        }

        await order.save();
        await wallet.save();

        console.log('Final:', { product: product.name, refundAmount, totalRefunded: totalRefundedSoFar + refundAmount });

        res.json({
            success: true,
            message: 'Return accepted and refund processed',
            refundAmount
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};




exports.updateProductStatus = async (req, res) => {
    try {
        const { orderId } = req.params; // From URL params
        const { productStatuses } = req.body; // Array of { productId, status }
        console.log('Request body:', req.body);

        // Find order by _id (MongoDB ID)
        const order = await Order.findOne({ _id: orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Validation: Prevent changes if order is fully Cancelled or Returned
        if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned') {
            return res.status(400).json({ success: false, message: 'Cannot update products in Cancelled or Returned orders' });
        }

        // Update product statuses
        for (const { productId, status } of productStatuses) {
            const product = order.products.find(p => p._id.toString() === productId);
            if (!product) {
                console.log(`Product ${productId} not found in order`);
                continue; // Skip if product not found, but don’t fail entire request
            }

            // Validation: Prevent invalid status transitions
            if (product.productStatus === 'Cancelled' || product.productStatus === 'Returned') {
                console.log(`Skipping ${productId}: Already ${product.productStatus}`);
                continue; // Skip if product is already Cancelled or Returned
            }
            if (product.productStatus === 'Shipped' && (status === 'Pending' || status === 'Processing')) {
                console.log(`Skipping ${productId}: Cannot revert Shipped to ${status}`);
                continue;
            }
            if (product.productStatus === 'Processing' && status === 'Pending') {
                console.log(`Skipping ${productId}: Cannot revert Processing to Pending`);
                continue;
            }

            // Handle cancellation and refund logic
            if (status === 'Cancelled' && order.paymentStatus === 'Paid' && product.productStatus !== 'Cancelled') {
                const totalDiscountedPrice = order.products.reduce((sum, p) => {
                    return sum + ((p.price - (p.appliedOffer?.discountAmount || 0)) * p.quantity);
                }, 0);
                if (totalDiscountedPrice === 0) {
                    console.log('Total discounted price is zero - skipping refund');
                    product.productStatus = status;
                    continue;
                }

                const productDiscountedPrice = (product.price - (product.appliedOffer?.discountAmount || 0)) * product.quantity;
                const refundAmount = Math.round((productDiscountedPrice / totalDiscountedPrice) * order.totalAmount);
                console.log(`Refund for ${productId}: ${refundAmount}`);

                if (refundAmount > 0) {
                    order.totalAmount -= refundAmount;
                    order.refundedAmount = (order.refundedAmount || 0) + refundAmount;

                    await Wallet.findOneAndUpdate(
                        { user: order.user }, // Use customer's user ID
                        {
                            $inc: { balance: refundAmount },
                            $push: {
                                transactions: {
                                    type: 'credit',
                                    amount: refundAmount,
                                    description: `Refund for cancelled product in order #${order.orderID} (Razorpay)`,
                                    orderId: order._id
                                }
                            }
                        },
                        { upsert: true }
                    );
                    console.log(`Wallet updated for user ${order.user} with refund: ${refundAmount}`);
                }
            }

            // Update product status
            product.productStatus = status;
            console.log(`Updated ${productId} to ${status}`);
        }

        // Check if all products are Cancelled
        const allCancelled = order.products.every(p => p.productStatus === 'Cancelled');
        if (allCancelled && order.paymentStatus === 'Paid') {
            order.paymentStatus = 'Refunded';
            order.orderStatus = 'Cancelled';
            order.totalAmount = 0;
            console.log('All products cancelled - updating order to Cancelled/Refunded');
        }

        await order.save();
        res.json({ success: true, message: 'Product statuses updated successfully!' });

    } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};




exports.renderReturnRequestsList = async (req, res) => {
    try {
        // Fetch orders with return requests
        const returnRequests = await Order.find({ 
            orderStatus: 'Return Requested',
            'return.requested': true 
        })
        .populate('user', 'name') // Populate username
        .populate('products.product') // Populate product details
        .lean();

        res.render('admin/return-requests', { returnRequests });
    } catch (error) {
        console.error('Error rendering return requests list:', error);
        res.status(500).render('admin/error', { message: 'Server Error' });
    }
};












function getBadgeClass(status) {
    switch (status) {
        case 'Pending': return 'warning';
        case 'Processing': return 'primary';
        case 'Shipped': return 'info';
        case 'Delivered': return 'success';
        case 'Cancelled': return 'danger';
        case 'Cancellation Requested': return 'warning';
        case 'Return Requested': return 'warning';
        case 'Returned': return 'secondary';
        default: return 'secondary';
    }
}

module.exports = exports;