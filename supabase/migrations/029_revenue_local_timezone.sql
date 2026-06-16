-- 029_revenue_local_timezone.sql
-- Revenue time buckets (today / this week / this month / this year) were computed
-- with date_trunc(unit, now()) in the DB session timezone, which is UTC. Morocco
-- (Africa/Casablanca) is UTC+1, so "today" started at 01:00 local — payments made
-- in the first hour of the day fell into the wrong bucket and the owner numbers
-- looked off. Recompute every boundary in Morocco local time.

-- Start of the current day/week/month/year in Africa/Casablanca, as a timestamptz.
-- now() -> local wall clock -> truncate -> back to an absolute instant.
create or replace function casa_now_trunc(p_unit text)
returns timestamptz language sql stable as $$
  select date_trunc(p_unit, now() at time zone 'Africa/Casablanca') at time zone 'Africa/Casablanca'
$$;

-- ── owner_overview: KPI buckets ───────────────────────────────────────────────
create or replace function public.owner_overview()
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v jsonb; v_rev_total numeric; v_paying int;
begin
  if not is_founder(auth.uid()) then return null; end if;
  select coalesce(sum(amount_mad),0) into v_rev_total from crm_payments where payment_status='paid' and amount_mad>0 and coalesce(excluded_from_revenue,false)=false;
  select count(distinct student_id) into v_paying from crm_payments where payment_status='paid' and amount_mad>0 and coalesce(excluded_from_revenue,false)=false and student_id is not null;
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
    'conversion_rate', case when (select count(*) from subscription_leads) > 0
        then round(v_paying::numeric / (select count(*) from subscription_leads) * 100, 1) else 0 end,
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

-- ── owner_alerts: this-month vs last-month revenue ────────────────────────────
create or replace function public.owner_alerts()
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v jsonb; v_inactive7 int; v_backlog int; v_rev_this numeric; v_rev_prev numeric; v_pending_claims int;
begin
  if not is_founder(auth.uid()) then return '[]'::jsonb; end if;
  select count(*) into v_inactive7 from crm_students s where s.deleted_at is null and s.is_active
    and not exists (select 1 from student_activity a where a.student_id = s.id and a.created_at > now() - interval '7 days');
  select count(*) into v_backlog from subscription_leads l where l.next_followup_at is not null and l.next_followup_at < now()
    and l.status not in ('confirmed','converted','paid','rejected','cancelled');
  v_rev_this := revenue_between(casa_now_trunc('month'), now() + interval '1 sec');
  v_rev_prev := revenue_between(casa_now_trunc('month') - interval '1 month', casa_now_trunc('month'));
  select count(*) into v_pending_claims from reward_claims where status = 'pending';
  select jsonb_agg(a) into v from (
    select * from (values
      ('warn',   '⏰ ' || v_inactive7 || ' طالب غير نشط منذ 7 أيام أو أكثر', v_inactive7 > 0),
      ('warn',   '📞 ' || v_backlog || ' متابعة متأخرة لدى الفريق', v_backlog > 0),
      ('danger', '📉 إيراد هذا الشهر أقل من الشهر الماضي (' || round(v_rev_this) || ' مقابل ' || round(v_rev_prev) || ' درهم)', v_rev_prev > 0 and v_rev_this < v_rev_prev),
      ('info',   '🎁 ' || v_pending_claims || ' طلب مكافأة بانتظار الموافقة', v_pending_claims > 0)
    ) x(level, text, show) where show
  ) a;
  return coalesce(v, '[]'::jsonb);
end; $function$;

-- ── owner_revenue_trend: monthly chart (months in local time + correct labels) ─
create or replace function public.owner_revenue_trend()
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object('month', to_char(m at time zone 'Africa/Casablanca', 'YYYY-MM'),
      'mad', revenue_between(m, m + interval '1 month')) order by m), '[]'::jsonb) into v
  from generate_series(casa_now_trunc('month') - interval '5 months', casa_now_trunc('month'), interval '1 month') m;
  return v;
end; $function$;
