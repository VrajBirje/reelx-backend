const productService = require('../services/productService');

// Add Product
const addProduct = async (req, res) => {
  try {
    const data = await productService.addProduct(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("Error adding product:", error.message || error); // Log a detailed error
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const data = await productService.updateProduct(product_id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    await productService.deleteProduct(product_id);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await productService.getProductById(parseInt(id));

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const getPaginatedProducts2 = async (req, res) => {
  try {
    console.log("🔹 Received Query Params:", req.query);

    let { page = 1, limit = 10, category_id, sort = 'default' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      console.error("❌ Invalid pagination parameters:", { page, limit });
      return res.status(400).json({ success: false, message: "Invalid pagination parameters" });
    }

    const data = await productService.getPaginatedProducts2(page, limit, category_id, sort);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Controller Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Products by ID
const getProductsById = async (req, res) => {
  try {
    // Accept both comma-separated string or array in request
    let productIds = req.query.ids || req.body.ids;
    
    if (!productIds) {
      return res.status(400).json({ 
        success: false, 
        message: "Product IDs are required" 
      });
    }

    // Convert string to array if needed
    if (typeof productIds === 'string') {
      productIds = productIds.split(',').map(id => parseInt(id.trim()));
    }

    const data = await productService.getProductsById(productIds);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching products:", error.message || error);
    res.status(error.message.includes("No products found") ? 404 : 500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

module.exports = { addProduct, updateProduct, deleteProduct, getPaginatedProducts2, getProductById, getProductsById  };
