import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function SellerStats() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSellerStats = async () => {
      try {
        const userRes = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        const loggedInUser = userRes.data.user;

        if (loggedInUser.role !== "seller") {
          navigate("/signin");
          return;
        }

        setUser(loggedInUser);

        const statsRes = await axios.get(
          `http://localhost:8000/api/analytics/seller/${loggedInUser.id}`,
          { withCredentials: true },
        );

        setStats(statsRes.data);
      } catch (error) {
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    loadSellerStats();
  }, [navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const statCards = [
    ["Total Revenue", formatCurrency(stats?.totalRevenue || 0)],
    ["Total Orders", stats?.totalOrders || 0],
    ["Pending", stats?.pendingOrders || 0],
    ["Shipped", stats?.shippedOrders || 0],
    ["Delivered", stats?.deliveredOrders || 0],
    ["Cancelled", stats?.cancelledOrders || 0],
  ];

  return (
    <div className="min-h-screen bg-[#f6f3ee] pb-14 text-stone-900">
      <Navbar title="Seller Stats" user={user} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-amber-700">
              Store insights
            </p>
            <h1 className="mt-1 text-3xl font-bold text-stone-950">
              Seller Stats
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-600">
              Track sales, order status, best-selling products, monthly revenue, and low stock items.
            </p>
          </div>

          <button
            onClick={() => navigate("/seller/dashboard")}
            className="inline-flex h-11 items-center justify-center rounded-md bg-stone-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-stone-800"
          >
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="rounded-lg border border-stone-200 bg-white py-20 text-center text-stone-500 shadow-sm">
            Loading seller stats...
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
                  Best Selling Products
                </h2>

                {(stats?.bestSellingProducts || []).length === 0 ? (
                  <p className="mt-4 text-sm text-stone-500">
                    No sales data yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {stats.bestSellingProducts.map((product) => (
                      <div
                        key={product.productId}
                        className="flex items-center justify-between border-b border-stone-100 pb-3"
                      >
                        <div>
                          <p className="font-semibold text-stone-800">
                            {product.name}
                          </p>
                          <p className="text-sm text-stone-500">
                            Sold: {product.quantitySold}
                          </p>
                        </div>
                        <p className="font-bold text-amber-900">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-stone-950">
                  Monthly Sales
                </h2>

                {(stats?.monthlySales || []).length === 0 ? (
                  <p className="mt-4 text-sm text-stone-500">
                    No monthly sales yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {stats.monthlySales.map((item) => (
                      <div
                        key={item.month}
                        className="flex items-center justify-between border-b border-stone-100 pb-3"
                      >
                        <p className="font-semibold text-stone-800">
                          {item.month}
                        </p>
                        <p className="font-bold text-emerald-700">
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-stone-950">
                  Low Stock Products
                </h2>

                {(stats?.lowStockProducts || []).length === 0 ? (
                  <p className="mt-4 text-sm text-stone-500">
                    No low stock products.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {stats.lowStockProducts.map((product) => (
                      <div
                        key={product.productId}
                        className="flex items-center justify-between border-b border-stone-100 pb-3"
                      >
                        <div>
                          <p className="font-semibold text-stone-800">
                            {product.name}
                          </p>
                          <p className="text-sm text-red-600">
                            Only {product.stock} left
                          </p>
                        </div>
                        <p className="font-bold text-stone-950">
                          {formatCurrency(product.price)}
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

export default SellerStats;
