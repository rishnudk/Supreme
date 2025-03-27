const User =require('../../models/User')
const Order =require('../../models/Order')
const Wallet = require('../../models/Wallet')









exports.getWalletManagement = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Number of transactions per page
        const skip = (page - 1) * limit;

        // Fetch all wallets with populated user data
        const wallets = await Wallet.find()
            .populate('user', 'name email')
            .lean();

        // Flatten and sort transactions by date (latest first)
        let transactions = [];
        wallets.forEach(wallet => {
            wallet.transactions.forEach(transaction => {
                transactions.push({
                    transactionId: transaction._id,
                    date: transaction.date,
                    user: wallet.user,
                    type: transaction.type,
                    amount: transaction.amount,
                    description: transaction.description,
                    orderId: transaction.orderId
                });
            });
        });

        // Sort by date descending (latest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Calculate pagination details
        const totalTransactions = transactions.length;
        const totalPages = Math.ceil(totalTransactions / limit);
        const paginatedTransactions = transactions.slice(skip, skip + limit);

        res.render('admin/wallet', {
            transactions: paginatedTransactions,
            pageTitle: 'Wallet',
            currentPage: page,
            totalPages: totalPages,
            hasPrev: page > 1,
            hasNext: page < totalPages
        });
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        res.status(500).render('error', { 
            message: 'Error loading wallet management page' 
        });
    }
};

exports.getWalletOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId)
            .populate('user', 'name email') 
            .populate('products.product', 'name price') 
            .lean();

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Error fetching wallet order details:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};