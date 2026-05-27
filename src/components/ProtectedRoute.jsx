import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isAuthenticated, getCurrentUser } from '../utils/auth.js';

/**
 * Route guard component that checks authentication and role.
 * Redirects unauthenticated users to '/login'.
 * For admin-only routes (adminOnly prop), redirects non-admins to '/blogs'.
 * Renders children if authorized.
 * @param {object} props
 * @param {React.ReactNode} props.children - The child elements to render if authorized
 * @param {boolean} [props.adminOnly] - Whether the route requires admin role
 * @returns {JSX.Element}
 */
function ProtectedRoute({ children, adminOnly }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      return <Navigate to="/blogs" replace />;
    }
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  adminOnly: PropTypes.bool,
};

ProtectedRoute.defaultProps = {
  adminOnly: false,
};

export default ProtectedRoute;