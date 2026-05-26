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

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar title="Buyer Dashboard" user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Editorial Style Header */}
        <div className="mb-12 border-b border-stone-200 pb-8">
          <h1 className="text-4xl font-serif text-stone-900 mb-3">
            Welcome back, {user?.fullName?.split(" ")[0] || "Guest"}
          </h1>
          <p className="text-lg text-stone-500">
            Explore the latest handcrafted arrivals from our artisans.
          </p>
        </div>

        {/* Premium Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              className="group flex flex-col bg-white rounded-2xl border border-stone-200/60 overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500"
            >
              {/* Image Container with Hover Zoom & Floating Badge */}
              <div className="relative h-72 overflow-hidden bg-stone-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md text-stone-800 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Card Content Area */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-4 mb-1">
                  <h3 className="text-xl font-serif text-stone-900 leading-tight group-hover:text-amber-800 transition-colors">
                    {product.name}
                  </h3>
                  <span className="text-lg font-semibold text-stone-900">
                    ₹{product.price}
                  </span>
                </div>

                <p className="text-sm font-medium text-stone-400 mb-4">
                  By{" "}
                  <span className="text-stone-600">
                    {product.seller?.fullName}
                  </span>
                </p>

                <p className="text-stone-600 text-sm line-clamp-2 mb-6 flex-grow">
                  {product.description}
                </p>

                {/* Footer of the card */}
                <div className="pt-4 border-t border-stone-100 flex flex-col gap-4 mt-auto">
                  <div className="flex items-center justify-between text-xs font-medium text-stone-500">
                    <span className="bg-stone-100 px-2.5 py-1 rounded-md">
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="w-full bg-transparent border border-amber-800 text-amber-900 py-2.5 rounded-xl hover:bg-amber-800 hover:text-white transition-colors duration-300 text-sm font-bold tracking-wide"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <button
        onClick={() => navigate("/my-orders")}
        className="bg-amber-700 text-white px-4 py-2 rounded"
      >
        My Orders
      </button>
    </div>
  );
}

export default BuyerDashboard;
