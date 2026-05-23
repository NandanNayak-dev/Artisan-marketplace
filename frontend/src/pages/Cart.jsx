import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Cart() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);

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

  return (
    <div>
      <Navbar />
      <h1>Cart</h1>
      <ul>
        {cartItems.map((item) => (
          <li key={item._id}>
            {item.product.name} - Quantity: {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Cart;
