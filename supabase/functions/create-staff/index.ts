// Deploy with: supabase functions deploy create-staff
// Uses the service_role key (auto-available to Edge Functions as
// SUPABASE_SERVICE_ROLE_KEY) to create a real login for a staff member —
// this is the one thing that genuinely can't happen from the browser,
// since creating arbitrary user accounts needs elevated privileges.
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");

  // First, confirm the CALLER is a logged-in owner (using their own token).
  const callerClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader! } } }
  );
  const { data: { user } } = await callerClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Not logged in" }), { status: 401 });
  }
  const { data: profile } = await callerClient.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "owner") {
    return new Response(JSON.stringify({ error: "Only the owner can create staff logins" }), { status: 403 });
  }

  const { username, password } = await req.json();
  if (!username || !password) {
    return new Response(JSON.stringify({ error: "username and password required" }), { status: 400 });
  }

  // Now use the ADMIN client (service role) to actually create the account.
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Supabase Auth needs an email — synthesize one from the username since
  // this dashboard only wants a username/password login experience.
  const fakeEmail = `${username}@checkpoint.local`;
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: fakeEmail,
    password,
    email_confirm: true,
  });
  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), { status: 400 });
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .insert({ id: created.user.id, username, role: "staff" });
  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ ok: true, username }), {
    headers: { "Content-Type": "application/json" },
  });
});
