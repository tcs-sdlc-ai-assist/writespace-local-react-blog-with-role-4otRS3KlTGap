import PropTypes from 'prop-types';
import { useState } from 'react';
import { getAvatar } from './Avatar.jsx';
import { getCurrentUser } from '../utils/auth.js';

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
 * User row/card component for the user management table.
 * Displays user avatar, display name, username, role badge, creation date, and delete button.
 * Delete button is disabled for the hard-coded admin and the current user (self).
 * Confirmation required before deletion.
 * @param {object} props
 * @param {object} props.user - The user object
 * @param {string} props.user.id - User ID
 * @param {string} props.user.displayName - User display name
 * @param {string} props.user.username - Username
 * @param {string} props.user.role - User role ('admin' or 'user')
 * @param {string} props.user.createdAt - ISO date string
 * @param {function} props.onDelete - Callback invoked with user ID when delete is confirmed
 * @returns {JSX.Element}
 */
function UserRow({ user, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  const currentUser = getCurrentUser();
  const isHardCodedAdmin = user.username === 'admin';
  const isSelf = currentUser && currentUser.userId === user.id;
  const deleteDisabled = isHardCodedAdmin || isSelf;

  const handleDeleteClick = () => {
    if (deleteDisabled) return;
    setConfirming(true);
  };

  const handleConfirm = () => {
    setConfirming(false);
    onDelete(user.id);
  };

  const handleCancel = () => {
    setConfirming(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {getAvatar(user.role)}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              {user.displayName}
            </span>
            <span
              className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                user.role === 'admin'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {user.role}
            </span>
          </div>
          <p className="text-xs text-gray-500">@{user.username}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Joined {formatDate(user.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {confirming ? (
          <>
            <button
              type="button"
              onClick={handleConfirm}
              className="text-xs font-medium px-3 py-1.5 rounded bg-rose-500 text-white hover:bg-rose-600 transition-colors"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs font-medium px-3 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={deleteDisabled}
            title={
              isHardCodedAdmin
                ? 'Cannot delete the admin account'
                : isSelf
                  ? 'Cannot delete your own account'
                  : 'Delete user'
            }
            className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${
              deleteDisabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
            }`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default UserRow;