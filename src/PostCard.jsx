// src/PostCard.jsx
import React, { useEffect, useState } from "react";
import { likePost, getComments, addComment, API_BASE } from "./api";

// Build a safe image URL that works on Render
const buildImageUrl = (raw) => {
  if (!raw) return "";
  const url = String(raw).trim();
  if (!url) return "";

  // Rewrite localhost URLs to API_BASE
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

  // Already absolute
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // Relative
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
};

export default function PostCard({ post, currentUser, onOpenProfile }) {
  const [likes, setLikes] = useState(post.like_count || 0);
  const [hasLiked, setHasLiked] = useState(post.has_liked || false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentStatus, setCommentStatus] = useState("");

  const username = post.user?.username || "user";
  const imageUrl = buildImageUrl(post.media_url);

  const loadComments = async () => {
    try {
      const data = await getComments(post.id);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Get comments error:", err);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const handleLike = async () => {
    try {
      const data = await likePost(post.id);
      if (data && typeof data.like_count === "number") {
        setLikes(data.like_count);
      }
      if (data && typeof data.has_liked === "boolean") {
        setHasLiked(data.has_liked);
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setCommentStatus("");
      await addComment(post.id, newComment.trim());
      setNewComment("");
      await loadComments();
    } catch (err) {
      console.error("Add comment error:", err);
      setCommentStatus("Failed to add comment.");
    }
  };

  return (
    <div
      className="post-card"
      style={{
        border: "2px solid #ff00ff",
        boxShadow: "0 0 10px rgba(255,0,255,0.5)",
        position: "relative",
      }}
    >
      {/* BIG DEBUG LABEL SO WE KNOW THIS FILE IS LIVE */}
      <div
        style={{
          position: "absolute",
          top: -12,
          right: 8,
          background: "yellow",
          color: "black",
          fontSize: 10,
          padding: "2px 4px",
          borderRadius: 4,
          zIndex: 5,
        }}
      >
        DEBUG POST CARD
      </div>

      {/* HEADER */}
      <div className="post-header">
        <div
          className="post-author"
          onClick={() => onOpenProfile && onOpenProfile(username)}
          style={{ cursor: "pointer" }}
        >
          <div className="post-avatar">
            {username[0]?.toUpperCase()}
          </div>
          <div className="post-author-text">
            <div className="post-author-username">@{username}</div>
            <div className="post-time">
              {post.created_at
                ? new Date(post.created_at).toLocaleString()
                : ""}
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE */}
      {post.media_url && (
        <div className="post-media-wrapper">
          <a href={imageUrl} target="_blank" rel="noreferrer">
            <img
              src={imageUrl}
              alt="post"
              className="post-media"
              onError={(e) => {
                console.error("Post image load error:", imageUrl);
                e.currentTarget.style.display = "none";
              }}
            />
          </a>

          {/* VERY SMALL URL DEBUG TEXT */}
          <div
            style={{
              fontSize: 10,
              color: "#888",
              marginTop: 4,
              wordBreak: "break-all",
            }}
          >
            img src: {imageUrl}
          </div>
        </div>
      )}

      {/* CAPTION */}
      {post.caption && (
        <div className="post-caption">{post.caption}</div>
      )}

      {/* LIKE + COUNT */}
      <div className="post-actions">
        <button type="button" onClick={handleLike}>
          {hasLiked ? "♥ Liked" : "♡ Like"}
        </button>
        <span className="post-like-count">{likes} likes</span>
      </div>

      {/* COMMENTS */}
      <div className="comments">
        {comments.map((c) => {
          const cUser = c.user?.username || "user";
          return (
            <div key={c.id} className="comment-item">
              <span
                className="comment-user"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  onOpenProfile && onOpenProfile(cUser)
                }
              >
                @{cUser}
              </span>{" "}
              <span>{c.text}</span>
            </div>
          );
        })}

        {currentUser && (
          <div className="comment-form">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <button type="button" onClick={handleAddComment}>
              Post
            </button>
          </div>
        )}

        {commentStatus && (
          <div className="comment-status">{commentStatus}</div>
        )}
      </div>
    </div>
  );
}
