# Checkpoint — Attendance + Camera Dashboard (Supabase edition)

No Node server to run or keep alive anymore — the whole backend is now
**Supabase**: a hosted Postgres database, built-in login system, and two
small serverless functions for the two things that genuinely can't run
safely in the browser (creating staff logins, and calling Groq without
exposing your API key).

Note: Supabase's own CLI and the GitHub Actions build step still use
Node — but that's just *tooling*, run once (deploying) or automatically
in the cloud (GitHub's build step). Nothing runs continuously on your
own machine like the old Express backend did.

## 1. Create your Supabase project

Go to supabase.com, sign in (you already have an account for BreDucky),
and create a **new project** — keep it separate from your BreDucky
project since they're unrelated apps.

## 2. Set up the database

In your new project's dashboard, go to SQL Editor, paste in the
contents of `supabase/migrations/001_schema.sql`, and run it. This
creates all four tables (profiles, employees, attendance, devices) with
the access rules already wired up.

## 3. Create your own (owner) account

Supabase Auth needs an email, so usernames get turned into
`yourname@checkpoint.local` behind the scenes — you'll still just type
"BreDuck" to log in.

1. Dashboard > Authentication > Users > Add user > email:
   `BreDuck@checkpoint.local`, password: your real password, check
   "Auto Confirm User".
2. Dashboard > Table Editor > profiles > Insert row > id: copy the UUID
   from the user you just created, username: `BreDuck`, role: `owner`.

From here on, you (as owner) create staff logins from the dashboard's
Staff Accounts page — no more manual steps needed for them.

## 4. Deploy the two Edge Functions

Install the Supabase CLI (one-time, via `npm install -g supabase` or a
standalone installer from supabase.com/docs/guides/cli if you'd rather
avoid npm entirely), then:

```bash
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy chat
supabase functions deploy create-staff
supabase secrets set GROQ_API_KEY=your-real-groq-key
supabase secrets set GROQ_MODEL=openai/gpt-oss-120b
```

## 5. Get your frontend's connection details

Dashboard > Settings > API. You need two values:
- Project URL (looks like https://xxxxx.supabase.co)
- anon public key (safe to expose in frontend code — this is what Row
  Level Security is designed to protect against, unlike the
  service_role key which must never leave the Edge Functions)

## 6. Local development

```bash
cd web
npm install
echo "VITE_SUPABASE_URL=https://xxxxx.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env
npm run dev
```

## 7. Deploy to GitHub Pages

1. Push this repo to GitHub as `checkpoint-attendance` (matches the
   base path already set in web/vite.config.js and App.jsx).
2. Repo > Settings > Secrets and variables > Actions > Variables tab >
   add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (same values as
   your local .env).
3. Repo > Settings > Pages > Source > GitHub Actions.
4. Push to main — the included workflow builds and deploys
   automatically.
5. Visit https://<your-username>.github.io/checkpoint-attendance/

## Adding your CCTV camera / biometric scanner

Once you know the exact models, their integration will call:
```
POST https://xxxxx.supabase.co/rest/v1/devices?id=eq.<device-id>
apikey: <anon-key>
Content-Type: application/json

{ "last_seen": "now()", "stream_url": "..." }
```
The devices table's RLS policy already allows this kind of update
without a login, so whatever script/integration you end up writing for
the hardware just needs to hit that URL periodically.
