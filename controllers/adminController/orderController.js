const Cart = require("../../models/Cart");
const mongoose = require('mongoose')
const User =require('../../models/User')
const Order =require('../../models/Order')






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


exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, newStatus } = req.body;
        console.log(req.body)

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
             order.orderStatus = newStatus;

       order.products.forEach((product)=>{
        product.productStatus = newStatus;
       })       

        await order.save();
        res.json({ message: "Order status updated successfully!" });

    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate("products.product");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

