const { supabase } = require("../config/config");
const productsData = require("../data/productData");

/**
 * Add product to the cart
 */

const addToCart = async (customer_id, product_id, size, quantity = 1) => {
    if (!size) {
        return { success: false, message: "Size is required." };
    }

    try {
        // Check if product exists in local data first
        let product = productsData.find(p => p.product_id === product_id);

        if (!product) {
            // Fetch from Supabase if not in local data
            const { data: fetchedProduct, error: productError } = await supabase
                .from("product")
                .select("*")
                .eq("product_id", product_id)
                .single();

            if (productError || !fetchedProduct) {
                return { success: false, message: "Product not found." };
            }
            product = fetchedProduct;
        }

        // Find raw_tshirt_id based on size
        const rawTshirtId = product.raw_tshirt_ids?.[0] || null; // Assuming first raw_tshirt_id for selected size

        // Check if product already exists in cart
        const { data: existingCart, error: cartError } = await supabase
            .from("cart")
            .select("*")
            .eq("customer_id", customer_id)
            .eq("product_id", product_id)
            .eq("size", size)
            .single();

        if (existingCart) {
            // If exists, update quantity
            const { error: updateError } = await supabase
                .from("cart")
                .update({ quantity: existingCart.quantity + quantity })
                .match({ customer_id, product_id, size });

            if (updateError) throw updateError;
            return { success: true, message: "Quantity updated in cart." };
        } else {
            // Insert new cart entry
            const { error: insertError } = await supabase.from("cart").insert([
                {
                    customer_id,
                    product_id,
                    size,
                    quantity,
                    raw_tshirt_id: rawTshirtId,
                },
            ]);

            if (insertError) throw insertError;
            return { success: true, message: "Product added to cart." };
        }
    } catch (error) {
        return { success: false, message: "Error adding to cart", error };
    }
};

const getCartItemsByCustomer = async (customer_id) => {
    try {
        // Fetch cart items including cart_id
        const { data: cartItems, error } = await supabase
            .from("cart")
            .select("cart_id, product_id, quantity, size, raw_tshirt_id")
            .eq("customer_id", customer_id);

        if (error) throw error;

        // Fetch product and raw_tshirt details for each cart item
        const productPromises = cartItems.map(async (item) => {
            // Check if product exists in local data
            let product = productsData.find(p => p.product_id === item.product_id);

            if (!product) {
                // Fetch from Supabase if not found in local data
                const { data: fetchedProduct, error: productError } = await supabase
                    .from("product")
                    .select("name, description, price, discountedprice, discount, category_id, tag, images, date_added, date_updated, color, raw_tshirt_ids")
                    .eq("product_id", item.product_id)
                    .single();

                if (productError) throw productError;
                product = fetchedProduct;
            }

            // Fetch raw_tshirt details
            const { data: rawTshirt, error: rawTshirtError } = await supabase
                .from("raw_tshirts")
                .select("id, quantity, size")
                .eq("id", item.raw_tshirt_id)
                .single();

            if (rawTshirtError) throw rawTshirtError;

            return {
                cart_id: item.cart_id,
                product_id: item.product_id,
                quantity: item.quantity,
                size: item.size,
                raw_tshirt: rawTshirt || null,
                ...product,
            };
        });

        const products = await Promise.all(productPromises);

        return { success: true, data: products };
    } catch (error) {
        return { success: false, message: error.message };
    }
};


const removeFromCart = async (cart_id) => {
    try {
        // Delete the cart item using cart_id
        const { error } = await supabase
            .from("cart")
            .delete()
            .match({ cart_id }); // Use cart_id to match the specific cart item

        if (error) throw error;

        return { success: true, message: "Item removed from cart successfully" };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const updateCartQuantity = async (customer_id, raw_tshirt_id, size, quantity, cart_id) => {
    try {
        console.log("Received cart_id:", cart_id); // Debugging: Log the cart_id

        if (!cart_id) {
            throw new Error("cart_id is required");
        }

        // Get the available quantity of that raw_tshirt_id
        const { data: rawTshirt, error: rawError } = await supabase
            .from("raw_tshirts")
            .select("quantity")
            .eq("id", raw_tshirt_id) // Use raw_tshirt_id instead of product_id
            .maybeSingle();

        if (rawError) throw rawError;
        if (!rawTshirt) throw new Error("Product size not found");

        // Ensure the quantity is within valid limits
        if (quantity < 1) return { success: false, message: "Quantity cannot be less than 1" };
        if (quantity > rawTshirt.quantity) return { success: false, message: `Only ${rawTshirt.quantity} items available` };

        // Update quantity in cart
        const { error } = await supabase
            .from("cart")
            .update({ quantity })
            .match({ cart_id }); // Use only cart_id to match the specific cart item

        if (error) throw error;

        return { success: true, message: "Cart quantity updated successfully" };
    } catch (error) {
        console.error("Error in updateCartQuantity:", error.message); // Debugging: Log the error
        return { success: false, message: error.message };
    }
};


module.exports = { addToCart, getCartItemsByCustomer, removeFromCart, updateCartQuantity };
