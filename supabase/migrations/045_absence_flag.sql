-- 045_absence_flag.sql
-- An absence should not die inside the teacher's attendance sheet.
--
-- When a teacher marks a student absent, a row lands in crm_activity_log so the
-- sales team sees it in the feed alongside everything else, and the founder can
-- pull "who is missing classes" without asking a teacher. Marking someone
-- present again (a correction) does not log a second time — only the transition
-- into absent counts.
--
-- Also adds student_absence_summary(): the CRM-side read of who has been
-- missing, so follow-up is driven by data rather than by memory.
--
-- Requires 044_teachers.sql.

create or replace function public.log_absence_to_crm()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_student  record;
  v_session  record;
  v_teacher  text;
begin
  -- Only the transition into 'absent' is interesting.
  if new.status <> 'absent' then return null; end if;
  if tg_op = 'UPDATE' and old.status = 'absent' then return null; end if;

  select s.full_name, s.phone_number into v_student
    from public.crm_students s where s.id = new.student_id;

  select cs.title, cs.starts_at, cs.teacher_id into v_session
    from public.class_sessions cs where cs.id = new.session_id;

  select coalesce(tp.display_name, p.full_name, p.email) into v_teacher
    from public.profiles p
    left join public.teacher_profiles tp on tp.id = p.id
   where p.id = v_session.teacher_id;

  insert into public.crm_activity_log
    (actor_id, actor_email, actor_role, action, entity_type, entity_id, metadata)
  values (
    new.marked_by,
    (select email from public.profiles where id = new.marked_by),
    'teacher',
    'student_absent',
    'student',
    new.student_id,
    jsonb_build_object(
      'student_name', v_student.full_name,
      'class_title',  v_session.title,
      'class_at',     v_session.starts_at,
      'teacher',      v_teacher,
      'note',         new.note
    )
  );
  return null;
end $$;

drop trigger if exists trg_absence_to_crm on public.class_attendance;
create trigger trg_absence_to_crm after insert or update on public.class_attendance
  for each row execute function public.log_absence_to_crm();

-- Who is slipping? Staff-only; drives the CRM follow-up list.
-- p_days looks back over a window so an old bad month doesn't haunt a student.
create or replace function public.student_absence_summary(p_days integer default 30)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select case when not public.is_crm_staff(auth.uid()) then '[]'::jsonb
    else coalesce(jsonb_agg(row_to_json(t) order by (t.absences)::int desc), '[]'::jsonb) end
  from (
    select
      s.id                                                            as student_id,
      s.full_name,
      s.phone_number,
      s.course,
      count(*) filter (where a.status = 'absent')                     as absences,
      count(*)                                                        as sessions,
      round(100.0 * count(*) filter (where a.status in ('present','late'))
            / nullif(count(*), 0))                                    as attendance_rate,
      max(cs.starts_at) filter (where a.status = 'absent')             as last_absence,
      coalesce(tp.display_name, p.full_name, p.email)                  as teacher
    from public.class_attendance a
    join public.class_sessions  cs on cs.id = a.session_id
    join public.crm_students     s on s.id  = a.student_id
    left join public.profiles          p  on p.id  = cs.teacher_id
    left join public.teacher_profiles tp on tp.id = cs.teacher_id
    where cs.starts_at >= now() - make_interval(days => p_days)
      and s.deleted_at is null
    group by s.id, s.full_name, s.phone_number, s.course, tp.display_name, p.full_name, p.email
    having count(*) filter (where a.status = 'absent') > 0
  ) t
$$;

grant execute on function public.student_absence_summary(integer) to authenticated;
