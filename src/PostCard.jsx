// src/PostCard.jsx
import React, { useEffect, useState } from "react";
import { likePost, getComments, addComment, API_BASE } from "./api";

const buildImageUrl = (raw) => {
  if (!raw) return "";
  const url = String(raw).trim();
  if (!url) return "";

  // 1) If it came from local dev DB (127.0.0.1 / localhost), rewrite to API_BASE
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
      // if parsing fails, just drop host and use as path
      const withoutHost = url.replace(/^https?:\/\/[^/]+/, "");
      return `${API_BASE}${withoutHost}`;
    }
  }

  // 2) Already points to our backend or some other absolute URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // 3) Relative path
  if (url.startsWith("/")) {
    return `${API_BASE}${url}`;
  }
  return `${API_BASE}/${url}`;
};

export default function PostCard({ post, currentUser, onOpenProfile }) {
  const [likes, setLikes] = useState(post.like_count || 0);
  const [hasLiked, setHasLiked] = useState(post.has_liked || false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentStatus, setCommentStatus] = useState("");

  const authorUsername = post.user?.username || "user";

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
    <div className="post-card">
      {/* HEADER */}
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

      {/* MEDIA */}
      {post.media_url && (
        <img
          src={buildImageUrl(post.media_url)}
          alt="post"
          className="post-media"
        />
      )}

      {/* CAPTION */}
      {post.caption && (
        <div className="post-caption">{post.caption}</div>
      )}

      {/* LIKE + META */}
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
                onClick={() =>
                  onOpenProfile && onOpenProfile(cUser)
                }
                style={{ cursor: "pointer" }}
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
