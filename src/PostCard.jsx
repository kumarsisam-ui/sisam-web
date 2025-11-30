// src/PostCard.jsx
import React, { useEffect, useState } from "react";
import { likePost, getComments, addComment, API_BASE } from "./api";

function buildImageUrl(raw) {
  if (!raw) return "";
  const url = String(raw).trim();

  // Already absolute?
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If backend returned "uploads/..." or "/uploads/..."
  if (url.startsWith("/")) {
    return `${API_BASE}${url}`;
  }
  return `${API_BASE}/${url}`;
}

export default function PostCard({ post, currentUser, onOpenProfile }) {
  const [likes, setLikes] = useState(post.like_count || 0);
  const [hasLiked, setHasLiked] = useState(post.has_liked || false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentStatus, setCommentStatus] = useState("");

  const authorUsername = post.user?.username || "user";

  // -------- COMMENTS --------

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

  // -------- LIKE --------

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
      // Optional tiny status, instead of alert:
      // setCommentStatus("Failed to like post.");
    }
  };

  // -------- ADD COMMENT --------

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

  // -------- RENDER --------

  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-header">
        <div
          className="post-author"
          onClick={() =>
            onOpenProfile && onOpenProfile(authorUsername)
          }
        >
          <div className="post-avatar">
            {authorUsername[0]?.toUpperCase()}
          </div>
          <div className="post-author-text">
            <div className="post-author-username">@{authorUsername}</div>
            <div className="post-time">
              {post.created_at
                ? new Date(post.created_at).toLocaleString()
                : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Media */}
      {post.media_url && (
        <img
          src={buildImageUrl(post.media_url)}
          alt="post"
          className="post-media"
        />
      )}

      {/* Caption */}
      {post.caption && (
        <div className="post-caption">{post.caption}</div>
      )}

      {/* Like & meta */}
      <div className="post-actions">
        <button type="button" onClick={handleLike}>
          {hasLiked ? "♥ Liked" : "♡ Like"}
        </button>
        <span className="post-like-count">{likes} likes</span>
      </div>

      {/* Comments */}
      <div className="comments">
        {comments.map((c) => {
          const cUser = c.user?.username || "user";
          return (
            <div key={c.id} className="comment-item">
              <button
                type="button"
                className="comment-user"
                onClick={() =>
                  onOpenProfile && onOpenProfile(cUser)
                }
              >
                @{cUser}
              </button>{" "}
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
