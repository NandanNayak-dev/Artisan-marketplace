import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:8000/api";

function MyWishlist() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    const userRes = await axios.get(`${API_URL}/auth/me`, {
      withCredentials: true,
    });
    setUser(userRes.data.user);

    const wishlistRes = await axios.get(`${API_URL}/wishlist`, {
      withCredentials: true,
    });
    setItems(wishlistRes.data.items || []);
  };

  useEffect(() => {
    loadWishlist()
      .catch(() => {
        navigate("/signin");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API_URL}/wishlist/${productId}`, {
        withCredentials: true,
      });
      setItems((currentItems) =>
        currentItems.filter((item) => item.product?._id !== productId),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove product");
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post(
        `${API_URL}/cart/add`,
        {
          buyer: user.id,
          product: productId,
          quantity: 1,
        },
        { withCredentials: true },
      );
      alert("Product added to cart");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product to cart");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="My Wishlist" user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
              Saved Crafts
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-900">
              My Wishlist
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Keep track of handmade products you want to revisit.
            </p>
          </div>
          <button
            onClick={() => navigate("/buyer/dashboard")}
            className="rounded-md bg-amber-700 px-4 py-2 text-sm font-bold text-white hover:bg-amber-800"
          >
            Continue Shopping
          </button>
        </div>

        {loading ? (
          <div className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600">
            Loading wishlist...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
            <h2 className="text-lg font-bold text-stone-900">
              No saved products yet
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Save products from the shop and they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div
                  key={item._id}
                  className="flex flex-col rounded-lg border border-stone-200 bg-white shadow-sm"
                >
                  <div
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="h-56 cursor-pointer rounded-t-lg bg-stone-100"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain p-4"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-sm font-medium text-stone-500">
                      {product.seller?.fullName}
                    </p>
                    <h2 className="mt-1 line-clamp-2 min-h-[2.5rem] text-base font-bold text-stone-900">
                      {product.name}
                    </h2>
                    <p className="mt-2 text-xl font-bold text-stone-900">
                      Rs. {product.price}
                    </p>
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                      <button
                        onClick={() => addToCart(product._id)}
                        disabled={product.stock <= 0}
                        className="rounded-md border border-amber-600 px-3 py-2 text-sm font-bold text-amber-700 hover:bg-amber-600 hover:text-white disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400 disabled:hover:bg-white"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product._id)}
                        className="rounded-md border border-stone-300 px-3 py-2 text-sm font-bold text-stone-700 hover:bg-stone-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyWishlist;
