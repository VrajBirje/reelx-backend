const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

router.post('/add', couponController.addCoupon);
router.put('/update/:coupon_id', couponController.updateCoupon);
router.post('/validate', couponController.validateCoupon);

module.exports = router;
