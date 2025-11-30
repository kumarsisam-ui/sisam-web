// src/App.js
import React, { useEffect, useState } from "react";
import "./App.css";
import {
  API_BASE,
  getFeed,
  getStories,
  getNotifications,
  getConversations,
  searchAll,
  clearAuthToken,
} from "./api";

import StoriesBar from "./StoriesBar.jsx";
import UploadForm from "./UploadForm.jsx";
import MessagesPanel from "./MessagesPanel.jsx";
import PostCard from "./PostCard.jsx";
import ProfileEdit from "./ProfileEdit.jsx";
import LoginForm from "./LoginForm.jsx";

function App() {
  const [currentUser, setCurrentUser] = useState(
    typeof localStorage !== "undefined"
      ? localStorage.getItem("username")
      : null
  );
  const [theme, setTheme] = useState(
    typeof localStorage !== "undefined"
      ? localStorage.getItem("theme") || "dark"
      : "dark"
  );
  const [feed, setFeed] = useState([]);
  const [stories, setStories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------- THEME ----------------

  useEffect(() => {
    document.body.classList.toggle("light-theme", theme === "light");
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  // ---------------- DATA LOAD ----------------

  useEffect(() => {
    if (!currentUser) return;

    async function loadAll() {
      try {
        setLoading(true);
        const [feedData, storiesData, notifData, convosData] =
          await Promise.all([
            getFeed(),
            getStories(),
            getNotifications(),
            getConversations(),
          ]);
        setFeed(feedData || []);
        setStories(storiesData || []);
        setNotifications(notifData || []);
        setConversations(convosData || []);
      } catch (err) {
        console.error("Error loading initial data", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [currentUser]);

  // ---------------- SEARCH ----------------

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }

    try {
      const results = await searchAll(q);
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleSearchKey = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ---------------- AUTH ----------------

  const handleLogout = () => {
    clearAuthToken();
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("username");
    }
    setCurrentUser(null);
    setFeed([]);
    setStories([]);
    setNotifications([]);
    setConversations([]);
    setSearchResults(null);
  };

  const handleLoginSuccess = (username) => {
    setCurrentUser(username);
  };

  // ---------------- RENDER HELPERS ----------------

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;
  const unreadMessages = conversations.filter((c) => c.unread_count > 0).length;

  // ---------------- MAIN RENDER ----------------

  if (!currentUser) {
    return (
      <div className={`app-root ${theme}`}>
        <header className="top-bar gradient-bar">
          <div className="logo">Sisam</div>
          <div className="search-wrapper">
            <input
              className="search-input"
              placeholder="Search users or posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKey}
            />
            <button className="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>
          <div className="top-actions">
            <button className="pill-button" onClick={() => setTheme("light")}>
              Home
            </button>
          </div>
        </header>

        <main className="main-layout">
          <div className="center-column">
            <LoginForm onLogin={handleLoginSuccess} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`app-root ${theme}`}>
      {/* TOP BAR */}
      <header className="top-bar gradient-bar">
        <div className="logo">Sisam</div>

        {/* SEARCH + BUTTON */}
        <div className="search-wrapper">
          <input
            className="search-input"
            placeholder="Search users or posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKey}
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>

        {/* RIGHT BUTTONS */}
        <div className="top-actions">
          <button className="pill-button">Home</button>
          <button className="pill-button">Explore</button>

          <button className="pill-button" onClick={toggleTheme}>
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>

          <button className="icon-pill">
            💬 <span className="badge">{unreadMessages}</span>
          </button>
          <button className="icon-pill">
            🔔 <span className="badge">{unreadNotifications}</span>
          </button>

          <span className="current-user">@{currentUser}</span>
          <button className="pill-button logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* LAYOUT */}
      <main className="main-layout">
        <section className="left-column">
          <StoriesBar
            stories={stories}
            currentUser={currentUser}
            onStoryUpload={() => {
              // reload stories after upload if you want
            }}
          />

          {loading && (
            <div className="loading-indicator">Loading feed...</div>
          )}

          {(searchResults?.posts || feed).length === 0 && !loading && (
            <div className="empty-feed">No posts to show.</div>
          )}

          {(searchResults?.posts || feed).map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onUserClick={(username) => setSelectedProfile(username)}
            />
          ))}
        </section>

        <section className="right-column">
          <UploadForm />

          <div className="sidebar-card">
            <h3>Notifications</h3>
            {notifications.length === 0 && (
              <p className="muted">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <div key={n.id} className="notification-item">
                {n.text}
              </div>
            ))}
          </div>

          <MessagesPanel
            currentUser={currentUser}
            conversations={conversations}
          />

          <ProfileEdit
            username={currentUser}
            selectedProfile={selectedProfile}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
