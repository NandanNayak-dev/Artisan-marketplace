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

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/api/products/${productId}`, {
        withCredentials: true,
      });

      setProducts(products.filter((product) => product._id !== productId));
      alert("Product deleted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete product");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Seller Dashboard" user={user} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.fullName}
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your handmade products here
            </p>
          </div>

          <button
            onClick={() => navigate("/seller/add-product")}
            className="bg-amber-700 text-white px-5 py-2.5 rounded hover:bg-amber-800 transition"
          >
            Add Product
          </button>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Products</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
              .filter((product) => product.seller?._id === user?.id)
              .map((product) => (
                <div key={product._id} className="bg-white rounded shadow p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded mb-4"
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
    </div>
  );
}

export default SellerDashboard;
