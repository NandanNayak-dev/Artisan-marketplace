import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function SellerOrders() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const fetchSellerOrders = async (sellerId) => {
    const res = await axios.get(
      `http://localhost:8000/api/orders/seller/${sellerId}`,
      {
        withCredentials: true,
      }
    );

    setOrders(res.data.orders);
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const userRes = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        setUser(userRes.data.user);
        await fetchSellerOrders(userRes.data.user.id);
      } catch (error) {
        console.log(error);
      }
    };

    loadOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(
        `http://localhost:8000/api/orders/${orderId}/status`,
        { status },
        { withCredentials: true }
      );

      fetchSellerOrders(user.id);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar title="Seller Orders" user={user} />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-amber-700 mb-6">
          Seller Orders
        </h1>

        {orders.length === 0 ? (
          <p className="text-gray-600">No orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded shadow p-5">
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="font-semibold">Order ID: {order._id}</p>
                    <p className="text-sm text-gray-600">
                      Buyer: {order.buyer?.fullName}
                    </p>
                  </div>

                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>

                {order.items
                  .filter((item) => item.seller === user?.id)
                  .map((item) => (
                    <div
                      key={item._id}
                      className="flex gap-4 border-t py-4 items-center"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />

                      <div className="flex-1">
                        <h2 className="font-bold">{item.product.name}</h2>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-gray-600">Price: ₹{item.price}</p>
                      </div>

                      <p className="font-semibold">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerOrders;