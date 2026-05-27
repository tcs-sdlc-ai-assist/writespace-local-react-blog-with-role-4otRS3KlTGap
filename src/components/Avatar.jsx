import PropTypes from 'prop-types';

/**
 * Returns a role-distinct avatar JSX element.
 * @param {'admin' | 'user'} role - The role to render an avatar for
 * @returns {JSX.Element} A styled avatar element
 */
export function getAvatar(role) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-500 text-white text-sm">
        👑
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-sm">
      📖
    </span>
  );
}

/**
 * Avatar component that renders a role-distinct visual indicator.
 * @param {object} props
 * @param {'admin' | 'user'} props.role - The user role
 * @returns {JSX.Element}
 */
function Avatar({ role }) {
  return getAvatar(role);
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
};

export default Avatar;