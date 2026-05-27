import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth.js';
import { getPosts } from '../utils/storage.js';
import Navbar from '../components/Navbar.jsx';
import PublicNavbar from '../components/PublicNavbar.jsx';
import BlogCard from '../components/BlogCard.jsx';

/**
 * Public landing page component.
 * Displays hero section, features section, latest posts preview, and footer.
 * Shows PublicNavbar for guests, Navbar for authenticated users.
 * @returns {JSX.Element}
 */
function LandingPage() {
  const authenticated = isAuthenticated();
  const posts = getPosts().slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {authenticated ? <Navbar /> : <PublicNavbar />}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            ✍️ WriteSpace
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-violet-100 max-w-2xl mx-auto mb-10">
            A clean, minimal space to write, share, and discover blog posts. Express your ideas with the world.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {authenticated ? (
              <>
                <Link
                  to="/blogs"
                  className="inline-block text-sm font-medium bg-white text-violet-700 hover:bg-gray-100 transition-colors px-8 py-3 rounded-lg shadow-sm"
                >
                  Browse Blogs
                </Link>
                <Link
                  to="/blog/new"
                  className="inline-block text-sm font-medium bg-violet-500 text-white hover:bg-violet-400 transition-colors px-8 py-3 rounded-lg shadow-sm border border-violet-400"
                >
                  Start Writing
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-block text-sm font-medium bg-white text-violet-700 hover:bg-gray-100 transition-colors px-8 py-3 rounded-lg shadow-sm"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="inline-block text-sm font-medium bg-violet-500 text-white hover:bg-violet-400 transition-colors px-8 py-3 rounded-lg shadow-sm border border-violet-400"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Why WriteSpace?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Everything you need to start sharing your thoughts, all in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8 text-center">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-100 text-2xl mb-5">
              📝
            </span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Writing</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              A distraction-free editor that lets you focus on what matters most — your words.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8 text-center">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 text-2xl mb-5">
              🌍
            </span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Share Instantly</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Publish your posts and share them with the community in just a few clicks.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8 text-center">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-2xl mb-5">
              🔒
            </span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Role-Based Access</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Admins manage everything while users own their content. Simple and secure.
            </p>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Latest Posts
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Check out what the community has been writing about recently.
            </p>
          </div>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">
                No posts yet. Be the first to write something!
              </p>
            </div>
          )}
          <div className="text-center mt-10">
            <Link
              to={authenticated ? '/blogs' : '/register'}
              className="inline-block text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors px-6 py-2 rounded-lg border border-violet-200 hover:border-violet-300 hover:bg-violet-50"
            >
              {authenticated ? 'View All Posts' : 'Join to Start Writing'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-lg font-bold text-white">✍️ WriteSpace</span>
              <p className="text-sm mt-1">A minimal blogging platform for everyone.</p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="text-sm hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                to={authenticated ? '/blogs' : '/login'}
                className="text-sm hover:text-white transition-colors"
              >
                Blogs
              </Link>
              <Link
                to={authenticated ? '/blog/new' : '/register'}
                className="text-sm hover:text-white transition-colors"
              >
                Write
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} WriteSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;