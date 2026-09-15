import React, { useEffect, useRef, useState } from "react";
import { api } from "../api.js";

// Floating BreDuck chat bubble — professional-only mode, no roleplay.
// Same duck branding as the main site, just without the friend/persona
// chat modes; this one is strictly here to help staff with whatever
// they need.
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey, I'm BreDuck 🦆 — need a hand with anything?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      // Only send role/content to the backend — keep the UI-only fields out.
      const { reply } = await api.sendChat(nextMessages.map(({ role, content }) => ({ role, content })));
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([...nextMessages, { role: "assistant", content: `Sorry, something went wrong: ${err.message}` }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open BreDuck chat"
        style={{
          position: "fixed", bottom: 24, right: 24, width: 56, height: 56,
          borderRadius: "50%", fontSize: "1.5rem", padding: 0,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 50,
        }}
      >
        {open ? "✕" : "🦆"}
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: "fixed", bottom: 92, right: 24, width: 320, maxHeight: 440,
            display: "flex", flexDirection: "column", zIndex: 50, padding: 0, overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.2rem" }}>🦆</span>
            <strong style={{ fontFamily: "var(--font-display)" }}>BreDuck</strong>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "var(--yellow)" : "var(--surface-alt)",
                  color: m.role === "user" ? "#111" : "var(--text-primary)",
                  padding: "8px 12px", borderRadius: 14, fontSize: "0.85rem", maxWidth: "85%",
                }}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div style={{ alignSelf: "flex-start", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                BreDuck is typing…
              </div>
            )}
          </div>

          <form onSubmit={handleSend} style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--border)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BreDuck anything…"
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={sending} style={{ padding: "10px 14px" }}>
              →
            </button>
          </form>
        </div>
      )}
    </>
  );
}
