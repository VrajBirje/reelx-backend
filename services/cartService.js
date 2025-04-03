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

        // Determine raw_tshirt_id based on size
        const sizeIndexMap = { S: 0, M: 1, L: 2, XL: 3 };
        const rawTshirtId = product.raw_tshirt_ids?.[sizeIndexMap[size]] || null;

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
        // 1. Fetch only cart items from Supabase
        const { data: cartItems, error: cartError } = await supabase
            .from("cart")
            .select("cart_id, product_id, quantity, size, raw_tshirt_id")
            .eq("customer_id", customer_id);

        if (cartError) throw cartError;
        if (!cartItems?.length) return { success: true, data: [] };

        // 2. Create a Set of unique raw_tshirt_ids for bulk fetch
        const rawTshirtIds = [...new Set(
            cartItems.map(item => item.raw_tshirt_id).filter(Boolean)
        )];

        // 3. Fetch all needed raw_tshirts in one query
        const { data: rawTshirts = [], error: rawTshirtsError } = rawTshirtIds.length 
            ? await supabase
                .from("raw_tshirts")
                .select("id, quantity, size")
                .in("id", rawTshirtIds)
            : { data: [], error: null };

        if (rawTshirtsError) throw rawTshirtsError;

        // 4. Create lookup maps
        const rawTshirtMap = new Map(rawTshirts.map(t => [t.id, t]));
        const productMap = new Map(productsData.map(p => [p.product_id, p]));

        // 5. Combine all data with local products
        const result = cartItems.map(item => {
            const product = productMap.get(item.product_id);
            if (!product) {
                console.warn(`Product ${item.product_id} not found in local data`);
                return null;
            }

            return {
                cart_id: item.cart_id,
                product_id: item.product_id,
                quantity: item.quantity,
                size: item.size,
                raw_tshirt: item.raw_tshirt_id ? rawTshirtMap.get(item.raw_tshirt_id) : null,
                ...product
            };
        }).filter(Boolean); // Remove any items with missing products

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching cart items:", error);
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
