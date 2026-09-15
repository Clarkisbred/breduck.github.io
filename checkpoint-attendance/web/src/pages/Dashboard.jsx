import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import CameraView from "../components/CameraView.jsx";
import AttendanceLedger from "../components/AttendanceTable.jsx";
import DeviceStatus from "../components/DeviceStatus.jsx";
import Marquee from "../components/Marquee.jsx";
import StaffAccounts from "./StaffAccounts.jsx";
import ChatWidget from "../components/ChatWidget.jsx";
import { useTheme } from "../useTheme.js";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [me, setMe] = useState(null);
  const [view, setView] = useState("overview"); // "overview" | "staff"
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useTheme();

  async function refresh() {
    try {
      const [d, a] = await Promise.all([api.getDevices(), api.getAttendance()]);
      setDevices(d);
      setAttendance(a);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    api.getMe().then(setMe).catch(() => {});
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, []);

  const cameras = devices.filter((d) => d.type === "camera");
  const biometric = devices.filter((d) => d.type === "biometric");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-dot">🦆</span>
          Checkpoint
        </div>
        <a
          className={`nav-link ${view === "overview" ? "active" : ""}`}
          onClick={() => setView("overview")}
        >
          Overview
        </a>
        {me?.role === "owner" && (
          <a
            className={`nav-link ${view === "staff" ? "active" : ""}`}
            onClick={() => setView("staff")}
          >
            Staff Accounts
          </a>
        )}
        <a
          className="nav-link"
          onClick={async () => { await api.logout(); location.href = "/breduck.github.io/login"; }}
        >
          Sign out
        </a>

        <div className="theme-row">
          <span className="theme-label">{theme === "dark" ? "Dark" : "Light"}</span>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            <span className="toggle-ball">{theme === "dark" ? "🌙" : "☀️"}</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <h1 className="page-title">
          {view === "staff" ? "Staff accounts" : "Who's around 🦆"}
        </h1>
        <p className="page-subtitle">
          {view === "staff"
            ? "Only you (the owner) can see this page."
            : `Logged in as ${me?.username || "…"} (${me?.role || "…"}). Refreshed every 15s.`}
        </p>

        {view === "overview" && (
          <Marquee
            items={[
              "🦆 Checkpoint",
              `${attendance.length} scans today`,
              `${cameras.length} camera${cameras.length === 1 ? "" : "s"}`,
              `${biometric.length} scanner${biometric.length === 1 ? "" : "s"}`,
            ]}
          />
        )}

        {error && <p className="error-text">{error}</p>}

        {view === "staff" ? (
          <StaffAccounts />
        ) : (
          <div className="grid-2">
            <div className="card">
              <CameraView cameras={cameras} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div className="card">
                <h3 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Device status</h3>
                <DeviceStatus devices={devices} />
              </div>
              <div className="card">
                <h3 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Recent scans</h3>
                <AttendanceLedger rows={attendance} />
              </div>
            </div>
          </div>
        )}
      </main>

      <ChatWidget />
    </div>
  );
}
