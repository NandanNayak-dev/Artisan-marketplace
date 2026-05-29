import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBehindScenes, setShowBehindScenes] = useState(false);
  const [popularItems, setPopularItems] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const userRes = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        setUser(userRes.data.user);

        const productRes = await axios.get(
          `http://localhost:8000/api/products/${id}`,
        );

        setProduct(productRes.data.product);
      } catch (error) {
        console.log(error);
        alert("Failed to load product details");
        navigate("/buyer/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-600 font-medium animate-pulse">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-800">
            Product not found
          </h2>
          <button
            onClick={() => navigate("/buyer/dashboard")}
            className="mt-4 text-amber-700 hover:underline"
          >
            Go back to shop
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login first");
      navigate("/signin");
      return;
    }
    try {
      await axios.post(
        "http://localhost:8000/api/cart/add",
        {
          buyer: user.id,
          product: product._id,
          quantity: 1,
        },
        {
          withCredentials: true,
        },
      );

      alert("Product added to cart");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to add product to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      alert("Please login first");
      navigate("/signin");
      return;
    }
    try {
      await axios.post(
        "http://localhost:8000/api/orders/buy-now",
        {
          buyer: user.id,
          productId: product._id,
          quantity: 1,
        },
        {
          withCredentials: true,
        },
      );

      alert("Order placed successfully");
      navigate("/my-orders");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place order");
    }
  };

  const getProductLocation = () => {
    return [product?.originPlace, product?.originState]
      .filter(Boolean)
      .join(", ");
  };

  const handleGetPopularItems = async () => {
    const location = getProductLocation();

    if (!location) {
      alert("Origin location is not available for this product");
      return;
    }

    setAiLoading(true);
    setPopularItems("");

    try {
      const res = await axios.post(
        "http://localhost:8000/api/ai/popular-handicrafts",
        { location },
        { withCredentials: true },
      );

      setPopularItems(res.data.suggestion);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to generate suggestions");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <Navbar title="Product Details" user={user} />

      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-stone-500">
            <Link to="/buyer/dashboard" className="hover:text-amber-700">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="hover:text-amber-700 cursor-pointer">
              {product.category}
            </span>
            <span className="mx-2">/</span>
            <span className="text-stone-800 font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-0">
            {/* Left Column: Image Gallery */}
            <div className="bg-stone-50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-stone-200 lg:col-span-2">
              <div className="relative w-full max-w-md aspect-square bg-white rounded-lg overflow-hidden shadow-sm group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-700 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                    HANDMADE
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Product Details */}
            <div className="p-6 lg:p-8 flex flex-col">
              <div className="flex-1">
                <p
                  onClick={() =>
                    navigate("/buyer/dashboard", {
                      state: { filter: product.category },
                    })
                  }
                  className="text-sm text-amber-700 font-medium uppercase tracking-wide cursor-pointer hover:underline mb-2"
                >
                  {product.category}
                </p>

                <h1 className="text-2xl md:text-3xl font-bold text-stone-900 leading-tight mb-2">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < 4 ? "text-amber-400" : "text-stone-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-stone-500 font-medium cursor-pointer hover:text-amber-700">
                    (128 Ratings)
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-stone-900">
                    ₹{product.price}
                  </span>
                  <span className="text-lg text-stone-500 line-through">
                    ₹{Math.floor(product.price * 1.3)}
                  </span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    30% OFF
                  </span>
                </div>

                {/* Trust Badges */}
                <div className="flex gap-4 mb-8">
                  <div className="flex items-center gap-1 text-xs font-medium text-stone-600">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Free Delivery
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-stone-600">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    100% Handcrafted
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-stone-800 mb-2">
                    Product Description
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {product.behindTheScenesVideo && (
                  <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <h3 className="mb-2 text-lg font-bold text-stone-800">
                      Behind the Scenes
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-stone-600">
                      Watch how this product was made and understand the
                      craftsmanship behind its price.
                    </p>
                    <button
                      onClick={() => setShowBehindScenes(true)}
                      className="w-full rounded-lg bg-amber-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-800"
                    >
                      Watch Making Video
                    </button>
                  </div>
                )}

                <div className="mb-8 rounded-lg border border-stone-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                        Craft Origin Discovery
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-stone-800">
                        Other popular items of this location
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">
                        {getProductLocation()
                          ? `Explore other handicrafts famous in ${getProductLocation()}.`
                          : "Add this product's origin place and state to discover local craft suggestions."}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleGetPopularItems}
                    disabled={aiLoading || !getProductLocation()}
                    className="mt-4 w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                  >
                    {aiLoading
                      ? "Finding local crafts..."
                      : "Other Popular Items of This Location"}
                  </button>

                  {popularItems && (
                    <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-amber-800">
                        Popular handicrafts from {getProductLocation()}
                      </h4>
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-stone-700">
                        {popularItems}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Seller Info Card */}
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center text-stone-600 font-bold text-lg">
                      {product.seller?.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Sold by</p>
                      <p className="text-sm font-bold text-stone-800">
                        {product.seller?.fullName}
                      </p>
                      <p className="text-xs text-stone-400">Artisan verified</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability & Actions */}
              <div className="border-t border-stone-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-stone-700">
                    Availability:
                  </span>
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                      In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold">Out of Stock</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-amber-50 border border-amber-700 text-amber-700 py-3 rounded-lg font-bold hover:bg-amber-700 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 bg-amber-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-amber-700/30 hover:bg-amber-800 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBehindScenes && product.behindTheScenesVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  Behind the Scenes
                </h2>
                <p className="text-sm text-stone-500">{product.name}</p>
              </div>
              <button
                onClick={() => setShowBehindScenes(false)}
                className="rounded-full bg-stone-100 px-3 py-1 text-sm font-bold text-stone-700 hover:bg-stone-200"
              >
                X
              </button>
            </div>
            <div className="bg-black">
              <video
                src={product.behindTheScenesVideo}
                controls
                className="max-h-[70vh] w-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
