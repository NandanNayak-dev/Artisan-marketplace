import React, { useState } from "react";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";

function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/signin",
        formData,
        {
          withCredentials: true,
        }
      );

      console.log(res.data);
      if (res.data.user.role === "buyer") {
        navigate("/buyer/dashboard");
      } else {
        navigate("/seller/dashboard");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login failed");
    }
    setFormData({
      email: "",
      password: "",
    });
  };

  const handleGoogleSignin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await axios.post(
        "http://localhost:8000/api/auth/google/signin",
        {
          idToken,
        },
        {
          withCredentials: true,
        }
      );

      console.log(res.data);
      if (res.data.user.role === "buyer") {
        navigate("/buyer/dashboard");
      } else {
        navigate("/seller/dashboard");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Google signin failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF9F6]">
      {/* Left Side - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-stone-900 items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop"
          alt="Handwoven artisan textiles"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 p-12 text-stone-50 flex flex-col items-center text-center max-w-lg">
          <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight tracking-wide">
            Welcome Back to the Workshop.
          </h1>
          <p className="text-stone-300 text-lg">
            Pick up right where you left off. The marketplace awaits.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <form
          className="w-full max-w-md"
          onSubmit={handleSubmit}
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-serif text-stone-800 mb-2">Sign In</h2>
            <p className="text-stone-500">Access your artisan or shopper account</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                required
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 outline-none transition-all placeholder:text-stone-400"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-stone-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-amber-800 hover:text-amber-900 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 outline-none transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-amber-800 text-white font-medium py-3 rounded-lg hover:bg-amber-900 transition-colors shadow-md shadow-amber-900/10"
          >
            Enter Marketplace
          </button>

          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-stone-300"></div>
            <span className="flex-shrink-0 mx-4 text-stone-400 text-sm">or</span>
            <div className="flex-grow border-t border-stone-300"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 text-stone-700 font-medium py-3 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm mt-8 text-stone-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-amber-800 font-medium hover:underline">
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
