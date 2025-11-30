// src/StoriesBar.jsx
import React from "react";
import { normalizeMediaUrl } from "./api";

function StoriesBar({ stories = [], currentUser }) {
  const handleAddStory = () => {
    const el = document.getElementById("create-story-panel");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="stories-bar">
      {/* Add story bubble */}
      <button className="story-item story-add" onClick={handleAddStory}>
        <div className="story-avatar add-avatar">+</div>
        <div className="story-username">
          {currentUser ? `@${currentUser}` : "Your story"}
        </div>
      </button>

      {/* Other users' stories */}
      {stories.map((story) => {
        const username =
          story.username ||
          story.user_username ||
          story.author_username ||
          "user";

        // Try many possible image fields
        const rawImage =
          story.image_url ||
          story.media_url ||
          story.photo_url ||
          story.thumbnail_url ||
          story.image ||
          story.file_path ||
          story.path ||
          story.url;

        const imgSrc = normalizeMediaUrl(rawImage);

        return (
          <div className="story-item" key={story.id}>
            <div className="story-avatar">
              {imgSrc ? (
                <img src={imgSrc} alt={`${username} story`} />
              ) : (
                <span>{username[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="story-username">@{username}</div>
          </div>
        );
      })}
    </div>
  );
}

export default StoriesBar;
