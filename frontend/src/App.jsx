import { Routes, Route, Navigate } from "react-router-dom";

import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";

import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";

import ForgotPassword from "./pages/ForgotPassword";


function App() {
  const userData = null;

  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />

      <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
      <Route path="/seller/dashboard" element={<SellerDashboard />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

    </Routes>
  );
}

export default App;
