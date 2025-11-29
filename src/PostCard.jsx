// src/PostCard.jsx
import React, { useEffect, useState } from "react";
import { likePost, getComments, addComment, API_BASE } from "./api";

export default function PostCard({ post, currentUser, onOpenProfile, onLiked }) {
  const [likes, setLikes] = useState(post.like_count || 0);
  const [hasLiked, setHasLiked] = useState(post.has_liked || false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentStatus, setCommentStatus] = useState("");

  const authorUsername = post.user?.username || "user";

  // keep local like state in sync when feed updates
  useEffect(() => {
    setLikes(post.like_count || 0);
    setHasLiked(post.has_liked || false);
  }, [post.id, post.like_count, post.has_liked]);

  const buildImageUrl = (raw) => {
    if (!raw) return "";
    const url = String(raw).trim();
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${API_BASE}${url}`;
    return `${API_BASE}/${url}`;
  };

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
      if (onLiked) {
        onLiked(post.id, data);
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
      {/* Header */}
      <div className="post-header">
        <div
          className="post-author"
          onClick={() => onOpenProfile && onOpenProfile(authorUsername)}
        >
          <div className="post-avatar">
            {authorUsername[0]?.toUpperCase()}
          </div>
          <div className="post-author-text">
            <div className="post-author-username">@{authorUsername}</div>
            <div className="post-time">
              {new Date(post.created_at).toLocaleString()}
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
      {post.caption && <div className="post-caption">{post.caption}</div>}

      {/* Like & meta */}
      <div className="post-actions">
        <button type="button" onClick={handleLike}>
          {hasLiked ? "♥ Liked" : "♡ Like"}
        </button>
        <span className="post-like-count">{likes} likes</span>
      </div>

      {/* Comments */}
      <div className="comments">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <span className="comment-user">@{c.user.username}</span>{" "}
            <span>{c.text}</span>
          </div>
        ))}

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
