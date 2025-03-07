const orderService = require('../services/orderService');

// 🔵 Create Order
exports.createOrder = async (req, res) => {
    try {
        const { user_id, customer_name, address_details, contact_details, providedSubtotal, providedTotal, discounted_amount, shipping_charges, payment_method, coupon_code } = req.body;

        if (!user_id || !customer_name || !address_details || !contact_details || !shipping_charges || !payment_method) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const order = await orderService.createOrder(user_id, customer_name, address_details, contact_details, providedSubtotal, providedTotal, discounted_amount, shipping_charges, payment_method, coupon_code);
        res.status(201).json({ success: true, order });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 🟢 Get All Orders for a User
exports.getOrders = async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await orderService.getOrdersByUserId(user_id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🟡 Update Order Status
exports.updateOrder = async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;

    try {
        const result = await orderService.updateOrderStatus(order_id, status);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🚫 Cancel Order Endpoint
exports.cancelOrder = async (req, res) => {
    const { order_id } = req.params;

    try {
        const result = await orderService.cancelOrder(order_id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
