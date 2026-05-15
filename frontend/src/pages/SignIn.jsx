import React from "react";
import { useState } from "react";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { useNavigate } from "react-router-dom";

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
        },
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
        },
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="w-full max-w-md bg-white p-8 rounded shadow"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={handleGoogleSignin}
          className="w-full mt-4 border py-2 rounded hover:bg-gray-50"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-amber-700 hover:underline">
            Sign Up
          </a>
        </p>

        <a
          href="/forgot-password"
          className="text-sm text-amber-700 hover:underline text-right block mt-4"
        >
          Forgot password?
        </a>
      </form>
    </div>
  );
}

export default SignIn;
