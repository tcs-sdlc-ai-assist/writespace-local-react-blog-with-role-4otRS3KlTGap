import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAvatar } from './Avatar.jsx';
import { getCurrentUser } from '../utils/auth.js';

/**
 * Truncates a string to the specified maximum length, appending ellipsis if needed.
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum character length
 * @returns {string} The truncated text
 */
function truncate(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}

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
 * Blog post preview card component.
 * Displays title, excerpt, date, author name, avatar, and conditional edit icon.
 * Edit icon shows for admin on all posts, for users only on their own posts.
 * Links to '/blog/:id' for reading.
 * @param {object} props
 * @param {object} props.post - The blog post object
 * @param {string} props.post.id - Post ID
 * @param {string} props.post.title - Post title
 * @param {string} props.post.content - Post content
 * @param {string} props.post.createdAt - ISO date string
 * @param {string} props.post.authorId - Author user ID
 * @param {string} props.post.authorName - Author display name
 * @returns {JSX.Element}
 */
function BlogCard({ post }) {
  const currentUser = getCurrentUser();
  const authorRole = post.authorId === 'admin' ? 'admin' : 'user';

  const canEdit =
    currentUser &&
    (currentUser.role === 'admin' || currentUser.userId === post.authorId);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getAvatar(authorRole)}
            <span className="text-sm font-medium text-gray-700">
              {post.authorName}
            </span>
          </div>
          {canEdit && (
            <Link
              to={`/blog/${post.id}/edit`}
              className="text-gray-400 hover:text-violet-600 transition-colors"
              title="Edit post"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </Link>
          )}
        </div>
        <Link to={`/blog/${post.id}`} className="block group">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-violet-600 transition-colors mb-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {truncate(post.content)}
          </p>
        </Link>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
      </div>
    </div>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    authorId: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
  }).isRequired,
};

export default BlogCard;