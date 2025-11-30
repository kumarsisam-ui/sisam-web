// src/UploadForm.jsx
import React, { useState } from "react";
import { createPost } from "./api";

function UploadForm() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState("");

  // we use the token stored by login()
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!file) {
      setStatus("Please choose an image or video.");
      return;
    }

    try {
      setStatus("Uploading...");
      await createPost({ caption, file });

      setStatus("Post uploaded!");
      setCaption("");
      setFile(null);

      // clear the file input visually
      if (e.target && e.target.reset) {
        e.target.reset();
      }
    } catch (err) {
      console.error("Failed to upload post", err);
      setStatus("Upload failed. Please try again.");
    }
  };

  // if there is no token at all, show the login message
  if (!token) {
    return (
      <div className="sidebar-card">
        <h3>Create Post</h3>
        <p className="muted">Login to create a post.</p>
      </div>
    );
  }

  return (
    <div className="sidebar-card">
      <h3>Create Post</h3>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />

        <textarea
          rows={2}
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <button type="submit" className="pill-button">
          Upload
        </button>
      </form>

      {status && (
        <p className="muted" style={{ marginTop: "6px" }}>
          {status}
        </p>
      )}
    </div>
  );
}

export default UploadForm;
