import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function MyOrders() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userRes = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        setUser(userRes.data.user);

        const orderRes = await axios.get(
          `http://localhost:8000/api/orders/buyer/${userRes.data.user.id}`,
          {
            withCredentials: true,
          },
        );

        setOrders(orderRes.data.orders);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOrders();
  }, []);

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing":
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <Navbar title="My Orders" user={user} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto mb-4 text-stone-200">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">
              No orders yet
            </h2>
            <p className="text-stone-500 mb-6">
              You haven't placed any orders yet. Start exploring our handcrafted
              collection!
            </p>
            <button
              onClick={() => navigate("/buyer/dashboard")}
              className="bg-amber-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-amber-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">
                      Order Placed
                    </p>
                    <p className="text-sm font-medium text-stone-800 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">
                      Total
                    </p>
                    <p className="text-sm font-bold text-stone-800 mt-1">
                      ₹{order.totalAmount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">
                      Order ID
                    </p>
                    <p className="text-xs text-stone-600 mt-1 font-mono">
                      #{order._id.slice(-10).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Order Status & Items */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-stone-800">
                        Order Status
                      </h3>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Simple visual stepper for status (Demo) */}
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                      <div
                        className={`w-2 h-2 rounded-full ${order.status !== "Cancelled" ? "bg-green-500" : "bg-stone-300"}`}
                      ></div>
                      <span className="text-stone-600">Placed</span>
                      <div className="w-8 h-px bg-stone-300"></div>
                      <div
                        className={`w-2 h-2 rounded-full ${order.status === "Shipped" || order.status === "Delivered" ? "bg-green-500" : "bg-stone-300"}`}
                      ></div>
                      <span className="text-stone-600">Shipped</span>
                      <div className="w-8 h-px bg-stone-300"></div>
                      <div
                        className={`w-2 h-2 rounded-full ${order.status === "Delivered" ? "bg-green-500" : "bg-stone-300"}`}
                      ></div>
                      <span className="text-stone-600">Delivered</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex flex-col sm:flex-row gap-4 border-b border-stone-100 last:border-0 pb-4 last:pb-0 last:border-none"
                      >
                        <div className="w-24 h-24 bg-stone-100 rounded-lg border border-stone-200 flex-shrink-0 overflow-hidden">
                          <img
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-base font-bold text-stone-900 line-clamp-1">
                              {item.product?.name || "Product unavailable"}
                            </h4>
                            <p className="text-sm text-stone-500 mt-1">
                              Sold by:{" "}
                              {item.product?.seller?.fullName || "Artisan"}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-stone-600">
                            <span className="bg-stone-100 px-2 py-1 rounded">
                              Qty: {item.quantity}
                            </span>
                            <span>₹{item.price} each</span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex sm:flex-col justify-between items-start sm:items-end">
                          <div></div>
                          <p className="text-base font-bold text-stone-900">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Actions */}
                  <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
                    <button
                      onClick={() => navigate("/buyer/dashboard")}
                      className="text-sm font-bold text-amber-700 hover:text-amber-800 hover:underline"
                    >
                      Buy Again
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
