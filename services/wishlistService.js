// const { supabase } = require("../config/config");

// exports.addProductToWishlist = async (customer_id, product_id) => {
//     try {
//         // Check if customer exists in the wishlist
//         let { data, error } = await supabase
//             .from("wishlist")
//             .select("product_ids")
//             .eq("customer_id", customer_id)
//             .single();

//         if (error && error.code !== "PGRST116") {
//             console.error("Error fetching wishlist:", error);
//             return { success: false, message: "Error fetching wishlist" };
//         }

//         if (data) {
//             // Customer exists, append product_id if not already in array
//             if (!data.product_ids.includes(product_id)) {
//                 const updatedProductIds = [...data.product_ids, product_id];

//                 const { error: updateError } = await supabase
//                     .from("wishlist")
//                     .update({ product_ids: updatedProductIds })
//                     .eq("customer_id", customer_id);

//                 if (updateError) {
//                     console.error("Error updating wishlist:", updateError);
//                     return { success: false, message: "Error updating wishlist" };
//                 }
//             }
//         } else {
//             // Customer does not exist, insert new row
//             const { error: insertError } = await supabase.from("wishlist").insert([
//                 {
//                     customer_id,
//                     product_ids: [product_id], // Initialize array with product_id
//                 },
//             ]);

//             if (insertError) {
//                 console.error("Error inserting into wishlist:", insertError);
//                 return { success: false, message: "Error adding to wishlist" };
//             }
//         }

//         return { success: true, message: "Product added to wishlist successfully" };
//     } catch (error) {
//         console.error("Error in wishlistService:", error);
//         return { success: false, message: "Internal server error" };
//     }
// };

// exports.removeProductFromWishlist = async (customer_id, product_id) => {
//     try {
//         // Fetch wishlist entry
//         let { data, error } = await supabase
//             .from("wishlist")
//             .select("product_ids")
//             .eq("customer_id", customer_id)
//             .single();

//         if (error) {
//             console.error("Error fetching wishlist:", error);
//             return { success: false, message: "Error fetching wishlist" };
//         }

//         if (data) {
//             const updatedProductIds = data.product_ids.filter((id) => id !== product_id);

//             if (updatedProductIds.length === data.product_ids.length) {
//                 return { success: false, message: "Product not found in wishlist" };
//             }

//             // Update the wishlist
//             const { error: updateError } = await supabase
//                 .from("wishlist")
//                 .update({ product_ids: updatedProductIds })
//                 .eq("customer_id", customer_id);

//             if (updateError) {
//                 console.error("Error updating wishlist:", updateError);
//                 return { success: false, message: "Error updating wishlist" };
//             }

//             return { success: true, message: "Product removed from wishlist" };
//         } else {
//             return { success: false, message: "Customer not found in wishlist" };
//         }
//     } catch (error) {
//         console.error("Error in wishlistService:", error);
//         return { success: false, message: "Internal server error" };
//     }
// };

// exports.fetchWishlistProducts = async (customer_id) => {
//     try {
//         // Fetch wishlist entry
//         const { data: wishlistData, error: wishlistError } = await supabase
//             .from("wishlist")
//             .select("product_ids")
//             .eq("customer_id", customer_id)
//             .single();

//         if (wishlistError || !wishlistData) {
//             console.error("Error fetching wishlist:", wishlistError);
//             return { success: false, message: "Wishlist not found" };
//         }

//         const productIds = wishlistData.product_ids;

//         if (!productIds || productIds.length === 0) {
//             return { success: true, total: 0, products: [] };
//         }

//         // Fetch products matching the wishlist product IDs
//         const { data: products, error: productsError } = await supabase
//             .from("product")
//             .select("*")
//             .in("product_id", productIds);

//         if (productsError) {
//             console.error("Error fetching products:", productsError);
//             return { success: false, message: "Error fetching products" };
//         }

//         return { success: true, total: products.length, products };
//     } catch (error) {
//         console.error("Error in fetchWishlistProducts:", error);
//         return { success: false, message: "Internal server error" };
//     }
// };

const { supabase } = require("../config/config");
const products = require("../data/productData");

exports.addProductToWishlist = async (customer_id, product_id) => {
    try {
        // First check if product exists in local data
        const productExists = products.some(p => p.product_id === product_id);
        if (!productExists) {
            return { success: false, message: "Product not found" };
        }

        // Check if customer exists in the wishlist
        let { data, error } = await supabase
            .from("wishlist")
            .select("product_ids")
            .eq("customer_id", customer_id)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Error fetching wishlist:", error);
            return { success: false, message: "Error fetching wishlist" };
        }

        if (data) {
            // Customer exists, append product_id if not already in array
            if (!data.product_ids.includes(product_id)) {
                const updatedProductIds = [...data.product_ids, product_id];

                const { error: updateError } = await supabase
                    .from("wishlist")
                    .update({ product_ids: updatedProductIds })
                    .eq("customer_id", customer_id);

                if (updateError) {
                    console.error("Error updating wishlist:", updateError);
                    return { success: false, message: "Error updating wishlist" };
                }
            }
        } else {
            // Customer does not exist, insert new row
            const { error: insertError } = await supabase.from("wishlist").insert([
                {
                    customer_id,
                    product_ids: [product_id],
                },
            ]);

            if (insertError) {
                console.error("Error inserting into wishlist:", insertError);
                return { success: false, message: "Error adding to wishlist" };
            }
        }

        return { success: true, message: "Product added to wishlist successfully" };
    } catch (error) {
        console.error("Error in wishlistService:", error);
        return { success: false, message: "Internal server error" };
    }
};

exports.removeProductFromWishlist = async (customer_id, product_id) => {
    try {
        // Fetch wishlist entry
        let { data, error } = await supabase
            .from("wishlist")
            .select("product_ids")
            .eq("customer_id", customer_id)
            .single();

        if (error) {
            console.error("Error fetching wishlist:", error);
            return { success: false, message: "Error fetching wishlist" };
        }

        if (data) {
            const updatedProductIds = data.product_ids.filter((id) => id !== product_id);

            if (updatedProductIds.length === data.product_ids.length) {
                return { success: false, message: "Product not found in wishlist" };
            }

            // Update the wishlist
            const { error: updateError } = await supabase
                .from("wishlist")
                .update({ product_ids: updatedProductIds })
                .eq("customer_id", customer_id);

            if (updateError) {
                console.error("Error updating wishlist:", updateError);
                return { success: false, message: "Error updating wishlist" };
            }

            return { success: true, message: "Product removed from wishlist" };
        } else {
            return { success: false, message: "Customer not found in wishlist" };
        }
    } catch (error) {
        console.error("Error in wishlistService:", error);
        return { success: false, message: "Internal server error" };
    }
};

exports.fetchWishlistProducts = async (customer_id) => {
    try {
        // Fetch wishlist entry from Supabase
        const { data: wishlistData, error: wishlistError } = await supabase
            .from("wishlist")
            .select("product_ids")
            .eq("customer_id", customer_id)
            .single();

        if (wishlistError || !wishlistData) {
            console.error("Error fetching wishlist:", wishlistError);
            return { success: false, message: "Wishlist not found" };
        }

        const productIds = wishlistData.product_ids;

        if (!productIds || productIds.length === 0) {
            return { success: true, total: 0, products: [] };
        }

        // Get products from local data
        const wishlistProducts = products.filter(p => 
            productIds.includes(p.product_id)
        );

        return { 
            success: true, 
            total: wishlistProducts.length, 
            products: wishlistProducts 
        };
    } catch (error) {
        console.error("Error in fetchWishlistProducts:", error);
        return { success: false, message: "Internal server error" };
    }
};