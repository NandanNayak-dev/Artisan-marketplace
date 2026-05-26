import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Navbar({ title, user }) {
  const [open, setOpen] = useState(false);

  const firstLetter = user?.fullName?.charAt(0).toUpperCase() || "U";
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );

      navigate("/signin");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#FAF9F6]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link to="/buyer/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-700 rounded flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <span className="text-xl font-bold text-stone-800 hidden sm:block">
              Artisan<span className="text-amber-700">.</span>
            </span>
          </Link>

          <div className="leading-tight">
            <div className="mt-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
                {title}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="group flex items-center gap-3 rounded-full border border-stone-200 bg-white/90 px-2.5 py-2 pr-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-700/20"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-700 to-orange-900 text-sm font-bold text-white ring-2 ring-white/80">
              {firstLetter}
            </span>

            <div className="hidden text-left leading-tight sm:block">
              <p className="max-w-[140px] truncate text-sm font-semibold text-stone-800">
                {user?.fullName || "User"}
              </p>
              <p className="text-xs text-stone-500">Account</p>
            </div>

            <svg
              className={`h-4 w-4 text-stone-400 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.18l3.71-3.95a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-200/60 ring-1 ring-black/5">
              <div className="border-b border-stone-100 bg-gradient-to-r from-stone-50 to-amber-50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-700 to-orange-900 text-base font-bold text-white ring-2 ring-white">
                    {firstLetter}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {user?.fullName}
                    </p>
                    <p className="truncate text-sm text-stone-500">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-amber-900 hover:shadow-md"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M21 3v18" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
