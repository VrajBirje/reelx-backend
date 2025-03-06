const { supabase } = require('../config/config');

// 🟢 Add Address
const addAddress = async (user_id, address) => {
    const { address_line_1, address_line_2, city, state, pincode } = address;

    const { data, error } = await supabase
        .from('address')
        .insert([{ user_id, address_line_1, address_line_2, city, state, pincode }])
        .select();

    if (error) throw error;
    return data;
};

// 🟡 Update Address
const updateAddress = async (address_id, address) => {
    const { address_line_1, address_line_2, city, state, pincode } = address;

    const { data, error } = await supabase
        .from('address')
        .update({ address_line_1, address_line_2, city, state, pincode, updated_at: new Date() })
        .eq('address_id', address_id)
        .select();

    if (error) throw error;
    return data;
};

// 🔵 Get Address List by User ID
const getAddressesByUserId = async (user_id) => {
    const { data, error } = await supabase
        .from('address')
        .select('*')
        .eq('user_id', user_id);

    if (error) throw error;
    return data;
};

// 🔴 Delete Address
const deleteAddress = async (address_id) => {
    const { data, error } = await supabase
        .from('address')
        .delete()
        .eq('address_id', address_id);

    if (error) throw error;
    return data;
};

module.exports = {
    addAddress,
    updateAddress,
    getAddressesByUserId,
    deleteAddress,
};
