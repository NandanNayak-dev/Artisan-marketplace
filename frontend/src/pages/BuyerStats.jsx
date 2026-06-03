import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function BuyerStats() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBuyerStats = async () => {
      try {
        const userRes = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        const loggedInUser = userRes.data.user;

        if (loggedInUser.role !== "buyer") {
          navigate("/signin");
          return;
        }

        setUser(loggedInUser);

        const statsRes = await axios.get(
          `http://localhost:8000/api/analytics/buyer/${loggedInUser.id}`,
          { withCredentials: true },
        );

        setStats(statsRes.data);
      } catch (error) {
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    loadBuyerStats();
  }, [navigate]);

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

  const statCards = [
    ["Total Orders", stats?.totalOrders || 0],
    ["Total Spent", formatCurrency(stats?.totalSpent || 0)],
    ["Items Bought", stats?.totalItems || 0],
    ["Delivered", stats?.deliveredOrders || 0],
    ["In Progress", (stats?.pendingOrders || 0) + (stats?.confirmedOrders || 0) + (stats?.shippedOrders || 0)],
    ["Cancelled", stats?.cancelledOrders || 0],
  ];

  return (
    <div className="min-h-screen bg-[#f6f3ee] pb-14 text-stone-900">
      <Navbar title="Buyer Stats" user={user} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-amber-700">
              Shopping insights
            </p>
            <h1 className="mt-1 text-3xl font-bold text-stone-950">
              Buyer Stats
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-600">
              See your order activity, spending, favorite categories, and recent purchases.
            </p>
          </div>

          <button
            onClick={() => navigate("/buyer/dashboard")}
            className="inline-flex h-11 items-center justify-center rounded-md bg-stone-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-stone-800"
          >
            Continue Shopping
          </button>
        </div>

        {loading ? (
          <div className="rounded-lg border border-stone-200 bg-white py-20 text-center text-stone-500 shadow-sm">
            Loading buyer stats...
          </div>
        ) : (
          <>
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {statCards.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-bold uppercase text-stone-500">
                    {label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-stone-950">
                    {value}
                  </p>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-stone-950">
                  Monthly Spend
                </h2>

                {(stats?.monthlySpend || []).length === 0 ? (
                  <p className="mt-4 text-sm text-stone-500">
                    No paid orders yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {stats.monthlySpend.map((item) => (
                      <div
                        key={item.month}
                        className="flex items-center justify-between border-b border-stone-100 pb-3"
                      >
                        <p className="font-semibold text-stone-800">
                          {item.month}
                        </p>
                        <p className="font-bold text-amber-900">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-stone-950">
                  Favorite Categories
                </h2>

                {(stats?.favoriteCategories || []).length === 0 ? (
                  <p className="mt-4 text-sm text-stone-500">
                    No category data yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {stats.favoriteCategories.map((item) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between border-b border-stone-100 pb-3"
                      >
                        <div>
                          <p className="font-semibold text-stone-800">
                            {item.category}
                          </p>
                          <p className="text-sm text-stone-500">
                            {item.quantity} items
                          </p>
                        </div>
                        <p className="font-bold text-stone-950">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-stone-950">
                  Recent Orders
                </h2>

                {(stats?.recentOrders || []).length === 0 ? (
                  <p className="mt-4 text-sm text-stone-500">
                    No orders yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {stats.recentOrders.map((order) => (
                      <div
                        key={order.orderId}
                        className="border-b border-stone-100 pb-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-stone-800">
                            #{order.orderId.slice(-8).toUpperCase()}
                          </p>
                          <p className="font-bold text-amber-900">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-stone-500">
                          {order.itemCount} items · {order.status} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default BuyerStats;
