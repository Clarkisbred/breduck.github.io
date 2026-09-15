import React, { useState } from "react";

// Multi-camera picker, FNAF-monitor style: a strip of camera-name chips
// above a single viewer that swaps feeds when you click one.
export default function CameraView({ cameras = [] }) {
  const [activeId, setActiveId] = useState(cameras[0]?.id ?? null);
  const active = cameras.find((c) => c.id === activeId) || cameras[0];

  const trisHomeLink = (
    <p style={{ marginTop: 10, fontSize: 14 }}>
      View live footage in the <a href="https://apps.apple.com/us/app/tris-home/id6444226037" target="_blank" rel="noreferrer">Tris Home app (iOS)</a> or <a href="https://play.google.com/store/apps/details?id=com.cz.czeye" target="_blank" rel="noreferrer">Tris Home app (Android)</a>.
    </p>
  );

  if (!cameras.length) {
    return (
      <div>
        <div className="camera-frame">
          <span>No cameras added yet — add one once you know your CCTV's model.</span>
        </div>
        {trisHomeLink}
      </div>
    );
  }

  return (
    <div>
      <div className="camera-frame">
        {active?.stream_url ? (
          <video src={active.stream_url} autoPlay playsInline muted controls />
        ) : (
          <span>{active?.label} — stream not connected yet</span>
        )}
      </div>
      {!active?.stream_url && trisHomeLink}
      <div className="camera-picker">
        {cameras.map((cam) => (
          <button
            key={cam.id}
            type="button"
            className={`camera-chip ${cam.id === active?.id ? "active" : ""}`}
            onClick={() => setActiveId(cam.id)}
          >
            {cam.label}
          </button>
        ))}
      </div>
    </div>
  );
}
