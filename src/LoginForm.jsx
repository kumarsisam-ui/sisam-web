// src/LoginForm.jsx
import React, { useState } from "react";
import { login } from "./api";

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(username, password);

      // login() already saves token + username in localStorage
      if (onLogin) {
        onLogin(result.username);
      }

      // Simple UX: clear fields
      setPassword("");
      // Optional: redirect to home
      // window.location.href = "/";

    } catch (err) {
      setError("Invalid username or password");
    }

    setLoading(false);
  }

  return (
    <div className="login-overlay">
      <div className="login-card">
        <h2 className="login-title">Login</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && <div className="login-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
