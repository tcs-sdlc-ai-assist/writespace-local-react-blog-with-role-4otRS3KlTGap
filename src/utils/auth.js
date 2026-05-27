import { getUsers, getSession, setSession, clearSession } from './storage.js';

/**
 * Attempts to log in a user with the given credentials.
 * Validates against the hard-coded admin account ('admin'/'admin') and localStorage users.
 * @param {string} username - The username to authenticate
 * @param {string} password - The password to authenticate
 * @returns {{success: boolean, session?: {userId: string, username: string, displayName: string, role: string}, error?: string}}
 */
export function login(username, password) {
  try {
    if (!username || !password) {
      return { success: false, error: 'Username and password are required' };
    }

    if (username === 'admin' && password === 'admin') {
      const session = {
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };
      setSession(session);
      return { success: true, session };
    }

    const users = getUsers();
    const user = users.find((u) => u.username === username && u.password === password);

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    const session = {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    };
    setSession(session);
    return { success: true, session };
  } catch (e) {
    console.error('Login failed:', e);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Logs out the current user by clearing the session from localStorage.
 */
export function logout() {
  clearSession();
}

/**
 * Checks whether a user session currently exists.
 * @returns {boolean} True if a session exists, false otherwise
 */
export function isAuthenticated() {
  return getSession() !== null;
}

/**
 * Returns the current user's session data, or null if not logged in.
 * @returns {{userId: string, username: string, displayName: string, role: string} | null}
 */
export function getCurrentUser() {
  return getSession();
}

/**
 * Checks whether the current user has the specified role.
 * @param {string} role - The role to check against (e.g., 'admin' or 'user')
 * @returns {boolean} True if the current user's role matches, false otherwise
 */
export function hasRole(role) {
  const session = getSession();
  if (!session) {
    return false;
  }
  return session.role === role;
}