require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require("./routes/orderRoutes");
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");


const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 5000;
// Allow requests from your frontend dev server (Vite default port 5173)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

//Routes--------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
// Connect to MongoDB-----------------
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
//---------------------------------------------------------------------












app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
