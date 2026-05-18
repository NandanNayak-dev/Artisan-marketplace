import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function BuyerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        if (res.data.user.role !== "buyer") {
          navigate("/signin");
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
    <Navbar title="Buyer Dashboard" user={user} onLogout={handleLogout} />

    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Welcome, {user?.fullName}
      </h1>

      <h2 className="text-xl font-semibold mb-4">
        Available Products
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border rounded-lg p-4 shadow-sm"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover rounded-md mb-4"
            />

            <h3 className="text-lg font-bold">{product.name}</h3>

            <p className="text-gray-600">{product.description}</p>

            <p className="mt-2 font-semibold">₹{product.price}</p>

            <p className="text-sm text-gray-500">
              Category: {product.category}
            </p>

            <p className="text-sm text-gray-500">
              Stock: {product.stock}
            </p>

            <p className="text-sm text-gray-500">
              Seller: {product.seller?.fullName}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}

export default BuyerDashboard;
