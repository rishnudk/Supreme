const Category = require('../../models/Category')
const Coupon = require('../../models/Coupon')
const mongoose = require('mongoose')



// exports.getCouponManagePage = async (req, res) => {
//     try {
//         const coupons = await Coupon.find()
//             .sort({ expiryDate: -1 })
//             .lean();
//         console.log('Coupons fetched:', coupons.length); // Debug: Check if data is fetched
//         res.render('admin/couponManage', {
//             title: 'Coupon Management',
//             coupons: coupons.map((coupon, index) => ({
//                 id: coupon._id.toString(),
//                 code: coupon.code,
//                 discount: `${coupon.discountValue}%`,
//                 status: coupon.isActive ? 'active' : 'inactive',
//                 index: index + 1
//             }))
//         });
//     } catch (error) {
//         console.error('Error in getCouponManagePage:', error);
//         res.render('admin/couponManage', {
//             title: 'Coupon Management',
//             coupons: [],
//             error: 'Failed to load coupons'
//         });
//     }
// };





exports.getCouponManagePage = async (req, res) => {
    try {
        // Get page number from query params, default to 1
        const page = parseInt(req.query.page) || 1;
        const limit = 3; // Number of coupons per page
        const skip = (page - 1) * limit;

        // Get total count of coupons
        const totalCoupons = await Coupon.countDocuments();

        // Fetch coupons with pagination, sorted by createdAt descending (newest first)
        const coupons = await Coupon.find()
            .sort({ createdAt: -1 }) // Changed from expiryDate to createdAt
            .skip(skip)
            .limit(limit)
            .lean();

        console.log('Coupons fetched:', coupons.length);

        // Calculate pagination details
        const totalPages = Math.ceil(totalCoupons / limit);

        res.render('admin/couponManage', {
            title: 'Coupon Management',
            coupons: coupons.map((coupon, index) => ({
                id: coupon._id.toString(),
                code: coupon.code,
                discount: `${coupon.discountValue}%`,
                status: coupon.isActive ? 'active' : 'inactive',
                index: skip + index + 1 // Adjust index based on page
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
        console.log('Add coupon request body:', req.body); // Debug: Check incoming data
        const { code, discountValue, minOrderValue, expiryDate, isActive } = req.body;

        const newCoupon = new Coupon({
            code: code.toUpperCase(),
            discountType: 'percentage', // Default value since field is removed from modal
            discountValue: Number(discountValue),
            minOrderValue: Number(minOrderValue) || 0,
            expiryDate: new Date(expiryDate),
            isActive: isActive === 'true' // Convert string to boolean
        });

        await newCoupon.save();
        console.log('Coupon saved:', newCoupon); // Debug: Confirm save

        res.json({
            success: true,
            message: 'Coupon added successfully',
            coupon: {
                id: newCoupon._id.toString(),
                code: newCoupon.code,
                discount: `${newCoupon.discountValue}%`, // Assuming percentage
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
        console.log('Update coupon request body:', req.body); // Debug: Check incoming data
        const { id } = req.params;
        const { code, discountValue, minOrderValue, usageLimit, expiryDate, isActive } = req.body;

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            {
                code: code.toUpperCase(),
                discountType: 'percentage', // Fixed as per your modal
                discountValue: Number(discountValue),
                minOrderValue: Number(minOrderValue) || 0,
                usageLimit: Number(usageLimit) || 1,
                expiryDate: new Date(expiryDate),
                isActive: isActive === 'true'
            },
            { new: true, runValidators: true } // Return updated doc and validate
        );

        if (!updatedCoupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        console.log('Coupon updated:', updatedCoupon); // Debug: Confirm update
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
        console.log('Delete coupon request for ID:', req.params.id); // Debug: Check ID
        const { id } = req.params;

        const deletedCoupon = await Coupon.findByIdAndDelete(id);

        if (!deletedCoupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        console.log('Coupon deleted:', deletedCoupon); // Debug: Confirm deletion
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