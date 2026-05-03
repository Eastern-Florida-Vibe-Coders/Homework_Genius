-- ============================================================
-- Homework Genius - Initial Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  time_zone text not null default 'America/New_York',
  daily_study_threshold integer not null default 6,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- PREFERENCES
-- ============================================================
create table public.preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  preferred_study_hours_start text not null default '09:00',
  preferred_study_hours_end text not null default '22:00',
  max_continuous_study_minutes integer not null default 90,
  break_interval_minutes integer not null default 15,
  focus_mode_enabled boolean not null default true,
  pomodoro_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.preferences enable row level security;

create policy "Users can manage own preferences"
  on public.preferences for all
  using (auth.uid() = user_id);

-- Auto-create preferences row when profile is created
create or replace function public.handle_new_profile()
returns trigger as $$
begin
  insert into public.preferences (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();

-- ============================================================
-- EVENTS (Fixed Commitments)
-- ============================================================
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  event_type text not null check (event_type in ('class', 'work', 'sports', 'personal', 'other')),
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_recurring boolean not null default false,
  recurrence_rule text,
  created_at timestamptz not null default now(),
  constraint valid_event_times check (end_time > start_time)
);

alter table public.events enable row level security;

create policy "Users can manage own events"
  on public.events for all
  using (auth.uid() = user_id);

create index idx_events_user_time on public.events (user_id, start_time, end_time);

-- ============================================================
-- TASKS (Academic Workload)
-- ============================================================
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  subject text,
  estimated_hours numeric(4,2) not null default 1.0 check (estimated_hours > 0),
  deadline timestamptz not null,
  priority_level integer not null default 3 check (priority_level between 1 and 5),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint completed_after_created check (
    status != 'completed' or updated_at >= created_at
  )
);

alter table public.tasks enable row level security;

create policy "Users can manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id);

create index idx_tasks_user_deadline on public.tasks (user_id, deadline);
create index idx_tasks_user_status on public.tasks (user_id, status);

-- ============================================================
-- STUDY BLOCKS (Scheduler Output)
-- ============================================================
create table public.study_blocks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'planned' check (status in ('planned', 'completed', 'missed', 'rescheduled')),
  intensity_score integer check (intensity_score between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_block_times check (end_time > start_time)
);

alter table public.study_blocks enable row level security;

create policy "Users can manage own study blocks"
  on public.study_blocks for all
  using (auth.uid() = user_id);

create index idx_study_blocks_user_time on public.study_blocks (user_id, start_time, end_time);
create index idx_study_blocks_status on public.study_blocks (user_id, status);

-- ============================================================
-- USER TRUST LOGS (Behavior Learning)
-- ============================================================
create table public.user_trust_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  study_block_id uuid references public.study_blocks(id) on delete cascade not null,
  action text not null check (action in ('moved', 'skipped', 'completed_early', 'extended')),
  original_start timestamptz not null,
  original_end timestamptz not null,
  new_start timestamptz,
  new_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.user_trust_logs enable row level security;

create policy "Users can manage own trust logs"
  on public.user_trust_logs for all
  using (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER (reusable)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

create trigger set_study_blocks_updated_at
  before update on public.study_blocks
  for each row execute procedure public.set_updated_at();

create trigger set_preferences_updated_at
  before update on public.preferences
  for each row execute procedure public.set_updated_at();
