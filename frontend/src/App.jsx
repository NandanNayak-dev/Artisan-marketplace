import { Routes, Route, Navigate } from "react-router-dom";

import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";

import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AddProduct from "./pages/AddProduct";
import ForgotPassword from "./pages/ForgotPassword";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import SellerOrders from "./pages/SellerOrders";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />

      <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
      <Route path="/seller/dashboard" element={<SellerDashboard />} />
      <Route path="/seller/add-product" element={<AddProduct />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />

      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/seller/orders" element={<SellerOrders />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  );
}

export default App;
