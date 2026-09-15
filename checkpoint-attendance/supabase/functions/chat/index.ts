// Deploy with: supabase functions deploy chat
// Set the secret once with: supabase secrets set GROQ_API_KEY=your-key-here
import { createClient } from "jsr:@supabase/supabase-js@2";

const SYSTEM_PROMPT = `You are BreDuck, an assistant built into the Checkpoint staff dashboard.
You help staff with anything work-related: how to use the dashboard, general
questions, or just something they need help thinking through. Keep a
professional, friendly, concise tone. You are not a roleplay character —
answer plainly and helpfully, the way a competent coworker would.`;

Deno.serve(async (req) => {
  // Verify the caller is a logged-in user before spending Groq credits.
  const authHeader = req.headers.get("Authorization");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader! } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Not logged in" }), { status: 401 });
  }

  const { messages } = await req.json();
  if (!Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "messages array required" }), { status: 400 });
  }

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("GROQ_MODEL") || "openai/gpt-oss-120b",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.5,
    }),
  });

  if (!groqRes.ok) {
    const text = await groqRes.text();
    return new Response(JSON.stringify({ error: `Groq error: ${text}` }), { status: 502 });
  }

  const data = await groqRes.json();
  const reply = data.choices?.[0]?.message?.content ?? "Sorry, I didn't catch that.";
  return new Response(JSON.stringify({ reply }), {
    headers: { "Content-Type": "application/json" },
  });
});
