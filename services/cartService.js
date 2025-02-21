const { supabase } = require("../config/config");

/**
 * Add product to the cart
 */
const addToCart = async (customer_id, product_id, size, quantity = 1) => {
    if (!size) {
        return { success: false, message: "Size is required." };
    }

    try {
        // Fetch product details
        const { data: product, error: productError } = await supabase
            .from("product")
            .select("*")
            .eq("product_id", product_id)
            .single();

        if (productError || !product) {
            return { success: false, message: "Product not found." };
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
        const { data: cartItems, error } = await supabase
            .from("cart")
            .select("product_id, quantity, size, raw_tshirt_id")
            .eq("customer_id", customer_id);

        if (error) throw error;

        // Fetch product details for each cart item
        const productPromises = cartItems.map(async (item) => {
            const { data: product, error: productError } = await supabase
                .from("product")
                .select("name, description, price, discountedprice, discount, category_id, tag, images, date_added, date_updated, color")
                .eq("product_id", item.product_id)
                .single();

            if (productError) throw productError;

            // Fetch raw_tshirt details
            const { data: rawTshirt, error: rawTshirtError } = await supabase
                .from("raw_tshirts")
                .select("id, quantity, size")
                .eq("id", item.raw_tshirt_id)
                .single();

            return {
                ...product,
                product_id: item.product_id,
                quantity: item.quantity,
                size: item.size,
                raw_tshirt: rawTshirt || null,
            };
        });

        const products = await Promise.all(productPromises);

        return { success: true, data: products };
    } catch (error) {
        return { success: false, message: error.message };
    }
};


const removeFromCart = async (customer_id, product_id) => {
    try {
        const { error } = await supabase
            .from("cart")
            .delete()
            .match({ customer_id, product_id });

        if (error) throw error;

        return { success: true, message: "Item removed from cart successfully" };
    } catch (error) {
        return { success: false, message: error.message };
    }
};
const updateCartQuantity = async (customer_id, raw_tshirt_id, size, quantity) => {
    try {
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
            .match({ customer_id, raw_tshirt_id, size });

        if (error) throw error;

        return { success: true, message: "Cart quantity updated successfully" };
    } catch (error) {
        return { success: false, message: error.message };
    }
};


module.exports = { addToCart, getCartItemsByCustomer, removeFromCart, updateCartQuantity };
