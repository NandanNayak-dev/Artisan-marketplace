import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });
        if (res.data.user.role !== "seller") {
          navigate("/signin");
          return;
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
      await axios.post("http://localhost:8000/api/auth/logout",
        {},
        {
          withCredentials: true
        }
      );
      navigate("/signin");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      <Navbar title="Seller Dashboard" user={user} onLogout={handleLogout} />
      <h1 className="text-2xl font-bold mt-6">Welcome, {user?.fullName}</h1>
    </div>
  );
}

export default SellerDashboard;
