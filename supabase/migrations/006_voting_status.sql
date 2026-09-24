-- Pause / stop voting without relying on a past deadline.
-- open: students may enter and vote while voting_end_time is in the future
-- paused: entry and votes blocked; winners are not shown
-- stopped: entry and votes blocked; winners treated as final (same as deadline passed)

alter table public.settings
  add column if not exists voting_status text not null default 'open';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'settings_voting_status_check'
  ) then
    alter table public.settings
      add constraint settings_voting_status_check
      check (voting_status in ('open', 'paused', 'stopped'));
  end if;
end $$;

create or replace function public.competition_is_open()
returns boolean
language sql
stable
as $$
  select
    voting_status = 'open'
    and voting_end_time > now()
  from public.settings
  where id = 1;
$$;
