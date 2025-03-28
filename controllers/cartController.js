const cartService = require("../services/cartService");

/**
 * Handle adding a product to the cart
 */
const addToCart = async (req, res) => {
    const { customer_id, product_id, size, quantity } = req.body;

    if (!customer_id || !product_id || !size) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const result = await cartService.addToCart(customer_id, product_id, size, quantity);
    return res.status(result.success ? 200 : 400).json(result);
};


const getCartItems = async (req, res) => {
    const { customer_id } = req.params;
  
    if (!customer_id) {
      return res.status(400).json({ success: false, message: "customer_id is required" });
    }
  
    const response = await cartService.getCartItemsByCustomer(customer_id);
  
    if (response.success) {
      return res.status(200).json(response);
    } else {
      return res.status(500).json({ success: false, message: response.message });
    }
  };
  
  const deleteCartItem = async (req, res) => {
    const { cart_id } = req.body;
  
    if (!cart_id ) {
      return res.status(400).json({ success: false, message: "cart_id are required" });
    }
  
    const response = await cartService.removeFromCart(cart_id);
  
    if (response.success) {
      return res.status(200).json(response);
    } else {
      return res.status(500).json({ success: false, message: response.message });
    }
  };

  const updateCartQuantity = async (req, res) => {
    const { customer_id, product_id, size, quantity, cart_id } = req.body;

    // Validate required fields
    if (!customer_id || !product_id || !size || quantity == null || !cart_id) {
        return res.status(400).json({ 
            success: false, 
            message: "customer_id, product_id, size, quantity, and cart_id are required" 
        });
    }

    // Call the service function with cart_id
    const response = await cartService.updateCartQuantity(customer_id, product_id, size, quantity, cart_id);

    if (response.success) {
        return res.status(200).json(response);
    } else {
        return res.status(500).json({ success: false, message: response.message });
    }
};

module.exports = { addToCart, getCartItems, deleteCartItem, updateCartQuantity };
