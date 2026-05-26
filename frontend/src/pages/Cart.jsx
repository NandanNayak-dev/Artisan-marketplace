import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Cart() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const totalAmount = cartItems.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);

  const fetchCart = async (buyerId) => {
    const res = await axios.get(`http://localhost:8000/api/cart/${buyerId}`, {
      withCredentials: true,
    });

    setCartItems(res.data.cartItems);
  };

  useEffect(() => {
    const loadCart = async () => {
      try {
        const userRes = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        setUser(userRes.data.user);

        await fetchCart(userRes.data.user.id);
      } catch (error) {
        console.log(error);
      }
    };

    loadCart();
  }, []);

  const placeOrder = async () => {
    try {
      if (!user) {
        alert("Please login first");
        return;
      }

      if (cartItems.length === 0) {
        alert("Your cart is empty");
        return;
      }

      await axios.post(
        "http://localhost:8000/api/orders",
        {
          buyer: user.id,
        },
        {
          withCredentials: true,
        }
      );

      alert("Order placed successfully");
      setCartItems([]);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place order");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar title="Cart" user={user} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-serif text-stone-800 mb-8 pb-4 border-b border-stone-300">
          Your Collection
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 text-stone-300">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-stone-600 text-lg font-medium">Your cart is currently empty.</p>
            <p className="text-stone-400 mt-2">Discover unique handmade items to add here.</p>
          </div>
        ) : (
          <>
            <ul className="space-y-6">
              {cartItems.map((item) => (
                <li 
                  key={item._id}
                  className="flex flex-col sm:flex-row items-center gap-6 bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Image Container */}
                  <div className="flex-shrink-0 w-32 h-32 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name || "Product"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 text-center sm:text-left flex flex-col justify-between h-full py-2">
                    <h3 className="text-xl font-serif text-stone-800 mb-3">
                      {item.product?.name || "Product unavailable"}
                    </h3>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <span className="inline-flex items-center px-4 py-1.5 bg-stone-100 text-stone-700 text-sm rounded-full font-medium border border-stone-200">
                        Quantity: <span className="ml-2 font-bold text-stone-900">{item.quantity}</span>
                      </span>
                      <span className="inline-flex items-center px-4 py-1.5 bg-amber-50 text-amber-900 text-sm rounded-full font-medium border border-amber-100">
                        Price: <span className="ml-2 font-bold">₹{item.product?.price || 0}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <p className="text-xs uppercase tracking-wide text-stone-400 font-semibold">
                      Subtotal
                    </p>
                    <p className="text-lg font-bold text-stone-900">
                      ₹{(item.product?.price || 0) * item.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 bg-white rounded-xl border border-stone-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-stone-500 font-semibold">
                  Order Total
                </p>
                <p className="text-2xl font-bold text-stone-900">
                  ₹{totalAmount}
                </p>
              </div>

              <button
                className="bg-amber-700 text-white px-6 py-2 rounded hover:bg-amber-800"
                onClick={placeOrder}
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Cart;
