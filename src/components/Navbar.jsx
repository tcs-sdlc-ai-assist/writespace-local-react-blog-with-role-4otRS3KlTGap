import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

/**
 * Navigation bar for authenticated users.
 * Displays app name, navigation links (Blogs, Write), admin-only links (Dashboard, Users),
 * user avatar via getAvatar, display name, and logout button.
 * Responsive with mobile menu. Adapts links based on user role.
 * @returns {JSX.Element}
 */
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const isAdmin = currentUser && currentUser.role === 'admin';

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link
              to="/blogs"
              className="text-xl font-bold text-violet-600 hover:text-violet-700 transition-colors"
            >
              ✍️ WriteSpace
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/blogs"
                className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                Blogs
              </Link>
              <Link
                to="/blog/new"
                className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                Write
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Users
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Desktop user section */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser && (
              <>
                {getAvatar(currentUser.role)}
                <span className="text-sm font-medium text-gray-700">
                  {currentUser.displayName}
                </span>
              </>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Logout
            </button>
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
            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-2">
                {getAvatar(currentUser.role)}
                <span className="text-sm font-medium text-gray-700">
                  {currentUser.displayName}
                </span>
              </div>
            )}
            <Link
              to="/blogs"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              Blogs
            </Link>
            <Link
              to="/blog/new"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              Write
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  Users
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;