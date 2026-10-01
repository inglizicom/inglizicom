-- 048_enrollment_analytics.sql
-- One source of truth for enrollment, attendance and revenue numbers.
--
-- Counting rules (mirrored for the UI in src/lib/enrollment-metrics.ts — keep
-- the two in step):
--   • Dates are Morocco local days (Africa/Casablanca). A range [from, to] is
--     every instant from local midnight of `from` to local midnight after `to`.
--   • Course enrollment record = a row in lms_enrollments (active | completed)
--     or lms_enrollment_history (removed → cancelled, or completed then removed).
--   • Class enrollment record = a row in online_class_enrollments.
--   • Enrollments are dated by enrolled_at; sessions and attendance by the
--     session's starts_at; revenue by payment_date (created_at as fallback).
--   • Soft-deleted students (crm_students.deleted_at) are excluded everywhere.
--     Retired courses drop out with their rows.
--   • Payments, attendance rows and CRM student rows are never enrollment records.
--   • "Unique students" de-duplicates across course and class enrollments.
--   • Filters: course → course enrollments in that course, and classes/sessions
--     linked to it. class / teacher / mode → class enrollments and sessions that
--     match, and course enrollments of the students in that cohort (teacher also
--     includes students assigned to the teacher). status → the record's current
--     status. Revenue ignores these filters: payments are not linked to an
--     enrollment, so it is reported for all students and labelled as such.

-- ════════════════════════════════════════════════════════════
-- Enrollment + attendance analytics
-- ════════════════════════════════════════════════════════════

create or replace function public.enrollment_analytics(
  p_from    date  default null,           -- null = since the first record
  p_to      date  default null,           -- null = today
  p_filters jsonb default '{}'::jsonb,    -- {course_id, class_id, teacher_id, mode, status}
  p_bucket  text  default 'month',        -- trend granularity: day | week | month
  p_detail  boolean default true)         -- false = KPIs only (previous-period comparison)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_today    date := casa_date(now());
  v_to       date := coalesce(p_to, casa_date(now()));
  t0         timestamptz := case when p_from is null then '-infinity'::timestamptz else casa_day_start(p_from) end;
  t1         timestamptz := casa_day_start(coalesce(p_to, casa_date(now())) + 1);
  t_snap     timestamptz := least(casa_day_start(coalesce(p_to, casa_date(now())) + 1), now());
  f_course   uuid := nullif(p_filters->>'course_id', '')::uuid;
  f_class    uuid := nullif(p_filters->>'class_id', '')::uuid;
  f_teacher  uuid := nullif(p_filters->>'teacher_id', '')::uuid;
  f_mode     text := nullif(p_filters->>'mode', '');
  f_status   text := nullif(p_filters->>'status', '');
  v_cohort   boolean;
  v          jsonb;
begin
  perform require_staff();
  if p_from is not null and p_to is not null and p_to < p_from then
    raise exception 'Range end % is before its start %', p_to, p_from using errcode = '22023';
  end if;
  if coalesce(p_bucket, '') not in ('day', 'week', 'month') then
    raise exception 'Unknown bucket %', p_bucket using errcode = '22023';
  end if;
  if f_mode is not null and f_mode not in ('group', 'private') then
    raise exception 'Unknown mode %', f_mode using errcode = '22023';
  end if;
  if f_status is not null and f_status not in ('active', 'waitlisted', 'completed', 'cancelled') then
    raise exception 'Unknown status %', f_status using errcode = '22023';
  end if;
  v_cohort := f_class is not null or f_teacher is not null or f_mode is not null;

  with
  cohort as (
    select e.student_id from online_class_enrollments e join online_classes c on c.id = e.class_id
    where v_cohort
      and (f_class is null or e.class_id = f_class)
      and (f_teacher is null or c.teacher_id = f_teacher)
      and (f_mode is null or c.mode = f_mode)
    union
    select ts.student_id from teacher_students ts
    where f_teacher is not null and f_class is null and f_mode is null
      and ts.teacher_id = f_teacher and ts.is_active
  ),
  ce_all as (
    select e.student_id, e.course_id, e.enrolled_at, e.status, e.completed_at, null::timestamptz as ended_at
    from lms_enrollments e
    union all
    select h.student_id, h.course_id, h.enrolled_at,
           case when h.final_status = 'completed' then 'completed' else 'cancelled' end,
           h.completed_at, h.ended_at
    from lms_enrollment_history h
  ),
  ce as (
    select a.*, c.title as course_title
    from ce_all a
    join crm_students s on s.id = a.student_id and s.deleted_at is null
    join lms_courses  c on c.id = a.course_id
    where (f_course is null or a.course_id = f_course)
      and (f_status is null or a.status = f_status)
      and (not v_cohort or a.student_id in (select student_id from cohort))
  ),
  ke as (
    select e.student_id, e.class_id, e.status, e.enrolled_at, e.activated_at, e.ended_at,
           c.mode, c.teacher_id, c.title as class_title, c.capacity
    from online_class_enrollments e
    join online_classes c on c.id = e.class_id
    join crm_students   s on s.id = e.student_id and s.deleted_at is null
    where (f_course  is null or c.course_id  = f_course)
      and (f_class   is null or e.class_id   = f_class)
      and (f_teacher is null or c.teacher_id = f_teacher)
      and (f_mode    is null or c.mode       = f_mode)
      and (f_status  is null or e.status     = f_status)
  ),
  ce_in as (select * from ce where enrolled_at >= t0 and enrolled_at < t1),
  ke_in as (select * from ke where enrolled_at >= t0 and enrolled_at < t1),
  -- Active as of the end of the range (or now, if the range runs into the future).
  ce_snap as (select * from ce where enrolled_at < t_snap
                and coalesce(ended_at, 'infinity') > t_snap and coalesce(completed_at, 'infinity') > t_snap),
  ke_snap as (select * from ke where activated_at is not null and activated_at < t_snap
                and coalesce(ended_at, 'infinity') > t_snap),
  ss as (
    select s.* from class_sessions s
    where s.starts_at >= t0 and s.starts_at < t1
      and (f_course  is null or s.course_id  = f_course)
      and (f_class   is null or s.class_id   = f_class)
      and (f_teacher is null or s.teacher_id = f_teacher)
      and (f_mode    is null or s.mode       = f_mode)
  ),
  att as (
    select a.*, ss.teacher_id as session_teacher
    from class_attendance a
    join ss on ss.id = a.session_id
    join crm_students st on st.id = a.student_id and st.deleted_at is null
  ),
  kpis as (
    select jsonb_build_object(
      'course_enrollments',  (select count(*) from ce_in),
      'course_students',     (select count(distinct student_id) from ce_in),
      'class_enrollments',   (select count(*) from ke_in),
      'class_students',      (select count(distinct student_id) from ke_in),
      'group_enrollments',   (select count(*) from ke_in where mode = 'group'),
      'private_enrollments', (select count(*) from ke_in where mode = 'private'),
      'group_students',      (select count(distinct student_id) from ke_in where mode = 'group'),
      'private_students',    (select count(distinct student_id) from ke_in where mode = 'private'),
      'unique_students',     (select count(*) from (select student_id from ce_in union select student_id from ke_in) u),
      'both_students',       (select count(*) from (select student_id from ce_in intersect select student_id from ke_in) b),
      'course_status', jsonb_build_object(
        'active',    (select count(*) from ce_in where status = 'active'),
        'completed', (select count(*) from ce_in where status = 'completed'),
        'cancelled', (select count(*) from ce_in where status = 'cancelled')),
      'class_status', jsonb_build_object(
        'active',     (select count(*) from ke_in where status = 'active'),
        'waitlisted', (select count(*) from ke_in where status = 'waitlisted'),
        'completed',  (select count(*) from ke_in where status = 'completed'),
        'cancelled',  (select count(*) from ke_in where status = 'cancelled')),
      'active_at_end', jsonb_build_object(
        'as_of',              t_snap,
        'course_enrollments', (select count(*) from ce_snap),
        'class_enrollments',  (select count(*) from ke_snap),
        'group_enrollments',  (select count(*) from ke_snap where mode = 'group'),
        'private_enrollments',(select count(*) from ke_snap where mode = 'private'),
        'unique_students',    (select count(*) from (select student_id from ce_snap union select student_id from ke_snap) u)),
      'sessions_done',       (select count(*) from ss where status = 'done'),
      'sessions_cancelled',  (select count(*) from ss where status = 'cancelled'),
      'sessions_scheduled',  (select count(*) from ss where status in ('scheduled', 'live')),
      'hours_done',          (select coalesce(round(sum(duration_min)::numeric / 60, 1), 0) from ss where status = 'done'),
      'reports_owed',        (select count(*) from ss where status = 'done'
                                and not exists (select 1 from lesson_reports r where r.session_id = ss.id)),
      'attendance', (select jsonb_build_object(
          'marks',   count(*),
          'present', count(*) filter (where status = 'present'),
          'late',    count(*) filter (where status = 'late'),
          'absent',  count(*) filter (where status = 'absent'),
          'excused', count(*) filter (where status = 'excused'),
          'rate',    case when count(*) = 0 then null
                          else round(100.0 * count(*) filter (where status in ('present', 'late')) / count(*), 1) end)
        from att)
    ) as j
  ),
  bounds as (
    select coalesce(p_from, least(
             (select min(casa_date(enrolled_at)) from ce),
             (select min(casa_date(enrolled_at)) from ke),
             v_today)) as d0,
           v_to as d1
  ),
  buckets as (
    select gs::date as b
    from bounds, generate_series(date_trunc(p_bucket, d0::timestamp), d1::timestamp, ('1 ' || p_bucket)::interval) gs
  ),
  trend as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'bucket', b,
      'course_enrollments',  (select count(*) from ce_in where date_trunc(p_bucket, casa_date(enrolled_at)::timestamp)::date = b),
      'class_enrollments',   (select count(*) from ke_in where date_trunc(p_bucket, casa_date(enrolled_at)::timestamp)::date = b),
      'group_enrollments',   (select count(*) from ke_in where mode = 'group'   and date_trunc(p_bucket, casa_date(enrolled_at)::timestamp)::date = b),
      'private_enrollments', (select count(*) from ke_in where mode = 'private' and date_trunc(p_bucket, casa_date(enrolled_at)::timestamp)::date = b),
      'sessions_done',       (select count(*) from ss where status = 'done' and date_trunc(p_bucket, casa_date(starts_at)::timestamp)::date = b),
      'attendance_marks',    (select count(*) from att a join ss on ss.id = a.session_id
                               where date_trunc(p_bucket, casa_date(ss.starts_at)::timestamp)::date = b)
    ) order by b), '[]'::jsonb) as j
    from buckets
  ),
  by_course as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'course_id', course_id, 'title', course_title, 'enrollments', n, 'students', st,
      'active', act, 'completed', comp, 'cancelled', canc) order by n desc, course_title), '[]'::jsonb) as j
    from (select course_id, course_title, count(*) n, count(distinct student_id) st,
                 count(*) filter (where status = 'active') act, count(*) filter (where status = 'completed') comp,
                 count(*) filter (where status = 'cancelled') canc
          from ce_in group by course_id, course_title) x
  ),
  by_class as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'class_id', class_id, 'title', class_title, 'mode', mode, 'capacity', capacity,
      'teacher_name', (select coalesce(tp.display_name, p.full_name, p.email) from profiles p
                         left join teacher_profiles tp on tp.id = p.id where p.id = x.teacher_id),
      'enrollments', n, 'students', st, 'active', act, 'waitlisted', wl, 'completed', comp, 'cancelled', canc)
      order by n desc, class_title), '[]'::jsonb) as j
    from (select class_id, class_title, mode, capacity, teacher_id, count(*) n, count(distinct student_id) st,
                 count(*) filter (where status = 'active') act, count(*) filter (where status = 'waitlisted') wl,
                 count(*) filter (where status = 'completed') comp, count(*) filter (where status = 'cancelled') canc
          from ke_in group by class_id, class_title, mode, capacity, teacher_id) x
  ),
  by_mode as (
    select jsonb_build_object(
      'group',   jsonb_build_object('enrollments', (select count(*) from ke_in where mode = 'group'),
                                    'students',    (select count(distinct student_id) from ke_in where mode = 'group')),
      'private', jsonb_build_object('enrollments', (select count(*) from ke_in where mode = 'private'),
                                    'students',    (select count(distinct student_id) from ke_in where mode = 'private'))) as j
  ),
  by_teacher as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'teacher_id', t.teacher_id,
      'name', coalesce((select coalesce(tp.display_name, p.full_name, p.email) from profiles p
                          left join teacher_profiles tp on tp.id = p.id where p.id = t.teacher_id), 'بدون أستاذ'),
      'class_enrollments', coalesce(k.n, 0), 'class_students', coalesce(k.st, 0),
      'sessions_done', coalesce(s.done, 0), 'sessions_cancelled', coalesce(s.canc, 0),
      'attendance_rate', a.rate)
      order by coalesce(k.n, 0) desc, coalesce(s.done, 0) desc), '[]'::jsonb) as j
    from (select teacher_id from ke_in union select teacher_id from ss) t
    left join (select teacher_id, count(*) n, count(distinct student_id) st from ke_in group by teacher_id) k
           on k.teacher_id is not distinct from t.teacher_id
    left join (select teacher_id, count(*) filter (where status = 'done') done,
                      count(*) filter (where status = 'cancelled') canc from ss group by teacher_id) s
           on s.teacher_id is not distinct from t.teacher_id
    left join (select session_teacher, round(100.0 * count(*) filter (where status in ('present', 'late')) / nullif(count(*), 0), 1) rate
                 from att group by session_teacher) a on a.session_teacher is not distinct from t.teacher_id
  ),
  lifetime as (
    select jsonb_build_object(
      'course_enrollments', (select count(*) from ce),
      'class_enrollments',  (select count(*) from ke),
      'unique_students',    (select count(*) from (select student_id from ce union select student_id from ke) u),
      'active_now_course',  (select count(*) from ce where coalesce(ended_at, 'infinity') > now()
                               and coalesce(completed_at, 'infinity') > now() and enrolled_at <= now()),
      'active_now_class',   (select count(*) from ke where status = 'active')) as j
  )
  select jsonb_build_object(
    'range', jsonb_build_object('from', p_from, 'to', v_to, 'start', t0, 'end', t1,
                                'timezone', 'Africa/Casablanca', 'bucket', p_bucket),
    'filters', jsonb_strip_nulls(jsonb_build_object('course_id', f_course, 'class_id', f_class,
                                 'teacher_id', f_teacher, 'mode', f_mode, 'status', f_status)),
    'kpis', (select j from kpis),
    'trend',      case when p_detail then (select j from trend)      end,
    'by_course',  case when p_detail then (select j from by_course)  end,
    'by_class',   case when p_detail then (select j from by_class)   end,
    'by_mode',    case when p_detail then (select j from by_mode)    end,
    'by_teacher', case when p_detail then (select j from by_teacher) end,
    'lifetime',   case when p_detail then (select j from lifetime)   end
  ) into v;
  return v;
end $$;

-- Record-level rows behind the numbers, for CSV export. Same filters and range.
create or replace function public.enrollment_analytics_rows(
  p_from date default null, p_to date default null, p_filters jsonb default '{}'::jsonb)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  t0        timestamptz := case when p_from is null then '-infinity'::timestamptz else casa_day_start(p_from) end;
  t1        timestamptz := casa_day_start(coalesce(p_to, casa_date(now())) + 1);
  f_course  uuid := nullif(p_filters->>'course_id', '')::uuid;
  f_class   uuid := nullif(p_filters->>'class_id', '')::uuid;
  f_teacher uuid := nullif(p_filters->>'teacher_id', '')::uuid;
  f_mode    text := nullif(p_filters->>'mode', '');
  f_status  text := nullif(p_filters->>'status', '');
  v_cohort  boolean := f_class is not null or f_teacher is not null or f_mode is not null;
begin
  perform require_staff();
  return coalesce((
    with cohort as (
      select e.student_id from online_class_enrollments e join online_classes c on c.id = e.class_id
      where v_cohort and (f_class is null or e.class_id = f_class)
        and (f_teacher is null or c.teacher_id = f_teacher) and (f_mode is null or c.mode = f_mode)
      union
      select ts.student_id from teacher_students ts
      where f_teacher is not null and f_class is null and f_mode is null and ts.teacher_id = f_teacher and ts.is_active
    ),
    rows_ as (
      select 'course' as kind, s.full_name as student, c.title as item, null::text as mode, null::text as teacher,
             a.status, a.enrolled_at, coalesce(a.ended_at, a.completed_at) as ended_at
      from (select e.student_id, e.course_id, e.enrolled_at, e.status, e.completed_at, null::timestamptz ended_at from lms_enrollments e
            union all
            select h.student_id, h.course_id, h.enrolled_at,
                   case when h.final_status = 'completed' then 'completed' else 'cancelled' end, h.completed_at, h.ended_at
            from lms_enrollment_history h) a
      join crm_students s on s.id = a.student_id and s.deleted_at is null
      join lms_courses c on c.id = a.course_id
      where a.enrolled_at >= t0 and a.enrolled_at < t1
        and (f_course is null or a.course_id = f_course)
        and (f_status is null or a.status = f_status)
        and (not v_cohort or a.student_id in (select student_id from cohort))
      union all
      select 'class', s.full_name, c.title, c.mode,
             (select coalesce(tp.display_name, p.full_name, p.email) from profiles p
                left join teacher_profiles tp on tp.id = p.id where p.id = c.teacher_id),
             e.status, e.enrolled_at, e.ended_at
      from online_class_enrollments e
      join online_classes c on c.id = e.class_id
      join crm_students s on s.id = e.student_id and s.deleted_at is null
      where e.enrolled_at >= t0 and e.enrolled_at < t1
        and (f_course is null or c.course_id = f_course) and (f_class is null or e.class_id = f_class)
        and (f_teacher is null or c.teacher_id = f_teacher) and (f_mode is null or c.mode = f_mode)
        and (f_status is null or e.status = f_status)
    )
    select jsonb_agg(jsonb_build_object(
      'kind', kind, 'student', student, 'item', item, 'mode', mode, 'teacher', teacher, 'status', status,
      'enrolled_on', casa_date(enrolled_at), 'ended_on', casa_date(ended_at)) order by enrolled_at, student)
    from rows_
  ), '[]'::jsonb);
end $$;

-- ════════════════════════════════════════════════════════════
-- Revenue analytics (paid payments, by payment date)
-- ════════════════════════════════════════════════════════════
-- Same definition as revenue_between(): payment_status = 'paid', amount > 0,
-- not excluded_from_revenue. Dated by payment_date (the local day it was paid),
-- falling back to the local day the row was created.

create or replace function public.revenue_analytics(
  p_from date default null, p_to date default null, p_bucket text default 'month', p_detail boolean default true)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_to date := coalesce(p_to, casa_date(now()));
  v    jsonb;
begin
  perform require_staff();
  if p_from is not null and p_to is not null and p_to < p_from then
    raise exception 'Range end % is before its start %', p_to, p_from using errcode = '22023';
  end if;
  if coalesce(p_bucket, '') not in ('day', 'week', 'month') then
    raise exception 'Unknown bucket %', p_bucket using errcode = '22023';
  end if;

  with
  paid as (
    select p.*, coalesce(p.payment_date, casa_date(p.created_at)) as d
    from crm_payments p
    where p.payment_status = 'paid' and p.amount_mad > 0 and coalesce(p.excluded_from_revenue, false) = false
  ),
  pin as (select * from paid where (p_from is null or d >= p_from) and d <= v_to),
  leads as (
    select l.status from subscription_leads l
    where l.is_archived = false and l.plan_id not in ('test_completed', 'inquiry')
      and (p_from is null or casa_date(l.created_at) >= p_from) and casa_date(l.created_at) <= v_to
  ),
  bounds as (select coalesce(p_from, (select min(d) from paid), v_to) as d0),
  buckets as (
    select gs::date as b from bounds,
      generate_series(date_trunc(p_bucket, least(d0, v_to)::timestamp), v_to::timestamp, ('1 ' || p_bucket)::interval) gs
  )
  select jsonb_build_object(
    'range', jsonb_build_object('from', p_from, 'to', v_to, 'timezone', 'Africa/Casablanca', 'bucket', p_bucket),
    'kpis', jsonb_build_object(
      'revenue',         (select coalesce(sum(amount_mad), 0) from pin),
      'payments',        (select count(*) from pin),
      'paying_students', (select count(distinct student_id) from pin where student_id is not null)),
    'trend', case when p_detail then (
      select coalesce(jsonb_agg(jsonb_build_object('bucket', b,
        'revenue', (select coalesce(sum(amount_mad), 0) from pin where date_trunc(p_bucket, d::timestamp)::date = b),
        'payments', (select count(*) from pin where date_trunc(p_bucket, d::timestamp)::date = b)) order by b), '[]'::jsonb)
      from buckets) end,
    'by_course', case when p_detail then (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'mad', mad, 'count', n) order by mad desc), '[]'::jsonb)
      from (select coalesce(nullif(btrim(course_or_service), ''), '—') label, sum(amount_mad) mad, count(*) n
            from pin group by 1) x) end,
    'by_source', case when p_detail then (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'mad', mad, 'count', n) order by mad desc), '[]'::jsonb)
      from (select coalesce(l.lead_source, l.source, 'Direct') label, sum(pin.amount_mad) mad, count(*) n
            from pin left join subscription_leads l on l.id = pin.lead_id group by 1) x) end,
    'by_staff', case when p_detail then (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'mad', mad, 'count', n) order by mad desc), '[]'::jsonb)
      from (select coalesce(split_part(pr.full_name, ' ', 1), split_part(pr.email, '@', 1), '—') label,
                   sum(pin.amount_mad) mad, count(*) n
            from pin left join profiles pr on pr.id = pin.added_by_id group by 1) x) end,
    'funnel', case when p_detail then jsonb_build_object(
      'total',     (select count(*) from leads),
      'contacted', (select count(*) from leads where status in ('contacted','interested','follow_up','confirmed','paid','converted','delayed')),
      'confirmed', (select count(*) from leads where status in ('confirmed','paid','converted','delayed')),
      'paid',      (select count(*) from leads where status in ('paid','converted'))) end,
    'lifetime', case when p_detail then jsonb_build_object(
      'revenue', (select coalesce(sum(amount_mad), 0) from paid),
      'payments', (select count(*) from paid)) end
  ) into v;
  return v;
end $$;

-- ════════════════════════════════════════════════════════════
-- Teacher scoreboard with an explicit period
-- ════════════════════════════════════════════════════════════
-- "Current" columns describe today's roster and ignore the period. Period
-- columns count sessions that started inside [p_from, p_to] (Morocco days).
-- Both null = all time.

drop function if exists public.teachers_scoreboard();

create or replace function public.teachers_scoreboard(p_from date default null, p_to date default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  t0 timestamptz := case when p_from is null then '-infinity'::timestamptz else casa_day_start(p_from) end;
  t1 timestamptz := case when p_to   is null then 'infinity'::timestamptz  else casa_day_start(p_to + 1) end;
begin
  if not is_crm_staff(auth.uid()) then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(t order by t->>'display_name')
    from (
      select jsonb_build_object(
        'id',            p.id,
        'display_name',  coalesce(tp.display_name, p.full_name, p.email),
        'email',         p.email,
        'headline',      tp.headline,
        'avatar_url',    tp.avatar_url,
        'is_active',     coalesce(tp.is_active, true),
        'hired_at',      tp.hired_at,
        'rating_avg',    coalesce(tp.rating_avg, 0),
        'rating_count',  coalesce(tp.rating_count, 0),
        'period',        jsonb_build_object('from', p_from, 'to', p_to, 'timezone', 'Africa/Casablanca'),
        -- current roster (not affected by the period)
        'assigned_students', r.assigned,
        'class_students',    r.seated,
        'unique_students',   r.uniq,
        'course_students',   r.in_course,
        'group_enrollments', (select count(*) from online_class_enrollments e join online_classes c on c.id = e.class_id
                               join crm_students s on s.id = e.student_id and s.deleted_at is null
                               where c.teacher_id = p.id and e.status = 'active' and c.mode = 'group'),
        'private_enrollments', (select count(*) from online_class_enrollments e join online_classes c on c.id = e.class_id
                               join crm_students s on s.id = e.student_id and s.deleted_at is null
                               where c.teacher_id = p.id and e.status = 'active' and c.mode = 'private'),
        'classes_active',    (select count(*) from online_classes c
                               where c.teacher_id = p.id and c.status = 'active' and c.archived_at is null),
        -- period
        'sessions_delivered', (select count(*) from class_sessions s
                                where s.teacher_id = p.id and s.status = 'done' and s.starts_at >= t0 and s.starts_at < t1),
        'hours_delivered',    (select coalesce(round(sum(s.duration_min)::numeric / 60, 1), 0) from class_sessions s
                                where s.teacher_id = p.id and s.status = 'done' and s.starts_at >= t0 and s.starts_at < t1),
        'sessions_cancelled', (select count(*) from class_sessions s
                                where s.teacher_id = p.id and s.status = 'cancelled' and s.starts_at >= t0 and s.starts_at < t1),
        'reports_owed',       (select count(*) from class_sessions s
                                where s.teacher_id = p.id and s.status = 'done' and s.starts_at >= t0 and s.starts_at < t1
                                  and not exists (select 1 from lesson_reports lr where lr.session_id = s.id)),
        'reports_owed_all_time', (select count(*) from class_sessions s
                                where s.teacher_id = p.id and s.status = 'done'
                                  and not exists (select 1 from lesson_reports lr where lr.session_id = s.id)),
        'attendance_marks',   (select count(*) from class_attendance a join class_sessions s on s.id = a.session_id
                                where s.teacher_id = p.id and s.starts_at >= t0 and s.starts_at < t1),
        'attendance_rate',    (select case when count(*) = 0 then null
                                 else round(100.0 * count(*) filter (where a.status in ('present', 'late')) / count(*)) end
                                from class_attendance a join class_sessions s on s.id = a.session_id
                                where s.teacher_id = p.id and s.starts_at >= t0 and s.starts_at < t1),
        'new_class_enrollments', (select count(*) from online_class_enrollments e join online_classes c on c.id = e.class_id
                                where c.teacher_id = p.id and e.enrolled_at >= t0 and e.enrolled_at < t1)
      ) as t
      from profiles p
      left join teacher_profiles tp on tp.id = p.id
      cross join lateral (
        with a as (select ts.student_id from teacher_students ts join crm_students s on s.id = ts.student_id
                   where ts.teacher_id = p.id and ts.is_active and s.deleted_at is null),
             k as (select distinct e.student_id from online_class_enrollments e join online_classes c on c.id = e.class_id
                   join crm_students s on s.id = e.student_id and s.deleted_at is null
                   where c.teacher_id = p.id and e.status = 'active'),
             u as (select student_id from a union select student_id from k)
        select (select count(*) from a) as assigned,
               (select count(*) from k) as seated,
               (select count(*) from u) as uniq,
               (select count(*) from u where exists (select 1 from lms_enrollments le where le.student_id = u.student_id)) as in_course
      ) r
      where p.role::text = 'teacher'
    ) scored
  ), '[]'::jsonb);
end $$;

-- Teachers for pickers (class editor, analytics filters). Assistants cannot read
-- other profiles directly, so this goes through a staff-only RPC.
create or replace function public.staff_teacher_options()
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  perform require_staff();
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', p.id, 'name', coalesce(tp.display_name, p.full_name, p.email),
                                        'is_active', coalesce(tp.is_active, true)) order by coalesce(tp.display_name, p.full_name, p.email))
    from profiles p left join teacher_profiles tp on tp.id = p.id
    where p.role::text = 'teacher'), '[]'::jsonb);
end $$;

revoke execute on function
  public.enrollment_analytics(date, date, jsonb, text, boolean),
  public.enrollment_analytics_rows(date, date, jsonb),
  public.revenue_analytics(date, date, text, boolean),
  public.teachers_scoreboard(date, date),
  public.staff_teacher_options()
  from public, anon;
