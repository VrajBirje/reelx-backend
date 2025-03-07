const couponService = require('../services/couponService');

// 🟢 Add Coupon
exports.addCoupon = async (req, res) => {
    try {
        const coupon = await couponService.addCoupon(req.body);
        res.status(201).json({ success: true, coupon });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 🟡 Update Coupon
exports.updateCoupon = async (req, res) => {
    try {
        const { coupon_id } = req.params;
        const updatedCoupon = await couponService.updateCoupon(coupon_id, req.body);
        res.json({ success: true, updatedCoupon });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 🔵 Validate Coupon (with Clerk User ID)
exports.validateCoupon = async (req, res) => {
    try {
        const { code, clerk_user_id, order_amount, is_new_user } = req.body;

        // Validate input
        if (!code || !clerk_user_id || !order_amount || is_new_user === undefined) {
            throw new Error('Missing required fields in the request body.');
        }

        const validation = await couponService.validateCoupon(code, clerk_user_id, order_amount, is_new_user);
        res.json({ success: true, ...validation });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
