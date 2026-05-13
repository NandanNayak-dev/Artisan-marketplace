import axios from "axios";
import { useNavigate } from "react-router-dom";
function BuyerDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8000/api/auth/logout", {
        withCredentials: true
      });
      navigate("/signin");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      <h1>Buyer Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default BuyerDashboard;
