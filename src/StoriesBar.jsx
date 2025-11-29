// src/StoriesBar.jsx
import React, { useMemo, useState } from "react";
import { API_BASE } from "./api";

function buildMediaUrl(raw) {
  if (!raw) return "";
  const url = String(raw).trim();
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
}

export default function StoriesBar({
  stories,
  currentUser,
  onOpenProfile,
  onAddStoryClick,
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // flat list for viewer navigation
  const orderedStories = useMemo(() => {
    if (!Array.isArray(stories)) return [];
    return [...stories].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [stories]);

  const openViewerAt = (idx) => {
    if (idx < 0 || idx >= orderedStories.length) return;
    setViewerIndex(idx);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);

  const showPrev = () => {
    setViewerIndex((i) => (i > 0 ? i - 1 : i));
  };

  const showNext = () => {
    setViewerIndex((i) => (i < orderedStories.length - 1 ? i + 1 : i));
  };

  const activeStory =
    viewerOpen && orderedStories.length > 0
      ? orderedStories[viewerIndex]
      : null;

  return (
    <>
      <div className="stories-bar">
        {/* Add story circle */}
        {currentUser && (
          <div className="add-story-circle">
            <div className="add-story-ring" onClick={onAddStoryClick}>
              <div className="add-story-plus">+</div>
            </div>
            <div
              className="story-username"
              onClick={() => onOpenProfile && onOpenProfile(currentUser)}
            >
              @{currentUser}
            </div>
          </div>
        )}

        {/* Existing stories */}
        {orderedStories.map((story, idx) => {
          const username = story.user?.username || "user";
          const isMe = currentUser && username === currentUser;
          return (
            <div
              key={story.id}
              className="story-circle"
              onClick={() => openViewerAt(idx)}
            >
              <div
                className={
                  isMe ? "story-avatar-ring-me" : "story-avatar-ring"
                }
              >
                <img
                  src={buildMediaUrl(story.media_url)}
                  alt={story.caption || "story"}
                  className="story-avatar-img"
                />
              </div>
              <button
                type="button"
                className="story-username"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProfile && onOpenProfile(username);
                }}
              >
                @{username}
              </button>
            </div>
          );
        })}
      </div>

      {/* Story modal viewer */}
      {viewerOpen && activeStory && (
        <div
          className="story-modal-backdrop"
          onClick={closeViewer}
        >
          <div
            className="story-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="story-modal-header">
              <span>
                @{activeStory.user?.username || "user"} ·{" "}
                {new Date(activeStory.created_at).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={closeViewer}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#fff",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            <img
              src={buildMediaUrl(activeStory.media_url)}
              alt={activeStory.caption || "story"}
              className="story-modal-img"
            />
            {activeStory.caption && (
              <div className="story-modal-caption">
                {activeStory.caption}
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <button
                type="button"
                disabled={viewerIndex === 0}
                onClick={showPrev}
                style={{
                  borderRadius: 999,
                  border: "none",
                  padding: "4px 10px",
                  background: "#444",
                  color: "#fff",
                  fontSize: 12,
                  cursor: viewerIndex === 0 ? "default" : "pointer",
                  opacity: viewerIndex === 0 ? 0.4 : 1,
                }}
              >
                ◀ Prev
              </button>
              <button
                type="button"
                disabled={viewerIndex === orderedStories.length - 1}
                onClick={showNext}
                style={{
                  borderRadius: 999,
                  border: "none",
                  padding: "4px 10px",
                  background: "#444",
                  color: "#fff",
                  fontSize: 12,
                  cursor:
                    viewerIndex === orderedStories.length - 1
                      ? "default"
                      : "pointer",
                  opacity:
                    viewerIndex === orderedStories.length - 1 ? 0.4 : 1,
                }}
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
