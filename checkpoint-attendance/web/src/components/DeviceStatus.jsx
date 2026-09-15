import React from "react";

// Shows an online/offline pill per device — used for both the CCTV
// camera(s) and the biometric scanner, side by side.
export default function DeviceStatus({ devices }) {
  if (!devices.length) {
    return <p className="empty-state" style={{ padding: "10px 0" }}>No devices added yet.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {devices.map((d) => (
        <div key={d.id} className="pulse-wrap">
          <span className={`pulse ${d.online ? "" : "offline"}`} />
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.label}</span>
          <span>— {d.online ? "online" : "offline"}</span>
        </div>
      ))}
    </div>
  );
}
