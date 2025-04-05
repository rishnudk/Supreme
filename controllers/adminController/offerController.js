const Category = require('../../models/Category')
const Product = require('../../models/Product')
const Coupon = require('../../models/Coupon')
const Offer = require('../../models/Offer')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs'); 







exports.getOfferManagePage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 3; 
        const skip = (page - 1) * limit;

        const totalOffers = await Offer.countDocuments();

        const offers = await Offer.find()
            .populate('productId', 'name')
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit);

        console.log("Offers data:", offers.map(o => ({
            _id: o._id,
            applicableTo: o.applicableTo,
            productId: o.productId,
            categoryId: o.categoryId,
            createdAt: o.createdAt 
        })));

        const products = await Product.find({ status: 'Active' }, 'name _id');
        const categories = await Category.find({ isDeleted: false }, 'name _id');
        
        const totalPages = Math.ceil(totalOffers / limit);

        res.render('admin/offerManage', { 
            offers, 
            products, 
            categories, 
            successMsg: req.query.success, 
            errorMsg: req.query.error,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                hasPrev: page > 1,
                hasNext: page < totalPages,
                totalOffers: totalOffers
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};








    



    exports.addOffer = async (req, res) => {
        const { discountValue, applicableTo, expiryDate, isActive, productId, categoryId } = req.body;
        try {
            let existingOffer;
            if (applicableTo === 'product' && productId) {
                existingOffer = await Offer.findOne({ productId, applicableTo });
            } else if (applicableTo === 'category' && categoryId) {
                existingOffer = await Offer.findOne({ categoryId, applicableTo });
            }
    
            if (existingOffer) {
                return res.redirect('/admin/offers?error=An offer already exists for this ' + applicableTo);
            }
    
            const newOffer = new Offer({
                discountValue,
                applicableTo,
                productId: applicableTo === 'product' ? productId : null,
                categoryId: applicableTo === 'category' ? categoryId : null,
                expiryDate,
                isActive: isActive === 'on' || isActive === true
            });
            await newOffer.save();
            res.redirect('/admin/offers?success=Offer added successfully');
        } catch (error) {
            console.error(error);
            res.redirect('/admin/offers?error=Error adding offer');
        }
    };
    
    exports.updateOffer = async (req, res) => {
        const { discountValue, applicableTo, expiryDate, isActive, productId, categoryId } = req.body;
        const offerId = req.params.id;
        try {
            let existingOffer;
            if (applicableTo === 'product' && productId) {
                existingOffer = await Offer.findOne({ 
                    productId, 
                    applicableTo, 
                    _id: { $ne: offerId } 
                });
            } else if (applicableTo === 'category' && categoryId) {
                existingOffer = await Offer.findOne({ 
                    categoryId, 
                    applicableTo, 
                    _id: { $ne: offerId } 
                });
            }
    
            if (existingOffer) {
                return res.redirect('/admin/offers?error=An offer already exists for this ' + applicableTo);
            }
    
            const updatedOffer = await Offer.findByIdAndUpdate(
                offerId,
                {
                    discountValue,
                    applicableTo,
                    productId: applicableTo === 'product' ? productId : null,
                    categoryId: applicableTo === 'category' ? categoryId : null,
                    expiryDate,
                    isActive: isActive === 'on' || isActive === true
                },
                { new: true, runValidators: true }
            );
            if (!updatedOffer) return res.status(404).send('Offer not found');
            res.redirect('/admin/offers?success=Offer updated successfully');
        } catch (error) {
            console.error(error);
            res.redirect('/admin/offers?error=Error updating offer');
        }
    };
    



    exports.deleteOffer = async (req, res) => {
        const offerId = req.params.id;
        try {
            const offer = await Offer.findByIdAndDelete(offerId);
            if (!offer) {
                return res.redirect('/admin/offers?error=Offer not found');
            }
            res.redirect('/admin/offers?success=Offer deleted successfully');
        } catch (error) {
            console.error("Error deleting offer:", error);
            res.redirect('/admin/offers?error=Error deleting offer');
        }
    };