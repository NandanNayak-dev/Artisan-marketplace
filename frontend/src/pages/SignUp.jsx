import React from 'react'
import { useState } from 'react';
import axios from 'axios';

function SignUp() {
  const[formData,setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })

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
        'http://localhost:8000/api/auth/signup',
        formData
      );

      console.log(res.data);

      setFormData({
        fullName: '',
        email: '',
        password: '',
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="w-full max-w-md bg-white p-8 rounded shadow" onSubmit={handleSubmit}>
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
        

        <button type='submit' className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800">
          Sign Up
        </button>
      </form>
    </div>
  )
}

export default SignUp