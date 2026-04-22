-- Fix triggers to bypass RLS for incrementing/decrementing counts
-- By default, triggers run as the invoking user, which causes RLS to block updates to other users' prompts.
-- Adding 'security definer' allows the trigger to run as the database owner, bypassing RLS correctly.

create or replace function public.handle_fork_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.parent_id is not null then
    update public.prompts set fork_count = fork_count + 1 where id = new.parent_id;
  end if;
  return new;
end;
$$;

create or replace function public.handle_star_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.prompts set star_count = star_count + 1 where id = new.prompt_id;
  return new;
end;
$$;

create or replace function public.handle_star_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.prompts set star_count = greatest(star_count - 1, 0) where id = old.prompt_id;
  return old;
end;
$$;
