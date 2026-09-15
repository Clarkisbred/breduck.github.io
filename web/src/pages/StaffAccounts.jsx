import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function StaffAccounts() {
  const [staff, setStaff] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function refresh() {
    try {
      setStaff(await api.getStaff());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.createStaff(username, password);
      setSuccess(`${username} can now log in.`);
      setUsername("");
      setPassword("");
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(id) {
    try {
      await api.deleteStaff(id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid-2">
      <div className="card">
        <h3 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Add a staff login</h3>
        <form onSubmit={handleAdd}>
          <div className="field">
            <label htmlFor="staffUsername">Username</label>
            <input id="staffUsername" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="staffPassword">Password</label>
            <input
              id="staffPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Create login</button>
          {error && <p className="error-text">{error}</p>}
          {success && <p style={{ color: "var(--accent-in)", fontSize: "0.82rem", marginTop: 10 }}>{success}</p>}
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Current logins</h3>
        {!staff.length && <p className="empty-state">No accounts yet.</p>}
        {staff.map((s) => (
          <div className="ledger-row" key={s.id} style={{ gridTemplateColumns: "1fr auto auto" }}>
            <span className="ledger-name">{s.username}</span>
            <span className="ledger-type">{s.role}</span>
            {s.role !== "owner" && (
              <button
                type="button"
                onClick={() => handleRemove(s.id)}
                style={{ background: "var(--danger)", color: "#fff", padding: "5px 12px", fontSize: "0.72rem" }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
