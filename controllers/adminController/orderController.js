const Cart = require("../../models/Cart");
const mongoose = require('mongoose')
const User =require('../../models/User')
const Order =require('../../models/Order')
const Wallet = require('../../models/Wallet')
const bcrypt = require('bcryptjs'); 



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

        if (['Returned', 'Cancelled', 'Delivered'].includes(currentStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${currentStatus} - it is a final state`
            });
        }

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

        if (
            (newStatus === 'Cancelled' || newStatus === 'Returned') &&
            order.paymentStatus === 'Paid' &&
            currentStatus !== newStatus
        ) {
            const refundAmount = order.totalAmount;
            console.log(`Refund for order ${orderId} (${newStatus}): ${refundAmount}`);

            if (refundAmount > 0) {
                order.totalAmount -= refundAmount; 
                order.refundedAmount = (order.refundedAmount || 0) + refundAmount;
                order.paymentStatus = 'Refunded';

                await Wallet.findOneAndUpdate(
                    { user: order.user },
                    {
                        $inc: { balance: refundAmount },
                        $push: {
                            transactions: {
                                type: 'credit',
                                amount: refundAmount,
                                description: `Refund for ${newStatus.toLowerCase()} order #${order.orderID} (Razorpay)`,
                                orderId: order._id
                            }
                        }
                    },
                    { upsert: true }
                );
                console.log(`Wallet updated for user ${order.user} with refund: ${refundAmount}`);
            } else {
                console.log('Refund amount is zero - skipping wallet update');
            }
        }

        order.orderStatus = newStatus;

        const allDelivered = order.products.every(p => p.productStatus === 'Delivered');
        order.isDelivered = allDelivered;

        await order.save();
        res.json({ success: true, message: "Order status updated successfully!" });

    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};





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




exports.updateProductStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { productStatuses } = req.body;
        console.log('Request body:', req.body);

        const order = await Order.findOne({ _id: orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned') {
            return res.status(400).json({ success: false, message: 'Cannot update products in Cancelled or Returned orders' });
        }

        for (const { productId, status } of productStatuses) {
            const product = order.products.find(p => p._id.toString() === productId);
            if (!product) {
                console.log(`Product ${productId} not found in order`);
                continue;
            }

            if (product.productStatus === 'Cancelled' || product.productStatus === 'Returned') {
                console.log(`Skipping ${productId}: Already ${product.productStatus}`);
                continue;
            }
            if (product.productStatus === 'Shipped' && (status === 'Pending' || status === 'Processing')) {
                console.log(`Skipping ${productId}: Cannot revert Shipped to ${status}`);
                continue;
            }
            if (product.productStatus === 'Processing' && status === 'Pending') {
                console.log(`Skipping ${productId}: Cannot revert Processing to Pending`);
                continue;
            }

            if (
                (status === 'Cancelled' || status === 'Returned') &&
                order.paymentStatus === 'Paid' &&
                product.productStatus !== status 
            ) {
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
                console.log(`Refund for ${productId} (${status}): ${refundAmount}`);

                if (refundAmount > 0) {
                    order.totalAmount -= refundAmount;
                    order.refundedAmount = (order.refundedAmount || 0) + refundAmount;

                    await Wallet.findOneAndUpdate(
                        { user: order.user },
                        {
                            $inc: { balance: refundAmount },
                            $push: {
                                transactions: {
                                    type: 'credit',
                                    amount: refundAmount,
                                    description: `Refund for ${status.toLowerCase()} product in order #${order.orderID} (Razorpay)`,
                                    orderId: order._id
                                }
                            }
                        },
                        { upsert: true }
                    );
                    console.log(`Wallet updated for user ${order.user} with refund: ${refundAmount}`);
                }
            }

            product.productStatus = status;
            console.log(`Updated ${productId} to ${status}`);
        }

        const productCount = order.products.length;
        const deliveredCount = order.products.filter(p => p.productStatus === 'Delivered').length;
        const cancelledCount = order.products.filter(p => p.productStatus === 'Cancelled').length;
        const returnedCount = order.products.filter(p => p.productStatus === 'Returned').length;

        if (productCount > 1) { 
            if (deliveredCount > 0 && deliveredCount < productCount) {
                order.orderStatus = 'Partially Delivered';
                console.log('Order status set to Partially Delivered');
            } else if (deliveredCount === productCount) {
                order.orderStatus = 'Delivered';
                console.log('Order status set to Delivered');
            }
        }

        if (cancelledCount + returnedCount === productCount && order.paymentStatus === 'Paid') {
            order.paymentStatus = 'Refunded';
            order.orderStatus = cancelledCount === productCount ? 'Cancelled' : 'Returned';
            order.totalAmount = 0;
            console.log(`All products ${order.orderStatus.toLowerCase()} - updating order to ${order.orderStatus}/Refunded`);
        }

        await order.save();
        res.json({ success: true, message: 'Product statuses updated successfully!' });

    } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};








exports.getAllOrders = async (req, res) => {
    try {
        const limit = 10; // Number of orders per page
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const skip = (page - 1) * limit; // Calculate how many to skip

        // Get total number of orders
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        // Fetch paginated orders
        const orders = await Order.find()
            .sort({ orderDate: -1 }) // Newest first
            .skip(skip)
            .limit(limit)
            .lean();

        res.render('admin/allOrders', {
            title: 'Order Management',
            orders: orders,
            currentPage: page,
            totalPages: totalPages,
            pageName: 'orders',
            filters: {}
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).render('error', {
            message: 'Failed to fetch orders',
            error: error
        });
    }
};

// Get orders with filters and pagination
exports.getFilteredOrders = async (req, res) => {
    try {
        const { status, startDate, endDate, customerId } = req.query;
        const limit = 10; // Number of orders per page
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const skip = (page - 1) * limit; // Calculate how many to skip

        const filter = {};

        if (status && status !== 'all') {
            filter.orderStatus = status;
        }

        if (startDate && endDate) {
            filter.orderDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (customerId) {
            filter.user = customerId;
        }

        // Get total number of filtered orders
        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);

        // Fetch paginated filtered orders
        const orders = await Order.find(filter)
            .sort({ orderDate: -1 }) // Newest first
            .skip(skip)
            .limit(limit)
            .lean();

        res.render('admin/allOrders', {
            title: 'Order Management',
            orders: orders,
            currentPage: page,
            totalPages: totalPages,
            currentPage: 'orders',
            filters: {
                status,
                startDate,
                endDate,
                customerId
            }
        });
    } catch (error) {
        console.error('Error fetching filtered orders:', error);
        res.status(500).render('error', {
            message: 'Failed to fetch orders',
            error: error
        });
    }
};




// Get order details
exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findOne({ orderID: orderId });
        
        if (!order) {
            return res.status(404).render('error', {
                message: 'Order not found',
                error: { status: 404 }
            });
        }
        
        res.render('order-details', {
            title: `Order #${order.orderID}`,
            order: order,
            currentPage: 'orders'
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).render('error', {
            message: 'Failed to fetch order details',
            error: error
        });
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