-- ════════════════════════════════════════════════════════════════════════
-- 040: Certificates are for COURSE COMPLETION only
--
-- Policy change: a certificate must mean "you finished the course" — a real
-- learning achievement — not "you collected coins" or kept a streak. Coins and
-- streaks still power the rewards/leaderboard system; they just no longer mint
-- a printable certificate.
--   1. student_check_certificates → awards course_complete only (drops coins + streak).
--   2. cert_candidates → the "ready" bucket only surfaces course completions.
--   3. Remove the coin/streak certificates already auto-issued.
-- Custom staff-issued certificates (kind='custom') are unaffected.
-- ════════════════════════════════════════════════════════════════════════

-- 1) Award: course completion only ---------------------------------------
create or replace function public.student_check_certificates(p_token text)
returns jsonb language plpgsql volatile security definer set search_path to 'public' as $$
declare
  v_id uuid; v_name text; v_new text[] := '{}';
  r record; v_serial text;
begin
  select id, full_name into v_id, v_name from crm_students
    where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return jsonb_build_object('found', false); end if;

  -- course completion: every lesson of an enrolled course is completed
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

-- 2) Candidates board: "ready" = course completion only ------------------
create or replace function public.cert_candidates()
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not is_crm_staff(auth.uid()) then return null; end if;

  return (
  with active as (
    select s.id, s.full_name, s.verification_token as token, s.avatar_url
    from crm_students s
    where s.deleted_at is null and s.is_active and s.verification_token is not null
  ),
  cp as (   -- per (student, enrolled course) lesson completion
    select e.student_id, c.id as course_id, c.title,
           count(l.id) as total,
           count(lp.id) filter (where lp.status = 'completed') as done
    from lms_enrollments e
    join lms_courses c on c.id = e.course_id
    join lms_modules m on m.course_id = c.id
    join lms_lessons l on l.module_id = m.id
    left join lms_lesson_progress lp on lp.lesson_id = l.id and lp.student_id = e.student_id
    group by e.student_id, c.id, c.title
  ),
  ready as (   -- completed a course, certificate not yet issued
    select cp.student_id, '🎓 إتمام دورة ' || cp.title as label
    from cp
    where cp.total > 0 and cp.done = cp.total
      and not exists (select 1 from student_certificates sc
        where sc.student_id = cp.student_id and sc.kind = 'course_complete' and sc.course_id = cp.course_id)
  ),
  ready_g as (
    select r.student_id, jsonb_agg(r.label order by r.label) as items, count(*)::int as n
    from ready r group by r.student_id
  ),
  close_g as (   -- best in-progress course per student, 75–99%
    select distinct on (cp.student_id) cp.student_id, cp.title,
           round(cp.done::numeric / nullif(cp.total, 0) * 100)::int as pct
    from cp
    where cp.total > 0 and cp.done < cp.total
      and round(cp.done::numeric / nullif(cp.total, 0) * 100) >= 75
    order by cp.student_id, round(cp.done::numeric / nullif(cp.total, 0) * 100) desc
  )
  select jsonb_build_object(
    'ready', coalesce((
      select jsonb_agg(jsonb_build_object(
        'student_id', a.id, 'name', a.full_name, 'token', a.token, 'avatar_url', a.avatar_url,
        'items', g.items, 'count', g.n) order by g.n desc, a.full_name)
      from ready_g g join active a on a.id = g.student_id), '[]'::jsonb),
    'close', coalesce((
      select jsonb_agg(jsonb_build_object(
        'student_id', a.id, 'name', a.full_name, 'avatar_url', a.avatar_url,
        'course', g.title, 'pct', g.pct) order by g.pct desc)
      from close_g g join active a on a.id = g.student_id
      where not exists (select 1 from ready_g rg where rg.student_id = g.student_id)), '[]'::jsonb),
    'recent', coalesce((
      select jsonb_agg(x.obj order by x.created_at desc) from (
        select jsonb_build_object(
          'student_id', sc.student_id, 'name', s.full_name, 'avatar_url', s.avatar_url,
          'serial', sc.serial, 'title', sc.title, 'date', to_char(sc.created_at, 'YYYY-MM-DD')) as obj,
          sc.created_at
        from student_certificates sc
        join crm_students s on s.id = sc.student_id and s.deleted_at is null
        where sc.created_at > now() - interval '30 days'
        order by sc.created_at desc limit 24) x), '[]'::jsonb),
    'counts', jsonb_build_object(
      'ready',  (select count(*) from ready_g),
      'close',  (select count(*) from close_g cg where not exists (select 1 from ready_g rg where rg.student_id = cg.student_id)),
      'recent', (select count(*) from student_certificates where created_at > now() - interval '30 days'))
  )
  );
end; $$;

-- 3) Retire the coin/streak certificates already issued -------------------
delete from student_certificates where kind in ('coins', 'streak');
