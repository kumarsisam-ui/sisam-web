import React, { useState } from "react";
import { createPost } from "./api";

export default function UploadForm({ currentUser, onPosted }) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    return (
      <div className="upload-form sidebar-card">
        <strong>Create Post</strong>
        <p style={{ fontSize: 12 }}>Login to create a post.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!file) {
      setStatus("Please choose an image.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Uploading post...");
      const post = await createPost({ caption, file });
      setCaption("");
      setFile(null);
      setStatus("Post uploaded ✔");

      if (onPosted) onPosted();

      // Clear status after a short delay
      setTimeout(() => setStatus(""), 1500);
    } catch (err) {
      console.error("Post upload error:", err);

      // Try to show server error details if available
      const serverMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data;

      if (serverMsg) {
        setStatus(`Failed to upload post: ${JSON.stringify(serverMsg)}`);
      } else {
        setStatus("Failed to upload post.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <strong>Create Post</strong>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0] || null)}
      />
      <input
        type="text"
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <button type="submit" className="upload-btn" disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {status && <div className="status-text">{status}</div>}
    </form>
  );
}
