const express = require("express");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.post("/add", cartController.addToCart);
router.get("/cart/:customer_id", cartController.getCartItems);
router.put("/cart/update", cartController.updateCartQuantity);
router.delete("/cart/remove", cartController.deleteCartItem);

module.exports = router;
