-- Admin-owned projects, eligible voter list, OTP challenges, cookie-based votes.
-- Apply in Supabase SQL Editor after 001 and 002.

-- ─── New tables ─────────────────────────────────────────────────────────────

create table if not exists public.eligible_students (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint eligible_students_email_format check (email = lower(email))
);

create table if not exists public.otp_challenges (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists otp_challenges_email_idx on public.otp_challenges (email);

-- ─── Projects: student_id → created_by ──────────────────────────────────────

drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own_or_admin" on public.projects;

alter table public.projects
  add column if not exists created_by uuid references public.profiles(id) on delete restrict;

update public.projects
set created_by = student_id
where created_by is null and student_id is not null;

alter table public.projects
  alter column created_by set not null;

alter table public.projects
  drop constraint if exists projects_student_id_key;

alter table public.projects
  drop constraint if exists projects_student_id_fkey;

alter table public.projects
  drop column if exists student_id;

-- ─── Votes: user_id → eligible_student_id ───────────────────────────────────

drop policy if exists "votes_insert_own" on public.votes;
drop policy if exists "votes_update_own" on public.votes;
drop policy if exists "votes_delete_own" on public.votes;

truncate table public.votes;

alter table public.votes
  drop constraint if exists votes_user_id_key;

alter table public.votes
  drop constraint if exists votes_user_id_fkey;

alter table public.votes
  drop column if exists user_id;

alter table public.votes
  add column if not exists eligible_student_id uuid references public.eligible_students(id) on delete cascade;

alter table public.votes
  alter column eligible_student_id set not null;

alter table public.votes
  add constraint votes_eligible_student_id_key unique (eligible_student_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────

alter table public.eligible_students enable row level security;
alter table public.otp_challenges enable row level security;

drop policy if exists "eligible_students_admin_all" on public.eligible_students;
create policy "eligible_students_admin_all"
  on public.eligible_students for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "otp_challenges_no_direct" on public.otp_challenges;
-- No policies: only service role (bypasses RLS) reads/writes OTP rows.

drop policy if exists "projects_insert_admin" on public.projects;
create policy "projects_insert_admin"
  on public.projects for insert
  with check (public.is_admin() and auth.uid() = created_by);

drop policy if exists "projects_update_admin" on public.projects;
create policy "projects_update_admin"
  on public.projects for update
  using (public.is_admin());

drop policy if exists "projects_delete_admin" on public.projects;
create policy "projects_delete_admin"
  on public.projects for delete
  using (public.is_admin());

-- Vote writes go through service role / definer RPC. Keep public read.
drop policy if exists "votes_select_all" on public.votes;
create policy "votes_select_all"
  on public.votes for select
  using (true);

-- ─── cast_vote for eligible students (service role / definer) ───────────────

create or replace function public.cast_vote(
  p_project_id uuid,
  p_eligible_student_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_eligible_student_id is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if not public.competition_is_open() then
    raise exception 'Voting is closed' using errcode = '42501';
  end if;

  if not exists (select 1 from public.eligible_students where id = p_eligible_student_id) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'Project not found' using errcode = 'P0002';
  end if;

  insert into public.votes (eligible_student_id, project_id)
  values (p_eligible_student_id, p_project_id);
  return p_project_id;
exception
  when unique_violation then
    update public.votes
      set project_id = p_project_id
      where eligible_student_id = p_eligible_student_id
        and project_id is distinct from p_project_id;
    return p_project_id;
end;
$$;

revoke all on function public.cast_vote(uuid) from public;
revoke all on function public.cast_vote(uuid) from authenticated;
revoke all on function public.cast_vote(uuid, uuid) from public;
grant execute on function public.cast_vote(uuid, uuid) to service_role;
grant execute on function public.cast_vote(uuid, uuid) to authenticated;
