const { supabase } = require('../config/config');

// 🔵 Create Order with Cart Fetching & Stock Check
exports.createOrder = async (user_id, customer_name, address_details, contact_details, providedSubtotal, providedTotal, providedDiscountedAmount, shipping_charges, payment_method, coupon_code) => {
    try {
        // 🛒 Fetch Cart Items for the User
        const { data: cartItems, error: cartError } = await supabase
            .from("cart")
            .select("product_id, quantity, size, raw_tshirt_id")
            .eq("customer_id", user_id);

        if (cartError || !cartItems.length) throw new Error('No items found in cart.');

        // 🛍️ Fetch Product & Raw T-Shirt Details
        let computedSubtotal = 0;
        let rawTshirtUpdates = [];

        const products = await Promise.all(cartItems.map(async (item) => {
            // 🟢 Fetch Product Details
            const { data: product, error: productError } = await supabase
                .from("product")
                .select("name, description, price, discountedprice, discount, category_id, tag, images, date_added, date_updated, color")
                .eq("product_id", item.product_id)
                .single();
            if (productError) throw productError;

            // 🟢 Compute Subtotal
            computedSubtotal += product.discountedprice * item.quantity;

            // 🟡 Fetch & Validate Raw T-Shirt Stock
            let rawTshirt = null;
            if (item.raw_tshirt_id) {
                const { data: rawTshirtData, error: rawTshirtError } = await supabase
                    .from("raw_tshirts")
                    .select("id, quantity, size")
                    .eq("id", item.raw_tshirt_id)
                    .single();

                if (rawTshirtError) throw rawTshirtError;
                if (rawTshirtData.quantity < item.quantity) {
                    throw new Error(payment_method === 'online'
                        ? `Insufficient stock for ${product.name}. Your payment will be refunded shortly.`
                        : `Insufficient stock for ${product.name}.`);
                }

                rawTshirt = rawTshirtData;
                rawTshirtUpdates.push({
                    id: rawTshirt.id,
                    newQuantity: rawTshirt.quantity - item.quantity
                });
            }

            return {
                ...product,
                product_id: item.product_id,
                quantity: item.quantity,
                size: item.size,
                raw_tshirt: rawTshirt || null
            };
        }));

        providedDiscountedAmount = providedDiscountedAmount ?? 0; // Default to 0 if undefined
        shipping_charges = shipping_charges ?? 0;

        // 🏷️ Compute Final Total Amount
        let computedTotal = computedSubtotal - providedDiscountedAmount + shipping_charges;

        // 🔍 Validate Computed Values Against Provided Values
        if (
            Number(computedSubtotal) !== Number(providedSubtotal) || 
            Number(computedTotal) !== Number(providedTotal)
        ) {
            console.log(Number(computedSubtotal),"computedSubtotal")
            console.log(Number(providedSubtotal),"ProSub")
            console.log(Number(computedTotal),"comTotal")
            console.log(Number(providedTotal),"proTotal")
            throw new Error("Subtotal or total amount mismatch.");
        }

        // 🟢 Insert Order into `orders` Table
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert([{
                user_id,
                customer_name,
                address_details,
                contact_details,
                products,
                subtotal: computedSubtotal,
                total_amount: computedTotal,
                discounted_amount: providedDiscountedAmount,
                shipping_charges,
                status: 'placed', // Default status
                coupon_code,
                payment_method
            }])
            .select();

        if (orderError) throw orderError;

        // 🟡 Update Raw T-Shirt Stock
        for (const update of rawTshirtUpdates) {
            const { error: stockError } = await supabase
                .from("raw_tshirts")
                .update({ quantity: update.newQuantity })
                .eq("id", update.id);
            if (stockError) throw new Error(`Failed to update stock for raw_tshirt ID ${update.id}`);
        }

        // 🗑️ Delete Cart Items After Order is Created
        const { error: deleteError } = await supabase
            .from("cart")
            .delete()
            .eq("customer_id", user_id);

        if (deleteError) throw deleteError;

        return order;
    } catch (error) {
        throw error;
    }
};

// 🟢 Get All Orders for a User
exports.getOrdersByUserId = async (user_id) => {
    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", user_id);

        if (error) throw error;
        return { success: true, data: orders };
    } catch (error) {
        throw new Error(error.message);
    }
};

// 🟡 Update Order Status
exports.updateOrderStatus = async (order_id, status) => {
    const validStatuses = ['placed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        throw new Error("Invalid order status.");
    }

    try {
        const { error } = await supabase
            .from("orders")
            .update({ status })
            .eq("order_id", order_id);

        if (error) throw error;
        return { success: true, message: "Order status updated successfully." };
    } catch (error) {
        throw new Error(error.message);
    }
};

// 🛑 Cancel Order (Only if Status is "Placed") & Restore Stock
exports.cancelOrder = async (order_id) => {
    try {
        // Fetch the order details including products
        const { data: order, error: fetchError } = await supabase
            .from("orders")
            .select("status, products")
            .eq("order_id", order_id)
            .single();

        if (fetchError) throw fetchError;
        if (!order) throw new Error("Order not found.");

        // Check if the order is eligible for cancellation
        if (order.status !== "placed") {
            throw new Error("Order cannot be canceled as it has already been processed.");
        }

        // 🟡 Restore Stock for Raw T-Shirts
        for (const product of order.products) {
            if (product.raw_tshirt && product.raw_tshirt.id) {
                // Fetch the current raw_tshirt quantity
                const { data: rawTshirt, error: rawTshirtError } = await supabase
                    .from("raw_tshirts")
                    .select("quantity")
                    .eq("id", product.raw_tshirt.id)
                    .single();

                if (rawTshirtError) throw rawTshirtError;
                if (!rawTshirt) throw new Error(`Raw t-shirt ID ${product.raw_tshirt.id} not found.`);

                // Calculate the new quantity after adding back the ordered quantity
                const newQuantity = rawTshirt.quantity + product.quantity;

                // Update the raw_tshirt quantity
                const { error: updateStockError } = await supabase
                    .from("raw_tshirts")
                    .update({ quantity: newQuantity })
                    .eq("id", product.raw_tshirt.id);

                if (updateStockError) throw new Error(`Failed to update stock for raw_tshirt ID ${product.raw_tshirt.id}`);
            }
        }

        // Update order status to "cancelled"
        const { error: updateError } = await supabase
            .from("orders")
            .update({ status: "cancelled" })
            .eq("order_id", order_id);

        if (updateError) throw updateError;

        return { success: true, message: "Order has been successfully canceled, and stock has been restored." };
    } catch (error) {
        throw new Error(error.message);
    }
};
