import React from "react";

const DEFAULT_ITEMS = ["🦆 Checkpoint", "Front Desk", "Live Attendance", "24/7 Watch"];

export default function Marquee({ items = DEFAULT_ITEMS }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span className="marquee-item" key={i}>
            {item}
            <span className="marquee-dot">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
