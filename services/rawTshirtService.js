const { supabase } = require('../config/config');

// Update Quantity of Raw T-shirt by ID
const updateRawTshirtQuantity = async (rawTshirtId, change) => {
    // Fetch current quantity of the raw T-shirt
    const { data: rawTshirtData, error: fetchError } = await supabase
        .from('raw_tshirts')
        .select('quantity')
        .eq('id', rawTshirtId)
        .single();

    if (fetchError) throw new Error(`Error fetching raw T-shirt ID ${rawTshirtId}.`);

    const currentQuantity = rawTshirtData.quantity;
    const newQuantity = currentQuantity + change;

    if (newQuantity < 1) throw new Error('Quantity cannot be less than 1.');

    // Update the quantity in the database
    const { data: updatedTshirt, error: updateError } = await supabase
        .from('raw_tshirts')
        .update({ quantity: newQuantity })
        .eq('id', rawTshirtId)
        .select('*')
        .single();

    if (updateError) throw new Error(`Error updating quantity for raw T-shirt ID ${rawTshirtId}.`);

    return updatedTshirt;
};


module.exports = { updateRawTshirtQuantity };
