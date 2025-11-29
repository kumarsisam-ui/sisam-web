const API_URL = "https://sisam-backend.onrender.com";

// ---------------------- AUTH ----------------------

export async function signup(username, password) {
  const response = await fetch(`${API_URL}/users/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Signup failed");
  }

  return await response.json();
}

export async function login(username, password) {
  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  return await response.json();
}


// ---------------------- POSTS ----------------------

export async function createPost(token, content) {
  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }

  return await response.json();
}

export async function getPosts() {
  const response = await fetch(`${API_URL}/posts`);

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  return await response.json();
}


// ---------------------- MESSAGES ----------------------

export async function sendMessage(token, receiver, message) {
  const response = await fetch(`${API_URL}/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ receiver, message }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return await response.json();
}

export async function getMessages(token) {
  const response = await fetch(`${API_URL}/messages/inbox`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load messages");
  }

  return await response.json();
}


// ---------------------- PROFILE ----------------------

export async function getProfile(username) {
  const response = await fetch(`${API_URL}/users/profile/${username}`);

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return await response.json();
}
