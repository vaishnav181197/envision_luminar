-- Production hardening:
-- 1) Votes only via service_role (API with student cookie), not authenticated clients
-- 2) Prevent authenticated users from self-elevating profiles.role

revoke all on function public.cast_vote(uuid, uuid) from public;
revoke all on function public.cast_vote(uuid, uuid) from authenticated;
grant execute on function public.cast_vote(uuid, uuid) to service_role;

-- Drop legacy single-arg signature if it still exists
do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'cast_vote'
      and pg_get_function_identity_arguments(p.oid) = 'uuid'
  ) then
    revoke all on function public.cast_vote(uuid) from public;
    revoke all on function public.cast_vote(uuid) from authenticated;
    drop function public.cast_vote(uuid);
  end if;
end $$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.role() is distinct from 'service_role' then
    raise exception 'Cannot change profile role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row
  execute function public.protect_profile_role();
