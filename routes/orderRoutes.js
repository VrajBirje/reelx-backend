const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/create', orderController.createOrder);
router.get('/orders/:user_id', orderController.getOrders);
router.put('/orders/:order_id', orderController.updateOrder);
router.delete('/orders/:order_id/cancel', orderController.cancelOrder);

module.exports = router;
