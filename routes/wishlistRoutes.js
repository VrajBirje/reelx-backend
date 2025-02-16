const express = require("express");
const wishlistController = require("../controllers/wishlistController");

const router = express.Router();

router.post("/add", wishlistController.addToWishlist);
router.delete("/remove", wishlistController.removeFromWishlist);
router.get("/wishlist/:customer_id", wishlistController.getWishlistProducts);


module.exports = router;
