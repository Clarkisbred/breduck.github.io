import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useTheme } from "../useTheme.js";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { token } = await api.login(username, password);
      localStorage.setItem("token", token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-shell">
      <div className="card login-card">
        <div className="brand" style={{ justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="brand-dot">🦆</span>
            Checkpoint
          </span>
          <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle theme">
            <span className="toggle-ball">{theme === "dark" ? "🌙" : "☀️"}</span>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" style={{ width: "100%" }}>Sign in</button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}
