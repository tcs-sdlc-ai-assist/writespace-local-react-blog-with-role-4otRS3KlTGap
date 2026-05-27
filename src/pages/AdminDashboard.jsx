import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
import { getAvatar } from '../components/Avatar.jsx';
import { getCurrentUser } from '../utils/auth.js';
import { getPosts, getUsers, deletePost } from '../utils/storage.js';

/**
 * Formats an ISO date string into a human-readable format.
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Formatted date string
 */
function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return isoString;
  }
}

/**
 * Truncates a string to the specified maximum length, appending ellipsis if needed.
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum character length
 * @returns {string} The truncated text
 */
function truncate(text, maxLength = 80) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}

/**
 * Admin-only dashboard page at '/admin'.
 * Displays gradient header, four stat cards (total posts, total users, admin count, user count),
 * quick action buttons (Write Post, Manage Users), and recent posts list with edit/delete actions.
 * Data sourced from localStorage. Non-admins are redirected to '/blogs'.
 * @returns {JSX.Element}
 */
function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/blogs', { replace: true });
      return;
    }

    setPosts(getPosts());
    setUsers(getUsers());
  }, [currentUser, navigate]);

  const totalPosts = posts.length;
  const totalUsers = users.length + 1; // +1 for hard-coded admin
  const adminCount = users.filter((u) => u.role === 'admin').length + 1; // +1 for hard-coded admin
  const userCount = users.filter((u) => u.role === 'user').length;

  const recentPosts = posts.slice(0, 5);

  const handleDeleteClick = (postId) => {
    setConfirmingDeleteId(postId);
  };

  const handleConfirmDelete = (postId) => {
    setConfirmingDeleteId(null);
    try {
      const result = deletePost(postId);
      if (result.success) {
        setPosts(getPosts());
      }
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  const handleCancelDelete = () => {
    setConfirmingDeleteId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Gradient Header */}
      <section className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-2">
            {getAvatar('admin')}
            <h1 className="text-2xl sm:text-3xl font-bold">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-violet-100 text-sm sm:text-base">
            Welcome back, {currentUser ? currentUser.displayName : 'Admin'}. Here&apos;s an overview of your platform.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Posts"
            value={totalPosts}
            icon="📝"
            color="violet"
          />
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon="👥"
            color="indigo"
          />
          <StatCard
            title="Admins"
            value={adminCount}
            icon="👑"
            color="amber"
          />
          <StatCard
            title="Users"
            value={userCount}
            icon="📖"
            color="emerald"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/blog/new"
              className="text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors px-5 py-2.5 rounded-lg shadow-sm"
            >
              ✍️ Write Post
            </Link>
            <Link
              to="/admin/users"
              className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors px-5 py-2.5 rounded-lg border border-violet-200 hover:border-violet-300 hover:bg-violet-50"
            >
              👥 Manage Users
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Posts
            </h2>
            <Link
              to="/blogs"
              className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              View All →
            </Link>
          </div>

          {recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post) => {
                const authorRole = post.authorId === 'admin' ? 'admin' : 'user';

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {getAvatar(authorRole)}
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/blog/${post.id}`}
                          className="text-sm font-bold text-gray-900 hover:text-violet-600 transition-colors block truncate"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {post.authorName} · {formatDate(post.createdAt)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                          {truncate(post.content)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {confirmingDeleteId === post.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(post.id)}
                            className="text-xs font-medium px-3 py-1.5 rounded bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelDelete}
                            className="text-xs font-medium px-3 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to={`/blog/${post.id}/edit`}
                            className="text-xs font-medium px-3 py-1.5 rounded bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
                            title="Edit post"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(post.id)}
                            className="text-xs font-medium px-3 py-1.5 rounded bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                            title="Delete post"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-100 text-2xl mb-4">
                📝
              </span>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                No posts yet
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Create the first post to get started.
              </p>
              <Link
                to="/blog/new"
                className="inline-block text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors px-5 py-2.5 rounded-lg shadow-sm"
              >
                Create Post
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;