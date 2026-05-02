import React from 'react'

function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded"
        />

        <button className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800">
          Sign In
        </button>

        <p className="text-center text-sm mt-4">
          Don't have an account?{' '}
          <a href="/signup" className="text-amber-700 hover:underline">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  )
}

export default SignIn
