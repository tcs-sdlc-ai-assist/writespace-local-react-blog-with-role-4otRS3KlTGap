import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getUsers,
  createUser,
  deleteUser,
  getSession,
  setSession,
  clearSession,
} from './storage.js';

describe('storage.js', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ─── Session ───────────────────────────────────────────────────────

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      expect(getSession()).toBeNull();
    });

    it('returns the stored session object', () => {
      const session = {
        userId: 'u1',
        username: 'alice',
        displayName: 'Alice',
        role: 'user',
      };
      localStorage.setItem('writespace_session', JSON.stringify(session));
      expect(getSession()).toEqual(session);
    });

    it('returns null when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage error');
      });
      expect(getSession()).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      localStorage.setItem('writespace_session', '{bad json');
      expect(getSession()).toBeNull();
    });
  });

  describe('setSession', () => {
    it('persists session to localStorage', () => {
      const session = {
        userId: 'u1',
        username: 'alice',
        displayName: 'Alice',
        role: 'user',
      };
      setSession(session);
      const raw = localStorage.getItem('writespace_session');
      expect(JSON.parse(raw)).toEqual(session);
    });

    it('does not throw when localStorage.setItem fails', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });
      expect(() =>
        setSession({ userId: 'u1', username: 'a', displayName: 'A', role: 'user' })
      ).not.toThrow();
    });
  });

  describe('clearSession', () => {
    it('removes session from localStorage', () => {
      localStorage.setItem('writespace_session', JSON.stringify({ userId: 'u1' }));
      clearSession();
      expect(localStorage.getItem('writespace_session')).toBeNull();
    });

    it('does not throw when localStorage.removeItem fails', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('error');
      });
      expect(() => clearSession()).not.toThrow();
    });
  });

  // ─── Posts ─────────────────────────────────────────────────────────

  describe('getPosts', () => {
    it('returns empty array when no posts exist', () => {
      expect(getPosts()).toEqual([]);
    });

    it('returns posts sorted by createdAt descending', () => {
      const posts = [
        { id: '1', title: 'Old', content: 'c', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'a', authorName: 'A' },
        { id: '2', title: 'New', content: 'c', createdAt: '2024-06-01T00:00:00.000Z', authorId: 'a', authorName: 'A' },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      const result = getPosts();
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('1');
    });

    it('returns empty array for invalid JSON', () => {
      localStorage.setItem('writespace_posts', 'not-json');
      expect(getPosts()).toEqual([]);
    });

    it('returns empty array when stored value is not an array', () => {
      localStorage.setItem('writespace_posts', JSON.stringify({ foo: 'bar' }));
      expect(getPosts()).toEqual([]);
    });

    it('returns empty array when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('error');
      });
      expect(getPosts()).toEqual([]);
    });
  });

  describe('createPost', () => {
    it('creates a post with generated id and createdAt', () => {
      const result = createPost({
        title: 'Hello',
        content: 'World',
        authorId: 'u1',
        authorName: 'Alice',
      });
      expect(result.success).toBe(true);
      expect(result.post).toBeDefined();
      expect(result.post.id).toBeTruthy();
      expect(typeof result.post.id).toBe('string');
      expect(result.post.title).toBe('Hello');
      expect(result.post.content).toBe('World');
      expect(result.post.authorId).toBe('u1');
      expect(result.post.authorName).toBe('Alice');
      expect(result.post.createdAt).toBeTruthy();
    });

    it('persists the post to localStorage', () => {
      createPost({
        title: 'T',
        content: 'C',
        authorId: 'u1',
        authorName: 'A',
      });
      const posts = getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe('T');
    });

    it('returns error when title is missing', () => {
      const result = createPost({
        title: '',
        content: 'C',
        authorId: 'u1',
        authorName: 'A',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when content is missing', () => {
      const result = createPost({
        title: 'T',
        content: '',
        authorId: 'u1',
        authorName: 'A',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when authorId is missing', () => {
      const result = createPost({
        title: 'T',
        content: 'C',
        authorId: '',
        authorName: 'A',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when authorName is missing', () => {
      const result = createPost({
        title: 'T',
        content: 'C',
        authorId: 'u1',
        authorName: '',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('generates unique IDs for multiple posts', () => {
      const r1 = createPost({ title: 'A', content: 'C', authorId: 'u1', authorName: 'A' });
      const r2 = createPost({ title: 'B', content: 'C', authorId: 'u1', authorName: 'A' });
      expect(r1.post.id).not.toBe(r2.post.id);
    });

    it('returns error when localStorage write fails', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });
      const result = createPost({
        title: 'T',
        content: 'C',
        authorId: 'u1',
        authorName: 'A',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updatePost', () => {
    it('updates an existing post title and content', () => {
      const created = createPost({
        title: 'Old',
        content: 'Old content',
        authorId: 'u1',
        authorName: 'A',
      });
      const result = updatePost({
        id: created.post.id,
        title: 'New',
        content: 'New content',
      });
      expect(result.success).toBe(true);
      expect(result.post.title).toBe('New');
      expect(result.post.content).toBe('New content');
    });

    it('persists the update to localStorage', () => {
      const created = createPost({
        title: 'Old',
        content: 'Old',
        authorId: 'u1',
        authorName: 'A',
      });
      updatePost({ id: created.post.id, title: 'Updated', content: 'Updated' });
      const posts = getPosts();
      expect(posts[0].title).toBe('Updated');
    });

    it('preserves other fields like authorId and createdAt', () => {
      const created = createPost({
        title: 'T',
        content: 'C',
        authorId: 'u1',
        authorName: 'Alice',
      });
      const result = updatePost({
        id: created.post.id,
        title: 'T2',
        content: 'C2',
      });
      expect(result.post.authorId).toBe('u1');
      expect(result.post.authorName).toBe('Alice');
      expect(result.post.createdAt).toBe(created.post.createdAt);
    });

    it('returns error when post is not found', () => {
      const result = updatePost({
        id: 'nonexistent',
        title: 'T',
        content: 'C',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when id is missing', () => {
      const result = updatePost({ id: '', title: 'T', content: 'C' });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when title is missing', () => {
      const result = updatePost({ id: 'x', title: '', content: 'C' });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when content is missing', () => {
      const result = updatePost({ id: 'x', title: 'T', content: '' });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('deletePost', () => {
    it('deletes an existing post', () => {
      const created = createPost({
        title: 'T',
        content: 'C',
        authorId: 'u1',
        authorName: 'A',
      });
      const result = deletePost(created.post.id);
      expect(result.success).toBe(true);
      expect(getPosts()).toHaveLength(0);
    });

    it('returns error when post is not found', () => {
      const result = deletePost('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when postId is empty', () => {
      const result = deletePost('');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when postId is undefined', () => {
      const result = deletePost(undefined);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('only deletes the specified post', () => {
      const r1 = createPost({ title: 'A', content: 'C', authorId: 'u1', authorName: 'A' });
      createPost({ title: 'B', content: 'C', authorId: 'u1', authorName: 'A' });
      deletePost(r1.post.id);
      const posts = getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe('B');
    });
  });

  // ─── Users ─────────────────────────────────────────────────────────

  describe('getUsers', () => {
    it('returns empty array when no users exist', () => {
      expect(getUsers()).toEqual([]);
    });

    it('returns stored users', () => {
      const users = [
        { id: 'u1', displayName: 'Alice', username: 'alice', password: 'pass', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(users));
      expect(getUsers()).toEqual(users);
    });

    it('returns empty array for invalid JSON', () => {
      localStorage.setItem('writespace_users', 'bad');
      expect(getUsers()).toEqual([]);
    });
  });

  describe('createUser', () => {
    it('creates a user with generated id and createdAt', () => {
      const result = createUser({
        displayName: 'Alice',
        username: 'alice',
        password: 'pass123',
        role: 'user',
      });
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.id).toBeTruthy();
      expect(typeof result.user.id).toBe('string');
      expect(result.user.displayName).toBe('Alice');
      expect(result.user.username).toBe('alice');
      expect(result.user.password).toBe('pass123');
      expect(result.user.role).toBe('user');
      expect(result.user.createdAt).toBeTruthy();
    });

    it('persists the user to localStorage', () => {
      createUser({
        displayName: 'Alice',
        username: 'alice',
        password: 'pass',
        role: 'user',
      });
      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('alice');
    });

    it('defaults role to user when not provided', () => {
      const result = createUser({
        displayName: 'Bob',
        username: 'bob',
        password: 'pass',
        role: undefined,
      });
      expect(result.success).toBe(true);
      expect(result.user.role).toBe('user');
    });

    it('returns error when displayName is missing', () => {
      const result = createUser({
        displayName: '',
        username: 'alice',
        password: 'pass',
        role: 'user',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when username is missing', () => {
      const result = createUser({
        displayName: 'Alice',
        username: '',
        password: 'pass',
        role: 'user',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when password is missing', () => {
      const result = createUser({
        displayName: 'Alice',
        username: 'alice',
        password: '',
        role: 'user',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when username is "admin"', () => {
      const result = createUser({
        displayName: 'Fake Admin',
        username: 'admin',
        password: 'pass',
        role: 'user',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when username already exists', () => {
      createUser({
        displayName: 'Alice',
        username: 'alice',
        password: 'pass',
        role: 'user',
      });
      const result = createUser({
        displayName: 'Alice 2',
        username: 'alice',
        password: 'pass2',
        role: 'user',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('generates unique IDs for multiple users', () => {
      const r1 = createUser({ displayName: 'A', username: 'a', password: 'p', role: 'user' });
      const r2 = createUser({ displayName: 'B', username: 'b', password: 'p', role: 'user' });
      expect(r1.user.id).not.toBe(r2.user.id);
    });

    it('allows creating a user with admin role', () => {
      const result = createUser({
        displayName: 'Admin2',
        username: 'admin2',
        password: 'pass',
        role: 'admin',
      });
      expect(result.success).toBe(true);
      expect(result.user.role).toBe('admin');
    });
  });

  describe('deleteUser', () => {
    it('deletes an existing user', () => {
      const created = createUser({
        displayName: 'Alice',
        username: 'alice',
        password: 'pass',
        role: 'user',
      });
      const result = deleteUser(created.user.id);
      expect(result.success).toBe(true);
      expect(getUsers()).toHaveLength(0);
    });

    it('returns error when user is not found', () => {
      const result = deleteUser('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when userId is empty', () => {
      const result = deleteUser('');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error when userId is undefined', () => {
      const result = deleteUser(undefined);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('only deletes the specified user', () => {
      const r1 = createUser({ displayName: 'A', username: 'a', password: 'p', role: 'user' });
      createUser({ displayName: 'B', username: 'b', password: 'p', role: 'user' });
      deleteUser(r1.user.id);
      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('b');
    });
  });

  // ─── Schema compliance ────────────────────────────────────────────

  describe('schema compliance', () => {
    it('created post has all required fields', () => {
      const result = createPost({
        title: 'Title',
        content: 'Content',
        authorId: 'u1',
        authorName: 'Author',
      });
      const post = result.post;
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('createdAt');
      expect(post).toHaveProperty('authorId');
      expect(post).toHaveProperty('authorName');
    });

    it('created user has all required fields', () => {
      const result = createUser({
        displayName: 'Alice',
        username: 'alice',
        password: 'pass',
        role: 'user',
      });
      const user = result.user;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('displayName');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('password');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('createdAt');
    });

    it('createdAt is a valid ISO date string for posts', () => {
      const result = createPost({
        title: 'T',
        content: 'C',
        authorId: 'u1',
        authorName: 'A',
      });
      const date = new Date(result.post.createdAt);
      expect(date.toISOString()).toBe(result.post.createdAt);
    });

    it('createdAt is a valid ISO date string for users', () => {
      const result = createUser({
        displayName: 'A',
        username: 'a',
        password: 'p',
        role: 'user',
      });
      const date = new Date(result.user.createdAt);
      expect(date.toISOString()).toBe(result.user.createdAt);
    });
  });
});