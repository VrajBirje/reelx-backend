const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

router.post('/add', addressController.addAddress);
router.put('/update/:address_id', addressController.updateAddress);
router.get('/user/:user_id', addressController.getAddressesByUserId);
router.delete('/delete/:address_id', addressController.deleteAddress);

module.exports = router;
