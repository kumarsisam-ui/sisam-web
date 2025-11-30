// src/StoriesBar.jsx
import React from "react";
import { API_BASE } from "./api";

const buildImageUrl = (raw) => {
  if (!raw) return "";
  const url = String(raw).trim();
  if (!url) return "";

  if (
    url.startsWith("http://127.0.0.1") ||
    url.startsWith("https://127.0.0.1") ||
    url.startsWith("http://localhost") ||
    url.startsWith("https://localhost")
  ) {
    try {
      const u = new URL(url);
      return `${API_BASE}${u.pathname}${u.search}`;
    } catch {
      const withoutHost = url.replace(/^https?:\/\/[^/]+/, "");
      return `${API_BASE}${withoutHost}`;
    }
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE}${url}`;
  }
  return `${API_BASE}/${url}`;
};

export default function StoriesBar({
  stories,
  currentUser,
  onOpenProfile,
  onAddStoryClick,
}) {
  const list = Array.isArray(stories) ? stories : [];

  // Latest story per user
  const byUser = {};
  for (const s of list) {
    const username = s.user?.username || "user";
    if (!byUser[username]) {
      byUser[username] = s;
    } else {
      const prev = byUser[username];
      const prevTime = prev.created_at ? new Date(prev.created_at) : 0;
      const newTime = s.created_at ? new Date(s.created_at) : 0;
      if (newTime > prevTime) byUser[username] = s;
    }
  }
  const storyList = Object.values(byUser);

  return (
    <div className="stories-bar">
      {/* + ADD STORY */}
      {currentUser && (
        <div
          className="story-circle add-story-circle"
          onClick={() => onAddStoryClick && onAddStoryClick()}
        >
          <div className="add-story-ring">
            <span className="add-story-plus">+</span>
          </div>
          <div className="story-username">@{currentUser}</div>
        </div>
      )}

      {/* EXISTING STORIES */}
      {storyList.map((story) => {
        const username = story.user?.username || "user";
        const isMe = currentUser && username === currentUser;
        const storyUrl = buildImageUrl(story.media_url);

        return (
          <div key={story.id} className="story-circle">
            <div className={isMe ? "story-avatar-ring-me" : "story-avatar-ring"}>
              {/* Wrap in <a> so you can open story image in new tab */}
              <a href={storyUrl} target="_blank" rel="noreferrer">
                <img
                  src={storyUrl}
                  alt={`${username}'s story`}
                  className="story-avatar-img"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenProfile && onOpenProfile(username);
                  }}
                />
              </a>
            </div>
            <button
              type="button"
              className="story-username"
              onClick={() =>
                onOpenProfile && onOpenProfile(username)
              }
            >
              @{username}
            </button>
            {/* Debug text for story URL */}
            <div
              style={{ fontSize: "9px", color: "#888", marginTop: "2px" }}
            >
              story src: {storyUrl}
            </div>
          </div>
        );
      })}
    </div>
  );
}
