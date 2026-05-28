import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function SellerOrders() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const fetchSellerOrders = async (sellerId) => {
    const res = await axios.get(
      `http://localhost:8000/api/orders/seller/${sellerId}`,
      {
        withCredentials: true,
      },
    );

    setOrders(res.data.orders);
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const userRes = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        if (userRes.data.user.role !== "seller") {
          navigate("/signin");
          return;
        }

        setUser(userRes.data.user);
        await fetchSellerOrders(userRes.data.user.id);
      } catch (error) {
        console.log(error);
        navigate("/signin");
      }
    };

    loadOrders();
  }, [navigate]);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(
        `http://localhost:8000/api/orders/${orderId}/status`,
        { status },
        { withCredentials: true },
      );

      fetchSellerOrders(user.id);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const normalizeStatus = (status) => status?.toString().trim().toLowerCase();
  const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

  const getAllowedStatusOptions = (status) => {
    const normalizedStatus = normalizeStatus(status);

    if (["cancelled", "delivered"].includes(normalizedStatus)) {
      return [normalizedStatus];
    }

    const currentIndex = statusSteps.indexOf(normalizedStatus);

    return statusSteps.filter((_, index) => index >= currentIndex);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "refunded":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-12">
      <Navbar title="Seller Orders" user={user} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">
              Order management
            </p>
            <h1 className="mt-2 text-3xl font-bold text-stone-900">
              Seller Orders
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Review buyer orders, payment status, and delivery progress.
            </p>
          </div>

          <button
            onClick={() => navigate("/seller/dashboard")}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-stone-300 bg-white px-5 text-sm font-bold text-stone-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
          >
            Back to Dashboard
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-stone-900">No orders yet</h2>
            <p className="mt-2 text-sm text-stone-500">
              Buyer orders for your products will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order._id}
                className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-stone-200 bg-stone-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-bold text-stone-900">
                      Order #{order._id.slice(-10).toUpperCase()}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      Buyer: {order.buyer?.fullName || "Buyer"} | Placed on{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${getOrderStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${getPaymentStatusColor(
                        order.paymentStatus,
                      )}`}
                    >
                      Payment: {order.paymentStatus || "pending"}
                    </span>
                    <span className="text-xs font-medium text-stone-500">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-bold text-stone-900">
                      Total: {formatCurrency(order.totalAmount)}
                    </p>

                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      disabled={["cancelled", "delivered"].includes(
                        normalizeStatus(order.status),
                      )}
                      className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-stone-700 outline-none transition focus:border-amber-600 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
                    >
                      {getAllowedStatusOptions(order.status).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {order.items
                      .filter((item) => item.seller === user?.id)
                      .map((item) => (
                        <div
                          key={item._id}
                          className="flex gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                            <img
                              src={item.product?.image}
                              alt={item.product?.name || "Product"}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h2 className="truncate font-bold text-stone-900">
                              {item.product?.name || "Product unavailable"}
                            </h2>
                            <p className="mt-1 text-sm text-stone-500">
                              Qty: {item.quantity}
                            </p>
                            <p className="mt-1 text-sm text-stone-500">
                              Price: {formatCurrency(item.price)}
                            </p>
                          </div>

                          <p className="hidden font-bold text-stone-900 sm:block">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SellerOrders;
