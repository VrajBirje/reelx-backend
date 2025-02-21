// services/razorpayService.js
const {instance} = require('../config/razorConfig')

// Create a Razorpay order
const createOrder = async (amount, currency, receipt) => {
  const options = {
    amount: amount * 100, // Amount in paise (e.g., 1000 = ₹10)
    currency,
    receipt,
    payment_capture: 1, // Auto-capture payment
  };

  try {
    const order = await instance.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Verify payment signature
const verifyPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  const crypto = require('crypto');
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  return generatedSignature === razorpay_signature;
};

module.exports = {
  createOrder,
  verifyPayment,
};