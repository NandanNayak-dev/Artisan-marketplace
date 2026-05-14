import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function SellerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        if (res.data.user.role !== "seller") {
          navigate("/signin");
        }
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
      <h1>Seller Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default SellerDashboard;
