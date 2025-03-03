const Product = require('../../models/Product');

// Get product details and related products
exports.getProductByCategory = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            console.log('Product not found for ID:', req.params.id);
            return res.status(404).send('Product not found');
        }


        let relatedProducts = [];
        if (product.category && product.category._id) {
            relatedProducts = await Product.find({
                category: product.category._id,
                _id: { $ne: product._id }
            }).limit(4);
        } else {
            console.log('No valid category for product');
        }


        const user = req.session.user || null;

        res.render('user/product', {
            product: product,
            relatedProducts: relatedProducts,
            user: user
        });
    } catch (error) {
        console.error('Error in getProductByCategory:', error);
        res.status(500).send('Server Error');
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
        const cart = req.session.cart || []; // Default to empty array if no cart

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

module.exports = exports;