-- 054_student_dashboard.sql
-- The student's own dashboard: "My courses" and "My profile" in the student
-- space (student.inglizi.com). One token-gated read, plus real watch time.
--
--   student_dashboard(token)        everything both screens need, in one call
--   student_log_watch(token, lesson, seconds)   records video watch time
--
-- Tracks stay separate, as the platform models them:
--   course track   lms_enrollments          → course access (self-paced lessons)
--   class track    online_class_enrollments → seats in live classes (group | private)
-- A student may be in either, both or neither. Nothing here merges them.
--
-- Access: the same rule as every student_* RPC — the student's verification
-- token, not deleted, active. A wrong token returns {found:false}. The class
-- meeting link is only returned while the seat is active. Receipts and payment
-- methods are not returned. Read-only except student_log_watch, which only
-- inserts into student_activity.

-- ════════════════════════════════════════════════════════════
-- 1. Watch time — "hours watched" had no source until now
-- ════════════════════════════════════════════════════════════

create or replace function public.student_log_watch(p_token text, p_lesson uuid, p_seconds integer)
returns boolean language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v_title text;
begin
  if p_seconds is null or p_seconds < 5 or p_lesson is null then return false; end if;
  select id into v_id from crm_students
   where verification_token = upper(trim(coalesce(p_token, ''))) and deleted_at is null and is_active = true;
  if v_id is null then return false; end if;
  select title into v_title from lms_lessons where id = p_lesson;
  if v_title is null then return false; end if;
  insert into student_activity (student_id, event_type, entity_type, entity_id, entity_title, duration_sec)
  values (v_id, 'watched_video', 'lesson', p_lesson::text, v_title, least(p_seconds, 4 * 3600));
  return true;
end $$;

-- ════════════════════════════════════════════════════════════
-- 2. The dashboard
-- ════════════════════════════════════════════════════════════

create or replace function public.student_dashboard(p_token text)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  s       crm_students%rowtype;
  v_tz    constant text := 'Africa/Casablanca';
  v_today date := (now() at time zone v_tz)::date;
  v_week0 date := date_trunc('week', (now() at time zone v_tz))::date;   -- Monday
  v_monthly boolean;
begin
  select * into s from crm_students
   where verification_token = upper(trim(coalesce(p_token, ''))) and deleted_at is null and is_active = true;
  if s.id is null then return jsonb_build_object('found', false); end if;
  v_monthly := s.billing_type = 'monthly' or s.student_type = 'private_student';

  return jsonb_build_object(
    'found', true,

    'student', jsonb_build_object(
      'id', s.id, 'full_name', s.full_name, 'avatar_url', s.avatar_url, 'student_type', s.student_type,
      'enrollment_date', s.enrollment_date, 'course', s.course, 'billing_type', s.billing_type),

    -- ── course track ──
    'courses', coalesce((
      select jsonb_agg(jsonb_build_object(
        'course_id', lc.id, 'title', lc.title, 'level', lc.level, 'status', le.status,
        'enrolled_at', le.enrolled_at, 'completed_at', le.completed_at,
        'lessons_total', (select count(*) from lms_lessons l join lms_modules m on m.id = l.module_id where m.course_id = lc.id),
        'lessons_done',  (select count(*) from lms_lessons l join lms_modules m on m.id = l.module_id
                            join lms_lesson_progress lp on lp.lesson_id = l.id and lp.student_id = s.id and lp.status = 'completed'
                           where m.course_id = lc.id))
        order by (le.status <> 'active'), le.enrolled_at desc)
      from lms_enrollments le join lms_courses lc on lc.id = le.course_id
      where le.student_id = s.id), '[]'::jsonb),

    -- ── class track ──
    'classes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'enrollment_id', e.id, 'class_id', c.id, 'title', c.title, 'mode', c.mode, 'level', c.level,
        'status', e.status, 'class_status', c.status, 'schedule_note', c.schedule_note,
        'meeting_url', case when e.status = 'active' then c.meeting_url end,
        'enrolled_at', e.enrolled_at, 'ended_at', e.ended_at,
        'course_title', (select title from lms_courses where id = c.course_id),
        'teacher', case when c.teacher_id is null then null else jsonb_build_object(
                      'id', c.teacher_id, 'name', coalesce(tp.display_name, p.full_name), 'avatar_url', tp.avatar_url) end,
        'sessions_done', (select count(*) from class_sessions cs where cs.class_id = c.id and cs.status = 'done'),
        'attended', (select count(*) from class_attendance a join class_sessions cs on cs.id = a.session_id
                      where cs.class_id = c.id and a.student_id = s.id and a.status in ('present', 'late')),
        'next_session_at', case when e.status = 'active' then (
                      select min(cs.starts_at) from class_sessions cs
                       where cs.class_id = c.id and cs.status in ('scheduled', 'live') and cs.starts_at >= now() - interval '1 hour') end)
        order by case e.status when 'active' then 0 when 'waitlisted' then 1 else 2 end, c.title)
      from online_class_enrollments e
      join online_classes c on c.id = e.class_id
      left join profiles p on p.id = c.teacher_id
      left join teacher_profiles tp on tp.id = c.teacher_id
      where e.student_id = s.id and e.status in ('active', 'waitlisted', 'completed') and c.archived_at is null), '[]'::jsonb),

    -- ── sessions: my active classes, plus any session I was marked on; −35 … +28 days ──
    'sessions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', cs.id, 'title', cs.title, 'starts_at', cs.starts_at, 'duration_min', cs.duration_min,
        'mode', cs.mode, 'level', cs.level, 'status', cs.status, 'location', cs.location,
        'class_id', cs.class_id, 'class_title', oc.title,
        'teacher_name', coalesce(tp.display_name, p.full_name),
        'meeting_url', case when cs.status in ('scheduled', 'live') then cs.meeting_url end,
        'my_attendance', (select a.status from class_attendance a where a.session_id = cs.id and a.student_id = s.id))
        order by cs.starts_at)
      from class_sessions cs
      left join online_classes oc on oc.id = cs.class_id
      left join profiles p on p.id = cs.teacher_id
      left join teacher_profiles tp on tp.id = cs.teacher_id
      where cs.starts_at between now() - interval '35 days' and now() + interval '28 days'
        and (cs.class_id in (select e.class_id from online_class_enrollments e where e.student_id = s.id and e.status = 'active')
             or exists (select 1 from class_attendance a where a.session_id = cs.id and a.student_id = s.id))), '[]'::jsonb),

    -- ── attendance, all time ──
    'attendance', (
      select jsonb_build_object(
        'marks',   count(*),
        'present', count(*) filter (where a.status = 'present'),
        'late',    count(*) filter (where a.status = 'late'),
        'absent',  count(*) filter (where a.status = 'absent'),
        'excused', count(*) filter (where a.status = 'excused'),
        'rate', case when count(*) filter (where a.status <> 'excused') = 0 then null
                     else round(100.0 * count(*) filter (where a.status in ('present', 'late'))
                                      / count(*) filter (where a.status <> 'excused'))::int end,
        'recent', coalesce((
          select jsonb_agg(x order by x->>'at' desc) from (
            select jsonb_build_object('at', cs.starts_at, 'title', cs.title, 'status', a2.status, 'note', a2.note) x
              from class_attendance a2 join class_sessions cs on cs.id = a2.session_id
             where a2.student_id = s.id order by cs.starts_at desc limit 20) t), '[]'::jsonb))
      from class_attendance a where a.student_id = s.id),

    -- ── teachers: assigned by the office and/or teaching one of my classes ──
    'teachers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t.teacher_id, 'name', coalesce(tp.display_name, p.full_name), 'avatar_url', tp.avatar_url,
        'headline', tp.headline, 'specialties', coalesce(tp.specialties, '{}'),
        'rating_avg', tp.rating_avg, 'rating_count', tp.rating_count,
        'assigned', t.assigned, 'classes', to_jsonb(t.classes),
        'my_rating', (select r.rating from teacher_reviews r where r.teacher_id = t.teacher_id and r.student_id = s.id))
        order by t.assigned desc, coalesce(tp.display_name, p.full_name))
      from (
        select u.teacher_id, bool_or(u.assigned) as assigned,
               coalesce(array_agg(distinct u.cls) filter (where u.cls is not null), '{}'::text[]) as classes
          from (
            select ts.teacher_id, true as assigned, null::text as cls
              from teacher_students ts where ts.student_id = s.id and ts.is_active
            union all
            select c.teacher_id, false, c.title
              from online_class_enrollments e join online_classes c on c.id = e.class_id
             where e.student_id = s.id and e.status in ('active', 'completed') and c.teacher_id is not null
          ) u group by u.teacher_id
      ) t
      join profiles p on p.id = t.teacher_id
      left join teacher_profiles tp on tp.id = t.teacher_id), '[]'::jsonb),

    -- ── payments (same rules as revenue analytics; no receipts or methods) ──
    'payments', (
      with pay as (
        select * from crm_payments where student_id = s.id and coalesce(excluded_from_revenue, false) = false
      )
      select jsonb_build_object(
        'total_paid',   (select coalesce(sum(amount_mad), 0) from pay where payment_status = 'paid'),
        'paid_count',   (select count(*) from pay where payment_status = 'paid'),
        'last_paid_at', (select max(coalesce(payment_date, created_at::date)) from pay where payment_status = 'paid'),
        'outstanding',  (select coalesce(sum(amount_mad), 0) from pay where payment_status = 'pending'),
        'overdue',      (select coalesce(sum(amount_mad), 0) from pay where payment_status = 'pending' and due_date < v_today),
        'next_due_at',  least((select min(due_date) from pay where payment_status = 'pending' and due_date is not null),
                              case when v_monthly then s.next_payment_date end),
        'monthly_fee',  case when v_monthly then s.monthly_fee_mad end,
        'status', case
            when exists (select 1 from pay where payment_status = 'pending' and due_date < v_today)
              or (v_monthly and s.next_payment_date < v_today) then 'overdue'
            when exists (select 1 from pay where payment_status = 'pending')
              or (v_monthly and s.next_payment_date <= v_today + 7) then 'due'
            when exists (select 1 from pay where payment_status = 'paid') then 'paid'
            else 'none' end,
        'history', coalesce((
            select jsonb_agg(h order by h->>'at' desc) from (
              select jsonb_build_object(
                'id', id, 'at', coalesce(payment_date, due_date, created_at::date), 'amount', amount_mad,
                'label', coalesce(nullif(description, ''), nullif(course_or_service, ''), payment_type),
                'status', case when payment_status = 'pending' and due_date < v_today then 'overdue' else payment_status end,
                'due_date', due_date,
                'installment', case when installment_count > 1 then installment_no || '/' || installment_count end) h
              from pay order by coalesce(payment_date, due_date, created_at::date) desc limit 12) t), '[]'::jsonb))),

    -- ── study figures ──
    'study', jsonb_build_object(
      'lessons_completed', (select count(*) from lms_lesson_progress where student_id = s.id and status = 'completed'),
      'videos_completed',  (select count(*) from lms_lesson_progress lp join lms_lessons l on l.id = lp.lesson_id
                             where lp.student_id = s.id and lp.status = 'completed' and l.lesson_type = 'video'),
      'quizzes_passed',    (select count(distinct lesson_id) from lms_quiz_results where student_id = s.id and passed),
      'quiz_avg',          (select round(avg(100.0 * score / nullif(total, 0)))::int from lms_quiz_results where student_id = s.id),
      'exams_passed',      (select count(distinct module_id) from lms_unit_exam_results where student_id = s.id and passed),
      'tasks_done',        (select count(*) from student_assignments where student_id = s.id and status = 'done'),
      'tasks_total',       (select count(*) from student_assignments where student_id = s.id),
      'practice_correct',  (select count(*) from student_challenge_attempts where student_id = s.id and is_correct),
      'practice_total',    (select count(*) from student_challenge_attempts where student_id = s.id),
      'watch_minutes',     (select coalesce(sum(duration_sec), 0) / 60 from student_activity
                             where student_id = s.id and event_type = 'watched_video'),
      'watch_minutes_7',   (select coalesce(sum(duration_sec), 0) / 60 from student_activity
                             where student_id = s.id and event_type = 'watched_video' and created_at >= now() - interval '7 days'),
      'active_days_7',     (select count(distinct (created_at at time zone v_tz)::date) from student_activity
                             where student_id = s.id and created_at >= now() - interval '7 days'),
      'last_active_at',    (select max(created_at) from student_activity where student_id = s.id),
      'streak', (select jsonb_build_object('current', current_streak, 'longest', longest_streak)
                   from student_streaks where student_id = s.id),
      -- activity events per week, eight Morocco weeks ending this one
      'weekly', (select jsonb_agg(jsonb_build_object('week', w::date, 'events', (
                   select count(*) from student_activity a
                    where a.student_id = s.id and a.event_type <> 'login'
                      and (a.created_at at time zone v_tz)::date >= w::date
                      and (a.created_at at time zone v_tz)::date <  w::date + 7)) order by w)
                 from generate_series(v_week0 - 49, v_week0, interval '7 days') w))
  );
end $$;

revoke execute on function public.student_dashboard(text), public.student_log_watch(text, uuid, integer) from public;
grant execute on function public.student_dashboard(text), public.student_log_watch(text, uuid, integer) to anon, authenticated;
