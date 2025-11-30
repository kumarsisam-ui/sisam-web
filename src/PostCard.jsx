// src/PostCard.jsx
import React, { useState } from "react";
import { likePost, addComment, normalizeMediaUrl } from "./api";

function PostCard({ post, currentUser }) {
  const username =
    post.username || post.user_username || post.author_username || "user";

  const createdAt = post.created_at || post.createdAt || post.timestamp;

  const rawImage =
    post.image_url || post.media_url || post.photo_url || post.url;
  const imgSrc = normalizeMediaUrl(rawImage);

  const [liked, setLiked] = useState(
    post.liked_by_current_user || post.is_liked || false
  );
  const [likes, setLikes] = useState(
    post.like_count ?? post.likes ?? 0
  );

  const [comments, setComments] = useState(
    post.comments || post.latest_comments || []
  );
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLike = async () => {
    if (!post.id || busy) return;
    setBusy(true);
    try {
      // optimistic toggle
      setLiked((prev) => !prev);
      setLikes((prev) => prev + (liked ? -1 : 1));
      await likePost(post.id);
    } catch (err) {
      console.error("Like failed", err);
      // revert on error
      setLiked((prev) => !prev);
      setLikes((prev) => prev + (liked ? 1 : -1));
    } finally {
      setBusy(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !post.id || busy) return;

    setBusy(true);
    try {
      const text = commentText.trim();
      setCommentText("");

      let newComment;
      try {
        newComment = await addComment(post.id, text);
      } catch {
        newComment = {
          id: Math.random().toString(36).slice(2),
          username: currentUser || "you",
          text,
        };
      }
      setComments((prev) => [...prev, newComment]);
    } catch (err) {
      console.error("Add comment failed", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="post-card">
      <header className="post-header">
        <div className="post-avatar">
          <span>{username[0]?.toUpperCase()}</span>
        </div>
        <div className="post-meta">
          <span className="post-author">@{username}</span>
          {createdAt && (
            <span className="post-date">
              {new Date(createdAt).toLocaleString()}
            </span>
          )}
        </div>
      </header>

      {imgSrc && (
        <div className="post-media">
          <img src={imgSrc} alt={post.caption || "post"} />
        </div>
      )}

      {post.caption && (
        <div className="post-caption">{post.caption}</div>
      )}

      <div className="post-actions">
        <button
          className={`like-button ${liked ? "liked" : ""}`}
          onClick={handleLike}
          disabled={busy}
        >
          ♡ Like
        </button>
        <span className="likes-count">{likes} likes</span>
      </div>

      <div className="post-comments">
        {comments &&
          comments.map((c) => (
            <div className="comment-row" key={c.id}>
              <span className="comment-author">@{c.username}</span>
              <span className="comment-text">{c.text}</span>
            </div>
          ))}
      </div>

      <form className="comment-form" onSubmit={handleComment}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button type="submit" disabled={busy}>
          Post
        </button>
      </form>
    </article>
  );
}

export default PostCard;
