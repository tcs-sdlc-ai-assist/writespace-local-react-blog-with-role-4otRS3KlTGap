import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getAvatar } from '../components/Avatar.jsx';
import { getCurrentUser } from '../utils/auth.js';
import { getPosts, deletePost } from '../utils/storage.js';

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
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return isoString;
  }
}

/**
 * Full blog post reader page.
 * Displays title, author name, avatar, creation date, and full content.
 * Edit button links to '/blog/:id/edit', delete button removes post from localStorage.
 * Buttons visible per role/ownership: admin sees both on all posts, users see both only on their own.
 * Handles invalid/missing IDs with error message. Protected route.
 * @returns {JSX.Element}
 */
function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('No post ID provided');
      return;
    }

    const allPosts = getPosts();
    const found = allPosts.find((p) => p.id === id);

    if (!found) {
      setError('Post not found');
      return;
    }

    setPost(found);
  }, [id]);

  const authorRole = post && post.authorId === 'admin' ? 'admin' : 'user';

  const canEditOrDelete =
    post &&
    currentUser &&
    (currentUser.role === 'admin' || currentUser.userId === post.authorId);

  const handleDeleteClick = () => {
    setConfirmingDelete(true);
  };

  const handleConfirmDelete = () => {
    setConfirmingDelete(false);
    try {
      const result = deletePost(post.id);
      if (result.success) {
        navigate('/blogs', { replace: true });
      } else {
        setError(result.error || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Delete post error:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {error ? (
          <div className="text-center py-20">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-3xl mb-5">
              ⚠️
            </span>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{error}</h2>
            <p className="text-sm text-gray-500 mb-6">
              The post you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              to="/blogs"
              className="inline-block text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors px-6 py-2.5 rounded-lg shadow-sm"
            >
              Back to Blogs
            </Link>
          </div>
        ) : post ? (
          <article>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getAvatar(authorRole)}
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      {post.authorName}
                    </span>
                    <p className="text-xs text-gray-400">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>
                {canEditOrDelete && (
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/blog/${post.id}/edit`}
                      className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors px-4 py-2 rounded-lg hover:bg-violet-50 border border-violet-200"
                    >
                      Edit
                    </Link>
                    {confirmingDelete ? (
                      <>
                        <button
                          type="button"
                          onClick={handleConfirmDelete}
                          className="text-sm font-medium px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelDelete}
                          className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDeleteClick}
                        className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors px-4 py-2 rounded-lg hover:bg-rose-50 border border-rose-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {post.title}
              </h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/blogs"
                className="text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors"
              >
                ← Back to all posts
              </Link>
            </div>
          </article>
        ) : null}
      </main>
    </div>
  );
}

export default ReadBlog;