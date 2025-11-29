import React, { useState } from "react";
import { createStory } from "./api";

export default function StoryUpload({ currentUser, onUploaded }) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    return (
      <div className="upload-form">
        <strong>Stories</strong>
        <p style={{ fontSize: 12 }}>Login to post a story.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!file) {
      setStatus("Please select an image.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Uploading story...");
      await createStory({ caption, file });
      setCaption("");
      setFile(null);
      setStatus("Story uploaded ✔");
      if (onUploaded) onUploaded();
      setTimeout(() => setStatus(""), 1200);
    } catch (err) {
      console.error(err);
      setStatus("Story upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <strong>Stories</strong>
      <input
        id="story-upload-input"
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0] || null)}
      />
      <input
        type="text"
        placeholder="Story caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <button type="submit" className="upload-btn" disabled={loading}>
        {loading ? "Uploading..." : "Upload Story"}
      </button>
      {status && <div className="status-text">{status}</div>}
    </form>
  );
}
