const { supabase } = require('../config/config');

// Add Product
const addProduct = async (product) => {
  try {
    console.log("🔹 API Request Payload:", JSON.stringify(product, null, 2));

    const { data, error } = await supabase
      .from('product')
      .insert([product])
      .select('*');

    if (error) {
      console.error("❌ Supabase Insert Error:", JSON.stringify(error, null, 2));
      throw new Error(error.message || "Unknown Supabase error");
    }

    console.log("✅ Product Inserted Successfully:", data);
    return data;
  } catch (err) {
    console.error("❌ Unexpected Error in addProduct:", err);
    throw err;
  }
};

// Update Product
const updateProduct = async (product_id, updatedFields) => {
  const { data, error } = await supabase
    .from('Product')
    .update(updatedFields)
    .eq('product_id', product_id)
    .select('*');
  
  if (error) throw error;
  return data;
};

// Delete Product
const deleteProduct = async (product_id) => {
  const { error } = await supabase.from('Product').delete().eq('product_id', product_id);
  if (error) throw error;
};


const getProductById = async (product_id) => {
  if (!product_id || isNaN(product_id)) {
    throw new Error("Invalid product ID");
  }

  // Fetch product by ID
  const { data: product, error } = await supabase
    .from("product")
    .select("*")
    .eq("product_id", product_id)
    .single();

  if (error || !product) {
    throw new Error("Product not found");
  }

  // Fetch raw_tshirt_ids with details
  const { data: rawTshirts, error: rawError } = await supabase
    .from("raw_tshirts") // Adjust table name if needed
    .select("id, quantity, size")
    .in("id", product.raw_tshirt_ids || []);

  if (rawError) {
    throw new Error("Error fetching raw_tshirts");
  }

  // Attach raw_tshirt details to product
  product.raw_tshirt_ids = rawTshirts || [];

  return product;
};


// const getPaginatedProducts2 = async (page, limit, category_id, sort) => {
//   let query = supabase.from('product').select('*', { count: 'exact' });

//   console.log("🔹 Query Params:", { page, limit, category_id, sort });

//   // ✅ Convert category_id properly
//   if (category_id) {
//     category_id = parseInt(category_id);
//     if (isNaN(category_id)) {
//       console.error("❌ Invalid category_id:", category_id);
//       throw new Error("Invalid category_id");
//     }
//     query = query.eq('category_id', category_id);
//   }

//   // ✅ Sorting by discountedprice
//   if (sort === 'asc') {
//     query = query.order('discountedprice', { ascending: true });
//   } else if (sort === 'desc') {
//     query = query.order('discountedprice', { ascending: false });
//   } else {
//     query = query.order('product_id', { ascending: true }); // Default sorting
//   }

//   // ✅ Pagination
//   const from = (page - 1) * limit;
//   const to = from + limit - 1;
//   query = query.range(from, to);

//   // ✅ Fetch Data from Supabase
//   const { data, error, count } = await query;

//   if (error) {
//     console.error("❌ Supabase Error:", error);
//     throw new Error("Database query failed");
//   }

//   // console.log("✅ Query Result:", { total: count, data });

//   return { total: count, page, limit, products: data };
// };
const getPaginatedProducts2 = async (page, limit, category_id, sort) => {
  try {
    // Validate inputs
    if (category_id) {
      category_id = parseInt(category_id);
      if (isNaN(category_id)) {
        console.error("❌ Invalid category_id:", category_id);
        throw new Error("Invalid category_id");
      }
    }

    // Build query
    let query = supabase
      .from('product')
      .select('product_id, name, discountedprice, category_id, tag, images', { count: 'exact' }); // Select only required columns

    // Apply filters
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    // Apply sorting
    if (sort === 'asc') {
      query = query.order('discountedprice', { ascending: true });
    } else if (sort === 'desc') {
      query = query.order('discountedprice', { ascending: false });
    } else {
      query = query.order('product_id', { ascending: true }); // Default sorting
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Fetch data
    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Supabase Error:", error);
      throw new Error("Database query failed");
    }

    return { total: count, page, limit, products: data };
  } catch (error) {
    console.error("❌ Error in getPaginatedProducts2:", error);
    throw error;
  }
};

module.exports = { addProduct, updateProduct, deleteProduct, getPaginatedProducts2, getProductById };
