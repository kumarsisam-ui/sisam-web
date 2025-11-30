// src/StoriesBar.jsx
import React from "react";
import { API_BASE } from "./api";

const buildImageUrl = (raw) => {
  if (!raw) return "";
  const url = String(raw).trim();

  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
};

export default function StoriesBar({
  stories,
  currentUser,
  onOpenProfile,
  onAddStoryClick,
}) {
  const list = Array.isArray(stories) ? stories : [];

  // Show at most one (latest) story per user in the bar
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
      {/* + ADD STORY (uses hidden input with id="story-upload-input") */}
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

        return (
          <div key={story.id} className="story-circle">
            <div className={isMe ? "story-avatar-ring-me" : "story-avatar-ring"}>
              <img
                src={buildImageUrl(story.media_url)}
                alt={`${username}'s story`}
                className="story-avatar-img"
                onClick={() =>
                  onOpenProfile && onOpenProfile(username)
                }
              />
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
          </div>
        );
      })}
    </div>
  );
}
