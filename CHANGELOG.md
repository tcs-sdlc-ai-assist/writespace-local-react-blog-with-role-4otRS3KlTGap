# Changelog

All notable changes to the WriteSpace project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added

- **Public Landing Page** — Hero section with app branding, features overview, latest posts preview, and footer. Displays `PublicNavbar` for guests and `Navbar` for authenticated users.
- **User Authentication**
  - Login page with username and password fields, validation, and error handling.
  - Registration page with display name, username, password, and confirm password fields.
  - Hard-coded admin account (`admin` / `admin`) for initial platform access.
  - Session persistence via `localStorage` using the `writespace_session` key.
  - Automatic redirect for already-authenticated users away from login and register pages.
- **Role-Based Access Control**
  - `ProtectedRoute` component redirects unauthenticated users to `/login`.
  - Admin-only routes (`/admin`, `/admin/users`) redirect non-admin users to `/blogs`.
  - Conditional navbar rendering based on user role (admin sees Dashboard and Users links).
- **Blog CRUD Operations**
  - Create new blog posts at `/blog/new` with title and content fields, character counter, and validation.
  - Read full blog posts at `/blog/:id` with author avatar, display name, and formatted date.
  - Edit existing posts at `/blog/:id/edit` with pre-populated form fields and ownership enforcement.
  - Delete posts with confirmation dialog from both the read view and admin dashboard.
  - Blog listing page at `/blogs` with responsive grid layout using `BlogCard` components.
  - Posts sorted by creation date (newest first).
- **Admin Dashboard** (`/admin`)
  - Gradient header with admin avatar and welcome message.
  - Four stat cards displaying total posts, total users, admin count, and user count.
  - Quick action buttons for writing posts and managing users.
  - Recent posts list with inline edit and delete actions.
- **User Management** (`/admin/users`)
  - Create new users with display name, username, password, and role selection (admin or user).
  - Username uniqueness validation including reserved `admin` username check.
  - User list displayed using `UserRow` components with avatar, role badge, and join date.
  - Delete users with confirmation dialog; deletion disabled for the hard-coded admin account and the current user (self).
- **localStorage Persistence**
  - All data (posts, users, sessions) stored in `localStorage` under namespaced keys (`writespace_posts`, `writespace_users`, `writespace_session`).
  - Utility functions in `storage.js` with safe JSON parsing, error handling, and unique ID generation.
  - Authentication utilities in `auth.js` for login, logout, session management, and role checking.
- **Responsive Tailwind CSS UI**
  - Mobile-first responsive design using Tailwind CSS utility classes.
  - Responsive navigation bars (`Navbar`, `PublicNavbar`) with mobile hamburger menu toggle.
  - Responsive grid layouts for blog cards, stat cards, and user management.
  - Consistent violet/indigo color scheme with hover and focus states.
- **Reusable Components**
  - `Avatar` — Role-distinct avatar with crown emoji for admins and book emoji for users.
  - `BlogCard` — Post preview card with truncated content, author info, and conditional edit icon.
  - `StatCard` — Configurable stat display with multiple color schemes.
  - `UserRow` — User card with role badge, delete button, and confirmation flow.
- **Vercel Deployment** — `vercel.json` configured with SPA rewrites for client-side routing support.
- **Testing**
  - Unit tests for `storage.js` covering posts, users, sessions, schema compliance, and error handling.
  - Unit tests for `auth.js` covering login, logout, authentication checks, role verification, and edge cases.
  - Integration tests for `App.jsx` covering routing, navigation, protected routes, admin-only routes, and conditional rendering.
  - Test setup with Vitest, jsdom, `@testing-library/react`, and `@testing-library/user-event`.
  - Custom `localStorage` mock in `setupTests.js` for isolated test environments.