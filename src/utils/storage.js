const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';
const SESSION_KEY = 'writespace_session';

/**
 * Generates a unique ID string.
 * @returns {string} A unique identifier
 */
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

/**
 * Returns the current ISO timestamp string.
 * @returns {string} ISO 8601 timestamp
 */
function now() {
  return new Date().toISOString();
}

/**
 * Safely reads and parses a JSON array from localStorage.
 * @param {string} key - The localStorage key to read
 * @returns {Array} Parsed array or empty array on failure
 */
function readArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage:`, e);
    return [];
  }
}

/**
 * Safely writes a JSON array to localStorage.
 * @param {string} key - The localStorage key to write
 * @param {Array} data - The array to persist
 */
function writeArray(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage:`, e);
  }
}

/**
 * Retrieves all posts from localStorage, sorted by createdAt descending.
 * @returns {Array<{id: string, title: string, content: string, createdAt: string, authorId: string, authorName: string}>}
 */
export function getPosts() {
  const posts = readArray(POSTS_KEY);
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Creates a new post and persists it to localStorage.
 * @param {{title: string, content: string, authorId: string, authorName: string}} post - The post data
 * @returns {{success: boolean, post?: object, error?: string}}
 */
export function createPost({ title, content, authorId, authorName }) {
  try {
    if (!title || !content || !authorId || !authorName) {
      return { success: false, error: 'All fields are required' };
    }
    const posts = readArray(POSTS_KEY);
    const newPost = {
      id: generateId(),
      title,
      content,
      createdAt: now(),
      authorId,
      authorName,
    };
    posts.push(newPost);
    writeArray(POSTS_KEY, posts);
    return { success: true, post: newPost };
  } catch (e) {
    console.error('Failed to create post:', e);
    return { success: false, error: 'Failed to create post' };
  }
}

/**
 * Updates an existing post by ID.
 * @param {{id: string, title: string, content: string}} post - The updated post data
 * @returns {{success: boolean, post?: object, error?: string}}
 */
export function updatePost({ id, title, content }) {
  try {
    if (!id || !title || !content) {
      return { success: false, error: 'All fields are required' };
    }
    const posts = readArray(POSTS_KEY);
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Post not found' };
    }
    posts[index] = { ...posts[index], title, content };
    writeArray(POSTS_KEY, posts);
    return { success: true, post: posts[index] };
  } catch (e) {
    console.error('Failed to update post:', e);
    return { success: false, error: 'Failed to update post' };
  }
}

/**
 * Deletes a post by ID.
 * @param {string} postId - The ID of the post to delete
 * @returns {{success: boolean, error?: string}}
 */
export function deletePost(postId) {
  try {
    if (!postId) {
      return { success: false, error: 'Post ID is required' };
    }
    const posts = readArray(POSTS_KEY);
    const filtered = posts.filter((p) => p.id !== postId);
    if (filtered.length === posts.length) {
      return { success: false, error: 'Post not found' };
    }
    writeArray(POSTS_KEY, filtered);
    return { success: true };
  } catch (e) {
    console.error('Failed to delete post:', e);
    return { success: false, error: 'Failed to delete post' };
  }
}

/**
 * Retrieves all users from localStorage.
 * @returns {Array<{id: string, displayName: string, username: string, password: string, role: string, createdAt: string}>}
 */
export function getUsers() {
  return readArray(USERS_KEY);
}

/**
 * Creates a new user and persists to localStorage.
 * @param {{displayName: string, username: string, password: string, role: string}} user - The user data
 * @returns {{success: boolean, user?: object, error?: string}}
 */
export function createUser({ displayName, username, password, role }) {
  try {
    if (!displayName || !username || !password) {
      return { success: false, error: 'All fields are required' };
    }
    const users = readArray(USERS_KEY);
    if (username === 'admin' || users.some((u) => u.username === username)) {
      return { success: false, error: 'Username already exists' };
    }
    const newUser = {
      id: generateId(),
      displayName,
      username,
      password,
      role: role || 'user',
      createdAt: now(),
    };
    users.push(newUser);
    writeArray(USERS_KEY, users);
    return { success: true, user: newUser };
  } catch (e) {
    console.error('Failed to create user:', e);
    return { success: false, error: 'Failed to create user' };
  }
}

/**
 * Deletes a user by ID.
 * @param {string} userId - The ID of the user to delete
 * @returns {{success: boolean, error?: string}}
 */
export function deleteUser(userId) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }
    const users = readArray(USERS_KEY);
    const filtered = users.filter((u) => u.id !== userId);
    if (filtered.length === users.length) {
      return { success: false, error: 'User not found' };
    }
    writeArray(USERS_KEY, filtered);
    return { success: true };
  } catch (e) {
    console.error('Failed to delete user:', e);
    return { success: false, error: 'Failed to delete user' };
  }
}

/**
 * Retrieves the current session from localStorage.
 * @returns {{userId: string, username: string, displayName: string, role: string} | null}
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    return null;
  } catch (e) {
    console.error('Failed to read session from localStorage:', e);
    return null;
  }
}

/**
 * Writes a session object to localStorage.
 * @param {{userId: string, username: string, displayName: string, role: string}} session - The session data
 */
export function setSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to write session to localStorage:', e);
  }
}

/**
 * Clears the current session from localStorage.
 */
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear session from localStorage:', e);
  }
}