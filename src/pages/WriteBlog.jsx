import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getCurrentUser } from '../utils/auth.js';
import { getPosts, createPost, updatePost } from '../utils/storage.js';

/**
 * Blog post creation and editing form page.
 * At '/blog/new' creates a new post; at '/blog/:id/edit' edits an existing post.
 * Form with title and content fields, validation (both required), character counter for content,
 * and cancel button. Ownership enforcement: users can only edit their own posts, admin can edit any.
 * Saves to localStorage via storage.js. Redirects to '/blogs' on success.
 * @returns {JSX.Element}
 */
function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const allPosts = getPosts();
      const post = allPosts.find((p) => p.id === id);

      if (!post) {
        setError('Post not found');
        return;
      }

      const canEdit =
        currentUser &&
        (currentUser.role === 'admin' || currentUser.userId === post.authorId);

      if (!canEdit) {
        navigate('/blogs', { replace: true });
        return;
      }

      setTitle(post.title);
      setContent(post.content);
    }
  }, [id, isEditing, currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        const result = updatePost({
          id,
          title: title.trim(),
          content: content.trim(),
        });

        if (result.success) {
          navigate('/blogs', { replace: true });
        } else {
          setError(result.error || 'Failed to update post');
        }
      } else {
        const result = createPost({
          title: title.trim(),
          content: content.trim(),
          authorId: currentUser.userId,
          authorName: currentUser.displayName,
        });

        if (result.success) {
          navigate('/blogs', { replace: true });
        } else {
          setError(result.error || 'Failed to create post');
        }
      }
    } catch (err) {
      console.error('Save post error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/blogs');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Post' : 'Write a New Post'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEditing
              ? 'Update your post below'
              : 'Share your thoughts with the community'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your post title"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  Content
                </label>
                <span className="text-xs text-gray-400">
                  {content.length} characters
                </span>
              </div>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                rows={12}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors resize-y"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`text-sm font-medium text-white px-6 py-2.5 rounded-lg shadow-sm transition-colors ${
                  loading
                    ? 'bg-violet-400 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700'
                }`}
              >
                {loading
                  ? isEditing
                    ? 'Saving…'
                    : 'Publishing…'
                  : isEditing
                    ? 'Save Changes'
                    : 'Publish Post'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-6 py-2.5 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default WriteBlog;