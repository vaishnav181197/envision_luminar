-- ELEVATE Phase 2: schema + RLS
-- Run in Supabase SQL Editor if not already applied.

-- ─── Tables ─────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  display_name text,
  batch text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  description text not null check (char_length(description) between 10 and 500),
  demo_url text not null,
  thumbnail_url text,
  created_at timestamptz not null default now(),
  unique (student_id)
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  voting_end_time timestamptz not null
);

insert into public.settings (voting_end_time)
values (now() + interval '30 days')
on conflict (id) do nothing;

-- ─── Profile trigger ────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, batch)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'batch'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Helpers ─────────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.competition_is_open()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select voting_end_time > now() from public.settings where id = 1;
$$;

-- ─── RLS ─────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.votes enable row level security;
alter table public.settings enable row level security;

-- profiles
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- projects
drop policy if exists "projects_select_all" on public.projects;
create policy "projects_select_all"
  on public.projects for select
  using (true);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
  on public.projects for insert
  with check (
    auth.uid() = student_id
    and public.competition_is_open()
  );

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
  on public.projects for update
  using (
    (auth.uid() = student_id and public.competition_is_open())
    or public.is_admin()
  );

drop policy if exists "projects_delete_own_or_admin" on public.projects;
create policy "projects_delete_own_or_admin"
  on public.projects for delete
  using (
    (auth.uid() = student_id and public.competition_is_open())
    or public.is_admin()
  );

-- votes
drop policy if exists "votes_select_all" on public.votes;
create policy "votes_select_all"
  on public.votes for select
  using (true);

drop policy if exists "votes_insert_own" on public.votes;
create policy "votes_insert_own"
  on public.votes for insert
  with check (
    auth.uid() = user_id
    and public.competition_is_open()
  );

drop policy if exists "votes_update_own" on public.votes;
create policy "votes_update_own"
  on public.votes for update
  using (auth.uid() = user_id and public.competition_is_open());

drop policy if exists "votes_delete_own" on public.votes;
create policy "votes_delete_own"
  on public.votes for delete
  using (auth.uid() = user_id and public.competition_is_open());

-- settings
drop policy if exists "settings_select_all" on public.settings;
create policy "settings_select_all"
  on public.settings for select
  using (true);

drop policy if exists "settings_update_admin" on public.settings;
create policy "settings_update_admin"
  on public.settings for update
  using (public.is_admin());
