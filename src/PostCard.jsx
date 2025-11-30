// src/PostCard.jsx
import React, { useState } from "react";
import { likePost, addComment, getComments } from "./api";

function PostCard({ post, currentUser, onUserClick }) {
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [hasLiked, setHasLiked] = useState(post.has_liked || false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const handleLike = async () => {
    try {
      const res = await likePost(post.id);
      setHasLiked(res.has_liked);
      setLikesCount(res.likes_count);
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    try {
      const newComment = await addComment(post.id, text);
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const full = await getComments(post.id);
      setComments(full);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoadingComments(false);
    }
  };

  return (
    <article className="post-card">
      <header className="post-header">
        <div className="post-avatar">
          {post.author_username?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="post-meta">
          <div
            className="post-author clickable-username"
            onClick={() =>
              onUserClick && onUserClick(post.author_username)
            }
          >
            @{post.author_username}
          </div>
          <div className="post-date">
            {new Date(post.created_at).toLocaleString()}
          </div>
        </div>
      </header>

      {post.media_url && (
        <div className="post-media">
          <img src={post.media_url} alt={post.caption || "Post"} />
        </div>
      )}

      {post.caption && <div className="post-caption">{post.caption}</div>}

      <div className="post-actions">
        <button
          className={`pill-button like-button ${hasLiked ? "liked" : ""}`}
          onClick={handleLike}
        >
          {hasLiked ? "♥ Liked" : "♡ Like"}
        </button>
        <span className="likes-count">{likesCount} likes</span>

        <button className="link-button" onClick={loadComments}>
          {loadingComments ? "Loading comments…" : "View comments"}
        </button>
      </div>

      <div className="post-comments">
        {comments.map((c) => (
          <div key={c.id} className="comment-row">
            <span
              className="comment-author clickable-username"
              onClick={() =>
                onUserClick && onUserClick(c.author_username)
              }
            >
              @{c.author_username}
            </span>
            <span className="comment-text"> {c.text}</span>
          </div>
        ))}
      </div>

      <form className="comment-form" onSubmit={handleAddComment}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>
    </article>
  );
}

export default PostCard;
