// src/StoriesBar.jsx
import React, { useState } from "react";
import { API_BASE } from "./api";

function buildMediaUrl(raw) {
  if (!raw) return "";
  const url = String(raw).trim();

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${API_BASE}${url}`;
  }
  return `${API_BASE}/${url}`;
}

export default function StoriesBar({
  stories,
  currentUser,
  onOpenProfile,
  onAddStoryClick,
}) {
  const [activeStory, setActiveStory] = useState(null);

  const handleStoryClick = (story) => {
    setActiveStory(story);
  };

  const closeModal = () => setActiveStory(null);

  const renderStoryCircle = (story) => {
    const username = story.user?.username || "user";
    const isMe = currentUser && currentUser === username;

    return (
      <div
        key={story.id}
        className="story-circle"
        onClick={() => handleStoryClick(story)}
      >
        <div className={isMe ? "story-avatar-ring-me" : "story-avatar-ring"}>
          <img
            src={buildMediaUrl(story.media_url)}
            alt={`${username} story`}
            className="story-avatar-img"
          />
        </div>

        <button
          type="button"
          className="story-username"
          onClick={(e) => {
            e.stopPropagation(); // don’t open modal when clicking name
            onOpenProfile && onOpenProfile(username);
          }}
        >
          @{username}
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Story row */}
      <div className="stories-bar">
        {/* + Add story circle (only when logged in) */}
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

        {/* Existing stories */}
        {Array.isArray(stories) && stories.length > 0
          ? stories.map(renderStoryCircle)
          : null}
      </div>

      {/* Story modal */}
      {activeStory && (
        <div
          className="story-modal-backdrop"
          onClick={closeModal}
        >
          <div
            className="story-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="story-modal-header">
              <div>
                @{activeStory.user?.username || "user"} ·{" "}
                {activeStory.created_at
                  ? new Date(activeStory.created_at).toLocaleString()
                  : ""}
              </div>
              <button type="button" onClick={closeModal}>
                ✕
              </button>
            </div>

            <img
              src={buildMediaUrl(activeStory.media_url)}
              alt="story"
              className="story-modal-img"
            />

            {activeStory.caption && (
              <div className="story-modal-caption">
                {activeStory.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
