const Address = require("../../models/Address");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Cart = require("../../models/Cart");
const mongoose = require('mongoose')
const User =require('../../models/User')
const Order =require('../../models/Order')




exports.placeOrder = async (req, res) => {
    try {
        console.log("📩 Received Order Data:", req.body);

        // Ensure user is authenticated
        if (!req.session.user) {
            return res.status(401).json({ success: false, error: "User not authenticated. Please log in." });
        }

        req.user = req.session.user; // Attach user to request
        const userId = req.session.user._id;

        // ✅ Fetch the cart properly using `await`
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        // ❌ FIXED: Ensure the cart is found
        if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
            return res.status(400).json({ success: false, error: "Your cart is empty. Please add products before placing an order." });
        }

        const { addressId, paymentMethod } = req.body;

        // Validate required fields
        if (!addressId || !paymentMethod) {
            return res.status(400).json({ success: false, error: "Missing required fields: addressId or paymentMethod." });
        }

        console.log("Cart items received:", cart.items);

        // 🔥 Retrieve the full shipping address from the database
        const userAddress = await Address.findById(addressId);
        if (!userAddress) {
            return res.status(400).json({ success: false, error: "Invalid address selected." });
        }

        // ✅ Format `shippingAddress` as expected by the Order schema
        const shippingAddress = {
            fullName: userAddress.fullName,
            phone: userAddress.phone,
            address: userAddress.address,
            city: userAddress.city,
            state: userAddress.state,
            country: userAddress.country,
            pincode: userAddress.pincode
        };

        // ✅ Get totalAmount from the cart
        const totalAmount = cart.totalPrice;

        // ✅ Ensure `paymentMethod` matches the enum values
        const paymentMethodMap = {
            cod: "COD",
            razorpay: "Razorpay",
            wallet: "Wallet"
        };
        const finalPaymentMethod = paymentMethodMap[paymentMethod.toLowerCase()] || paymentMethod;

        if (!["COD", "Razorpay", "Wallet"].includes(finalPaymentMethod)) {
            return res.status(400).json({ success: false, error: `Invalid payment method: ${paymentMethod}` });
        }

        // ✅ Extract valid product details from cart items
        const products = cart.items.map(item => {
            if (!item.product || !item.product._id || !item.product.name || !item.product.price || !item.product.images?.length) {
                throw new Error(`Invalid cart item: ${JSON.stringify(item)}`);
            }

            return {
                product: item.product._id, 
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                image: item.product.images[0],
                 productStatus: "Pending"
            };
        });

        const generateOrderID = () => {
            return Math.floor(100000 + Math.random() * 900000); 
          };
      

        const newOrder = new Order({
            user: req.user._id,
            shippingAddress: shippingAddress,
            paymentMethod: finalPaymentMethod,
            products: products,
            totalAmount: totalAmount,
            orderStatus: "Pending",
            orderID : generateOrderID()
        });

        await newOrder.save();

        await Promise.all(cart.items.map(async (item) => {
            await Product.findByIdAndUpdate(
                item.product,  
                { $inc: { "variant.stock": -item.quantity } }, 
                { new: true }
            );
        }));
        

        await Cart.findOneAndDelete({ user: userId });

        res.json({ success: true, message: "Order placed successfully!" });
    } catch (error) {
        console.error("🚨 Order Placement Error:", error.message, error.stack);
        res.status(500).json({ success: false, error: error.message });
    }
};







exports.getUserOrders = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.session.user._id); 

      console.log("Fetching orders for user:", userId);
  
      const orders = await Order.find({ user: userId }).sort({ orderDate: -1 });
  
      res.render("user/account", { orders }); // Pass orders to EJS template
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  


  // ✅ Cancel the Entire Order (Single or Multi-Product)
exports.cancelEntireOrder = async (req, res) => {
    console.log('workiiiiiiiiiiiiiiiiiiiiiinnnnnnnnnnnnnnnnnggggggggggg',req.body)
    try {
        const { orderId, cancelReason } = req.body;
        const userId = new mongoose.Types.ObjectId(req.session.user._id);

        console.log(`Cancelling entire order ${orderId} for user ${userId}`);

        // Find the order belonging to the user
        const order = await Order.findOne({ _id: orderId });

        if (!order) {
            return res.status(404).json({ message: "Order not found or unauthorized" });
        }


        await Promise.all(order.products.map(async (item) => {
            await Product.findByIdAndUpdate(
                item.product, 
                { $inc: { "variant.stock": item.quantity } }, // Increase stock
                { new: true }
            );
        }));

        // ✅ Mark the entire order as cancelled
        order.orderStatus = "Cancelled";
        order.orderCancelreason = cancelReason || "No reason provided";

        // ✅ Cancel each product inside the order
        order.products.forEach(product => {
            product.productStatus = "Cancelled";
            product.productCancelreason = cancelReason || "No reason provided";
        });

        await order.save();

        res.json({ message: "Entire order cancelled successfully" });
    } catch (error) {
        console.error("Error canceling entire order:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



// ✅ Cancel a Single Product from a Multi-Product Order
exports.cancelSingleProduct = async (req, res) => {

console.log(req.body)

  try {
      const { orderId, productId, cancelReason } = req.body;
      const userId = new mongoose.Types.ObjectId(req.session.user._id);
      

      console.log(`Cancelling product ${productId} in order ${orderId} for user ${userId}`);

      // Find the order and check if it belongs to the user
      const order = await Order.findOne({ _id: orderId, user: userId });

      if (!order) {
          return res.status(404).json({ message: "Order not found or unauthorized" });
      }

      // ✅ Find the product in the order and update its status
      const productIndex = order.products.findIndex(p => p.product.toString() === productId);
      
      if (productIndex === -1) {
          return res.status(404).json({ message: "Product not found in order" });
      }

      order.products[productIndex].productStatus = "Cancelled";
      order.products[productIndex].productCancelreason = cancelReason || "No reason provided";
      
      const quantity = order.products[productIndex].quantity;


      // ✅ If all products are cancelled, update the entire order status
      const allCancelled = order.products.every(p => p.productStatus === "Cancelled");
      if (allCancelled) {
          order.orderStatus = "Cancelled";
      }

      await order.save();

     
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { "variant.stock": quantity } }, 
        { new: true }
    );
    
    
      res.json({ message: "Product cancelled successfully" });
  } catch (error) {
      console.error("Error canceling product:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};




exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.orderId; 
console.log("JJJJJJJJJJJJJJJJJJ",orderId);

        // Find order by ID and populate product details
        const order = await Order.findById(orderId)
        .populate("products.product")
        .populate("user", "name email")
        .lean();

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const response = {
            _id: order._id,
            user: order.user,
            orderDate: order.createdAt, // Assuming createdAt is available
            totalAmount: order.totalAmount,
            orderStatus: order.orderStatus,
            shippingAddress: order.shippingAddress,
            products: order.products.map(p => ({
                _id: p.product._id,
                name: p.product.name,
                price: p.product.price,
                image: p.product.image,
                quantity: p.quantity
            }))
        };

        res.render('user/orderdetails', { order: response , user: req.session.user});

    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



