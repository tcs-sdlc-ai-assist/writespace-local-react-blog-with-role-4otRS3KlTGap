import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BlogCard from '../components/BlogCard.jsx';
import { getPosts } from '../utils/storage.js';

/**
 * Authenticated blog listing page.
 * Displays all posts from localStorage in a responsive grid using BlogCard components.
 * Posts are sorted newest first. Shows empty state message when no posts exist.
 * Protected route — should only be rendered for authenticated users.
 * @returns {JSX.Element}
 */
function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const allPosts = getPosts();
    setPosts(allPosts);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              All Posts
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Browse the latest posts from the community
            </p>
          </div>
          <Link
            to="/blog/new"
            className="text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors px-5 py-2.5 rounded-lg shadow-sm"
          >
            ✍️ Write
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 text-3xl mb-5">
              📝
            </span>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              No posts yet
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Be the first to share something with the community!
            </p>
            <Link
              to="/blog/new"
              className="inline-block text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors px-6 py-2.5 rounded-lg shadow-sm"
            >
              Create Your First Post
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;