# Deployment Guide

This document covers deployment configuration, hosting setup, and CI/CD considerations for the WriteSpace application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Configuration](#build-configuration)
- [Vercel Deployment](#vercel-deployment)
  - [Automatic Deployment via Git](#automatic-deployment-via-git)
  - [Manual Deployment via CLI](#manual-deployment-via-cli)
  - [SPA Rewrite Configuration](#spa-rewrite-configuration)
- [Environment Considerations](#environment-considerations)
- [CI/CD Notes](#cicd-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (included with Node.js)
- A [Vercel](https://vercel.com/) account (free tier available)
- Git repository hosted on GitHub, GitLab, or Bitbucket

## Build Configuration

WriteSpace uses [Vite](https://vitejs.dev/) as its build tool. The production build is configured in `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

### Build Command

```bash
npm run build
```

This runs `vite build` under the hood, which:

1. Bundles all JavaScript (JSX) source files
2. Processes Tailwind CSS via PostCSS
3. Minifies and tree-shakes the output
4. Generates static assets in the **`dist/`** directory

### Output Directory

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── vite.svg
```

The `dist/` directory contains the complete static site ready for deployment. All routes are handled client-side by React Router, so the server must be configured to serve `index.html` for all paths (see [SPA Rewrite Configuration](#spa-rewrite-configuration)).

### Preview Locally

To preview the production build before deploying:

```bash
npm run build
npm run preview
```

The preview server runs at `http://localhost:4173` by default.

---

## Vercel Deployment

Vercel is the recommended hosting platform for WriteSpace. It auto-detects Vite projects and requires minimal configuration.

### Automatic Deployment via Git

1. **Push your repository** to GitHub, GitLab, or Bitbucket.

2. **Import the project** in the [Vercel Dashboard](https://vercel.com/new):
   - Select your Git provider and repository.
   - Vercel auto-detects the Vite framework.

3. **Verify build settings** (Vercel typically auto-fills these correctly):

   | Setting          | Value            |
   | ---------------- | ---------------- |
   | Framework Preset | Vite             |
   | Build Command    | `npm run build`  |
   | Output Directory | `dist`           |
   | Install Command  | `npm install`    |

4. **Click Deploy**. Vercel will install dependencies, run the build, and publish the site.

5. **Subsequent deployments** happen automatically on every push to the main branch. Pull request branches receive preview deployments with unique URLs.

### Manual Deployment via CLI

Install the Vercel CLI globally:

```bash
npm install -g vercel
```

Deploy from the project root:

```bash
# First-time setup — links the project to your Vercel account
vercel

# Production deployment
vercel --prod
```

The CLI will prompt you to confirm:

- **Project directory**: `.` (current directory)
- **Framework**: Vite (auto-detected)
- **Build command**: `npm run build`
- **Output directory**: `dist`

### SPA Rewrite Configuration

WriteSpace uses client-side routing via React Router v6. All navigation (e.g., `/blogs`, `/blog/:id`, `/admin`) is handled in the browser — there are no server-side routes.

The `vercel.json` file at the project root configures Vercel to rewrite all requests to `index.html`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Why this is required:**

- Without this rewrite, navigating directly to a route like `https://your-app.vercel.app/blogs` would return a 404 because no `blogs/index.html` file exists in the `dist/` output.
- The rewrite ensures that `index.html` is served for every path, allowing React Router to parse the URL and render the correct component.

**Important:** This file is already included in the repository. Do not remove it or the SPA routing will break on Vercel.

---

## Environment Considerations

### localStorage Persistence

WriteSpace stores all data (posts, users, sessions) in the browser's `localStorage` under namespaced keys:

| Key                   | Description              |
| --------------------- | ------------------------ |
| `writespace_posts`    | Blog post data (JSON)    |
| `writespace_users`    | User account data (JSON) |
| `writespace_session`  | Current user session     |

**Deployment implications:**

- Data is stored entirely on the client. There is no server-side database or API.
- Each user's browser maintains its own independent data store.
- Clearing browser data or switching devices will reset all content.
- No environment variables or server-side secrets are required.

### Environment Variables

WriteSpace does not currently require any environment variables. If future features need them (e.g., an API endpoint), they should follow the Vite convention:

- Prefix all client-exposed variables with `VITE_` (e.g., `VITE_API_URL`)
- Access them via `import.meta.env.VITE_API_URL`
- Add them in the Vercel Dashboard under **Settings → Environment Variables**
- Never commit secrets to the repository — use `.env.local` for local development (already in `.gitignore`)

### Node.js Version

Vercel uses Node.js 18.x by default. To pin a specific version, add an `engines` field to `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

Or set the Node.js version in the Vercel Dashboard under **Settings → General → Node.js Version**.

---

## CI/CD Notes

### Automatic Deployments with Vercel

Once connected to a Git provider, Vercel provides:

- **Production deployments** on every push to the main/master branch
- **Preview deployments** on every pull request, with unique URLs for review
- **Instant rollbacks** to any previous deployment from the Vercel Dashboard

### Running Tests Before Deployment

To ensure code quality before deploying, run the test suite:

```bash
npm test
```

The project uses [Vitest](https://vitest.dev/) with jsdom for unit and integration tests. Tests cover:

- `src/utils/storage.js` — localStorage CRUD operations
- `src/utils/auth.js` — Authentication and session management
- `src/App.jsx` — Routing, navigation, protected routes, and conditional rendering

### Adding a CI Step

To run tests automatically before Vercel builds, you can override the build command in `vercel.json` or the Vercel Dashboard:

```
npm test -- --run && npm run build
```

The `--run` flag tells Vitest to execute once and exit (non-watch mode), which is required in CI environments.

Alternatively, use a GitHub Actions workflow (`.github/workflows/ci.yml`):

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm test -- --run
```

Vercel will still handle the deployment separately, but this ensures tests pass before merging.

### Branch-Based Deployments

| Branch        | Deployment Type | URL                                  |
| ------------- | --------------- | ------------------------------------ |
| `main`        | Production      | `https://your-app.vercel.app`        |
| Pull requests | Preview         | `https://your-app-<hash>.vercel.app` |
| Other branches| Preview         | `https://your-app-<branch>.vercel.app` |

Preview deployments are read-only snapshots and do not affect the production site.

---

## Troubleshooting

### 404 on Direct URL Access

**Cause:** The SPA rewrite is not configured or `vercel.json` is missing.

**Fix:** Ensure `vercel.json` exists at the project root with the rewrite rule:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Build Fails on Vercel

**Cause:** Node.js version mismatch or missing dependencies.

**Fix:**
1. Verify the build works locally with `npm run build`.
2. Check that `package.json` lists all dependencies correctly.
3. Ensure the Node.js version on Vercel matches your local version (v18+).

### Blank Page After Deployment

**Cause:** Asset paths are incorrect, often due to a misconfigured `base` in Vite.

**Fix:** The default Vite `base` is `/`, which is correct for Vercel root deployments. Do not change it unless deploying to a subdirectory.

### Tests Fail in CI

**Cause:** Tests may rely on watch mode or interactive input.

**Fix:** Always use the `--run` flag in CI:

```bash
npm test -- --run
```