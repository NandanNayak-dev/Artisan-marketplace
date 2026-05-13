import React from "react";
import { useState } from "react";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "buyer",
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
        "http://localhost:8000/api/auth/signup",
        formData,
      );

      console.log(res.data);

      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "buyer",
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const idToken = await result.user.getIdToken();

      const res = await axios.post(
        "http://localhost:8000/api/auth/google",
        {
          idToken,
          role: formData.role,
        },
        {
          withCredentials: true,
        },
      );

      console.log(res.data);
      alert("Google signup successful");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Google signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="w-full max-w-md bg-white p-8 rounded shadow"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full mb-4 px-4 py-2 border rounded"
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded"
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded"
        />

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "buyer" })}
            className={`py-2 border rounded ${
              formData.role === "buyer"
                ? "bg-amber-700 text-white border-amber-700"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Buyer
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "seller" })}
            className={`py-2 border rounded ${
              formData.role === "seller"
                ? "bg-amber-700 text-white border-amber-700"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Seller
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full mt-4 border py-2 rounded hover:bg-gray-50"
        >
          Continue with Google
        </button>
        <p className="text-center text-sm mt-4">  
          Already have an account?{" "}
          <a href="/login" className="text-amber-700 hover:underline">
            Log in
          </a>
        </p>
      </form>
      
    </div>
  );
}

export default SignUp;
