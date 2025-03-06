const addressService = require('../services/addressService');

// 🟢 Add Address
exports.addAddress = async (req, res) => {
    try {
        const { user_id, address } = req.body;
        const newAddress = await addressService.addAddress(user_id, address);
        res.status(201).json({ message: 'Address added successfully', address: newAddress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🟡 Update Address
exports.updateAddress = async (req, res) => {
    try {
        const { address_id } = req.params;
        const updatedAddress = await addressService.updateAddress(address_id, req.body);
        res.status(200).json({ message: 'Address updated successfully', address: updatedAddress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔵 Get Addresses by User ID
exports.getAddressesByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;
        const addresses = await addressService.getAddressesByUserId(user_id);
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔴 Delete Address
exports.deleteAddress = async (req, res) => {
    try {
        const { address_id } = req.params;
        await addressService.deleteAddress(address_id);
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
