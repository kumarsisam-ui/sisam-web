// src/App.js
import React, { useEffect, useState } from "react";
import "./App.css";

import {
  getFeed,
  getStories,
  getNotifications,
  getConversations,
  searchAll,
  clearAuthToken,
} from "./api";

import LoginForm from "./LoginForm.jsx";
import StoriesBar from "./StoriesBar.jsx";
import UploadForm from "./UploadForm.jsx";
import MessagesPanel from "./MessagesPanel.jsx";
import PostCard from "./PostCard.jsx";

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

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  // --------- THEME ---------

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.toggle("light-theme", theme === "light");
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  // --------- LOAD DATA AFTER LOGIN ---------

  useEffect(() => {
    if (!currentUser) return;

    async function loadAll() {
      try {
        setLoading(true);
        const [feedData, storiesData, notifsData, convosData] =
          await Promise.all([
            getFeed(),
            getStories(),
            getNotifications(),
            getConversations(),
          ]);

        setFeed(feedData || []);
        setStories(storiesData || []);
        setNotifications(notifsData || []);
        setConversations(convosData || []);
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [currentUser]);

  // --------- SEARCH ---------

  const handleSearch = async () => {
    const q = searchText.trim();
    if (!q) return;

    try {
      const result = await searchAll(q);
      // for now just log; later we can show search results nicely
      console.log("Search results:", result);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // --------- AUTH ---------

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
    setSearchText("");
  };

  const handleLoginSuccess = (username) => {
    setCurrentUser(username);
  };

  // --------- BADGE COUNTS ---------

  const unreadNotifications = (notifications || []).filter(
    (n) => !n.is_read
  ).length;

  const unreadMessages = (conversations || []).filter(
    (c) => c.unread_count > 0
  ).length;

  // --------- RENDER ---------

  // not logged in → show login screen with header
  if (!currentUser) {
    return (
      <div className={`app-root ${theme}`}>
        <header className="top-bar gradient-bar">
          <div className="logo">Sisam</div>

          <div className="search-wrapper">
            <input
              className="search-input"
              placeholder="Search users or posts..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button className="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>

          <div className="top-actions">
            <button className="pill-button" onClick={toggleTheme}>
              {theme === "dark" ? "☀ Light" : "🌙 Dark"}
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

  // logged in → full app
  return (
    <div className={`app-root ${theme}`}>
      <header className="top-bar gradient-bar">
        <div className="logo">Sisam</div>

        {/* search + button */}
        <div className="search-wrapper">
          <input
            className="search-input"
            placeholder="Search users or posts..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>

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

      <main className="main-layout">
        <section className="left-column">
          <StoriesBar stories={stories} currentUser={currentUser} />

          {loading && (
            <div className="loading-indicator">Loading feed…</div>
          )}

          {!loading && feed.length === 0 && (
            <div className="empty-feed">No posts to show.</div>
          )}

          {feed.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
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

          <MessagesPanel currentUser={currentUser} />
        </section>
      </main>
    </div>
  );
}

export default App;
