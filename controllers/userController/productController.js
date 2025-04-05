const Product = require('../../models/Product');
const Offer = require('../../models/Offer');
const Coupon = require('../../models/Coupon');
const User = require('../../models/User')
const mongoose  = require('mongoose')
const bcrypt = require('bcryptjs'); 





exports.getProductByCategory = async (req, res) => {
    try {
        console.log("Received request for product ID:", req.params.id);

        const product = await Product.findById(req.params.id).populate("category");

        if (!product) {
            console.log("Product not found for ID:", req.params.id);
            return res.status(404).send("Product not found");
        }

        console.log("Fetched Product Data:", product);

        let relatedProducts = [];
        if (product.category && product.category._id) {
            relatedProducts = await Product.find({
                category: product.category._id,
                _id: { $ne: product._id }, 
                status: "Active" 
            }).limit(4);

            console.log("Fetched Related Products:", relatedProducts);
        } else {
            console.log("No valid category for product.");
        }

        const user = req.session.user || null;

        res.render("user/product", {
            product: product,
            relatedProducts: relatedProducts,
            user: user
        });
    } catch (error) {
        console.error("Error in getProductByCategory:", error);
        res.status(500).send("Server Error");
    }
};





// Add product to cart
exports.addToCart = async (req, res) => {
    const { productId } = req.body;
    try {
        // Fetch the product to add
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Initialize cart in session if it doesn’t exist
        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Add product to cart (store minimal data)
        req.session.cart.push({
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.images && product.images.length > 0 ? product.images[0] : '/images/default.png',
            quantity: 1
        });


        // Redirect to cart page instead of JSON response
        res.redirect('/user/cart');
    } catch (error) {
        console.error('Error in addToCart:', error);
        res.status(500).json({ success: false, message: 'Failed to add to cart' });
    }
};

// Get cart page
exports.getCart = async (req, res) => {
    try {
        const user = req.session.user || null;
        const cart = req.session.cart || []; 

        console.log('Rendering cart with:', { cart, user });

        res.render('user/cart', {
            cart: cart,
            user: user
        });
    } catch (error) {
        console.error('Error in getCart:', error);
        res.status(500).send('Server Error');
    }
};







exports.getProductById = async (req, res, next) => {
  try {
      const productId = req.params.id;

      // Validate ObjectId format before querying
      if (!mongoose.Types.ObjectId.isValid(productId)) {
          const error = new Error('Invalid product ID');
          error.statusCode = 400;
          throw error;
      }

      // Find the product and populate category
      const product = await Product.findById(productId).populate('category');

      if (!product) {
          console.log('Product not found for ID:', productId);
          const error = new Error('Product not found');
          error.statusCode = 404;
          throw error;
      }

      // Fetch active offers for this product
      const currentDate = new Date();
      const activeOffers = await Offer.find({
          isActive: true,
          expiryDate: { $gte: currentDate },
          $or: [
              { applicableTo: 'product', productId: product._id },
              { applicableTo: 'category', categoryId: product.category?._id }
          ]
      });

      // Fetch related products with their offers
      let relatedProducts = [];
      if (product.category && product.category._id) {
          const relatedProductsFetched = await Product.find({
              category: product.category._id,
              _id: { $ne: product._id },
              status: 'Active'
          }).limit(4);

          // Add offers to related products
          relatedProducts = relatedProductsFetched.map(relatedProduct => {
              const relatedOffers = activeOffers.filter(offer =>
                  (offer.applicableTo === 'product' && offer.productId?.toString() === relatedProduct._id.toString()) ||
                  (offer.applicableTo === 'category' && offer.categoryId?.toString() === relatedProduct.category?._id.toString())
              );

              return {
                  ...relatedProduct.toObject(),
                  offers: relatedOffers
              };
          });
      }

      const user = req.session.user || null;

      // Add offers to main product
      const productWithOffers = {
          ...product.toObject(),
          offers: activeOffers
      };

      console.log('Product with offers:', productWithOffers);
      console.log('Related Products with offers:', relatedProducts);

      res.render('user/product', {
          product: productWithOffers,
          relatedProducts: relatedProducts,
          user: user
      });
  } catch (err) {
      if (err.name === 'CastError') {
          const error = new Error('Invalid product ID');
          error.statusCode = 400;
          return next(error);
      }
      next(err);
  }
};










module.exports = exports;