-- ════════════════════════════════════════════════════════════════════════
-- 039: Certificate candidates board — "who is ready to get a certificate"
--
-- Certificates auto-award when the student opens their portal (via
-- student_check_certificates). But a student can QUALIFY before they next log
-- in — so the team needs a view of who is eligible RIGHT NOW so they can award
-- + notify proactively. cert_candidates() returns three buckets:
--   ready  — qualifies for a certificate they don't have yet (award now)
--   close  — 75–99% through a course (nudge them to finish)
--   recent — issued in the last 30 days (to print / send / celebrate)
-- The award action itself reuses the existing student_check_certificates(token).
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.cert_candidates()
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v jsonb;
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
  co as (
    select student_id, coalesce(sum(coins_amount), 0) as earned
    from coin_transactions where coins_amount > 0 group by student_id
  ),
  stk as (
    select student_id, coalesce(longest_streak, 0) as longest from student_streaks
  ),
  ready as (   -- qualifying certs the student does NOT already hold
    select cp.student_id, '🎓 إتمام دورة ' || cp.title as label
    from cp
    where cp.total > 0 and cp.done = cp.total
      and not exists (select 1 from student_certificates sc
        where sc.student_id = cp.student_id and sc.kind = 'course_complete' and sc.course_id = cp.course_id)
    union all
    select co.student_id, '🪙 ' || mv.m || ' عملة' as label
    from co cross join (values (100), (500), (1000), (2500)) mv(m)
    where co.earned >= mv.m
      and not exists (select 1 from student_certificates sc
        where sc.student_id = co.student_id and sc.kind = 'coins' and sc.milestone = mv.m)
    union all
    select stk.student_id, '🔥 مواظبة ' || mv.m || ' يوم' as label
    from stk cross join (values (7), (30)) mv(m)
    where stk.longest >= mv.m
      and not exists (select 1 from student_certificates sc
        where sc.student_id = stk.student_id and sc.kind = 'streak' and sc.milestone = mv.m)
  ),
  ready_g as (
    select r.student_id, jsonb_agg(r.label order by r.label) as items, count(*)::int as n
    from ready r group by r.student_id
  ),
  close_g as (   -- best (highest %) in-progress course per student, 75–99%
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
grant execute on function public.cert_candidates() to authenticated, service_role;
revoke execute on function public.cert_candidates() from public, anon;
