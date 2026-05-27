import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  hasRole,
} from './auth.js';
import {
  getSession,
  setSession,
  clearSession,
  getUsers,
  createUser,
} from './storage.js';

describe('auth.js', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ─── login ─────────────────────────────────────────────────────────

  describe('login', () => {
    it('returns success and admin session for hard-coded admin credentials', () => {
      const result = login('admin', 'admin');
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.userId).toBe('admin');
      expect(result.session.username).toBe('admin');
      expect(result.session.displayName).toBe('Admin');
      expect(result.session.role).toBe('admin');
    });

    it('persists admin session to localStorage on admin login', () => {
      login('admin', 'admin');
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.userId).toBe('admin');
      expect(session.role).toBe('admin');
    });

    it('returns success and user session for valid registered user', () => {
      createUser({
        displayName: 'Alice',
        username: 'alice',
        password: 'pass123',
        role: 'user',
      });
      const result = login('alice', 'pass123');
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.username).toBe('alice');
      expect(result.session.displayName).toBe('Alice');
      expect(result.session.role).toBe('user');
      expect(result.session.userId).toBeTruthy();
    });

    it('persists user session to localStorage on user login', () => {
      createUser({
        displayName: 'Bob',
        username: 'bob',
        password: 'secret',
        role: 'user',
      });
      login('bob', 'secret');
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.username).toBe('bob');
      expect(session.role).toBe('user');
    });

    it('returns error for invalid username', () => {
      const result = login('nonexistent', 'password');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error for invalid password', () => {
      createUser({
        displayName: 'Alice',
        username: 'alice',
        password: 'correct',
        role: 'user',
      });
      const result = login('alice', 'wrong');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when username is empty', () => {
      const result = login('', 'password');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when password is empty', () => {
      const result = login('admin', '');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when both username and password are empty', () => {
      const result = login('', '');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when username is undefined', () => {
      const result = login(undefined, 'password');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when password is undefined', () => {
      const result = login('admin', undefined);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('does not match admin username with wrong password', () => {
      const result = login('admin', 'wrongpassword');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns success for a user with admin role created via createUser', () => {
      createUser({
        displayName: 'Admin2',
        username: 'admin2',
        password: 'adminpass',
        role: 'admin',
      });
      const result = login('admin2', 'adminpass');
      expect(result.success).toBe(true);
      expect(result.session.role).toBe('admin');
      expect(result.session.username).toBe('admin2');
    });

    it('handles localStorage error gracefully', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage error');
      });
      const result = login('admin', 'admin');
      // admin login doesn't need getItem for users, but setSession might fail
      // The function should handle errors gracefully
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  // ─── logout ────────────────────────────────────────────────────────

  describe('logout', () => {
    it('clears the session from localStorage', () => {
      login('admin', 'admin');
      expect(getSession()).not.toBeNull();
      logout();
      expect(getSession()).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => logout()).not.toThrow();
    });

    it('makes isAuthenticated return false after logout', () => {
      login('admin', 'admin');
      expect(isAuthenticated()).toBe(true);
      logout();
      expect(isAuthenticated()).toBe(false);
    });
  });

  // ─── isAuthenticated ──────────────────────────────────────────────

  describe('isAuthenticated', () => {
    it('returns false when no session exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true after admin login', () => {
      login('admin', 'admin');
      expect(isAuthenticated()).toBe(true);
    });

    it('returns true after user login', () => {
      createUser({
        displayName: 'Alice',
        username: 'alice',
        password: 'pass',
        role: 'user',
      });
      login('alice', 'pass');
      expect(isAuthenticated()).toBe(true);
    });

    it('returns false after logout', () => {
      login('admin', 'admin');
      logout();
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when session is set manually', () => {
      setSession({
        userId: 'u1',
        username: 'test',
        displayName: 'Test',
        role: 'user',
      });
      expect(isAuthenticated()).toBe(true);
    });

    it('returns false when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage error');
      });
      expect(isAuthenticated()).toBe(false);
    });
  });

  // ─── getCurrentUser ───────────────────────────────────────────────

  describe('getCurrentUser', () => {
    it('returns null when no session exists', () => {
      expect(getCurrentUser()).toBeNull();
    });

    it('returns admin session data after admin login', () => {
      login('admin', 'admin');
      const user = getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.userId).toBe('admin');
      expect(user.username).toBe('admin');
      expect(user.displayName).toBe('Admin');
      expect(user.role).toBe('admin');
    });

    it('returns user session data after user login', () => {
      createUser({
        displayName: 'Alice',
        username: 'alice',
        password: 'pass',
        role: 'user',
      });
      login('alice', 'pass');
      const user = getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.username).toBe('alice');
      expect(user.displayName).toBe('Alice');
      expect(user.role).toBe('user');
    });

    it('returns null after logout', () => {
      login('admin', 'admin');
      logout();
      expect(getCurrentUser()).toBeNull();
    });

    it('returns the session object set manually', () => {
      const session = {
        userId: 'u99',
        username: 'manual',
        displayName: 'Manual User',
        role: 'user',
      };
      setSession(session);
      expect(getCurrentUser()).toEqual(session);
    });

    it('returns null when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage error');
      });
      expect(getCurrentUser()).toBeNull();
    });
  });

  // ─── hasRole ──────────────────────────────────────────────────────

  describe('hasRole', () => {
    it('returns false when no session exists', () => {
      expect(hasRole('admin')).toBe(false);
      expect(hasRole('user')).toBe(false);
    });

    it('returns true for admin role when logged in as admin', () => {
      login('admin', 'admin');
      expect(hasRole('admin')).toBe(true);
    });

    it('returns false for user role when logged in as admin', () => {
      login('admin', 'admin');
      expect(hasRole('user')).toBe(false);
    });

    it('returns true for user role when logged in as user', () => {
      createUser({
        displayName: 'Alice',
        username: 'alice',
        password: 'pass',
        role: 'user',
      });
      login('alice', 'pass');
      expect(hasRole('user')).toBe(true);
    });

    it('returns false for admin role when logged in as user', () => {
      createUser({
        displayName: 'Alice',
        username: 'alice',
        password: 'pass',
        role: 'user',
      });
      login('alice', 'pass');
      expect(hasRole('admin')).toBe(false);
    });

    it('returns false after logout', () => {
      login('admin', 'admin');
      logout();
      expect(hasRole('admin')).toBe(false);
    });

    it('returns true for admin role when user created with admin role', () => {
      createUser({
        displayName: 'Admin2',
        username: 'admin2',
        password: 'pass',
        role: 'admin',
      });
      login('admin2', 'pass');
      expect(hasRole('admin')).toBe(true);
    });

    it('returns false for an unrecognized role string', () => {
      login('admin', 'admin');
      expect(hasRole('superadmin')).toBe(false);
    });

    it('returns false when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage error');
      });
      expect(hasRole('admin')).toBe(false);
    });
  });
});