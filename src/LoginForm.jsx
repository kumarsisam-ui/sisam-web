// src/LoginForm.jsx
import React, { useState, useEffect } from "react";
import { login } from "./api";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-hide error after 3 seconds
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(t);
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Logging in...");

      const result = await login(username.trim(), password.trim());

      if (result && result.error === "invalid_credentials") {
        // Wrong username/password – handled gracefully
        setStatus("");
        setError("Invalid username or password.");
        return;
      }

      // Successful login
      setStatus("Login successful ✔");

      if (onLogin) {
        const userName =
          result.username ||
          (result.user && result.user.username) ||
          username.trim();

        onLogin(userName, result.access_token);
      }
    } catch (err) {
      console.error(err);
      setStatus("");
      setError("Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <strong>Login</strong>
      <form onSubmit={handleSubmit} className="form-vertical">
        <input
          type="text"
          placeholder="Username"
          value={username}
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {status && <div className="status-text">{status}</div>}

      {error && (
        <div className="status-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
