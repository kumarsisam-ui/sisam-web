// src/App.js
import React, { useEffect, useState } from "react";
import {
  login,
  clearAuthToken,
  getFeed,
  getStories,
  getProfile,
  followUser,
  unfollowUser,
  getNotifications,
  markNotificationRead,
  searchAll,
} from "./api";

import PostCard from "./PostCard";
import MessagesPanel from "./MessagesPanel";
import StoryUpload from "./StoryUpload";
import UploadForm from "./UploadForm";
import StoriesBar from "./StoriesBar";
import ProfileEdit from "./ProfileEdit";

import "./App.css";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [feed, setFeed] = useState([]);
  const [stories, setStories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [status, setStatus] = useState("");

  const [viewingProfile, setViewingProfile] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showChatDropdown, setShowChatDropdown] = useState(false);

  // which user’s chat is open
  const [chatUser, setChatUser] = useState(null);

  // 🌗 theme: "light" or "dark"
  const [theme, setTheme] = useState("dark");

  const loggedIn = !!currentUser;

  // ---------- REHYDRATE LOGIN STATE ON PAGE LOAD ----------

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        // In this app, token === username
        setCurrentUser(storedToken);
      }
    } catch {
      // ignore
    }
  }, []);

  // ---------- THEME EFFECT ----------

  useEffect(() => {
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  // ---------- LOADERS ----------

  const loadFeed = async () => {
    try {
      const data = await getFeed();
      setFeed(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Feed error:", err);
    }
  };

  const loadStories = async () => {
    try {
      const data = await getStories();
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Stories error:", err);
    }
  };

  const loadNotifications = async () => {
    if (!loggedIn) return;
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Notifications error:", err);
    }
  };

  // Faster periodic refresh (feed + stories + notifications)
  useEffect(() => {
    if (loggedIn) {
      // Initial load
      loadFeed();
      loadStories();
      loadNotifications();

      const interval = setInterval(() => {
        loadFeed();
        loadStories();
        loadNotifications();
      }, 3000); // every 3 seconds

      return () => clearInterval(interval);
    } else {
      setFeed([]);
      setStories([]);
      setNotifications([]);
      setChatUser(null);
    }
  }, [loggedIn]);

  // ---------- AUTH ----------

  const handleLogin = async () => {
    try {
      setStatus("");
      const res = await login(loginData.username, loginData.password);
      if (res?.token) {
        const usernameFromBackend = res.username || loginData.username;

        setCurrentUser(usernameFromBackend);
        setStatus("Logged in!");

        try {
          localStorage.setItem("token", res.token);
        } catch {
          // ignore
        }

        await loadFeed();
        await loadStories();
        await loadNotifications();
      } else {
        setStatus("❌ Invalid login response");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Invalid username or password");
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    setViewingProfile(null);
    setProfileData(null);
    setFeed([]);
    setStories([]);
    setNotifications([]);
    setStatus("");
    setShowNotifDropdown(false);
    setShowChatDropdown(false);
    setChatUser(null);
  };

  // ---------- PROFILE ----------

  const openProfile = async (username) => {
    try {
      let data = null;

      // Try backend profile endpoint
      try {
        data = await getProfile(username);
      } catch (err) {
        console.error("getProfile failed, falling back to local data:", err);
      }

      // Fallback: build a minimal profile from feed posts
      if (!data) {
        const userPosts = feed.filter(
          (p) => p.user && p.user.username === username
        );
        data = {
          username,
          full_name: "",
          followers_count: 0,
          following_count: 0,
          is_following: false,
          posts: userPosts,
        };
      }

      setProfileData(data || null);
      setViewingProfile(username);
    } catch (err) {
      console.error("openProfile error:", err);
    }
  };

  const handleProfileUpdated = (updatedProfile) => {
    setProfileData(updatedProfile);
  };

  const toggleFollow = async () => {
    if (!profileData) return;
    try {
      if (profileData.is_following) {
        await unfollowUser(profileData.username);
      } else {
        await followUser(profileData.username);
      }

      // Refresh full profile + notifications
      try {
        const updated = await getProfile(profileData.username);
        setProfileData(updated || profileData);
      } catch (err) {
        console.error("Refresh profile after follow failed:", err);
        setProfileData({
          ...profileData,
          is_following: !profileData.is_following,
        });
      }

      await loadNotifications();
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  // ---------- SEARCH ----------

  const handleSearchChange = async (e) => {
    const q = e.target.value;
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const data = await searchAll(q.trim());
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleSearchClickUser = (username) => {
    setSearchResults([]);
    openProfile(username);
  };

  // ---------- NOTIFICATIONS ----------

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const messageNotifs = notifications.filter((n) => n.type === "message");
  const unreadChatCount = messageNotifs.filter((n) => !n.is_read).length;

  const readNotif = async (id) => {
    try {
      await markNotificationRead(id);
      await loadNotifications();
    } catch (err) {
      console.error("Mark notification read failed:", err);
    }
  };

  // ---------- STORIES: + button ----------

  const handleAddStoryClick = () => {
    const input = document.getElementById("story-upload-input");
    if (input) input.click();
  };

  // ---------- POST callbacks ----------

  const handlePostLiked = async () => {
    await loadNotifications();
  };

  // ---------- MESSAGES callbacks ----------

  const handleNewMessage = async () => {
    await loadNotifications();
  };

  const openChatFromHeader = (username) => {
    setChatUser(username);
    // scroll Messages panel into view like Messenger
    const panel = document.getElementById("messages-panel");
    if (panel) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ---------- RENDER ----------

  return (
    <div className={`App ${theme === "dark" ? "App-dark" : "App-light"}`}>
      {/* HEADER */}
      <header className="top-bar">
        <div className="logo">Sisam</div>

        <input
          className="search"
          placeholder="Search users or posts..."
          onChange={handleSearchChange}
        />

        <div className="nav-items">
          <button
            onClick={() => {
              setViewingProfile(null);
              setProfileData(null);
              loadFeed();
            }}
          >
            Home
          </button>

          <button
            onClick={() => {
              setViewingProfile(null);
              setProfileData(null);
              loadFeed();
              loadStories();
            }}
          >
            Explore
          </button>

          {/* Theme toggle */}
          <button type="button" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark" : "☀ Light"}
          </button>

          {/* CHAT ICON like Facebook Messenger */}
          {loggedIn && (
            <div className="chat-wrapper">
              <button
                type="button"
                className="chat-btn"
                onClick={() => {
                  setShowChatDropdown((open) => !open);
                  setShowNotifDropdown(false);
                }}
              >
                💬 {unreadChatCount}
              </button>

              {showChatDropdown && (
                <div className="chat-dropdown">
                  {messageNotifs.length === 0 && (
                    <div className="chat-item chat-empty">
                      No new messages
                    </div>
                  )}

                  {messageNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`chat-item ${n.is_read ? "read" : ""}`}
                      onClick={async () => {
                        if (n.actor && n.actor.username) {
                          openChatFromHeader(n.actor.username);
                        }
                        await readNotif(n.id);
                        setShowChatDropdown(false);
                      }}
                    >
                      <div className="chat-item-avatar">
                        {n.actor?.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="chat-item-text">
                        <div className="chat-item-username">
                          @{n.actor?.username || "user"}
                        </div>
                        <div className="chat-item-message">{n.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATION BELL */}
          {loggedIn && (
            <div className="notif-wrapper">
              <button
                type="button"
                className="notif-btn"
                onClick={() => {
                  setShowNotifDropdown((open) => !open);
                  setShowChatDropdown(false);
                }}
              >
                🔔 {unreadCount}
              </button>

              {showNotifDropdown && (
                <div className="notif-dropdown">
                  {notifications.length === 0 && (
                    <div className="notif-item notif-empty">
                      No notifications
                    </div>
                  )}

                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${n.is_read ? "read" : ""}`}
                      onClick={async () => {
                        await readNotif(n.id);
                        setShowNotifDropdown(false);
                        if (n.type === "message" && n.actor?.username) {
                          openChatFromHeader(n.actor.username);
                        }
                      }}
                    >
                      {n.actor?.username
                        ? `@${n.actor.username} ${n.message}`
                        : n.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {loggedIn && <span>@{currentUser}</span>}

          {loggedIn && (
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </header>

      {/* SEARCH RESULTS DROPDOWN */}
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((item, idx) => (
            <div
              key={idx}
              className="search-item"
              onClick={() => handleSearchClickUser(item.username)}
            >
              @{item.username}
            </div>
          ))}
        </div>
      )}

      {/* LOGIN BOX (when logged out) */}
      {!loggedIn && (
        <div className="login-box">
          <h3>Login</h3>
          <input
            placeholder="Username"
            value={loginData.username}
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />
          <button type="button" onClick={handleLogin}>
            Login
          </button>
          {status && <p className="status">{status}</p>}
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="page-layout">
        {/* LEFT: STORIES + FEED / PROFILE */}
        <main className="main-feed">
          <StoriesBar
            stories={stories}
            currentUser={currentUser}
            onOpenProfile={openProfile}
            onAddStoryClick={handleAddStoryClick}
          />

          {viewingProfile && profileData ? (
            <div className="profile-view">
              <h2>@{profileData.username}</h2>
              <p>{profileData.full_name}</p>
              <p>
                Followers: {profileData.followers_count} · Following:{" "}
                {profileData.following_count}
              </p>

              {/* Edit profile if it's me */}
              {currentUser && currentUser === profileData.username && (
                <ProfileEdit
                  profile={profileData}
                  onUpdated={handleProfileUpdated}
                />
              )}

              {/* Follow/unfollow if not me */}
              {currentUser && currentUser !== profileData.username && (
                <button type="button" onClick={toggleFollow}>
                  {profileData.is_following ? "Unfollow" : "Follow"}
                </button>
              )}

              <h3>Posts</h3>
              {Array.isArray(profileData.posts) &&
                profileData.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onOpenProfile={openProfile}
                    onLiked={handlePostLiked}
                  />
                ))}
            </div>
          ) : (
            <>
              <h2 className="feed-title">Home Feed</h2>
              {feed.length === 0 && <p>No posts to show.</p>}
              {feed.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onOpenProfile={openProfile}
                  onLiked={handlePostLiked}
                />
              ))}
            </>
          )}
        </main>

        {/* RIGHT: SIDEBAR */}
        <aside className="side-panel">
          <StoryUpload currentUser={currentUser} onUploaded={loadStories} />
          <UploadForm currentUser={currentUser} onPosted={loadFeed} />

          <div className="sidebar-card">
            <h4>Notifications</h4>
            {notifications.length === 0 ? (
              <p style={{ fontSize: 12, margin: 0 }}>No notifications yet.</p>
            ) : (
              <ul className="notif-list">
                {notifications.slice(0, 5).map((n) => (
                  <li
                    key={n.id}
                    className={n.is_read ? "read" : ""}
                    onClick={() => readNotif(n.id)}
                  >
                    {n.actor?.username
                      ? `@${n.actor.username} ${n.message}`
                      : n.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div id="messages-panel">
            <MessagesPanel
              currentUser={currentUser}
              onNewMessage={handleNewMessage}
              activeUser={chatUser}
              onChangeActiveUser={setChatUser}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
