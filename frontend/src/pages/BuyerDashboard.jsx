import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function BuyerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("relevance");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Extract unique categories from products
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // Server returns filtered products, use them directly
  const filteredProducts = products;

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

        const cartRes = await axios.get(
          `http://localhost:8000/api/cart/${res.data.user.id}`,
          {
            withCredentials: true,
          },
        );

        const itemCount = cartRes.data.cartItems.reduce((total, item) => {
          return total + item.quantity;
        }, 0);

        setCartCount(itemCount);
      } catch (error) {
        navigate("/signin");
      }
    };
    const fetchProducts = async () => {
      try {
        const params = {
          q: searchQuery || undefined,
          category:
            selectedCategory && selectedCategory !== "All"
              ? selectedCategory
              : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sort: sortOption || undefined,
          page: 1,
          limit: 100,
        };

        const res = await axios.get("http://localhost:8000/api/products", {
          params,
        });
        setProducts(res.data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    checkUser();
    fetchProducts();
  }, [navigate, searchQuery, selectedCategory, minPrice, maxPrice, sortOption]);

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

  const firstLetter = (user?.fullName?.charAt(0) || "U").toUpperCase();

  const handleAddToCart = async (productId) => {
    try {
      if (!user) {
        alert("Please login first");
        return;
      }

      await axios.post(
        "http://localhost:8000/api/cart/add",
        {
          buyer: user.id,
          product: productId,
          quantity: 1,
        },
        {
          withCredentials: true,
        },
      );

      setCartCount((prevCount) => prevCount + 1);
      alert("Product added to cart");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product to cart");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Enhanced Navbar Area */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Logo & Welcome */}
            <div className="flex items-center gap-4">
              <Link to="/buyer/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-amber-700 rounded flex items-center justify-center text-white font-bold text-xl">
                  A
                </div>
                <span className="text-xl font-bold text-stone-800 hidden sm:block">
                  Artisan<span className="text-amber-700">.</span>
                </span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-auto w-full">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search for handmade crafts, pottery, jewelry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 pl-4 pr-12 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-stone-700 placeholder-stone-400"
                />
                <button className="absolute right-1 top-1 bottom-1 bg-amber-700 hover:bg-amber-800 text-white px-4 rounded-md transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/my-orders")}
                className="flex items-center gap-2 text-stone-700 hover:text-amber-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="hidden sm:inline">My Orders</span>
              </button>

              <div className="h-8 w-px bg-stone-300 hidden md:block"></div>

              <button
                onClick={() => navigate("/cart")}
                className="flex items-center gap-2 text-stone-700 hover:text-amber-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Cart</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-700 text-white font-bold shadow-sm hover:bg-amber-800 transition-colors"
                >
                  {firstLetter}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="font-semibold text-stone-800 truncate">
                        {user?.fullName || "User"}
                      </p>
                      <p className="text-sm text-stone-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("/my-orders")}
                      className="w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      My Orders
                    </button>

                    <button
                      onClick={() => navigate("/buyer/stats")}
                      className="w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      Buyer Stats
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-amber-700 text-white shadow-md"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-stone-600">
            Showing{" "}
            <span className="font-bold text-stone-900">
              {filteredProducts.length}
            </span>{" "}
            results
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-stone-500">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border-none bg-transparent text-amber-700 font-bold cursor-pointer focus:ring-0"
            >
              <option value="relevance">Relevance</option>
              <option value="latest">Latest</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
            </select>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-600"
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-600"
          />
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSortOption("relevance");
              setMinPrice("");
              setMaxPrice("");
            }}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 hover:bg-stone-50"
          >
            Reset Filters
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border border-stone-200 flex flex-col"
            >
              {/* Image */}
              <div
                onClick={() => navigate(`/products/${product._id}`)}
                className="relative h-56 bg-stone-100 cursor-pointer overflow-hidden rounded-t-lg"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                  HANDMADE
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-grow">
                <div
                  onClick={() => navigate(`/products/${product._id}`)}
                  className="cursor-pointer"
                >
                  <h3 className="text-sm font-medium text-stone-500 hover:text-amber-700 line-clamp-1">
                    {product.seller?.fullName}
                  </h3>
                  <h2 className="text-base font-bold text-stone-900 line-clamp-2 mt-1 min-h-[2.5rem]">
                    {product.name}
                  </h2>
                </div>

                {/* Real Rating from Database */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.round(product.avgRating || 0)
                            ? "text-amber-400"
                            : "text-stone-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-stone-500">
                    {product.avgRating > 0
                      ? `${product.avgRating} (${product.reviewCount})`
                      : "No ratings"}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xl font-bold text-stone-900">
                    ₹{product.price}
                  </span>
                  <span className="text-xs text-stone-500 line-through">
                    ₹{Math.floor(product.price * 1.2)}
                  </span>
                  <span className="text-xs text-green-600 font-bold">
                    20% OFF
                  </span>
                </div>

                <div className="mt-1 text-xs text-green-700 font-medium">
                  Free delivery by tomorrow
                </div>

                <div className="mt-auto pt-4">
                  {product.stock > 0 ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className="flex-1 bg-amber-50 border border-amber-600 text-amber-700 py-2 rounded-md text-sm font-bold hover:bg-amber-600 hover:text-white transition-colors"
                      >
                        🛒 Add to Cart
                      </button>
                      <button
                        onClick={() =>
                          navigate("/checkout", {
                            state: {
                              type: "buyNow",
                              product,
                            },
                          })
                        }
                        className="flex-1 bg-amber-700 text-white py-2 rounded-md text-sm font-bold hover:bg-amber-800 transition-colors"
                      >
                        Buy Now
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-stone-200 text-stone-500 py-2 rounded-md text-sm font-bold cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-stone-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-stone-800">
              No products found
            </h3>
            <p className="text-stone-500 mt-1">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerDashboard;
