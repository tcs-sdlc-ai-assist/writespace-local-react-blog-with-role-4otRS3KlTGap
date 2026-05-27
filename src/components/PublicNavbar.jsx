import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Navigation bar for unauthenticated (guest) users.
 * Displays app name/logo, 'Login' and 'Get Started' buttons linking to '/login' and '/register'.
 * Responsive with mobile menu toggle.
 * @returns {JSX.Element}
 */
function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-violet-600 hover:text-violet-700 transition-colors"
            >
              ✍️ WriteSpace
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors px-4 py-2 rounded-lg shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-violet-600 hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors px-3 py-2 rounded-lg text-center shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default PublicNavbar;