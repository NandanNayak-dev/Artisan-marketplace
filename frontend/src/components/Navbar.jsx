import { useState } from "react";

function Navbar({ title, user, onLogout }) {
  const [open, setOpen] = useState(false);

  const firstLetter = user?.fullName?.charAt(0).toUpperCase() || "U";

  return (
    <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-amber-700">
          Artisan Marketplace
        </h1>
        <p className="text-sm text-gray-500">{title}</p>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center"
        >
          {firstLetter}
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-56 bg-white border rounded shadow-lg p-4">
            <p className="font-semibold text-gray-800">
              {user?.fullName}
            </p>

            <p className="text-sm text-gray-500 mb-4">
              {user?.email}
            </p>

            <button
              onClick={onLogout}
              className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
