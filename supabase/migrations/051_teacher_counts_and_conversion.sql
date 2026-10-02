-- 051_teacher_counts_and_conversion.sql
-- One definition of "a teacher's students", shared by the teacher's own home
-- page, their roster and the staff scoreboard, so the three can never disagree.
-- Plus two founder-dashboard fixes: conversion over one cohort, and revenue
-- dated by Morocco day regardless of the session time zone.
--
-- Counting rules (mirrored in COUNTING_RULES, src/lib/enrollment-metrics.ts):
--   assigned student   active teacher_students row (administration's assignment)
--   class seat         active online_class_enrollments row in one of the teacher's
--                      non-archived classes (waitlisted / ended seats are not seats)
--   roster             assigned ∪ seated, each student once ("unique students")
--   course student     roster student with at least one ACTIVE lms_enrollments row;
--                      course enrollments = those rows (relationships, not people)
--   seats vs students  a student in two of the teacher's classes is 2 seats, 1 student
--   period             sessions whose starts_at falls in [from, to] (Morocco days);
--                      attendance = marks on those sessions
-- Soft-deleted students are excluded everywhere. Payments never count as
-- enrollment; the scoreboard's revenue column is "payments by students on this
-- teacher's roster" — a student with two teachers appears under both, so it is
-- labelled non-exclusive and is never summed across teachers.
--
-- Additive for the live app: every key the current pages read is still returned.

-- ════════════════════════════════════════════════════════════
-- 1. The roster, defined once
-- ════════════════════════════════════════════════════════════

create or replace function public.teacher_roster(p_teacher uuid)
returns table (student_id uuid, assigned boolean, seated boolean)
language sql stable security definer set search_path to 'public' as $$
  with a as (
    select ts.student_id
    from teacher_students ts
    join crm_students s on s.id = ts.student_id and s.deleted_at is null
    where ts.teacher_id = p_teacher and ts.is_active
  ),
  k as (
    select distinct e.student_id
    from online_class_enrollments e
    join online_classes c on c.id = e.class_id
    join crm_students s on s.id = e.student_id and s.deleted_at is null
    where c.teacher_id = p_teacher and c.archived_at is null and e.status = 'active'
  )
  select coalesce(a.student_id, k.student_id), a.student_id is not null, k.student_id is not null
  from a full join k on k.student_id = a.student_id
$$;

-- Every teacher figure, for one teacher and one period. Internal: callers decide
-- who may see which teacher (teacher_overview = self, teachers_scoreboard = staff).
create or replace function public.teacher_counts(p_teacher uuid, p_from date, p_to date)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  with
  r as (select * from teacher_roster(p_teacher)),
  seats as (
    select e.student_id, c.mode
    from online_class_enrollments e
    join online_classes c on c.id = e.class_id
    join crm_students s on s.id = e.student_id and s.deleted_at is null
    where c.teacher_id = p_teacher and c.archived_at is null and e.status = 'active'
  ),
  ce as (
    select le.student_id
    from lms_enrollments le
    join r on r.student_id = le.student_id
    join lms_courses lc on lc.id = le.course_id
    where le.status = 'active'
  ),
  cls as (
    select mode from online_classes
    where teacher_id = p_teacher and status = 'active' and archived_at is null
  ),
  b as (
    select case when p_from is null then '-infinity'::timestamptz else casa_day_start(p_from) end as t0,
           case when p_to   is null then 'infinity'::timestamptz  else casa_day_start(p_to + 1) end as t1
  ),
  ss as (
    select s.* from class_sessions s, b
    where s.teacher_id = p_teacher and s.starts_at >= b.t0 and s.starts_at < b.t1
  ),
  att as (
    select a.status
    from class_attendance a
    join ss on ss.id = a.session_id
    join crm_students st on st.id = a.student_id and st.deleted_at is null
  )
  select jsonb_build_object(
    'roster', jsonb_build_object(
      'unique_students',    (select count(*) from r),
      'assigned_students',  (select count(*) from r where assigned),
      'assigned_only',      (select count(*) from r where assigned and not seated),
      'class_only',         (select count(*) from r where seated and not assigned),
      'assigned_and_class', (select count(*) from r where assigned and seated),
      'course_students',    (select count(distinct student_id) from ce),
      'course_enrollments', (select count(*) from ce),
      'no_course_students', (select count(*) from r where not exists (select 1 from ce where ce.student_id = r.student_id)),
      'class_students',     (select count(distinct student_id) from seats),
      'class_seats',        (select count(*) from seats),
      'group_seats',        (select count(*) from seats where mode = 'group'),
      'private_seats',      (select count(*) from seats where mode = 'private'),
      'group_students',     (select count(distinct student_id) from seats where mode = 'group'),
      'private_students',   (select count(distinct student_id) from seats where mode = 'private'),
      'group_classes',      (select count(*) from cls where mode = 'group'),
      'private_classes',    (select count(*) from cls where mode = 'private')),
    'period', jsonb_build_object(
      'from', p_from, 'to', p_to, 'timezone', 'Africa/Casablanca',
      'sessions_delivered', (select count(*) from ss where status = 'done'),
      'hours_delivered',    (select coalesce(round(sum(duration_min)::numeric / 60, 1), 0) from ss where status = 'done'),
      'sessions_cancelled', (select count(*) from ss where status = 'cancelled'),
      'sessions_scheduled', (select count(*) from ss where status in ('scheduled', 'live')),
      'reports_owed',       (select count(*) from ss where status = 'done'
                               and not exists (select 1 from lesson_reports lr where lr.session_id = ss.id)),
      'attendance', (select jsonb_build_object(
          'marks',   count(*),
          'present', count(*) filter (where status = 'present'),
          'late',    count(*) filter (where status = 'late'),
          'absent',  count(*) filter (where status = 'absent'),
          'excused', count(*) filter (where status = 'excused'),
          'rate',    case when count(*) = 0 then null
                          else round(100.0 * count(*) filter (where status in ('present', 'late')) / count(*), 1) end)
        from att)),
    'upcoming_sessions', (select count(*) from class_sessions s
                           where s.teacher_id = p_teacher and s.status in ('scheduled', 'live') and s.starts_at >= now()),
    'reports_owed_all_time', (select count(*) from class_sessions s
                               where s.teacher_id = p_teacher and s.status = 'done'
                                 and not exists (select 1 from lesson_reports lr where lr.session_id = s.id))
  )
$$;

-- ════════════════════════════════════════════════════════════
-- 2. Teacher home: own figures for a chosen period
-- ════════════════════════════════════════════════════════════
-- The no-argument version becomes (p_from, p_to) with defaults, so a call with
-- no arguments (the current app) still resolves — to all-time period figures
-- plus the month figures it already reads.

drop function if exists public.teacher_overview();

create or replace function public.teacher_overview(p_from date default null, p_to date default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare c jsonb;
begin
  if not is_teacher(auth.uid()) then return '{}'::jsonb; end if;
  if p_from is not null and p_to is not null and p_to < p_from then
    raise exception 'Range end % is before its start %', p_to, p_from using errcode = '22023';
  end if;
  c := teacher_counts(auth.uid(), p_from, p_to);
  return c || jsonb_build_object(
    -- keys read by earlier app versions; same definitions as `roster` above
    'students_total',    c->'roster'->'unique_students',
    'assigned_students', c->'roster'->'assigned_students',
    'class_students',    c->'roster'->'class_students',
    'classes_active',    (c->'roster'->>'group_classes')::int + (c->'roster'->>'private_classes')::int,
    'classes_month',     (select count(*) from class_sessions
                           where teacher_id = auth.uid() and status = 'done' and starts_at >= casa_now_trunc('month')),
    'hours_month',       (select coalesce(round(sum(duration_min)::numeric / 60, 1), 0) from class_sessions
                           where teacher_id = auth.uid() and status = 'done' and starts_at >= casa_now_trunc('month')),
    'upcoming',          (select count(*) from class_sessions
                           where teacher_id = auth.uid() and status = 'scheduled' and starts_at >= now()),
    'reports_owed',      c->'reports_owed_all_time',
    'attendance_rate',   (select case when count(*) = 0 then null
                            else round(100.0 * count(*) filter (where a.status in ('present', 'late')) / count(*)) end
                          from class_attendance a join class_sessions s on s.id = a.session_id
                          where s.teacher_id = auth.uid()),
    'rating_avg',        (select rating_avg   from teacher_profiles where id = auth.uid()),
    'rating_count',      (select rating_count from teacher_profiles where id = auth.uid()));
end $$;

-- ════════════════════════════════════════════════════════════
-- 3. Teacher roster: courses and class memberships, labelled separately
-- ════════════════════════════════════════════════════════════
-- relationship: assigned | class | both. Class memberships are only this
-- teacher's classes; courses are the student's course enrollments (no payments).

create or replace function public.teacher_my_students()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select case when not public.is_teacher(auth.uid()) then '[]'::jsonb else coalesce((
    select jsonb_agg(jsonb_build_object(
      'id',              s.id,
      'full_name',       s.full_name,
      'course',          s.course,
      'student_type',    s.student_type,
      'enrollment_date', s.enrollment_date,
      'is_active',       s.is_active,
      'avatar_url',      s.avatar_url,
      'phone_masked',    mask_phone(s.phone_number),
      'assigned',        r.assigned,
      'assigned_at',     (select ts.assigned_at from teacher_students ts
                           where ts.teacher_id = auth.uid() and ts.student_id = s.id and ts.is_active),
      'relationship',    case when r.assigned and r.seated then 'both' when r.assigned then 'assigned' else 'class' end,
      -- active seats (kept for earlier app versions)
      'classes', coalesce((
        select jsonb_agg(jsonb_build_object('class_id', c.id, 'title', c.title, 'mode', c.mode) order by c.title)
        from online_class_enrollments e join online_classes c on c.id = e.class_id
        where e.student_id = s.id and c.teacher_id = auth.uid() and c.archived_at is null and e.status = 'active'), '[]'::jsonb),
      'class_memberships', coalesce((
        select jsonb_agg(jsonb_build_object(
          'enrollment_id', e.id, 'class_id', c.id, 'title', c.title, 'mode', c.mode,
          'status', e.status, 'class_status', c.status, 'archived', c.archived_at is not null,
          'enrolled_at', e.enrolled_at, 'ended_at', e.ended_at)
          order by case e.status when 'active' then 0 when 'waitlisted' then 1 else 2 end, c.title)
        from online_class_enrollments e join online_classes c on c.id = e.class_id
        where e.student_id = s.id and c.teacher_id = auth.uid()
          and e.status in ('active', 'waitlisted', 'completed')), '[]'::jsonb),
      'courses', coalesce((
        select jsonb_agg(jsonb_build_object(
          'course_id', lc.id, 'title', lc.title, 'level', lc.level, 'status', le.status,
          'enrolled_at', le.enrolled_at, 'completed_at', le.completed_at)
          order by (le.status <> 'active'), lc.title)
        from lms_enrollments le join lms_courses lc on lc.id = le.course_id
        where le.student_id = s.id), '[]'::jsonb)
    ) order by s.full_name)
    from teacher_roster(auth.uid()) r
    join crm_students s on s.id = r.student_id
  ), '[]'::jsonb) end
$$;

-- ════════════════════════════════════════════════════════════
-- 4. Staff scoreboard: same figures per teacher, plus roster revenue
-- ════════════════════════════════════════════════════════════

create or replace function public.teachers_scoreboard(p_from date default null, p_to date default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not is_crm_staff(auth.uid()) then return '[]'::jsonb; end if;
  if p_from is not null and p_to is not null and p_to < p_from then
    raise exception 'Range end % is before its start %', p_to, p_from using errcode = '22023';
  end if;
  return coalesce((
    select jsonb_agg(t order by t->>'display_name')
    from (
      select jsonb_build_object(
        'id',           p.id,
        'display_name', coalesce(tp.display_name, p.full_name, p.email),
        'email',        p.email,
        'headline',     tp.headline,
        'avatar_url',   tp.avatar_url,
        'is_active',    coalesce(tp.is_active, true),
        'hired_at',     tp.hired_at,
        'rating_avg',   coalesce(tp.rating_avg, 0),
        'rating_count', coalesce(tp.rating_count, 0),
        'period',       jsonb_build_object('from', p_from, 'to', p_to, 'timezone', 'Africa/Casablanca'),
        'roster',       c->'roster',
        -- current roster (not affected by the period)
        'assigned_students',   (c->'roster'->>'assigned_students')::int,
        'class_students',      (c->'roster'->>'class_students')::int,
        'unique_students',     (c->'roster'->>'unique_students')::int,
        'course_students',     (c->'roster'->>'course_students')::int,
        'course_enrollments',  (c->'roster'->>'course_enrollments')::int,
        'class_seats',         (c->'roster'->>'class_seats')::int,
        'group_enrollments',   (c->'roster'->>'group_seats')::int,
        'private_enrollments', (c->'roster'->>'private_seats')::int,
        'group_classes',       (c->'roster'->>'group_classes')::int,
        'private_classes',     (c->'roster'->>'private_classes')::int,
        'classes_active',      (c->'roster'->>'group_classes')::int + (c->'roster'->>'private_classes')::int,
        -- period
        'sessions_delivered',    (c->'period'->>'sessions_delivered')::int,
        'hours_delivered',       (c->'period'->>'hours_delivered')::numeric,
        'sessions_cancelled',    (c->'period'->>'sessions_cancelled')::int,
        'reports_owed',          (c->'period'->>'reports_owed')::int,
        'reports_owed_all_time', (c->>'reports_owed_all_time')::int,
        'attendance_marks',      (c->'period'->'attendance'->>'marks')::int,
        'attendance_rate',       (c->'period'->'attendance'->>'rate')::numeric,
        'new_class_enrollments', (select count(*) from online_class_enrollments e
                                   join online_classes oc on oc.id = e.class_id
                                   join crm_students s on s.id = e.student_id and s.deleted_at is null
                                   where oc.teacher_id = p.id
                                     and e.enrolled_at >= case when p_from is null then '-infinity'::timestamptz else casa_day_start(p_from) end
                                     and e.enrolled_at <  case when p_to is null then 'infinity'::timestamptz else casa_day_start(p_to + 1) end),
        -- revenue: paid payments in the period by students on this roster today.
        -- Non-exclusive (a student with two teachers counts for both).
        'roster_revenue', (select coalesce(sum(cp.amount_mad), 0) from crm_payments cp
                            where cp.student_id in (select student_id from teacher_roster(p.id))
                              and cp.payment_status = 'paid' and cp.amount_mad > 0
                              and coalesce(cp.excluded_from_revenue, false) = false
                              and (p_from is null or coalesce(cp.payment_date, casa_date(cp.created_at)) >= p_from)
                              and (p_to   is null or coalesce(cp.payment_date, casa_date(cp.created_at)) <= p_to)),
        'roster_paying_students', (select count(distinct cp.student_id) from crm_payments cp
                            where cp.student_id in (select student_id from teacher_roster(p.id))
                              and cp.payment_status = 'paid' and cp.amount_mad > 0
                              and coalesce(cp.excluded_from_revenue, false) = false
                              and (p_from is null or coalesce(cp.payment_date, casa_date(cp.created_at)) >= p_from)
                              and (p_to   is null or coalesce(cp.payment_date, casa_date(cp.created_at)) <= p_to))
      ) as t
      from profiles p
      left join teacher_profiles tp on tp.id = p.id
      cross join lateral (select teacher_counts(p.id, p_from, p_to) as c) x
      where p.role::text = 'teacher'
    ) scored
  ), '[]'::jsonb);
end $$;

-- ════════════════════════════════════════════════════════════
-- 5. Founder dashboard: revenue by Morocco day, conversion over one cohort
-- ════════════════════════════════════════════════════════════

-- A payment's day is payment_date; legacy rows without one use the Morocco day
-- they were recorded. Mapping that day to its Morocco midnight (rather than
-- casting the date in the session time zone) keeps every caller's day, week,
-- month and year boundaries exact whatever the session's TimeZone is.
create or replace function public.revenue_between(p_from timestamp with time zone, p_to timestamp with time zone)
returns numeric language sql stable security definer set search_path to 'public' as $$
  select coalesce(sum(amount_mad), 0)
  from crm_payments
  where payment_status = 'paid' and amount_mad > 0 and coalesce(excluded_from_revenue, false) = false
    and casa_day_start(coalesce(payment_date, casa_date(created_at))) >= p_from
    and casa_day_start(coalesce(payment_date, casa_date(created_at))) <  p_to
$$;

-- conversion_rate was distinct paying students (from payments, any origin) over
-- every lead ever (archived and test leads included): two different populations.
-- It is now paid leads over leads, both from the same cohort — real plan leads,
-- not archived, all time — the same population as the analytics funnel.
create or replace function public.owner_overview()
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v jsonb; v_rev_total numeric; v_paying int; v_leads int; v_paid_leads int;
begin
  if not is_founder(auth.uid()) then return null; end if;
  select coalesce(sum(amount_mad),0) into v_rev_total from crm_payments where payment_status='paid' and amount_mad>0 and coalesce(excluded_from_revenue,false)=false;
  select count(distinct student_id) into v_paying from crm_payments where payment_status='paid' and amount_mad>0 and coalesce(excluded_from_revenue,false)=false and student_id is not null;
  select count(*), count(*) filter (where status in ('paid', 'converted')) into v_leads, v_paid_leads
    from subscription_leads where is_archived = false and plan_id not in ('test_completed', 'inquiry');
  select jsonb_build_object(
    'rev_today', revenue_between(casa_now_trunc('day'),   now() + interval '1 sec'),
    'rev_week',  revenue_between(casa_now_trunc('week'),  now() + interval '1 sec'),
    'rev_month', revenue_between(casa_now_trunc('month'), now() + interval '1 sec'),
    'rev_year',  revenue_between(casa_now_trunc('year'),  now() + interval '1 sec'),
    'rev_total', v_rev_total,
    'paying_students', v_paying,
    'arpu', case when v_paying > 0 then round(v_rev_total / v_paying) else 0 end,
    'new_leads_today', (select count(*) from subscription_leads where created_at >= casa_now_trunc('day')),
    'new_students_today', (select count(*) from crm_students where deleted_at is null and created_at >= casa_now_trunc('day')),
    'total_leads', (select count(*) from subscription_leads),
    'total_students', (select count(*) from crm_students where deleted_at is null),
    'active_students', (select count(*) from crm_students where deleted_at is null and is_active),
    'inactive_students', (select count(*) from crm_students where deleted_at is null and not is_active),
    'at_risk', (select count(*) from crm_students s where s.deleted_at is null and s.is_active
                 and not exists (select 1 from student_activity a where a.student_id = s.id and a.created_at > now() - interval '7 days')),
    'conversion_rate', case when v_leads > 0 then round(100.0 * v_paid_leads / v_leads, 1) else 0 end,
    'conversion', jsonb_build_object('leads', v_leads, 'paid', v_paid_leads,
                                     'cohort', 'plan leads, not archived, all time'),
    'enroll', (select coalesce(jsonb_object_agg(et, c), '{}'::jsonb) from (select coalesce(enrollment_type,'paid') et, count(*) c from crm_students where deleted_at is null group by 1) t),
    'rewards', jsonb_build_object(
      'coins_distributed', (select coalesce(sum(coins_amount),0) from coin_transactions where coins_amount > 0),
      'coins_spent', (select coalesce(abs(sum(coins_amount)),0) from coin_transactions where coins_amount < 0),
      'claims_total', (select count(*) from reward_claims),
      'claims_pending', (select count(*) from reward_claims where status = 'pending')),
    'top_course', (select jsonb_build_object('title', c.title, 'students', e.cnt)
       from (select course_id, count(*) cnt from lms_enrollments group by course_id order by cnt desc limit 1) e
       join lms_courses c on c.id = e.course_id),
    'worst_course', (select jsonb_build_object('title', c.title, 'students', e.cnt)
       from (select course_id, count(*) cnt from lms_enrollments group by course_id order by cnt asc limit 1) e
       join lms_courses c on c.id = e.course_id)
  ) into v;
  return v;
end; $function$;

-- ════════════════════════════════════════════════════════════
-- 6. Grants
-- ════════════════════════════════════════════════════════════

revoke execute on function public.teacher_overview(date, date), public.teachers_scoreboard(date, date)
  from public, anon;
revoke execute on function public.teacher_roster(uuid), public.teacher_counts(uuid, date, date)
  from public, anon, authenticated;
