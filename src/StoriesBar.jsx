// src/StoriesBar.jsx
import React from "react";

function StoriesBar({ stories = [], currentUser }) {
  const handleAddStory = () => {
    // We already have upload story UI on the right side,
    // so here we can just scroll to it or later open a modal.
    const el = document.getElementById("create-story-panel");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="stories-bar">
      {/* Your story (add story) */}
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

        const imageUrl =
          story.image_url || story.media_url || story.url || story.photo_url;

        return (
          <div className="story-item" key={story.id}>
            <div className="story-avatar">
              {imageUrl ? (
                <img src={imageUrl} alt={username + " story"} />
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
