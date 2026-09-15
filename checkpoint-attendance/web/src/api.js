import { supabase } from "./supabaseClient.js";

// Usernames are stored as a synthesized email under the hood (Supabase
// Auth requires an email), so login still just takes a plain username.
function toEmail(username) {
  return `${username}@checkpoint.local`;
}

export const api = {
  async login(username, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getMe() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from("profiles").select("username, role").eq("id", user.id).single();
    if (error) throw new Error(error.message);
    return data;
  },

  async createStaff(username, password) {
    const { data, error } = await supabase.functions.invoke("create-staff", {
      body: { username, password },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async getStaff() {
    const { data, error } = await supabase.from("profiles").select("id, username, role, created_at").order("role");
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteStaff(id) {
    // Removing the auth account itself needs the admin API (not safe
    // client-side) — for now this just removes their profile row, which
    // revokes their access to data via RLS. Full account deletion can be
    // added as another Edge Function later if needed.
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async getEmployees() {
    const { data, error } = await supabase.from("employees").select("*").order("name");
    if (error) throw new Error(error.message);
    return data;
  },

  async addEmployee(name, externalId) {
    const { data, error } = await supabase.from("employees").insert({ name, external_id: externalId || null }).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteEmployee(id) {
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async getAttendance() {
    const { data, error } = await supabase
      .from("attendance")
      .select("id, type, timestamp, source, employee_id, employees(name)")
      .order("timestamp", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    // Flatten the joined employee name to match the old shape components expect.
    return data.map((row) => ({ ...row, employee_name: row.employees?.name }));
  },

  async getDevices(type) {
    let query = supabase.from("devices").select("*");
    if (type) query = query.eq("type", type);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    const ONLINE_THRESHOLD_MS = 60_000;
    return data.map((d) => ({
      ...d,
      online: !!d.last_seen && Date.now() - new Date(d.last_seen).getTime() < ONLINE_THRESHOLD_MS,
    }));
  },

  async addDevice(type, label, streamUrl) {
    const { data, error } = await supabase.from("devices").insert({ type, label, stream_url: streamUrl || null }).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteDevice(id) {
    const { error } = await supabase.from("devices").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async sendChat(messages) {
    const { data, error } = await supabase.functions.invoke("chat", { body: { messages } });
    if (error) throw new Error(error.message);
    return data;
  },
};
