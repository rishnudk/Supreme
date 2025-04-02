const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");
const { isAuthenticated } = require("../middlewares/authMiddleware");

// Controllers
const authController = require("../controllers/userController/authController");
const userController = require("../controllers/userController/userController");
const productController = require("../controllers/userController/productController");
const addressController = require("../controllers/userController/addressController");
const cartController = require("../controllers/userController/cartController")
const checkoutController = require("../controllers/userController/checkoutController")
const orderController = require("../controllers/userController/orderController")
const wishlistController = require("../controllers/userController/wishlistController");
const razorpayController  = require("../controllers/userController/razorpayController");
const walletController  = require("../controllers/userController/walletController");


// Models
const Category = require("../models/Category");
const Address = require("../models/Address");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const User = require("../models/User");

// ===============================
// 🔹 Authentication Routes
// ===============================



router.get("/login", authController.renderLogin);

// Handle User Login
router.post("/login", authController.login);

// User Signup Page
router.get("/signup", authController.renderSignup);
router.post("/signup", authController.signup); 

// signup otp

router.post('/send-signup-otp', authController.sendSignupOTP);
router.post('/verify-signup-otp', authController.verifySignupOTP);






// Google Authentication
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/user/login" }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/user/home");
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/user/home");
  });
});

// ===============================
// 🔹 User Home & Profile Routes
// ===============================

// User Home Page (After Login)
router.get("/home", (req, res) => {
  res.render("user/home", { user: req.session.user });
});

// User Profile

// ===============================
// 🔹 Forgot Password & OTP Verification
// ===============================

// Forgot Password (Request OTP)
router.get("/forgot-password", (req, res) => {
  res.render("user/forgotPassword");
});
router.post("/forgot-password", authController.requestOtp);

// Verify OTP Page
router.get("/verify-otp", (req, res) => {
  res.render("user/verifyOtp");
});
router.post("/verify-otp", authController.verifyOtp);

// Reset Password
router.post("/reset-password", authController.changeforgetpass);

// Verify OTP via Controller
router.get("/verifyOtp", authController.getVerifyOtp);




 

// Shop Page (Product Listing) 
router.get("/shop", userController.getShopPage);

// Product Details Route
router.get("/product/category/:id", productController.getProductByCategory);
router.get("/product/:id", productController.getProductById);



//address
router.post("/address", addressController.addAddress);
router.get("/address", addressController.getAddressPage);
router.put('/edit/:id', addressController.updateAddress)
router.get('/address/:id', addressController.getAddressById);
router.delete('/address/:id', addressController.deleteAddress);




// Cart Routes 
router.get('/cart',  cartController.getCartPage);
router.post("/cart/add", cartController.addToCart);
router.post('/cart/update-quantity', cartController.updateCartQuantity);
router.post('/cart/remove', cartController.removeFromCart);


//checkout
router.get("/checkout", checkoutController.getCheckoutPage);
router.post('/checkout/address/add', checkoutController.addAddress)
router.put('/checkout/address/:id', checkoutController.updateAddress)
router.get('/checkout/address/:id', checkoutController.getAddress)
router.get('/checkout/addresses', checkoutController.getAddresses);


//order
router.post("/place-order", orderController.placeOrder)
router.post("/pay-later",  orderController.payLater);
router.get("/user-orders", orderController.getUserOrders);

// router.put('/order/cancel/:orderId', orderController.cancelEntireOrder);

// router.put('/order/cancel-product/:orderId/:productId', orderController.cancelSingleProduct)
router.get("/details/:orderId", orderController.getOrderDetails);
router.get("/order-details/:orderId",  orderController.getOrderDetails);





// routes/order.js
router.put('/order/cancel/:orderId', orderController.instantCancelEntireOrder);
router.put('/order/cancel-product/:orderId/:productId', orderController.instantCancelSingleProduct);

router.get('/return/:orderId/:productId', orderController.renderReturnPage);
router.post('/return', orderController.submitReturnRequest);




//profile
router.get("/account", userController.getAccount);

router.get('/profile',  userController.renderUserProfile);
router.post("/profile/update", userController.updateProfile);
router.post("/password/update", userController.updatePassword);

//wishlist


router.post("/wishlist/add", wishlistController.addToWishlist);
router.get("/wishlist", wishlistController.getWishlist);
router.post("/wishlist/remove", wishlistController.removeFromWishlist);
router.post("/wishlist/add-from-wishlist", wishlistController.addToCartFromWishlist);



//razorpay

router.post("/create-order", razorpayController.createOrder);
router.post("/verify-payment", razorpayController.verifyPayment);

router.post("/create-order-from-existing", razorpayController.createOrderFromExisting);
router.post("/verify-payment-from-existing", razorpayController.verifyPaymentFromExisting);

//wallet

router.get('/wallet', walletController.renderWalletPage);
router.get('/wallet/transactions',  walletController.getMoreTransactions);

//referral
router.get('/referral', userController.renderReferral);
router.post('/transfer-referral',  userController.transferReferralBalance);






router.get("/cart/total",  async (req, res) => {
  try {
    console.log('adddddddding to cart check ?? ')

      const userId = req.session.user?._id;
      console.log("cart/total - User ID:", userId);

      const cart = await Cart.findOne({ user: userId }).populate("items.product");
      console.log("cart/total - Cart:", cart);

      if (!cart || cart.items.length === 0) {
          console.log("cart/total - No cart or empty cart");
          return res.status(200).json({ total: 0 });
      }

      const subtotal = cart.totalPrice;
      const shippingCost = 15;
      const total = subtotal + shippingCost;

      console.log("cart/total - Subtotal:", subtotal, "Shipping:", shippingCost, "Total:", total);
      res.status(200).json({ total });
  } catch (error) {
      console.error("cart/total - Error:", error.message, error.stack);
      res.status(500).json({ message: "Server error" });
  }
});









router.get("/order-success/:orderId", async (req, res) => {
  try {
      const order = await Order.findById(req.params.orderId).populate("products.product");
      console.log("order-success - Order:", order);

      if (!order || order.user.toString() !== req.session.user._id) {
          console.log("order-success - Order not found or unauthorized");
          return res.status(404).send("Order not found");
      }

      res.render("user/order-success", { order,   user: req.session.user, });
  } catch (error) {
      console.error("order-success - Error:", error.message, error.stack);
      res.status(500).send("Server Error");
  }
});



router.get('/return/:orderId/:productId', async (req, res) => {
    try {
        const { orderId, productId } = req.params;
        const userId = req.session.user?._id; // Check if user is logged in
        if (!userId) {
            return res.redirect('/login'); // Redirect to login if no user session
        }

        const order = await Order.findOne({ _id: orderId, user: userId }).populate('products.product');
        if (!order) {
            return res.status(404).send('Order not found');
        }

        const product = order.products.find(p => p.product._id.toString() === productId);
        if (!product || product.productStatus !== 'Delivered') {
            return res.status(400).send('Product not eligible for return');
        }

        res.render('user/return', {
           // Pass user object
            orderId: order._id.toString(),
            productId: product.product._id.toString(),
            productName: product.name,
            orderID: order.orderID // Assuming orderID is a field in your Order schema
        });
    } catch (error) {
        console.error('Error rendering return page:', error);
        res.status(500).send('Server Error');
    }
});









router.get("/order-failure/:orderId", async (req, res) => {
    try {
        console.log('adddddddding to cart check ??');
        const orderId = req.params.orderId;
        const addressId = req.query.addressId || req.session.user?.lastAddressId || "";
        const errorMessage = req.query.error || null;
        console.log("order-failure - Order ID:", orderId, "Address ID:", addressId, "Error Message:", errorMessage);

        let order;
        if (/^[0-9a-fA-F]{24}$/.test(orderId)) {
            order = await Order.findById(orderId).populate("shippingAddress");
            console.log("order-failure - Searched by _id:", orderId);
        } else {
            order = await Order.findOne({ transactionId: orderId }).populate("shippingAddress");
            console.log("order-failure - Searched by transactionId:", orderId);
        }

        if (!order || order.user.toString() !== req.session.user?._id) {
            console.log("order-failure - Order not found or unauthorized");
            return res.status(404).render("user/error", { message: "Order not found or unauthorized" });
        }

        // Ensure addressId is a string (not an object)
        const validAddressId = typeof addressId === "string" ? addressId : order.shippingAddress?._id?.toString() || "";

        res.render("user/order-failure", {
            orderId: order._id,  // Use MongoDB _id
            order,               // Pass the full order object
            addressId: validAddressId,
            errorMessage,
            user: req.session.user,
            title: "Order Failure"
        });
    } catch (error) {
        console.error("order-failure - Error:", error.message, error.stack);
        res.status(500).render("user/error", { message: "Server Error" });
    }
});




// Add this route to your routes file (e.g., userRoutes.js)
router.get('/invoice/:orderId',  async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    // Fetch the order details
    const order = await Order.findById(orderId)
      .populate('user', 'email')
      .populate('products.product');
    
    if (!order) {
      return res.status(404).render('error', { message: 'Order not found' });
    }
    
    // Check if the order belongs to the logged-in user
    if (order.user._id.toString() !== req.session.user._id.toString()) {
      return res.status(403).render('error', { message: 'Unauthorized access' });
    }
    
    // Get user details
    const user = await User.findById(req.session.user._id);
    
    // Render the invoice template
    res.render('user/invoice', { 
      order: order, 
      user: user,
      title: `Invoice #${order.orderID}` 
    });
    
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).render('error', { message: 'Failed to generate invoice' });
  }
});



router.get('/test-error', (req, res, next) => {
  const error = new Error('Test server error');
  error.statusCode = 500;
  throw error;
});


module.exports = router;

