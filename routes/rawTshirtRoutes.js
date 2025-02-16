const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { updateRawTshirtQuantity } = require('../controllers/rawTshirtController');

const router = express.Router();

// Route to update raw T-shirt quantity by rawTshirtId
router.put('/quantity/:rawTshirtId',  updateRawTshirtQuantity);

module.exports = router;
