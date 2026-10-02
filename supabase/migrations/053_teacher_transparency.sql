-- 053_teacher_transparency.sql
-- Transparency for teachers, as the founder decided on 2026-10-02:
--   1. teacher_student_payments(student)  what one of MY students paid, owes and when
--   2. teacher_roster_payments()          the same, one line per student on my roster
--   3. teacher_leaderboard(from, to)      every active teacher ranked — rating, top-rated,
--                                         current / live / active students, sessions, hours
--
-- Access
--   1–2: the caller must be a teacher and the student must be on their roster
--        (teacher_roster: assigned ∪ active class seat). Anyone else gets NULL / [].
--   3:   any teacher or staff member. Other teachers' MONEY is never returned —
--        the leaderboard compares teaching, not revenue. The caller's own roster
--        revenue is returned to them alone (key `me`).
--
-- Money rules (same as revenue analytics): paid = payment_status 'paid' and not
-- excluded_from_revenue; outstanding = 'pending'; overdue = pending past due_date,
-- or a monthly student whose next_payment_date has passed. Receipts and payment
-- methods are not exposed.
-- Read-only: functions only, no table or data changes.

-- ════════════════════════════════════════════════════════════
-- 1. One student's payments
-- ════════════════════════════════════════════════════════════

create or replace function public.teacher_student_payments(p_student uuid)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_today date := (now() at time zone 'Africa/Casablanca')::date;
  s       record;
begin
  if p_student is null or not public.is_teacher(auth.uid())
     or not exists (select 1 from public.teacher_roster(auth.uid()) r where r.student_id = p_student) then
    return null;
  end if;

  select billing_type, monthly_fee_mad, next_payment_date, student_type
    into s from crm_students where id = p_student;

  return (
    with p as (
      select * from crm_payments
       where student_id = p_student and coalesce(excluded_from_revenue, false) = false
    )
    select jsonb_build_object(
      'total_paid',    (select coalesce(sum(amount_mad), 0) from p where payment_status = 'paid'),
      'paid_count',    (select count(*) from p where payment_status = 'paid'),
      'last_paid_at',  (select max(coalesce(payment_date, created_at::date)) from p where payment_status = 'paid'),
      'outstanding',   (select coalesce(sum(amount_mad), 0) from p where payment_status = 'pending'),
      'overdue',       (select coalesce(sum(amount_mad), 0) from p where payment_status = 'pending' and due_date < v_today),
      'next_due_at',   least(
                         (select min(due_date) from p where payment_status = 'pending' and due_date is not null),
                         case when s.billing_type = 'monthly' or s.student_type = 'private_student' then s.next_payment_date end),
      'monthly_fee',   case when s.billing_type = 'monthly' or s.student_type = 'private_student' then s.monthly_fee_mad end,
      'billing_type',  s.billing_type,
      'status', case
          when exists (select 1 from p where payment_status = 'pending' and due_date < v_today)
            or ((s.billing_type = 'monthly' or s.student_type = 'private_student') and s.next_payment_date < v_today) then 'overdue'
          when exists (select 1 from p where payment_status = 'pending')
            or ((s.billing_type = 'monthly' or s.student_type = 'private_student') and s.next_payment_date <= v_today + 7) then 'due'
          when exists (select 1 from p where payment_status = 'paid') then 'paid'
          else 'none' end,
      'history', coalesce((
          select jsonb_agg(h order by h->>'at' desc) from (
            select jsonb_build_object(
              'id', id,
              'at', coalesce(payment_date, due_date, created_at::date),
              'amount', amount_mad,
              'label', coalesce(nullif(description, ''), nullif(course_or_service, ''), payment_type),
              'status', case when payment_status = 'pending' and due_date < v_today then 'overdue' else payment_status end,
              'due_date', due_date,
              'installment', case when installment_count > 1 then installment_no || '/' || installment_count end) h
            from p order by coalesce(payment_date, due_date, created_at::date) desc limit 12
          ) t), '[]'::jsonb)
    ) from (select 1) one
  );
end $$;

-- ════════════════════════════════════════════════════════════
-- 2. My roster, one money line per student
-- ════════════════════════════════════════════════════════════

create or replace function public.teacher_roster_payments()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select case when not public.is_teacher(auth.uid()) then '[]'::jsonb else coalesce((
    select jsonb_agg(to_jsonb(x)) from (
      select r.student_id,
             coalesce(sum(p.amount_mad) filter (where p.payment_status = 'paid'), 0)    as total_paid,
             coalesce(sum(p.amount_mad) filter (where p.payment_status = 'pending'), 0) as outstanding,
             coalesce(bool_or(p.payment_status = 'pending' and p.due_date < (now() at time zone 'Africa/Casablanca')::date), false)
               or coalesce(bool_or((s.billing_type = 'monthly' or s.student_type = 'private_student')
                                   and s.next_payment_date < (now() at time zone 'Africa/Casablanca')::date), false) as overdue,
             max(coalesce(p.payment_date, p.created_at::date)) filter (where p.payment_status = 'paid') as last_paid_at
        from teacher_roster(auth.uid()) r
        join crm_students s on s.id = r.student_id
        left join crm_payments p on p.student_id = r.student_id and coalesce(p.excluded_from_revenue, false) = false
       group by r.student_id
    ) x
  ), '[]'::jsonb) end
$$;

-- ════════════════════════════════════════════════════════════
-- 3. The leaderboard
-- ════════════════════════════════════════════════════════════
-- Score (shown on the page, so it can be argued with):
--   10 per session delivered in the period
-- +  5 per current student
-- + 20 × average rating, once a teacher has at least 3 published reviews
-- Top rated = average ≥ 4.5 from at least 5 reviews (same rule as the public page).
-- Live students = roster students seen on the platform in the last 15 minutes.

create or replace function public.teacher_leaderboard(p_from date default null, p_to date default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_from date := coalesce(p_from, date_trunc('month', now() at time zone 'Africa/Casablanca')::date);
  v_to   date := coalesce(p_to, (now() at time zone 'Africa/Casablanca')::date);
  v_me   uuid := auth.uid();
begin
  if not (public.is_teacher(v_me) or public.is_crm_staff(v_me)) then return null; end if;
  if v_to < v_from then
    raise exception 'Range end % is before its start %', v_to, v_from using errcode = '22023';
  end if;

  return (
    with t as (
      select p.id,
             coalesce(tp.display_name, p.full_name) as name,
             tp.avatar_url, tp.headline,
             coalesce(tp.rating_avg, 0)::numeric  as rating_avg,
             coalesce(tp.rating_count, 0)::int    as rating_count,
             teacher_counts(p.id, v_from, v_to)   as c
        from profiles p
        join teacher_profiles tp on tp.id = p.id
       where p.role::text = 'teacher' and coalesce(tp.is_active, true)
    ),
    m as (
      select t.*,
             (c->'roster'->>'unique_students')::int    as students,
             (c->'period'->>'sessions_delivered')::int as sessions,
             (c->'period'->>'hours_delivered')::numeric as hours,
             (c->'period'->'attendance'->>'rate')::numeric as attendance_rate,
             (select count(*) from teacher_roster(t.id) r
                join student_presence sp on sp.student_id = r.student_id
               where sp.last_seen_at > now() - interval '15 minutes') as live,
             (select count(*) from teacher_roster(t.id) r
               where exists (select 1 from student_presence sp where sp.student_id = r.student_id
                              and sp.last_seen_at > now() - interval '7 days')
                  or exists (select 1 from student_activity a where a.student_id = r.student_id
                              and a.created_at > now() - interval '7 days')) as active_7d
        from t
    ),
    scored as (
      select m.*,
             (m.sessions * 10 + m.students * 5
               + case when m.rating_count >= 3 then round(m.rating_avg * 20)::int else 0 end) as score
        from m
    ),
    ranked as (
      select scored.*, rank() over (order by score desc, rating_avg desc, students desc) as rnk
        from scored
    )
    select jsonb_build_object(
      'period', jsonb_build_object('from', v_from, 'to', v_to, 'timezone', 'Africa/Casablanca'),
      'rows', coalesce(jsonb_agg(jsonb_build_object(
          'id', id, 'name', name, 'avatar_url', avatar_url, 'headline', headline,
          'rating_avg', round(rating_avg, 2), 'rating_count', rating_count,
          'is_top_rated', rating_avg >= 4.5 and rating_count >= 5,
          'students', students, 'live', live, 'active_7d', active_7d,
          'sessions', sessions, 'hours', hours, 'attendance_rate', attendance_rate,
          'score', score, 'rank', rnk, 'is_me', id = v_me) order by rnk, name), '[]'::jsonb),
      'me', (select case when v_me is null or not public.is_teacher(v_me) then null else jsonb_build_object(
          -- Money stays private: only the caller's own roster, never another teacher's.
          'roster_revenue', (select coalesce(sum(p.amount_mad), 0) from crm_payments p
                               join teacher_roster(v_me) r on r.student_id = p.student_id
                              where p.payment_status = 'paid' and coalesce(p.excluded_from_revenue, false) = false
                                and coalesce(p.payment_date, p.created_at::date) between v_from and v_to),
          'roster_paying_students', (select count(distinct p.student_id) from crm_payments p
                               join teacher_roster(v_me) r on r.student_id = p.student_id
                              where p.payment_status = 'paid' and coalesce(p.excluded_from_revenue, false) = false
                                and coalesce(p.payment_date, p.created_at::date) between v_from and v_to)) end)
    ) from ranked
  );
end $$;

revoke execute on function public.teacher_student_payments(uuid), public.teacher_roster_payments(),
  public.teacher_leaderboard(date, date) from public, anon;
grant execute on function public.teacher_student_payments(uuid), public.teacher_roster_payments(),
  public.teacher_leaderboard(date, date) to authenticated;
