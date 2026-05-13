import { Routes, Route, Navigate } from "react-router-dom";

import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";

import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";

function App() {
  const userData = null;

  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />

      <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
      <Route path="/seller/dashboard" element={<SellerDashboard />} />
    </Routes>
  );
}

export default App;
