-- Run this in Supabase Dashboard > SQL Editor (or via `supabase db push`)

-- Profiles: one row per logged-in person, links to Supabase Auth's own
-- users table and adds the owner/staff role.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  role text not null default 'staff' check (role in ('owner','staff')),
  created_at timestamptz default now()
);

create table employees (
  id bigint generated always as identity primary key,
  name text not null,
  external_id text unique,   -- ID from whatever biometric device you connect later
  created_at timestamptz default now()
);

create table attendance (
  id bigint generated always as identity primary key,
  employee_id bigint not null references employees(id),
  type text not null check (type in ('in','out')),
  timestamp timestamptz default now(),
  source text
);

create table devices (
  id bigint generated always as identity primary key,
  type text not null check (type in ('camera','biometric')),
  label text not null,
  stream_url text,
  last_seen timestamptz
);

-- Row Level Security: locked down by default, opened up per-table below.
alter table profiles enable row level security;
alter table employees enable row level security;
alter table attendance enable row level security;
alter table devices enable row level security;

-- profiles: anyone logged in can read their own row; owners can read all
-- (needed for the Staff Accounts page).
create policy "read own profile" on profiles for select
  using (auth.uid() = id);
create policy "owners read all profiles" on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner'));

-- employees / attendance: any logged-in user (owner or staff) can read.
-- Only owners can add/remove employees.
create policy "logged in users read employees" on employees for select
  using (auth.role() = 'authenticated');
create policy "owners manage employees" on employees for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner'));

create policy "logged in users read attendance" on attendance for select
  using (auth.role() = 'authenticated');
create policy "owners manage attendance" on attendance for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner'));

-- devices: any logged-in user can read. Owners can add/remove devices.
-- Anyone (even unauthenticated) can UPDATE last_seen/stream_url — this is
-- how the camera/biometric hardware reports "I'm online" once connected,
-- without needing its own login.
create policy "logged in users read devices" on devices for select
  using (auth.role() = 'authenticated');
create policy "owners manage devices" on devices for insert
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner'));
create policy "owners delete devices" on devices for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner'));
create policy "anyone can heartbeat devices" on devices for update
  using (true);
