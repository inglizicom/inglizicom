-- 058_assistant_teachers.sql
-- Assistants get the teachers page (stats, assigning students, creating and
-- editing teaching accounts, seeing pay) and mark attendance in live classes.
-- Almost all of it was already allowed by the database — teacher_profiles,
-- class_sessions and class_attendance have staff policies, and the teacher
-- RPCs check is_crm_staff. What changes here is the one thing that must stay
-- the founder's: a teacher's pay.
--
-- guard_teacher_profile_fields() let any staff member change pay_model and
-- hourly_rate_mad. Now:
--   founder        changes anything
--   assistant      changes anything except pay — a pay change is refused
--   anyone else    (the teacher, the rating trigger) as before: pay, hire date,
--                  active flag and — outside the rating refresh — the rating
--                  are silently kept as they were
--
-- Re-running this file is a no-op.

create or replace function public.guard_teacher_profile_fields()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if public.is_founder(auth.uid()) then
    return new;                                    -- the founder sets pay
  end if;
  if public.is_crm_staff(auth.uid()) then
    if new.pay_model is distinct from old.pay_model
    or new.hourly_rate_mad is distinct from old.hourly_rate_mad then
      raise exception 'Only a founder can change a teacher''s pay' using errcode = '42501';
    end if;
    return new;                                    -- assistants: everything else
  end if;
  if coalesce(current_setting('app.rating_refresh', true), '') <> 'on' then
    new.rating_avg   := old.rating_avg;
    new.rating_count := old.rating_count;
  end if;
  new.pay_model       := old.pay_model;
  new.hourly_rate_mad := old.hourly_rate_mad;
  new.hired_at        := old.hired_at;
  new.is_active       := old.is_active;
  return new;
end
$$;

revoke execute on function public.guard_teacher_profile_fields() from public, anon;
