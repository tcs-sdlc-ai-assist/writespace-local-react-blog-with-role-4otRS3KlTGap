# WriteSpace

A clean, minimal blogging platform built with React 18, Vite, and Tailwind CSS. WriteSpace provides a distraction-free space to write, share, and discover blog posts with role-based access control and localStorage persistence.

## Tech Stack

- **React 18** — UI library with functional components and hooks
- **Vite** — Fast build tool and development server
- **Tailwind CSS** — Utility-first CSS framework
- **React Router v6** — Client-side routing
- **localStorage** — Client-side data persistence
- **Vitest** — Unit and integration testing framework
- **PropTypes** — Runtime prop type checking

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (included with Node.js)

### Installation

```bash
git clone <repository-url>
cd writespace
npm install
```

### Development

Start the local development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Testing

Run the test suite:

```bash
npm test
```

## Default Credentials

A hard-coded admin account is available for initial platform access:

| Username | Password | Role  |
| -------- | -------- | ----- |
| `admin`  | `admin`  | Admin |

New user accounts can be created via the registration page or the admin user management panel.

## Folder Structure

```
writespace/
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── vitest.config.js            # Vitest configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── vercel.json                 # Vercel deployment configuration
├── CHANGELOG.md                # Project changelog
├── public/
│   └── vite.svg                # Favicon
└── src/
    ├── main.jsx                # React DOM entry point
    ├── App.jsx                 # Root component with route definitions
    ├── App.test.jsx            # Integration tests for routing and navigation
    ├── index.css               # Tailwind CSS directives
    ├── setupTests.js           # Test setup with localStorage mock
    ├── components/
    │   ├── Avatar.jsx          # Role-distinct avatar component
    │   ├── BlogCard.jsx        # Blog post preview card
    │   ├── Navbar.jsx          # Authenticated user navigation bar
    │   ├── ProtectedRoute.jsx  # Route guard for auth and role checks
    │   ├── PublicNavbar.jsx    # Guest navigation bar
    │   ├── StatCard.jsx        # Dashboard stat display card
    │   └── UserRow.jsx         # User management row/card component
    ├── pages/
    │   ├── AdminDashboard.jsx  # Admin dashboard with stats and recent posts
    │   ├── Home.jsx            # Blog listing page
    │   ├── LandingPage.jsx     # Public landing page
    │   ├── LoginPage.jsx       # Login form page
    │   ├── ReadBlog.jsx        # Full blog post reader
    │   ├── RegisterPage.jsx    # Registration form page
    │   ├── UserManagement.jsx  # Admin user management page
    │   └── WriteBlog.jsx       # Blog post creation and editing form
    └── utils/
        ├── auth.js             # Authentication utilities
        ├── auth.test.js        # Auth utility tests
        ├── storage.js          # localStorage CRUD utilities
        └── storage.test.js     # Storage utility tests
```

## Route Map

| Path              | Component        | Access          | Description                        |
| ----------------- | ---------------- | --------------- | ---------------------------------- |
| `/`               | LandingPage      | Public          | Hero, features, and latest posts   |
| `/login`          | LoginPage        | Public          | User login form                    |
| `/register`       | RegisterPage     | Public          | User registration form             |
| `/blogs`          | Home             | Authenticated   | Blog listing with all posts        |
| `/blog/new`       | WriteBlog        | Authenticated   | Create a new blog post             |
| `/blog/:id`       | ReadBlog         | Authenticated   | Read a full blog post              |
| `/blog/:id/edit`  | WriteBlog        | Authenticated   | Edit an existing blog post         |
| `/admin`          | AdminDashboard   | Admin only      | Platform overview and stats        |
| `/admin/users`    | UserManagement   | Admin only      | Create and manage users            |

## Features

### Public
- Landing page with hero section, features overview, and latest posts preview
- User registration with display name, username, and password
- User login with credential validation

### Authenticated Users
- Browse all blog posts in a responsive grid layout
- Create new blog posts with title and content
- Edit and delete own blog posts
- Character counter on the post editor
- Responsive navigation with mobile hamburger menu

### Admin Users
- Admin dashboard with platform statistics (total posts, total users, admin count, user count)
- Quick action buttons for writing posts and managing users
- Recent posts list with inline edit and delete actions
- User management panel to create new users with role selection
- Delete any user (except the hard-coded admin account and self)
- Edit and delete any blog post

### Data Persistence
- All data stored in `localStorage` under namespaced keys:
  - `writespace_posts` — Blog post data
  - `writespace_users` — User account data
  - `writespace_session` — Current user session
- Safe JSON parsing with error handling
- Unique ID generation for posts and users

## Deployment

### Vercel

The project includes a `vercel.json` configuration with SPA rewrites for client-side routing support.

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project in [Vercel](https://vercel.com/).
3. Vercel will auto-detect the Vite framework and configure the build settings.
4. Deploy. The `vercel.json` rewrites ensure all routes are handled by `index.html`.

Alternatively, deploy via the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## License

This is a private project. All rights reserved.