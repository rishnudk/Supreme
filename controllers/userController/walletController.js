const Wallet = require('../../models/Wallet');
const User = require('../../models/User');






exports.renderWalletPage = async (req, res) => {
    try {
        const userId = req.session.user._id; // Assuming session-based auth
        console.log('Fetching wallet for user:', userId);

        // Fetch wallet with populated fields
        const wallet = await Wallet.findOne({ user: userId })
            .populate('user', 'name email') // User details
            .populate('transactions.orderId', 'orderID totalAmount'); // Order details

        if (!wallet) {
            // Create new wallet if none exists
            const newWallet = new Wallet({
                user: userId,
                currency: 'INR' // Explicitly set default currency
            });
            await newWallet.save();
            return res.render('user/wallet', {
                balance: newWallet.balance,
                transactions: newWallet.transactions, // Empty array for new wallet
                currency: newWallet.currency,
                user: req.session.user
            });
        }

        // Sort transactions by date (newest first) and take the first 3
        const sortedTransactions = wallet.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Newest first
            .slice(0, 10); // Limit to 3 transactions

        // Render with existing wallet data
        res.render('user/wallet', {
            balance: wallet.balance,
            transactions: sortedTransactions,
            currency: wallet.currency,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading wallet:', error);
        req.flash('error', 'Error loading wallet');
        res.redirect('/'); // Redirect to homepage or error page
    }
};






exports.getMoreTransactions = async (req, res) => {
    try {
        const userId = req.session.user._id; // Assuming session-based auth
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 5;

        console.log('Fetching more transactions:', { userId, skip, limit });

        const wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            return res.json({ transactions: [] });
        }

        // Fetch transactions with pagination
        const transactions = wallet.transactions
            .slice(skip, skip + limit)
            .map(tx => ({
                _id: tx._id,
                type: tx.type,
                amount: tx.amount,
                description: tx.description,
                date: tx.date,
                orderId: tx.orderId
            }));

        res.json({ transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Server error' });
    }
};