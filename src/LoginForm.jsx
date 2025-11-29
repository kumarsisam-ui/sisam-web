import React, { useState } from "react";
import { login } from "./api";

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(username, password);

      // Save token locally for future requests
      localStorage.setItem("token", result.token);
      localStorage.setItem("username", result.username);

      if (onLogin) onLogin(result.username);

      alert("Login successful!");
    } catch (err) {
      setError("Invalid username or password");
    }

    setLoading(false);
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <h3>Login</h3>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </form>
    </div>
  );
}

export default LoginForm;
