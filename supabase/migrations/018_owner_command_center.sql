-- ════════════════════════════════════════════════════════════════════════
-- Owner Command Center + Revenue single-source-of-truth + Enrollment types
-- Additive. Founder-only analytics RPCs (is_founder gated).
-- REVENUE RULE (one source of truth): a payment counts ONLY when
--   payment_status = 'paid' AND amount_mad > 0 AND excluded_from_revenue = false.
-- Paid-but-no-amount students (free / coupon / gift / sponsored) do NOT count.
-- ════════════════════════════════════════════════════════════════════════

-- ── PHASE 3: enrollment types ───────────────────────────────────────────
alter table crm_students add column if not exists enrollment_type text not null default 'paid';  -- paid | free | coupon | sponsored | trial
alter table crm_students add column if not exists coupon_code text;
alter table crm_students add column if not exists reward_source text;     -- e.g. 'Weekly Leaderboard Winner'
alter table crm_students add column if not exists sponsor_reason text;
alter table crm_students add column if not exists trial_expires_at date;

-- ── PHASE 1: fix the revenue view (was SECURITY DEFINER + ignored exclusion) ──
drop view if exists crm_revenue_safe;
create view crm_revenue_safe with (security_invoker = true) as
  select p.id, p.lead_id, p.student_id, p.payment_type, p.course_or_service, p.amount_mad,
         p.payment_status, p.payment_date, p.next_payment_date, p.receipt_url, p.notes,
         p.added_by_id, p.approved_by_id, p.approved_at, p.created_at, p.updated_at,
         p.is_upgrade, p.prev_plan, p.description, p.payment_method,
         r.receipt_number, r.id as receipt_id
  from crm_payments p
  left join crm_receipts r on r.payment_id = p.id
  where p.payment_status = 'paid' and p.amount_mad > 0 and coalesce(p.excluded_from_revenue, false) = false;
revoke all on crm_revenue_safe from anon;
grant select on crm_revenue_safe to authenticated, service_role;

-- canonical revenue between two timestamps (single source of truth)
create or replace function public.revenue_between(p_from timestamptz, p_to timestamptz)
returns numeric language sql stable security definer set search_path to 'public' as $$
  select coalesce(sum(amount_mad), 0)
  from crm_payments
  where payment_status = 'paid' and amount_mad > 0 and coalesce(excluded_from_revenue, false) = false
    and coalesce(payment_date::timestamptz, created_at) >= p_from
    and coalesce(payment_date::timestamptz, created_at) <  p_to
$$;

-- ════════════════════════════════════════════════════════════════════════
-- PHASE 2: OWNER COMMAND CENTER RPCs (founder only)
-- ════════════════════════════════════════════════════════════════════════

-- A. Business overview (+ rewards + enrollment-type counts)
create or replace function public.owner_overview()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v jsonb; v_rev_total numeric; v_paying int;
begin
  if not is_founder(auth.uid()) then return null; end if;
  select coalesce(sum(amount_mad),0) into v_rev_total from crm_payments where payment_status='paid' and amount_mad>0 and coalesce(excluded_from_revenue,false)=false;
  select count(distinct student_id) into v_paying from crm_payments where payment_status='paid' and amount_mad>0 and coalesce(excluded_from_revenue,false)=false and student_id is not null;
  select jsonb_build_object(
    'rev_today', revenue_between(date_trunc('day', now()), now() + interval '1 sec'),
    'rev_week',  revenue_between(date_trunc('week', now()), now() + interval '1 sec'),
    'rev_month', revenue_between(date_trunc('month', now()), now() + interval '1 sec'),
    'rev_year',  revenue_between(date_trunc('year', now()), now() + interval '1 sec'),
    'rev_total', v_rev_total,
    'paying_students', v_paying,
    'arpu', case when v_paying > 0 then round(v_rev_total / v_paying) else 0 end,
    'new_leads_today', (select count(*) from subscription_leads where created_at >= date_trunc('day', now())),
    'new_students_today', (select count(*) from crm_students where deleted_at is null and created_at >= date_trunc('day', now())),
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
end; $$;

-- A2. revenue trend (last 6 months) for a sparkline
create or replace function public.owner_revenue_trend()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object('month', to_char(m, 'YYYY-MM'),
      'mad', revenue_between(m, m + interval '1 month')) order by m), '[]'::jsonb) into v
  from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m;
  return v;
end; $$;

-- B. Team performance (per assistant)
create or replace function public.owner_team()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(row_to_json(t) order by t.revenue desc), '[]'::jsonb) into v from (
    select
      p.id, coalesce(nullif(p.full_name,''), p.email, 'مساعد') as name,
      (select count(*) from subscription_leads l where l.assigned_to_id = p.id) as leads_handled,
      (select count(*) from subscription_leads l where l.assigned_to_id = p.id and l.status in ('confirmed','converted','paid')) as confirmed,
      (select count(*) from crm_students s where s.added_by_id = p.id and s.deleted_at is null) as students_added,
      (select count(distinct cp.student_id) from crm_payments cp join crm_students s on s.id = cp.student_id
         where s.added_by_id = p.id and cp.payment_status='paid' and cp.amount_mad>0 and coalesce(cp.excluded_from_revenue,false)=false) as paid_students,
      (select coalesce(sum(cp.amount_mad),0) from crm_payments cp join crm_students s on s.id = cp.student_id
         where s.added_by_id = p.id and cp.payment_status='paid' and cp.amount_mad>0 and coalesce(cp.excluded_from_revenue,false)=false) as revenue,
      (select count(*) from subscription_leads l where l.assigned_to_id = p.id and l.next_followup_at is not null and l.next_followup_at < now()
         and l.status not in ('confirmed','converted','paid','rejected','cancelled')) as followups_overdue
    from profiles p where p.role = 'assistant'
  ) t;
  return v;
end; $$;

-- C. Student intelligence (inactivity buckets, risk, top coins/streak)
create or replace function public.owner_students()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return null; end if;
  with last_act as (
    select s.id, s.full_name, s.verification_token, s.is_active, s.enrollment_type,
      (select max(a.created_at) from student_activity a where a.student_id = s.id) as last_at,
      coalesce((select sum(coins_amount) from coin_transactions ct where ct.student_id = s.id), 0) as coins,
      coalesce((select current_streak from student_streaks st where st.student_id = s.id), 0) as streak
    from crm_students s where s.deleted_at is null
  ),
  scored as (
    select *, case when last_at is null then 999 else extract(day from now() - last_at)::int end as days_inactive from last_act
  )
  select jsonb_build_object(
    'inactive_3', (select count(*) from scored where days_inactive >= 3 and days_inactive < 7),
    'inactive_7', (select count(*) from scored where days_inactive >= 7 and days_inactive < 14),
    'inactive_14', (select count(*) from scored where days_inactive >= 14 and days_inactive < 30),
    'inactive_30', (select count(*) from scored where days_inactive >= 30),
    'at_risk_list', (select coalesce(jsonb_agg(jsonb_build_object('name', full_name, 'token', verification_token, 'days', days_inactive,
        'risk', case when days_inactive >= 14 then 'high' when days_inactive >= 7 then 'medium' else 'low' end) order by days_inactive desc), '[]'::jsonb)
       from (select * from scored where is_active and days_inactive >= 7 order by days_inactive desc limit 30) r),
    'top_coins', (select coalesce(jsonb_agg(jsonb_build_object('name', full_name, 'coins', coins) order by coins desc), '[]'::jsonb)
       from (select * from scored where coins > 0 order by coins desc limit 10) r),
    'top_streak', (select coalesce(jsonb_agg(jsonb_build_object('name', full_name, 'streak', streak) order by streak desc), '[]'::jsonb)
       from (select * from scored where streak > 0 order by streak desc limit 10) r),
    'most_active', (select coalesce(jsonb_agg(jsonb_build_object('name', full_name, 'days', days_inactive) order by days_inactive asc), '[]'::jsonb)
       from (select * from scored where last_at is not null order by days_inactive asc limit 10) r)
  ) into v;
  return v;
end; $$;

-- D. Course analytics
create or replace function public.owner_courses()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v jsonb;
begin
  if not is_founder(auth.uid()) then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(row_to_json(t) order by t.students desc), '[]'::jsonb) into v from (
    select c.id, c.title,
      (select count(*) from lms_enrollments e where e.course_id = c.id) as students,
      (select count(*) from lms_lessons l join lms_modules m on m.id = l.module_id where m.course_id = c.id) as lessons,
      (select count(distinct a.student_id) from student_activity a where a.created_at > now() - interval '14 days'
        and a.student_id in (select student_id from lms_enrollments e where e.course_id = c.id)) as active_14d
    from lms_courses c
  ) t;
  return v;
end; $$;

-- G. Smart alerts (derived)
create or replace function public.owner_alerts()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v jsonb; v_inactive7 int; v_backlog int; v_rev_this numeric; v_rev_prev numeric; v_pending_claims int;
begin
  if not is_founder(auth.uid()) then return '[]'::jsonb; end if;
  select count(*) into v_inactive7 from crm_students s where s.deleted_at is null and s.is_active
    and not exists (select 1 from student_activity a where a.student_id = s.id and a.created_at > now() - interval '7 days');
  select count(*) into v_backlog from subscription_leads l where l.next_followup_at is not null and l.next_followup_at < now()
    and l.status not in ('confirmed','converted','paid','rejected','cancelled');
  v_rev_this := revenue_between(date_trunc('month', now()), now() + interval '1 sec');
  v_rev_prev := revenue_between(date_trunc('month', now()) - interval '1 month', date_trunc('month', now()));
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
end; $$;

grant execute on function public.revenue_between(timestamptz, timestamptz) to authenticated, service_role;
grant execute on function public.owner_overview() to authenticated, service_role;
grant execute on function public.owner_revenue_trend() to authenticated, service_role;
grant execute on function public.owner_team() to authenticated, service_role;
grant execute on function public.owner_students() to authenticated, service_role;
grant execute on function public.owner_courses() to authenticated, service_role;
grant execute on function public.owner_alerts() to authenticated, service_role;
