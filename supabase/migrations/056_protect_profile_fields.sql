-- 056_protect_profile_fields.sql
-- URGENT. profiles_self_update lets every signed-in user update their own row,
-- and the authenticated role holds UPDATE on every column. Nothing stopped a
-- user who signed up on the site from running, with the public key:
--   update profiles set role = 'founder', is_admin = true where id = <me>
-- which opens the whole CRM (leads, phones, payments, revenue). The same hole
-- let a user give themselves a paid plan or lift their own block.
--
-- Fix: a BEFORE UPDATE trigger. Callers who are not a founder / admin may still
-- edit their own name, phone and avatar; a change to any privileged column is
-- refused. Server-side work (service role, migrations, SECURITY DEFINER code
-- running without a JWT — auth.uid() is null) is unaffected, as are founders.
--
-- Checked on production before applying: the only non-student profiles are
-- the two founders, one teacher and one assistant, and no profile holds a paid
-- plan — the hole had not been used.
--
-- Re-running this file is a no-op.

create or replace function public.guard_profile_privileged_fields()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_caller uuid := auth.uid();
begin
  -- Server-side writes (no JWT) and founders/admins may change anything.
  if v_caller is null or public.is_founder(v_caller) or public.is_admin(v_caller) then
    return new;
  end if;

  if new.id            is distinct from old.id
  or new.role          is distinct from old.role
  or new.is_admin      is distinct from old.is_admin
  or new.blocked       is distinct from old.blocked
  or new.plan          is distinct from old.plan
  or new.plan_expires_at is distinct from old.plan_expires_at
  or new.plan_note     is distinct from old.plan_note
  or new.email         is distinct from old.email
  or new.created_at    is distinct from old.created_at then
    raise exception 'Only a founder can change role, admin, block, plan or email on a profile'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke execute on function public.guard_profile_privileged_fields() from public, anon;

drop trigger if exists trg_guard_profile_privileged_fields on public.profiles;
create trigger trg_guard_profile_privileged_fields
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_fields();
