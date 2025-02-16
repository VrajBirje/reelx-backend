const wishlistService = require("../services/wishlistService");

exports.addToWishlist = async (req, res) => {
    try {
        const { customer_id, product_id } = req.body;

        if (!customer_id || !product_id) {
            return res.status(400).json({ success: false, message: "Missing customer_id or product_id" });
        }

        const result = await wishlistService.addProductToWishlist(customer_id, product_id);
        return res.json(result);
    } catch (error) {
        console.error("Error in addToWishlist:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { customer_id, product_id } = req.body;

        if (!customer_id || !product_id) {
            return res.status(400).json({ success: false, message: "Missing customer_id or product_id" });
        }

        const result = await wishlistService.removeProductFromWishlist(customer_id, product_id);
        return res.json(result);
    } catch (error) {
        console.error("Error in removeFromWishlist:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getWishlistProducts = async (req, res) => {
    try {
        const { customer_id } = req.params;

        if (!customer_id) {
            return res.status(400).json({ success: false, message: "Missing customer_id" });
        }

        const result = await wishlistService.fetchWishlistProducts(customer_id);
        return res.json(result);
    } catch (error) {
        console.error("Error in getWishlistProducts:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

