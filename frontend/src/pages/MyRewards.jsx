import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:8000/api";

function MyRewards() {
  const [user, setUser] = useState(null);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const loadRewards = async () => {
      const userRes = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true,
      });
      setUser(userRes.data.user);

      const couponRes = await axios.get(`${API_URL}/coupons/my-coupons`, {
        withCredentials: true,
      });
      setCoupons(couponRes.data);
    };

    loadRewards().catch(() => {
      setCoupons([]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar title="My Rewards" user={user} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
            Discount Tokens
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900">
            My Rewards
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Use these tokens during checkout to get 10% off your next order.
          </p>
        </div>

        {coupons.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">
            No active discount tokens available.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                  10% Off
                </p>
                <h2 className="mt-2 text-2xl font-bold text-stone-900">
                  {coupon.code}
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Valid till {new Date(coupon.expiresAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyRewards;
