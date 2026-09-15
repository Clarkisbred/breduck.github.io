import React from "react";

export default function AttendanceLedger({ rows }) {
  if (!rows.length) {
    return <p className="empty-state">🦆 No scans yet — quiet pond today.</p>;
  }
  return (
    <div>
      {rows.map((row) => (
        <div className="ledger-row" key={row.id}>
          <span className={`ledger-bar ${row.type === "out" ? "out" : ""}`}>
            {row.type === "out" ? "👋" : "🦆"}
          </span>
          <span className="ledger-name">{row.employee_name}</span>
          <span className={`ledger-type ${row.type === "out" ? "out" : ""}`}>{row.type}</span>
          <span className="ledger-time">{new Date(row.timestamp + "Z").toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
