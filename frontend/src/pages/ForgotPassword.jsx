import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

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
        { email }
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
        { email, otp }
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
        }
      );
      alert(res.data.message);
      navigate("/signin");
    } catch (error) {
      alert(error.response?.data?.message || "Password reset failed");
    }
  };

  // Function to go back
  const handleBack = () => {
    if (step === "otp") setStep("email");
    if (step === "reset") setStep("otp");
  };

  return (
    <div className="min-h-screen flex bg-[#FAF9F6]">
      {/* Left Side: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 min-h-screen relative bg-stone-900 items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=2070&auto=format&fit=crop"
          alt="Lock and Craft"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 p-12 text-stone-50 flex flex-col items-center text-center max-w-lg">
          <h1 className="text-4xl font-serif mb-4 leading-tight">
            Secure Your Account
          </h1>
          <p className="text-stone-300 text-lg">
            Reset your password securely to regain access to the artisan marketplace.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 p-8">
          
          {/* Progress Stepper */}
          <div className="flex items-center justify-between mb-8">
            {["Email", "Verify", "Reset"].map((label, index) => {
              const currentStepIndex = ["email", "otp", "reset"].indexOf(step);
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-amber-700 text-white"
                        : "bg-stone-100 text-stone-400"
                    } ${isCurrent ? "ring-4 ring-amber-700/20" : ""}`}
                  >
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div
                      className={`w-12 sm:w-20 h-1 mx-2 transition-all duration-300 ${
                        index < currentStepIndex ? "bg-amber-700" : "bg-stone-200"
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Content Switching */}
          <div className="min-h-[300px]">
            {step === "email" && (
              <form onSubmit={handleSendOtp} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
                  Find Your Account
                </h2>
                <p className="text-stone-500 mb-6 text-sm">
                  Please enter your email address to search for your account.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 outline-none transition-all placeholder:text-stone-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-8 bg-amber-800 text-white font-medium py-3 rounded-lg hover:bg-amber-900 transition-colors shadow-md shadow-amber-900/10"
                >
                  Send OTP
                </button>

                <p className="text-center text-sm mt-6 text-stone-500">
                  Remember password?{" "}
                  <Link to="/signin" className="text-amber-700 font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
                  Verify OTP
                </h2>
                <p className="text-stone-500 mb-6 text-sm">
                  We sent a verification code to <span className="font-medium text-stone-800">{email}</span>. Please enter it below.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      One Time Password
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 123456"
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 outline-none transition-all placeholder:text-stone-400 text-center text-2xl tracking-widest font-mono"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-stone-100 text-stone-700 font-medium py-3 rounded-lg hover:bg-stone-200 transition-colors border border-stone-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-800 text-white font-medium py-3 rounded-lg hover:bg-amber-900 transition-colors shadow-md shadow-amber-900/10"
                  >
                    Verify
                  </button>
                </div>
                
                <p className="text-center text-sm mt-6 text-stone-500">
                    Didn't receive code?{" "}
                    <button type="button" onClick={handleSendOtp} className="text-amber-700 font-medium hover:underline">
                        Resend
                    </button>
                </p>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
                  Set New Password
                </h2>
                <p className="text-stone-500 mb-6 text-sm">
                  Your identity has been verified. Please set a new password.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 outline-none transition-all"
                      value={passwords.password}
                      onChange={(e) =>
                        setPasswords({ ...passwords, password: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 outline-none transition-all"
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                   <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-stone-100 text-stone-700 font-medium py-3 rounded-lg hover:bg-stone-200 transition-colors border border-stone-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-800 text-white font-medium py-3 rounded-lg hover:bg-amber-900 transition-colors shadow-md shadow-amber-900/10"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
