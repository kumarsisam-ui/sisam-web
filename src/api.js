// src/api.js
import axios from "axios";

// Base URL for the backend API
// In Vercel, REACT_APP_API_BASE is set.
// Fallback to the Render backend URL (NOT 127.0.0.1).
export const API_BASE =
  process.env.REACT_APP_API_BASE || "https://sisam-backend.onrender.com";

// ---------- MEDIA URL NORMALIZER ----------
// Make sure any stored image path or URL works against the deployed backend.
export function normalizeMediaUrl(path) {
  if (!path) return null;
  if (typeof path !== "string") return null;

  const trimmed = path.trim();
  if (!trimmed) return null;

  try {
    // Case 1: full URL (http://..., https://...)
    const u = new URL(trimmed);
    // Force it to use our backend host, but keep the path/query
    return `${API_BASE}${u.pathname}${u.search}`;
  } catch {
    // Case 2: relative path or filename

    // If it already starts with "/", just stick API_BASE in front:
    //   "/uploads/xyz.jpg"  ->  "https://sisam-backend.onrender.com/uploads/xyz.jpg"
    if (trimmed.startsWith("/")) {
      return `${API_BASE}${trimmed}`;
    }

    // Otherwise just prefix a "/" and API_BASE:
    //   "uploads/xyz.jpg"   ->  "https://sisam-backend.onrender.com/uploads/xyz.jpg"
    //   "xyz.jpg"           ->  "https://sisam-backend.onrender.com/xyz.jpg"
    return `${API_BASE}/${trimmed}`;
  }
}
// ------------- AUTH TOKEN HANDLING -------------
let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  try {
    localStorage.setItem("token", token);
  } catch {
    // ignore
  }
}

export function clearAuthToken() {
  authToken = null;
  try {
    localStorage.removeItem("token");
  } catch {
    // ignore
  }
}

// ... keep the REST of your existing api.js file EXACTLY as it was ...

// ---------------- AUTH TOKEN HANDLING ----------------

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  try {
    localStorage.setItem("token", token);
  } catch {
    // ignore
  }
}

export function clearAuthToken() {
  authToken = null;
  try {
    localStorage.removeItem("token");
  } catch {
    // ignore
  }
}

export function getAuthHeaders() {
  const token =
    authToken ||
    (typeof localStorage !== "undefined" && localStorage.getItem("token"));
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------------- AUTH ----------------

export async function signup(username, password) {
  const res = await axios.post(`${API_BASE}/users/signup`, {
    username,
    password,
  });
  return res.data;
}

export async function login(username, password) {
  const res = await axios.post(`${API_BASE}/users/login`, {
    username,
    password,
  });

  // backend returns { token, username }
  setAuthToken(res.data.token);
  try {
    localStorage.setItem("username", res.data.username);
  } catch {
    // ignore
  }

  return res.data;
}

// ---------------- POSTS ----------------

export async function getFeed() {
  const res = await axios.get(`${API_BASE}/posts/feed`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

export async function createPost({ caption, file }) {
  const form = new FormData();
  form.append("caption", caption);
  form.append("media", file); // backend expects "media" for posts

  const res = await axios.post(`${API_BASE}/posts/`, form, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function likePost(postId) {
  const res = await axios.post(
    `${API_BASE}/posts/${postId}/like`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function getComments(postId) {
  const res = await axios.get(`${API_BASE}/posts/${postId}/comments`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

export async function addComment(postId, text) {
  const res = await axios.post(
    `${API_BASE}/posts/${postId}/comments`,
    { text }, // JSON body
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function updatePost(postId, caption) {
  const res = await axios.put(
    `${API_BASE}/posts/${postId}`,
    { caption },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function deletePost(postId) {
  await axios.delete(`${API_BASE}/posts/${postId}`, {
    headers: getAuthHeaders(),
  });
}

// ---------------- STORIES ----------------

export async function getStories() {
  const res = await axios.get(`${API_BASE}/stories/`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

export async function createStory({ caption, file }) {
  const form = new FormData();
  form.append("caption", caption);
  form.append("file", file); // backend expects "file" for stories

  const res = await axios.post(`${API_BASE}/stories/`, form, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function updateStory(storyId, caption) {
  const res = await axios.put(
    `${API_BASE}/stories/${storyId}`,
    { caption },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function deleteStory(storyId) {
  await axios.delete(`${API_BASE}/stories/${storyId}`, {
    headers: getAuthHeaders(),
  });
}

// ---------------- PROFILE / FOLLOW ----------------

export async function getProfile(username) {
  const res = await axios.get(`${API_BASE}/users/${username}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

export async function followUser(username) {
  const res = await axios.post(
    `${API_BASE}/users/${username}/follow`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function unfollowUser(username) {
  const res = await axios.post(
    `${API_BASE}/users/${username}/unfollow`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function updateProfile(data) {
  // e.g. { full_name: "New Name" }
  const res = await axios.put(`${API_BASE}/users/me`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

// ---------------- NOTIFICATIONS ----------------

export async function getNotifications() {
  const res = await axios.get(`${API_BASE}/notifications/`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

// backend marks ALL as read at /notifications/mark_read
export async function markNotificationRead() {
  const res = await axios.post(
    `${API_BASE}/notifications/mark_read`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
}

// ---------------- SEARCH ----------------

export async function searchAll(query) {
  const res = await axios.get(`${API_BASE}/search`, {
    params: { q: query },
    headers: getAuthHeaders(),
  });
  return res.data;
}

// ---------------- MESSAGES / CHAT ----------------

export async function getConversations() {
  const res = await axios.get(`${API_BASE}/messages/conversations`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

export async function getMessagesWith(username) {
  const res = await axios.get(`${API_BASE}/messages/with/${username}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

export async function sendMessageTo(username, text) {
  const res = await axios.post(
    `${API_BASE}/messages/with/${username}`,
    { text },
    { headers: getAuthHeaders() }
  );
  return res.data;
}
