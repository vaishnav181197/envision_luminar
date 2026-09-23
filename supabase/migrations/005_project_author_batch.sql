-- Author + batch on competing projects (admin-entered labels).

alter table public.projects
  add column if not exists author_name text;

alter table public.projects
  add column if not exists batch text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_author_name_length'
  ) then
    alter table public.projects
      add constraint projects_author_name_length
      check (
        author_name is null
        or (char_length(author_name) between 2 and 100)
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_batch_length'
  ) then
    alter table public.projects
      add constraint projects_batch_length
      check (
        batch is null
        or (char_length(batch) between 2 and 50)
      );
  end if;
end $$;
