const Category = require('../../models/Category')
const Coupon = require('../../models/Coupon')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs'); 









exports.getCouponManagePage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 3; 
        const skip = (page - 1) * limit;

        const totalCoupons = await Coupon.countDocuments();

        const coupons = await Coupon.find()
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit)
            .lean();

        console.log('Coupons fetched:', coupons.length);

        const totalPages = Math.ceil(totalCoupons / limit);

        res.render('admin/couponManage', {
            title: 'Coupon Management',
            coupons: coupons.map((coupon, index) => ({
                id: coupon._id.toString(),
                code: coupon.code,
                discount: `${coupon.discountValue}%`,
                status: coupon.isActive ? 'active' : 'inactive',
                index: skip + index + 1 
            })),
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                hasPrev: page > 1,
                hasNext: page < totalPages,
                totalCoupons: totalCoupons
            }
        });
    } catch (error) {
        console.error('Error in getCouponManagePage:', error);
        res.render('admin/couponManage', {
            title: 'Coupon Management',
            coupons: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                hasPrev: false,
                hasNext: false,
                totalCoupons: 0
            },
            error: 'Failed to load coupons'
        });
    }
};



exports.addCoupon = async (req, res) => {
    try {
        console.log('Add coupon request body:', req.body); 
        const { code, discountValue, minOrderValue, expiryDate, isActive } = req.body;

        const newCoupon = new Coupon({
            code: code.toUpperCase(),
            discountType: 'percentage', 
            discountValue: Number(discountValue),
            minOrderValue: Number(minOrderValue) || 0,
            expiryDate: new Date(expiryDate),
            isActive: isActive === 'true' 
        });

        await newCoupon.save();
        console.log('Coupon saved:', newCoupon); 

        res.json({
            success: true,
            message: 'Coupon added successfully',
            coupon: {
                id: newCoupon._id.toString(),
                code: newCoupon.code,
                discount: `${newCoupon.discountValue}%`, 
                status: newCoupon.isActive ? 'active' : 'inactive'
            }
        });
    } catch (error) {
        console.error('Error in addCoupon:', error);
        res.status(error.code === 11000 ? 400 : 500).json({
            success: false,
            message: error.code === 11000 ? 'Coupon code already exists' : 'Failed to add coupon'
        });
    }
};



exports.updateCoupon = async (req, res) => {
    try {
        console.log('Update coupon request body:', req.body); 
        const { id } = req.params;
        const { code, discountValue, minOrderValue, usageLimit, expiryDate, isActive } = req.body;

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            {
                code: code.toUpperCase(),
                discountType: 'percentage', 
                discountValue: Number(discountValue),
                minOrderValue: Number(minOrderValue) || 0,
                usageLimit: Number(usageLimit) || 1,
                expiryDate: new Date(expiryDate),
                isActive: isActive === 'true'
            },
            { new: true, runValidators: true } 
        );

        if (!updatedCoupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        console.log('Coupon updated:', updatedCoupon); 
        res.json({
            success: true,
            message: 'Coupon updated successfully',
            coupon: {
                id: updatedCoupon._id.toString(),
                code: updatedCoupon.code,
                discount: `${updatedCoupon.discountValue}%`,
                status: updatedCoupon.isActive ? 'active' : 'inactive'
            }
        });
    } catch (error) {
        console.error('Error in updateCoupon:', error);
        res.status(error.code === 11000 ? 400 : 500).json({
            success: false,
            message: error.code === 11000 ? 'Coupon code already exists' : 'Failed to update coupon'
        });
    }
};


exports.getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id).lean();
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.json(coupon);
    } catch (error) {
        console.error('Error fetching coupon:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch coupon' });
    }
};


exports.deleteCoupon = async (req, res) => {
    try {
        console.log('Delete coupon request for ID:', req.params.id); 
        const { id } = req.params;

        const deletedCoupon = await Coupon.findByIdAndDelete(id);

        if (!deletedCoupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        console.log('Coupon deleted:', deletedCoupon); 
        res.json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteCoupon:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete coupon'
        });
    }
};