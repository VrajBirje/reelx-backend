const { supabase } = require('../config/config');

// 🟢 Add Coupon
exports.addCoupon = async (couponData) => {
    const { data, error } = await supabase
        .from('coupon')
        .insert([{ ...couponData }])
        .select();

    if (error) throw error;
    return data;
};

// 🟡 Update Coupon
exports.updateCoupon = async (coupon_id, updates) => {
    const { data, error } = await supabase
        .from('coupon')
        .update({ ...updates, updated_at: new Date() })
        .eq('coupon_id', coupon_id)
        .select();

    if (error) throw error;
    return data;
};

// 🔵 Validate Coupon
exports.validateCoupon = async (code, clerk_user_id, order_amount, is_new_user) => {
    const { data: coupon, error } = await supabase
        .from('coupon')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

    if (error || !coupon) throw new Error('Invalid or expired coupon.');

    // 🛑 Check expiry date
    if (new Date(coupon.valid_till) < new Date()) {
        throw new Error('Coupon has expired.');
    }

    // 🛑 Check min amount
    if (order_amount < coupon.min_amount) {
        throw new Error(`Minimum order amount to apply this coupon is ${coupon.min_amount}.`);
    }

    // 🛑 Check first-time user condition
    if (coupon.first_time_user && !is_new_user) {
        throw new Error('This coupon is only valid for first-time users.');
    }

    // 🛑 Check user-specific condition (if list is not empty)
    if (coupon.user_specific && coupon.user_specific.length > 0 && !coupon.user_specific.includes(clerk_user_id)) {
        throw new Error('This coupon is not applicable for your account.');
    }

    // 🛑 Check usage limit
    if (coupon.times_used >= coupon.usage_limit) {
        throw new Error('Coupon usage limit reached.');
    }

    // ✅ Apply discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
        discount = (order_amount * coupon.discount_percentage) / 100;
        if (coupon.max_discount_amount) {
            discount = Math.min(discount, coupon.max_discount_amount);
        }
    } else {
        discount = coupon.discount_amount;
    }

    return { coupon, discount };
};
