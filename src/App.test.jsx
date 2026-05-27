import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { setSession, clearSession, createUser, createPost } from './utils/storage.js';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    window.history.pushState({}, '', '/');
  });

  // ─── Helper functions ──────────────────────────────────────────────

  function loginAsAdmin() {
    setSession({
      userId: 'admin',
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
    });
  }

  function loginAsUser(userId = 'u1', username = 'alice', displayName = 'Alice') {
    setSession({
      userId,
      username,
      displayName,
      role: 'user',
    });
  }

  // ─── Landing Page ──────────────────────────────────────────────────

  describe('Landing Page', () => {
    it('renders the landing page at "/"', () => {
      render(<App />);
      expect(screen.getByText('✍️ WriteSpace')).toBeDefined();
      expect(screen.getByText(/A clean, minimal space/i)).toBeDefined();
    });

    it('shows PublicNavbar with Login and Get Started for unauthenticated users', () => {
      render(<App />);
      const loginLinks = screen.getAllByText('Login');
      expect(loginLinks.length).toBeGreaterThan(0);
      const getStartedLinks = screen.getAllByText('Get Started');
      expect(getStartedLinks.length).toBeGreaterThan(0);
    });

    it('shows Navbar with Blogs and Write links for authenticated users', () => {
      loginAsUser();
      render(<App />);
      expect(screen.getByText('Blogs')).toBeDefined();
      expect(screen.getByText('Write')).toBeDefined();
    });

    it('shows Dashboard and Users links in navbar for admin users', () => {
      loginAsAdmin();
      render(<App />);
      expect(screen.getByText('Dashboard')).toBeDefined();
      expect(screen.getByText('Users')).toBeDefined();
    });
  });

  // ─── Login Page ────────────────────────────────────────────────────

  describe('Login Page', () => {
    it('renders the login page at "/login"', () => {
      window.history.pushState({}, '', '/login');
      render(<App />);
      expect(screen.getByText('Welcome Back')).toBeDefined();
      expect(screen.getByText('Sign in to your WriteSpace account')).toBeDefined();
    });

    it('shows username and password fields', () => {
      window.history.pushState({}, '', '/login');
      render(<App />);
      expect(screen.getByLabelText('Username')).toBeDefined();
      expect(screen.getByLabelText('Password')).toBeDefined();
    });

    it('shows error for empty submission', async () => {
      window.history.pushState({}, '', '/login');
      render(<App />);
      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      expect(screen.getByText('Username and password are required')).toBeDefined();
    });

    it('shows error for invalid credentials', async () => {
      window.history.pushState({}, '', '/login');
      render(<App />);
      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Username'), 'wrong');
      await user.type(screen.getByLabelText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      expect(screen.getByText('Invalid credentials')).toBeDefined();
    });

    it('redirects admin to /admin after successful login', async () => {
      window.history.pushState({}, '', '/login');
      render(<App />);
      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Username'), 'admin');
      await user.type(screen.getByLabelText('Password'), 'admin');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeDefined();
      });
    });

    it('redirects user to /blogs after successful login', async () => {
      createUser({
        displayName: 'Alice',
        username: 'alice',
        password: 'pass123',
        role: 'user',
      });
      window.history.pushState({}, '', '/login');
      render(<App />);
      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Username'), 'alice');
      await user.type(screen.getByLabelText('Password'), 'pass123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      await waitFor(() => {
        expect(screen.getByText('All Posts')).toBeDefined();
      });
    });

    it('redirects already-authenticated admin away from login page', () => {
      loginAsAdmin();
      window.history.pushState({}, '', '/login');
      render(<App />);
      expect(screen.getByText('Admin Dashboard')).toBeDefined();
    });

    it('redirects already-authenticated user away from login page', () => {
      loginAsUser();
      window.history.pushState({}, '', '/login');
      render(<App />);
      expect(screen.getByText('All Posts')).toBeDefined();
    });
  });

  // ─── Register Page ─────────────────────────────────────────────────

  describe('Register Page', () => {
    it('renders the register page at "/register"', () => {
      window.history.pushState({}, '', '/register');
      render(<App />);
      expect(screen.getByText('Create Your Account')).toBeDefined();
    });

    it('shows all registration fields', () => {
      window.history.pushState({}, '', '/register');
      render(<App />);
      expect(screen.getByLabelText('Display Name')).toBeDefined();
      expect(screen.getByLabelText('Username')).toBeDefined();
      expect(screen.getByLabelText('Password')).toBeDefined();
      expect(screen.getByLabelText('Confirm Password')).toBeDefined();
    });

    it('shows error when fields are empty', async () => {
      window.history.pushState({}, '', '/register');
      render(<App />);
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(screen.getByText('All fields are required')).toBeDefined();
    });

    it('shows error when passwords do not match', async () => {
      window.history.pushState({}, '', '/register');
      render(<App />);
      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Display Name'), 'Bob');
      await user.type(screen.getByLabelText('Username'), 'bob');
      await user.type(screen.getByLabelText('Password'), 'pass1');
      await user.type(screen.getByLabelText('Confirm Password'), 'pass2');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(screen.getByText('Passwords do not match')).toBeDefined();
    });

    it('redirects to /blogs after successful registration', async () => {
      window.history.pushState({}, '', '/register');
      render(<App />);
      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Display Name'), 'Bob');
      await user.type(screen.getByLabelText('Username'), 'bob');
      await user.type(screen.getByLabelText('Password'), 'pass123');
      await user.type(screen.getByLabelText('Confirm Password'), 'pass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(screen.getByText('All Posts')).toBeDefined();
      });
    });

    it('redirects already-authenticated user away from register page', () => {
      loginAsUser();
      window.history.pushState({}, '', '/register');
      render(<App />);
      expect(screen.getByText('All Posts')).toBeDefined();
    });
  });

  // ─── Protected Routes ─────────────────────────────────────────────

  describe('Protected Routes', () => {
    it('redirects unauthenticated users from /blogs to /login', () => {
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      expect(screen.getByText('Welcome Back')).toBeDefined();
    });

    it('redirects unauthenticated users from /blog/new to /login', () => {
      window.history.pushState({}, '', '/blog/new');
      render(<App />);
      expect(screen.getByText('Welcome Back')).toBeDefined();
    });

    it('redirects unauthenticated users from /blog/some-id to /login', () => {
      window.history.pushState({}, '', '/blog/some-id');
      render(<App />);
      expect(screen.getByText('Welcome Back')).toBeDefined();
    });

    it('redirects unauthenticated users from /blog/some-id/edit to /login', () => {
      window.history.pushState({}, '', '/blog/some-id/edit');
      render(<App />);
      expect(screen.getByText('Welcome Back')).toBeDefined();
    });

    it('redirects unauthenticated users from /admin to /login', () => {
      window.history.pushState({}, '', '/admin');
      render(<App />);
      expect(screen.getByText('Welcome Back')).toBeDefined();
    });

    it('redirects unauthenticated users from /admin/users to /login', () => {
      window.history.pushState({}, '', '/admin/users');
      render(<App />);
      expect(screen.getByText('Welcome Back')).toBeDefined();
    });

    it('allows authenticated users to access /blogs', () => {
      loginAsUser();
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      expect(screen.getByText('All Posts')).toBeDefined();
    });

    it('allows authenticated users to access /blog/new', () => {
      loginAsUser();
      window.history.pushState({}, '', '/blog/new');
      render(<App />);
      expect(screen.getByText('Write a New Post')).toBeDefined();
    });
  });

  // ─── Admin-Only Routes ─────────────────────────────────────────────

  describe('Admin-Only Routes', () => {
    it('redirects non-admin users from /admin to /blogs', () => {
      loginAsUser();
      window.history.pushState({}, '', '/admin');
      render(<App />);
      expect(screen.getByText('All Posts')).toBeDefined();
    });

    it('redirects non-admin users from /admin/users to /blogs', () => {
      loginAsUser();
      window.history.pushState({}, '', '/admin/users');
      render(<App />);
      expect(screen.getByText('All Posts')).toBeDefined();
    });

    it('allows admin users to access /admin', () => {
      loginAsAdmin();
      window.history.pushState({}, '', '/admin');
      render(<App />);
      expect(screen.getByText('Admin Dashboard')).toBeDefined();
    });

    it('allows admin users to access /admin/users', () => {
      loginAsAdmin();
      window.history.pushState({}, '', '/admin/users');
      render(<App />);
      expect(screen.getByText('👥 User Management')).toBeDefined();
    });
  });

  // ─── Blog Pages ────────────────────────────────────────────────────

  describe('Blog Pages', () => {
    it('renders the Home page with posts', () => {
      loginAsUser();
      createPost({
        title: 'Test Post',
        content: 'Test content for the post',
        authorId: 'u1',
        authorName: 'Alice',
      });
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      expect(screen.getByText('Test Post')).toBeDefined();
    });

    it('shows empty state when no posts exist', () => {
      loginAsUser();
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      expect(screen.getByText('No posts yet')).toBeDefined();
    });

    it('renders ReadBlog page for a valid post', () => {
      loginAsUser();
      const result = createPost({
        title: 'My Blog Post',
        content: 'Full content of the blog post',
        authorId: 'u1',
        authorName: 'Alice',
      });
      window.history.pushState({}, '', `/blog/${result.post.id}`);
      render(<App />);
      expect(screen.getByText('My Blog Post')).toBeDefined();
      expect(screen.getByText('Full content of the blog post')).toBeDefined();
    });

    it('shows error for non-existent post', () => {
      loginAsUser();
      window.history.pushState({}, '', '/blog/nonexistent-id');
      render(<App />);
      expect(screen.getByText('Post not found')).toBeDefined();
    });

    it('renders WriteBlog in edit mode for existing post', () => {
      loginAsUser();
      const result = createPost({
        title: 'Editable Post',
        content: 'Editable content',
        authorId: 'u1',
        authorName: 'Alice',
      });
      window.history.pushState({}, '', `/blog/${result.post.id}/edit`);
      render(<App />);
      expect(screen.getByText('Edit Post')).toBeDefined();
      expect(screen.getByDisplayValue('Editable Post')).toBeDefined();
      expect(screen.getByDisplayValue('Editable content')).toBeDefined();
    });

    it('renders WriteBlog in create mode at /blog/new', () => {
      loginAsUser();
      window.history.pushState({}, '', '/blog/new');
      render(<App />);
      expect(screen.getByText('Write a New Post')).toBeDefined();
      expect(screen.getByText('Publish Post')).toBeDefined();
    });
  });

  // ─── Navigation ────────────────────────────────────────────────────

  describe('Navigation', () => {
    it('navigates from landing page to login page', async () => {
      render(<App />);
      const user = userEvent.setup();
      const loginLinks = screen.getAllByText('Login');
      await user.click(loginLinks[0]);
      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeDefined();
      });
    });

    it('navigates from landing page to register page', async () => {
      render(<App />);
      const user = userEvent.setup();
      const getStartedLinks = screen.getAllByText('Get Started');
      await user.click(getStartedLinks[0]);
      await waitFor(() => {
        expect(screen.getByText('Create Your Account')).toBeDefined();
      });
    });

    it('navigates from login page to register page', async () => {
      window.history.pushState({}, '', '/login');
      render(<App />);
      const user = userEvent.setup();
      await user.click(screen.getByText('Create one'));
      await waitFor(() => {
        expect(screen.getByText('Create Your Account')).toBeDefined();
      });
    });

    it('navigates from register page to login page', async () => {
      window.history.pushState({}, '', '/register');
      render(<App />);
      const user = userEvent.setup();
      await user.click(screen.getByText('Sign in'));
      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeDefined();
      });
    });

    it('logout redirects to login page', async () => {
      loginAsUser();
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      const user = userEvent.setup();
      await user.click(screen.getByText('Logout'));
      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeDefined();
      });
    });

    it('navigates from blogs to write page via navbar', async () => {
      loginAsUser();
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      const user = userEvent.setup();
      await user.click(screen.getByText('Write'));
      await waitFor(() => {
        expect(screen.getByText('Write a New Post')).toBeDefined();
      });
    });

    it('admin can navigate to dashboard from navbar', async () => {
      loginAsAdmin();
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      const user = userEvent.setup();
      await user.click(screen.getByText('Dashboard'));
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeDefined();
      });
    });

    it('admin can navigate to user management from navbar', async () => {
      loginAsAdmin();
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      const user = userEvent.setup();
      await user.click(screen.getByText('Users'));
      await waitFor(() => {
        expect(screen.getByText('👥 User Management')).toBeDefined();
      });
    });
  });

  // ─── Conditional Navbar Rendering ──────────────────────────────────

  describe('Conditional Navbar Rendering', () => {
    it('shows user display name in navbar when authenticated', () => {
      loginAsUser('u1', 'alice', 'Alice Wonderland');
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      expect(screen.getByText('Alice Wonderland')).toBeDefined();
    });

    it('shows admin display name in navbar when authenticated as admin', () => {
      loginAsAdmin();
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      expect(screen.getByText('Admin')).toBeDefined();
    });

    it('does not show Dashboard link for regular users', () => {
      loginAsUser();
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      expect(screen.queryByText('Dashboard')).toBeNull();
    });

    it('does not show Users link for regular users', () => {
      loginAsUser();
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      const usersLink = screen.queryByRole('link', { name: 'Users' });
      expect(usersLink).toBeNull();
    });

    it('shows Dashboard link for admin users', () => {
      loginAsAdmin();
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      expect(screen.getByText('Dashboard')).toBeDefined();
    });

    it('shows Users link for admin users', () => {
      loginAsAdmin();
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      expect(screen.getByText('Users')).toBeDefined();
    });
  });
});