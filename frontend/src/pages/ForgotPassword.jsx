import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const handleSendOtp = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/forgot-password",
        { email },
      );

      alert(res.data.message);
      setStep("otp");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/verify-reset-otp",
        { email, otp },
      );

      alert(res.data.message);
      setStep("reset");
    } catch (error) {
      alert(error.response?.data?.message || "OTP verification failed");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/reset-password",
        {
          email,
          password: passwords.password,
          confirmPassword: passwords.confirmPassword,
        },
      );

      alert(res.data.message);
      navigate("/signin");
    } catch (error) {
      alert(error.response?.data?.message || "Password reset failed");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        {step === "email" && (
          <form onSubmit={handleSendOtp}>
            <h1 className="text-2xl font-bold text-center mb-6">
              Forgot Password
            </h1>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mb-4 px-4 py-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <h1 className="text-2xl font-bold text-center mb-6">
              Enter OTP
            </h1>

            <p className="text-sm text-gray-600 text-center mb-4">
              OTP sent to {email}
            </p>

            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full mb-4 px-4 py-2 border rounded"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
            >
              Verify OTP
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword}>
            <h1 className="text-2xl font-bold text-center mb-6">
              Reset Password
            </h1>

            <input
              type="password"
              placeholder="New password"
              className="w-full mb-4 px-4 py-2 border rounded"
              value={passwords.password}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  password: e.target.value,
                })
              }
            />

            <input
              type="password"
              placeholder="Confirm password"
              className="w-full mb-4 px-4 py-2 border rounded"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  confirmPassword: e.target.value,
                })
              }
            />

            <button
              type="submit"
              className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
