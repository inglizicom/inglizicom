-- ════════════════════════════════════════════════════════════════════════
-- 037: Owner Live Pulse + generic certificates + student avatars
--
-- 1) student_presence     — heartbeat table so the owner sees who is online
--                           RIGHT NOW and what they are doing (RPC-write only).
-- 2) crm_students.avatar_url — staff-managed profile photo (student-files bucket).
-- 3) student_certificates — generic auto-awarded certificates (course complete,
--                           coin milestones, streaks) + staff-issued custom ones.
--                           Public verification by serial (anti-forgery).
-- 4) owner_live_pulse / owner_learning_intel — founder-only RPCs: online now,
--    studying today, who is progressing, who is struggling (and why).
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. Presence heartbeat ───────────────────────────────────────────────
create table if not exists public.student_presence (
  student_id   uuid primary key references public.crm_students(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  activity     text,                                        -- human label: "الرئيسية", "درس: Unit 3", …
  course_id    uuid references public.lms_courses(id) on delete set null,
  updated_at   timestamptz not null default now()
);
create index if not exists student_presence_seen_idx on public.student_presence (last_seen_at desc);

alter table public.student_presence enable row level security;
drop policy if exists student_presence_staff_read on public.student_presence;
create policy student_presence_staff_read on public.student_presence
  for select using (public.is_crm_staff(auth.uid()));
-- no client-side write policies: writes only via the SECURITY DEFINER RPC below

create or replace function public.student_heartbeat(p_token text, p_activity text default null, p_course uuid default null)
returns boolean language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid;
begin
  select id into v_id from crm_students
    where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return false; end if;
  insert into student_presence (student_id, last_seen_at, activity, course_id, updated_at)
  values (v_id, now(), left(p_activity, 120), p_course, now())
  on conflict (student_id) do update
    set last_seen_at = now(), activity = left(coalesce(p_activity, student_presence.activity), 120),
        course_id = coalesce(excluded.course_id, student_presence.course_id), updated_at = now();
  return true;
end; $$;
grant execute on function public.student_heartbeat(text, text, uuid) to anon, authenticated, service_role;

-- ── 2. Student avatar (staff-managed photo) ─────────────────────────────
alter table public.crm_students add column if not exists avatar_url text;

-- students see their own photo in the portal (token-gated, returns url or null)
create or replace function public.student_avatar(p_token text)
returns text language sql stable security definer set search_path to 'public' as $$
  select avatar_url from crm_students
  where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
$$;
grant execute on function public.student_avatar(text) to anon, authenticated, service_role;

-- staff can upload avatars into the student-files bucket (avatars/… path)
drop policy if exists student_files_staff_update on storage.objects;
create policy student_files_staff_update on storage.objects for update
  using (bucket_id = 'student-files' and public.is_crm_staff(auth.uid()))
  with check (bucket_id = 'student-files' and public.is_crm_staff(auth.uid()));

-- ── 3. Generic certificates ─────────────────────────────────────────────
create table if not exists public.student_certificates (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.crm_students(id) on delete cascade,
  course_id  uuid references public.lms_courses(id) on delete set null,
  kind       text not null,          -- course_complete | coins | streak | custom
  milestone  integer,                -- coin threshold / streak days (null for course/custom)
  title      text not null,
  serial     text not null unique,
  meta       jsonb,
  issued_by  uuid references public.profiles(id) on delete set null,   -- null = automatic
  created_at timestamptz not null default now()
);
-- one certificate per (student, kind, course, milestone)
create unique index if not exists student_certificates_dedupe on public.student_certificates
  (student_id, kind, coalesce(course_id, '00000000-0000-0000-0000-000000000000'::uuid), coalesce(milestone, 0));
create index if not exists student_certificates_student_idx on public.student_certificates (student_id, created_at desc);

alter table public.student_certificates enable row level security;
drop policy if exists student_certificates_staff_read  on public.student_certificates;
drop policy if exists student_certificates_staff_write on public.student_certificates;
drop policy if exists student_certificates_founder_del on public.student_certificates;
create policy student_certificates_staff_read  on public.student_certificates for select using (public.is_crm_staff(auth.uid()));
create policy student_certificates_staff_write on public.student_certificates for insert with check (public.is_crm_staff(auth.uid()));
create policy student_certificates_founder_del on public.student_certificates for delete using (public.is_founder(auth.uid()));

-- unique printable serial: IGZ-YYMM-XXXXXX
create or replace function public._cert_serial()
returns text language plpgsql volatile security definer set search_path to 'public' as $$
declare v text;
begin
  loop
    v := 'IGZ-' || to_char(now(), 'YYMM') || '-' ||
         upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from student_certificates where serial = v);
  end loop;
  return v;
end; $$;
revoke execute on function public._cert_serial() from public, anon, authenticated;

-- internal awarder (idempotent) — notifies the student when a cert is new
create or replace function public._award_certificate(
  p_student uuid, p_kind text, p_course uuid, p_milestone integer, p_title text, p_meta jsonb default null)
returns text language plpgsql volatile security definer set search_path to 'public' as $$
declare v_serial text;
begin
  insert into student_certificates (student_id, kind, course_id, milestone, title, serial, meta)
  values (p_student, p_kind, p_course, p_milestone, p_title, public._cert_serial(), p_meta)
  on conflict (student_id, kind, coalesce(course_id, '00000000-0000-0000-0000-000000000000'::uuid), coalesce(milestone, 0))
  do nothing
  returning serial into v_serial;
  if v_serial is not null then
    insert into student_notifications (student_id, type, title, body, tab)
    values (p_student, 'certificate', '🎓 حصلت على شهادة جديدة!', p_title, 'home');
  end if;
  return v_serial;
end; $$;
revoke execute on function public._award_certificate(uuid, text, uuid, integer, text, jsonb) from public, anon, authenticated;

-- token-gated: award anything earned, then return all certificates (+ which are new)
create or replace function public.student_check_certificates(p_token text)
returns jsonb language plpgsql volatile security definer set search_path to 'public' as $$
declare
  v_id uuid; v_name text; v_coins numeric; v_streak int; v_new text[] := '{}';
  r record; v_serial text; m int;
begin
  select id, full_name into v_id, v_name from crm_students
    where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return jsonb_build_object('found', false); end if;

  -- a) course completion: every lesson of an enrolled course is completed
  for r in
    select c.id as course_id, c.title,
           count(l.id) as total,
           count(lp.id) filter (where lp.status = 'completed') as done
    from lms_enrollments e
    join lms_courses c on c.id = e.course_id
    join lms_modules m2 on m2.course_id = c.id
    join lms_lessons l on l.module_id = m2.id
    left join lms_lesson_progress lp on lp.lesson_id = l.id and lp.student_id = v_id
    where e.student_id = v_id
    group by c.id, c.title
    having count(l.id) > 0 and count(l.id) = count(lp.id) filter (where lp.status = 'completed')
  loop
    v_serial := public._award_certificate(v_id, 'course_complete', r.course_id, null,
      'شهادة إتمام دورة ' || r.title, jsonb_build_object('lessons', r.total));
    if v_serial is not null then v_new := v_new || v_serial; end if;
  end loop;

  -- b) coin milestones (total EARNED coins, spending doesn't remove achievements)
  select coalesce(sum(coins_amount), 0) into v_coins from coin_transactions
    where student_id = v_id and coins_amount > 0;
  foreach m in array array[100, 500, 1000, 2500] loop
    if v_coins >= m then
      v_serial := public._award_certificate(v_id, 'coins', null, m,
        'شهادة إنجاز — جمع ' || m || ' عملة تعلّم', jsonb_build_object('coins', v_coins));
      if v_serial is not null then v_new := v_new || v_serial; end if;
    end if;
  end loop;

  -- c) streak milestones (longest streak reached)
  select coalesce(longest_streak, 0) into v_streak from student_streaks where student_id = v_id;
  foreach m in array array[7, 30] loop
    if coalesce(v_streak, 0) >= m then
      v_serial := public._award_certificate(v_id, 'streak', null, m,
        'شهادة مواظبة — ' || m || case when m <= 10 then ' أيام متتالية' else ' يومًا متتاليًا' end,
        jsonb_build_object('streak', v_streak));
      if v_serial is not null then v_new := v_new || v_serial; end if;
    end if;
  end loop;

  return jsonb_build_object(
    'found', true,
    'new', to_jsonb(v_new),
    'certs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'serial', sc.serial, 'kind', sc.kind, 'title', sc.title, 'milestone', sc.milestone,
        'course_title', c.title, 'date', to_char(sc.created_at, 'YYYY-MM-DD')) order by sc.created_at desc)
      from student_certificates sc left join lms_courses c on c.id = sc.course_id
      where sc.student_id = v_id), '[]'::jsonb)
  );
end; $$;
grant execute on function public.student_check_certificates(text) to anon, authenticated, service_role;

-- public verification / print page (by serial — safe fields only)
create or replace function public.certificate_verify(p_serial text)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select coalesce((
    select jsonb_build_object(
      'found', true, 'serial', sc.serial, 'kind', sc.kind, 'title', sc.title,
      'milestone', sc.milestone, 'student_name', s.full_name,
      'course_title', c.title, 'course_level', c.level,
      'date', to_char(sc.created_at, 'YYYY-MM-DD'))
    from student_certificates sc
    join crm_students s on s.id = sc.student_id
    left join lms_courses c on c.id = sc.course_id
    where sc.serial = upper(trim(p_serial)) and s.deleted_at is null
  ), jsonb_build_object('found', false));
$$;
grant execute on function public.certificate_verify(text) to anon, authenticated, service_role;

-- ── 4. Owner Live Pulse (founder only) ──────────────────────────────────
create or replace function public.owner_live_pulse()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return null; end if;
  select jsonb_build_object(
    'online_now', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.full_name, 'avatar_url', s.avatar_url,
        'activity', p.activity, 'course', c.title,
        'minutes', greatest(0, extract(epoch from now() - p.last_seen_at)::int / 60)) order by p.last_seen_at desc)
      from student_presence p
      join crm_students s on s.id = p.student_id and s.deleted_at is null
      left join lms_courses c on c.id = p.course_id
      where p.last_seen_at > now() - interval '5 minutes'), '[]'::jsonb),
    'online_count', (select count(*) from student_presence where last_seen_at > now() - interval '5 minutes'),
    'active_today', (select count(distinct student_id) from student_activity where created_at >= date_trunc('day', now()) and student_id is not null),
    'active_week',  (select count(distinct student_id) from student_activity where created_at > now() - interval '7 days' and student_id is not null),
    'lessons_today', (select count(*) from student_activity where event_type = 'completed_lesson' and created_at >= date_trunc('day', now())),
    'quizzes_today', (select count(*) from student_activity where event_type in ('completed_quiz', 'completed_reading_quiz') and created_at >= date_trunc('day', now())),
    'exams_passed_today', (select count(*) from student_activity where event_type = 'passed_unit_exam' and created_at >= date_trunc('day', now())),
    'challenges_today', (select count(*) from student_activity where event_type = 'completed_challenge' and created_at >= date_trunc('day', now())),
    'coins_today', (select coalesce(sum(coins_amount), 0) from coin_transactions where coins_amount > 0 and created_at >= date_trunc('day', now())),
    'avg_score_7d', (select coalesce(round(avg(score::numeric / nullif(total, 0)) * 100), 0) from (
        select score, total, created_at from lms_quiz_results
        union all select score, total, created_at from lms_unit_exam_results) q
      where created_at > now() - interval '7 days' and total > 0),
    'certs_week', (select count(*) from student_certificates where created_at > now() - interval '7 days'),
    'recent_events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', s.full_name, 'event', a.event_type, 'title', a.entity_title,
        'at', to_char(a.created_at, 'HH24:MI')) order by a.created_at desc)
      from (select * from student_activity where created_at >= date_trunc('day', now()) and student_id is not null
            order by created_at desc limit 12) a
      join crm_students s on s.id = a.student_id), '[]'::jsonb)
  ) into v;
  return v;
end; $$;
grant execute on function public.owner_live_pulse() to authenticated, service_role;
revoke execute on function public.owner_live_pulse() from public, anon;

-- who is progressing / who is struggling (and WHY) — founder only
create or replace function public.owner_learning_intel()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return null; end if;
  with base as (
    select s.id, s.full_name, s.avatar_url from crm_students s where s.deleted_at is null and s.is_active
  ),
  prog as (   -- lesson progress across enrolled courses
    select e.student_id,
           count(l.id) as total,
           count(lp.id) filter (where lp.status = 'completed') as done
    from lms_enrollments e
    join lms_modules m on m.course_id = e.course_id
    join lms_lessons l on l.module_id = m.id
    left join lms_lesson_progress lp on lp.lesson_id = l.id and lp.student_id = e.student_id
    group by e.student_id
  ),
  week as (   -- learning volume last 7 days
    select student_id,
           count(*) filter (where event_type = 'completed_lesson') as lessons_7d,
           count(*) filter (where event_type in ('completed_quiz', 'completed_reading_quiz')) as quizzes_7d,
           count(*) filter (where event_type = 'passed_unit_exam') as exams_7d
    from student_activity
    where created_at > now() - interval '7 days' and student_id is not null
    group by student_id
  ),
  scores as ( -- test performance last 30 days
    select student_id,
           round(avg(pct)) as avg_pct, count(*) as attempts
    from (
      select student_id, score::numeric / nullif(total, 0) * 100 as pct, created_at from lms_quiz_results where total > 0
      union all
      select student_id, score::numeric / nullif(total, 0) * 100, created_at from lms_unit_exam_results where total > 0
    ) q
    where created_at > now() - interval '30 days'
    group by student_id
  ),
  fails as (
    select student_id, count(*) as n from lms_unit_exam_results
    where passed = false and created_at > now() - interval '14 days'
    group by student_id
  ),
  last_act as (
    select student_id, max(created_at) as last_at from student_activity where student_id is not null group by student_id
  ),
  full_view as (
    select b.id, b.full_name, b.avatar_url,
           coalesce(p.total, 0) as total, coalesce(p.done, 0) as done,
           case when coalesce(p.total, 0) > 0 then round(p.done::numeric / p.total * 100) else null end as progress,
           coalesce(w.lessons_7d, 0) as lessons_7d, coalesce(w.quizzes_7d, 0) as quizzes_7d, coalesce(w.exams_7d, 0) as exams_7d,
           s.avg_pct, coalesce(s.attempts, 0) as attempts, coalesce(f.n, 0) as fails,
           case when la.last_at is null then 999 else extract(day from now() - la.last_at)::int end as days_inactive
    from base b
    left join prog p on p.student_id = b.id
    left join week w on w.student_id = b.id
    left join scores s on s.student_id = b.id
    left join fails f on f.student_id = b.id
    left join last_act la on la.student_id = b.id
  )
  select jsonb_build_object(
    'progressing', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'name', full_name, 'avatar_url', avatar_url, 'lessons_7d', lessons_7d,
        'quizzes_7d', quizzes_7d, 'progress', progress, 'avg_score', avg_pct)
        order by lessons_7d + quizzes_7d + exams_7d desc)
      from (select * from full_view
            where lessons_7d + quizzes_7d + exams_7d > 0
            order by lessons_7d + quizzes_7d + exams_7d desc limit 10) t), '[]'::jsonb),
    'struggling', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'name', full_name, 'avatar_url', avatar_url, 'progress', progress,
        'avg_score', avg_pct, 'fails', fails, 'days_inactive', days_inactive,
        'reason', case
          when attempts >= 3 and avg_pct < 55 then 'معدل النقاط منخفض (' || avg_pct || '%)'
          when fails >= 2 then 'رسب في امتحان الوحدة ' || fails || ' مرات'
          else 'تقدّم متوقف (' || coalesce(progress, 0) || '%) وخمول ' || days_inactive || ' أيام' end)
        order by (case when attempts >= 3 and avg_pct < 55 then 0 when fails >= 2 then 1 else 2 end), days_inactive desc)
      from (select * from full_view
            where (attempts >= 3 and avg_pct < 55)
               or fails >= 2
               or (total > 0 and coalesce(progress, 0) < 25 and days_inactive between 5 and 60)
            limit 15) t), '[]'::jsonb)
  ) into v;
  return v;
end; $$;
grant execute on function public.owner_learning_intel() to authenticated, service_role;
revoke execute on function public.owner_learning_intel() from public, anon;
