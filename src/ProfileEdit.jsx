// src/ProfileEdit.jsx
import React, { useState } from "react";
import { updateProfile } from "./api";

export default function ProfileEdit({ profile, onUpdated }) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const handleSave = async () => {
    setStatus("");
    try {
      setSaving(true);
      const updated = await updateProfile({
        full_name: fullName.trim() || null,
      });
      setStatus("Profile updated ✔");
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      console.error("updateProfile error:", err);
      setStatus("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 10,
        marginBottom: 16,
        padding: 10,
        borderRadius: 8,
        border: "1px solid #eee",
        background: "#fafafa",
      }}
    >
      <strong>Edit Profile</strong>
      <div style={{ marginTop: 6 }}>
        <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Full name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{
            width: "100%",
            padding: 6,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 13,
          }}
        />
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: 8,
          padding: "6px 12px",
          borderRadius: 8,
          border: "none",
          background: "#007bff",
          color: "#fff",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        {saving ? "Saving..." : "Save"}
      </button>
      {status && (
        <div style={{ marginTop: 4, fontSize: 12, color: "#555" }}>{status}</div>
      )}
    </div>
  );
}
