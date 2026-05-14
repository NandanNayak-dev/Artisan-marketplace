import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function BuyerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        if (res.data.user.role !== "buyer") {
          navigate("/signin");
        }
        setUser(res.data.user);
      } catch (error) {
        navigate("/signin");
      }
    };

    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );
      navigate("/signin");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      <h1>Buyer Dashboard</h1>
      <p>Welcome, {user?.fullName}</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default BuyerDashboard;
