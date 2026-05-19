import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });
        if (res.data.user.role !== "seller") {
          navigate("/signin");
          return;
        }

        setUser(res.data.user);
      } catch (error) {
        navigate("/signin");
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/products");
        setProducts(res.data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    
    checkUser();
    fetchProducts();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );
      navigate("/signin");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      <Navbar title="Seller Dashboard" user={user} onLogout={handleLogout} />
      <h1 className="text-2xl font-bold mt-6">Welcome, {user?.fullName}</h1>
      <button
        onClick={() => navigate("/seller/add-product")}
        className="mt-6 bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800"
      >
        Add Product
      </button>
      <h1>My Products</h1>
      <ul>
  {products
    .filter((product) => product.seller?._id === user?.id)
    .map((product) => (
      <li key={product._id}>
        {product.name} - ₹{product.price} - Stock: {product.stock}
      </li>
    ))}
</ul>

    </div>
  );
}

export default SellerDashboard;
