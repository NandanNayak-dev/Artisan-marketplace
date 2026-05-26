import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function MyOrders() {
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
          }
        );

        setOrders(orderRes.data.orders);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar title="My Orders" user={user} />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-amber-700 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <p className="text-gray-600">No orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded shadow p-5">
                <div className="flex justify-between mb-4">
                  <p className="font-semibold">Order ID: {order._id}</p>
                  <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded">
                    {order.status}
                  </span>
                </div>

                {order.items.map((item) => (
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

                <div className="text-right font-bold text-lg mt-4">
                  Total: ₹{order.totalAmount}
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