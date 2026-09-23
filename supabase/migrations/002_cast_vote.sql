-- Atomic vote cast/change for one-vote-per-user.
-- Run in Supabase SQL Editor after 001_schema_and_rls.sql.

create or replace function public.cast_vote(p_project_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if not public.competition_is_open() then
    raise exception 'Voting is closed' using errcode = '42501';
  end if;

  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'Project not found' using errcode = 'P0002';
  end if;

  insert into public.votes (user_id, project_id)
  values (v_user_id, p_project_id);
  return p_project_id;
exception
  when unique_violation then
    update public.votes
      set project_id = p_project_id
      where user_id = v_user_id
        and project_id is distinct from p_project_id;
    return p_project_id;
end;
$$;

revoke all on function public.cast_vote(uuid) from public;
grant execute on function public.cast_vote(uuid) to authenticated;
