const express = require('express');
const cors = require('cors');
require('dotenv').config();
const productRoutes = require('./routes/productRoutes');
const addressRoutes = require('./routes/addressRoutes');
const raw_tshirtsRoutes = require('./routes/rawTshirtRoutes');
const app = express();
const wishlistRoutes = require("./routes/wishlistRoutes");
// const { authenticate } = require('./middlewares/auth');
const cartRoutes = require("./routes/cartRoutes");
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/razorRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Allow requests from specific origin (frontend domain)
const allowedOrigins = [
  'https://reelxclothing.com',
  'http://localhost:3000', // Add localhost:3000 to the allowed origins
  'http://192.168.17.34:3000', // Add localhost:3000 to the allowed origins
  'https://reelx-seven.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.get('/', (req, res) => {
  res.send('Welcome to the Mastermind Server.');
});

app.use('/api/products',  productRoutes);
app.use('/api/raw-tshirts',  raw_tshirtsRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Following code for running the server on specific network i.e. IP
// app.listen(PORT, '10.112.9.12', () => {
//     console.log(`Server running on port ${PORT}`);
// });