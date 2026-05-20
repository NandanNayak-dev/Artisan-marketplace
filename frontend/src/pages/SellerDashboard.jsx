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
      <Navbar title="Seller Dashboard" user={user}  />

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
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition"
                >
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    {product.name}
                  </h2>

                  <p className="text-gray-600">
                    Price:{" "}
                    <span className="font-semibold text-amber-700">
                      ₹{product.price}
                    </span>
                  </p>

                  <p className="text-gray-600 mt-1">
                    Stock:{" "}
                    <span className="font-semibold text-gray-800">
                      {product.stock}
                    </span>
                  </p>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
