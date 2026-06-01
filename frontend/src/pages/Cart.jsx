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

      const orderRes = await axios.post(
        "http://localhost:8000/api/orders",
        {
          buyer: user.id,
        },
        {
          withCredentials: true,
        }
      );

      const rewardCoupon = orderRes.data.rewardCoupon;
      alert(
        rewardCoupon
          ? `Order placed successfully. You earned a 10% discount token: ${rewardCoupon.code}`
          : "Order placed successfully",
      );
      setCartItems([]);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place order");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#faf9f6_0%,#ffffff_45%,#f8f5ef_100%)]">
      <Navbar title="Cart" user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 border-b border-stone-200 pb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-800/80">
            Artisan Marketplace
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Shopping Cart
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
            Review the handcrafted items you’ve selected and proceed to checkout when ready.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-stone-200 bg-white px-6 py-14 text-center shadow-[0_10px_30px_rgba(28,25,23,0.06)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-8 w-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-stone-900">
              Your cart is empty
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Discover unique handmade pieces from artisans and add them here to continue.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Cart Items */}
            <section className="lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
                  Cart Items
                </h2>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {cartItems.length} item{cartItems.length > 1 ? "s" : ""}
                </span>
              </div>

              <ul className="space-y-5">
                {cartItems.map((item) => (
                  <li
                    key={item._id}
                    className="group flex flex-col gap-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_8px_24px_rgba(28,25,23,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(28,25,23,0.09)] sm:flex-row sm:items-center sm:p-5"
                  >
                    {/* Image */}
                    <div className="h-28 w-full flex-shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 sm:w-28">
                      <img
                        src={item.product?.image}
                        alt={item.product?.name || "Product"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-stone-900 group-hover:text-amber-900">
                            {item.product?.name || "Product unavailable"}
                          </h3>
                          <p className="mt-1 text-sm text-stone-500">
                            Handcrafted marketplace item
                          </p>
                        </div>

                        <div className="rounded-xl bg-amber-50 px-4 py-2 text-left sm:text-right">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800/80">
                            Unit Price
                          </p>
                          <p className="text-lg font-bold text-amber-900">
                            ₹{item.product?.price || 0}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-4 py-1.5 text-sm font-medium text-stone-700">
                          Quantity:
                          <span className="ml-2 font-bold text-stone-900">
                            {item.quantity}
                          </span>
                        </span>

                        <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-900">
                          Subtotal:
                          <span className="ml-2 font-bold">
                            ₹{(item.product?.price || 0) * item.quantity}
                          </span>
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Summary */}
            <aside className="lg:col-span-2 lg:sticky lg:top-24 h-fit">
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_10px_30px_rgba(28,25,23,0.06)]">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
                    Order Summary
                  </h2>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Secure
                  </span>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-stone-600">Items in cart</span>
                    <span className="text-sm font-semibold text-stone-900">
                      {cartItems.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-stone-600">Shipping</span>
                    <span className="text-sm font-semibold text-emerald-700">
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="mt-3 border-t border-stone-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-stone-700">
                        Total Amount
                      </span>
                      <span className="text-2xl font-bold tracking-tight text-stone-900">
                        ₹{totalAmount}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-stone-500">
                      Final amount may vary based on delivery address and payment method.
                    </p>
                  </div>
                </div>

                <button
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-700 to-orange-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-amber-800 hover:to-orange-900 hover:shadow-md"
                  onClick={placeOrder}
                >
                  Place Order
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-stone-500">
                  By placing your order, you agree to our marketplace terms and delivery policy.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
