import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import UserRow from '../components/UserRow.jsx';
import { getCurrentUser } from '../utils/auth.js';
import { getUsers, createUser, deleteUser } from '../utils/storage.js';

/**
 * Admin-only user management page at '/admin/users'.
 * Features create user form (display name, username, password, role dropdown for admin/user),
 * username uniqueness validation. Displays all users in responsive cards using UserRow.
 * Delete button disabled for hard-coded admin and self. Confirmation dialog before deletion.
 * Data sourced from localStorage. Non-admins are redirected to '/blogs'.
 * @returns {JSX.Element}
 */
function UserManagement() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [users, setUsers] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/blogs', { replace: true });
      return;
    }

    setUsers(getUsers());
  }, [currentUser, navigate]);

  const handleCreateUser = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!displayName.trim() || !username.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    if (username.trim() === 'admin') {
      setError('Username "admin" is reserved');
      return;
    }

    const existingUsers = getUsers();
    if (existingUsers.some((u) => u.username === username.trim())) {
      setError('Username already exists');
      return;
    }

    setLoading(true);

    try {
      const result = createUser({
        displayName: displayName.trim(),
        username: username.trim(),
        password,
        role,
      });

      if (result.success) {
        setSuccess(`User "${result.user.displayName}" created successfully`);
        setDisplayName('');
        setUsername('');
        setPassword('');
        setRole('user');
        setUsers(getUsers());
      } else {
        setError(result.error || 'Failed to create user');
      }
    } catch (err) {
      console.error('Create user error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    setError('');
    setSuccess('');

    try {
      const result = deleteUser(userId);
      if (result.success) {
        setSuccess('User deleted successfully');
        setUsers(getUsers());
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      setError('An unexpected error occurred');
    }
  };

  const hardCodedAdmin = {
    id: 'admin',
    displayName: 'Admin',
    username: 'admin',
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  const allUsers = [hardCodedAdmin, ...users];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Gradient Header */}
      <section className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            👥 User Management
          </h1>
          <p className="text-violet-100 text-sm sm:text-base">
            Create, view, and manage platform users.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create User Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Create New User
              </h2>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors bg-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-sm font-medium text-white py-2.5 rounded-lg shadow-sm transition-colors ${
                    loading
                      ? 'bg-violet-400 cursor-not-allowed'
                      : 'bg-violet-600 hover:bg-violet-700'
                  }`}
                >
                  {loading ? 'Creating…' : 'Create User'}
                </button>
              </form>
            </div>
          </div>

          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                All Users ({allUsers.length})
              </h2>
            </div>

            {allUsers.length > 0 ? (
              <div className="space-y-3">
                {allUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-100 text-2xl mb-4">
                  👥
                </span>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  No users yet
                </h3>
                <p className="text-xs text-gray-500">
                  Create the first user using the form.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserManagement;