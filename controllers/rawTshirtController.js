const rawTshirtService = require('../services/rawTshirtService');

// Update Quantity of Raw T-shirt by ID
const updateRawTshirtQuantity = async (req, res) => {
    try {
        const { rawTshirtId } = req.params; // Get raw T-shirt ID from the route parameter
        const { change } = req.body; // Change in quantity (positive or negative)

        const updatedTshirt = await rawTshirtService.updateRawTshirtQuantity(rawTshirtId, change);
        res.status(200).json({ success: true, data: updatedTshirt });
    } catch (error) {
        console.error('Error updating raw T-shirt quantity:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = { updateRawTshirtQuantity };
