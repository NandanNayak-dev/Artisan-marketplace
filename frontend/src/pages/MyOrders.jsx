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

  const normalizeStatus = (status) => status?.toString().trim().toLowerCase();

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const formatLabel = (value) => {
    const status = normalizeStatus(value);
    if (!status) return "Pending";

    return status
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusColor = (status) => {
    switch (normalizeStatus(status)) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "confirmed":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "pending":
      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
      case "canceled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (normalizeStatus(paymentStatus)) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      case "refunded":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  const isOrderCancelled = (status) =>
    ["cancelled", "canceled"].includes(normalizeStatus(status));
  const isOrderDelivered = (status) => normalizeStatus(status) === "delivered";
  const canCancelOrder = (status) =>
    !isOrderCancelled(status) && !isOrderDelivered(status);

  const getTimelineStepClass = (orderStatus, step) => {
    const status = normalizeStatus(orderStatus);

    if (isOrderCancelled(status)) {
      return "border-stone-300 bg-stone-300 text-stone-500";
    }

    const stepOrder = ["pending", "confirmed", "shipped", "delivered"];
    const currentIndex = stepOrder.indexOf(status);
    const stepIndex = stepOrder.indexOf(step);

    if (currentIndex >= stepIndex) {
      return "border-emerald-600 bg-emerald-600 text-white";
    }

    return "border-stone-300 bg-white text-stone-400";
  };

  const orderSummary = {
    total: orders.length,
    active: orders.filter((order) => !isOrderCancelled(order.status)).length,
    cancelled: orders.filter((order) => isOrderCancelled(order.status)).length,
    paid: orders.filter((order) => normalizeStatus(order.paymentStatus) === "paid")
      .length,
  };

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmCancel) return;

    try {
      const cancelRes = await axios.put(
        `http://localhost:8000/api/orders/${orderId}/cancel`,
        {
          reason: "Cancelled by buyer",
        },
        {
          withCredentials: true,
        },
      );

      alert("Order cancelled successfully");

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: "cancelled",
                paymentStatus:
                  cancelRes.data.order?.paymentStatus || order.paymentStatus,
                refundStatus:
                  cancelRes.data.order?.refundStatus || order.refundStatus,
                razorpayRefundId:
                  cancelRes.data.order?.razorpayRefundId ||
                  order.razorpayRefundId,
                cancelReason:
                  cancelRes.data.order?.cancelReason || order.cancelReason,
                cancelledAt:
                  cancelRes.data.order?.cancelledAt || order.cancelledAt,
              }
            : order,
        ),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel order");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f3ee] pb-14 text-stone-900">
      <Navbar title="My Orders" user={user} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-amber-700">
              Purchase history
            </p>
            <h1 className="mt-1 text-3xl font-bold text-stone-950">
              My Orders
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-600">
              Track your handmade pieces from payment to delivery.
            </p>
          </div>

          <button
            onClick={() => navigate("/buyer/dashboard")}
            className="inline-flex h-11 items-center justify-center rounded-md bg-stone-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-stone-800"
          >
            Continue Shopping
          </button>
        </div>

        {orders.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Total", orderSummary.total],
              ["Active", orderSummary.active],
              ["Paid", orderSummary.paid],
              ["Cancelled", orderSummary.cancelled],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-xs font-bold uppercase text-stone-500">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-bold text-stone-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {orders.length === 0 ? (
          <section className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white px-6 py-14 text-center shadow-sm">
            <div className="max-w-md">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7.5 12 3 4 7.5m16 0-8 4.5m8-4.5v9L12 21m0-9L4 7.5m8 4.5v9M4 7.5v9L12 21"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-stone-950">
                No orders yet
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Your handcrafted finds will appear here once you place an
                order.
              </p>
              <button
                onClick={() => navigate("/buyer/dashboard")}
                className="mt-7 inline-flex h-11 items-center justify-center rounded-md bg-amber-700 px-6 text-sm font-bold text-white transition hover:bg-amber-800"
              >
                Start Shopping
              </button>
            </div>
          </section>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order._id}
                className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
              >
                <div className="border-b border-stone-200 bg-[#fbfaf7] px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {formatLabel(order.status)}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getPaymentStatusColor(
                            order.paymentStatus,
                          )}`}
                        >
                          Payment {formatLabel(order.paymentStatus)}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-bold text-stone-950">
                        Order #{order._id.slice(-10).toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        Placed on {formatDate(order.createdAt)} via{" "}
                        {order.paymentMethod}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-[280px]">
                      <div className="rounded-md border border-stone-200 bg-white px-3 py-2">
                        <p className="text-xs font-bold uppercase text-stone-500">
                          Items
                        </p>
                        <p className="mt-1 font-bold text-stone-950">
                          {order.items.length}
                        </p>
                      </div>
                      <div className="rounded-md border border-stone-200 bg-white px-3 py-2">
                        <p className="text-xs font-bold uppercase text-stone-500">
                          Total
                        </p>
                        <p className="mt-1 font-bold text-stone-950">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_280px]">
                  <div>
                    <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase text-stone-500">
                      <span className="h-px flex-1 bg-stone-200"></span>
                      <span>Items in this order</span>
                      <span className="h-px flex-1 bg-stone-200"></span>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {order.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-100">
                            <img
                              src={item.product?.image}
                              alt={item.product?.name || "Ordered product"}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-bold text-stone-950">
                              {item.product?.name || "Product unavailable"}
                            </h3>
                            <p className="mt-1 text-sm text-stone-500">
                              Sold by{" "}
                              {item.product?.seller?.fullName || "Artisan"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
                              <span className="rounded-md bg-stone-100 px-2.5 py-1">
                                Qty {item.quantity}
                              </span>
                              <span className="rounded-md bg-stone-100 px-2.5 py-1">
                                {formatCurrency(item.price)} each
                              </span>
                            </div>
                          </div>

                          <p className="hidden text-sm font-bold text-stone-950 sm:block">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <aside className="border-t border-stone-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <p className="text-sm font-bold text-stone-950">
                      Order Progress
                    </p>

                    <div className="mt-4 space-y-4">
                      {[
                        ["pending", "Placed"],
                        ["confirmed", "Confirmed"],
                        ["shipped", "Shipped"],
                        ["delivered", "Delivered"],
                      ].map(([step, label], index, steps) => (
                        <div key={step} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${getTimelineStepClass(
                                order.status,
                                step,
                              )}`}
                            >
                              {index + 1}
                            </span>
                            {index < steps.length - 1 && (
                              <span className="mt-1 h-6 w-px bg-stone-200"></span>
                            )}
                          </div>
                          <p className="pt-0.5 text-sm font-medium text-stone-700">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {isOrderCancelled(order.status) && (
                      <div className="mt-5 rounded-md border border-red-100 bg-red-50 px-3 py-3">
                        <p className="text-sm font-bold text-red-700">
                          Order Cancelled
                        </p>
                        {order.paymentStatus === "refunded" ? (
                          <p className="mt-1 text-xs font-medium text-blue-700">
                            Refund processed
                            {order.razorpayRefundId
                              ? ` - ${order.razorpayRefundId}`
                              : ""}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-red-600">
                            No online refund required.
                          </p>
                        )}
                        {order.cancelledAt && (
                          <p className="mt-1 text-xs text-stone-500">
                            Cancelled on {formatDate(order.cancelledAt)}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-2">
                      {isOrderCancelled(order.status) ? (
                        <span className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700">
                          Order Cancelled
                        </span>
                      ) : canCancelOrder(order.status) ? (
                        <button
                          onClick={() => cancelOrder(order._id)}
                          className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition hover:bg-red-50"
                        >
                          Cancel Order
                        </button>
                      ) : (
                        <span className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-700">
                          Order Delivered
                        </span>
                      )}

                      <button
                        onClick={() => navigate("/buyer/dashboard")}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-amber-700 px-4 text-sm font-bold text-white transition hover:bg-amber-800"
                      >
                        Buy Again
                      </button>
                    </div>
                  </aside>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyOrders;
