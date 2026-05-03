# Homework Genius

An intelligent study scheduling app that eliminates FOMO and builds academic consistency.
Built with Next.js 15, React 19, Tailwind CSS v4, shadcn/ui, and Supabase.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Next.js 15 (App Router)   |
| Styling    | Tailwind CSS v4, shadcn/ui          |
| Backend    | Next.js API Routes (Route Handlers) |
| Database   | Supabase (PostgreSQL + Auth + RLS)  |
| Deployment | Vercel                              |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Copy your project URL and keys from **Project Settings → API**

### 3. Configure environment variables

Fill in `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Initialize shadcn/ui

```bash
npx shadcn@latest init
```

When prompted, choose:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

Then add components as needed:
```bash
npx shadcn@latest add button dialog select tabs tooltip
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  (auth)/           # Login & signup pages (no nav)
  (dashboard)/      # Protected pages (with nav)
    dashboard/      # Today's schedule + focus mode
    tasks/          # Task management
    schedule/       # Weekly calendar view
    settings/       # User preferences
    onboarding/     # First-run setup wizard
  api/
    auth/callback/  # Supabase OAuth callback
    schedule/       # GET today / POST regenerate / PATCH block
    tasks/          # CRUD for tasks
    events/         # CRUD for fixed events
    settings/       # PATCH profile + preferences

components/
  dashboard/        # Nav, dashboard home, settings view
  tasks/            # Tasks list + add form
  schedule/         # Weekly calendar
  providers/        # React Query provider

lib/
  supabase/         # Browser + server Supabase clients
  scheduler/        # Gap-Fill scheduling engine
  utils.ts          # cn() helper

hooks/
  use-tasks.ts      # React Query hooks for tasks
  use-schedule.ts   # React Query hooks for schedule
  use-user.ts       # Supabase auth state

types/
  database.ts       # Full typed Supabase schema

supabase/
  migrations/       # SQL migration files
```

---

## Deploying to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js

---

## Key Features

- **Gap-Fill Scheduling Engine** — finds free slots between fixed events and fills them with prioritized study blocks
- **Focus Mode** — full-screen distraction-free view when a block starts
- **Trust Logging** — tracks when users skip or reschedule blocks for future intelligence
- **Onboarding Wizard** — collects study window preferences on first run
- **Row Level Security** — all Supabase tables protected by RLS so users only see their own data
- **Dark mode** — respects system preference via `next-themes`

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (for calendar sync) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `MICROSOFT_CLIENT_ID` | Microsoft Graph client ID (for Outlook sync) |
| `MICROSOFT_CLIENT_SECRET` | Microsoft Graph client secret |
| `NEXTAUTH_SECRET` | Random secret for session signing |
| `NEXTAUTH_URL` | Base URL of your app |
| `NEXT_PUBLIC_APP_URL` | Public base URL (used in email links) |
