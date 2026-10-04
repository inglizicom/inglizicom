-- 060_teacher_monthly_report.sql
-- The teacher's monthly report: everything that happened in one month, the
-- money it produced and the teacher's net pay — the data behind the one-click
-- PDF in the teacher space and on the CRM teachers page.
--
--   1. Revenue share pay. teacher_profiles.revenue_share_pct: the share of the
--      money their students paid that the teacher keeps; the academy keeps the
--      rest. pay_model 'revenue_share' uses it, 'hourly' keeps hours × rate.
--      Only a founder changes either (guard_teacher_profile_fields, as in 058).
--      The money is the teacher's own side (059): confirmed payments of the
--      students they brought, dated in the month — exclusive, so every
--      teacher's report adds up with the academy's to total revenue.
--   2. founder_payroll() suggests the base from that share for such teachers.
--   3. teacher_month_notes: one written note from the academy per teacher per
--      month (optional); staff write it, the teacher reads it in the report.
--   4. teacher_month_report(teacher, month): students (each with attendance and
--      payments), sessions (delivered, cancelled with reasons, reports
--      missing), money (share, academy part, net, the recorded payout),
--      student reviews of the month (without names), the academy note, and
--      last month's key figures for the trend. The teacher reads their own;
--      staff read anyone's.
--
-- Re-running this file is a no-op.

-- ════════════════════════════════════════════════════════════
-- 1. Revenue share
-- ════════════════════════════════════════════════════════════

alter table public.teacher_profiles add column if not exists revenue_share_pct numeric(5,2);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'teacher_profiles_revenue_share_pct_check') then
    alter table public.teacher_profiles add constraint teacher_profiles_revenue_share_pct_check
      check (revenue_share_pct is null or (revenue_share_pct >= 0 and revenue_share_pct <= 100));
  end if;
end $$;

create or replace function public.guard_teacher_profile_fields()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if public.is_founder(auth.uid()) then
    return new;                                    -- the founder sets pay
  end if;
  if public.is_crm_staff(auth.uid()) then
    if new.pay_model is distinct from old.pay_model
    or new.hourly_rate_mad is distinct from old.hourly_rate_mad
    or new.revenue_share_pct is distinct from old.revenue_share_pct then
      raise exception 'Only a founder can change a teacher''s pay' using errcode = '42501';
    end if;
    return new;                                    -- assistants: everything else
  end if;
  if coalesce(current_setting('app.rating_refresh', true), '') <> 'on' then
    new.rating_avg   := old.rating_avg;
    new.rating_count := old.rating_count;
  end if;
  new.pay_model         := old.pay_model;
  new.hourly_rate_mad   := old.hourly_rate_mad;
  new.revenue_share_pct := old.revenue_share_pct;
  new.hired_at          := old.hired_at;
  new.is_active         := old.is_active;
  return new;
end
$$;

-- Confirmed money from the students a teacher brought, in [d0, d1).
create or replace function public.teacher_side_revenue(p_teacher uuid, p_d0 date, p_d1 date)
returns numeric language sql stable security definer set search_path to 'public' as $$
  select coalesce(sum(p.amount_mad), 0)
  from crm_payments p join crm_students s on s.id = p.student_id
  where s.origin_teacher_id = p_teacher and s.deleted_at is null
    and p.payment_status = 'paid' and p.amount_mad > 0 and not coalesce(p.excluded_from_revenue, false)
    and coalesce(p.payment_date, (p.created_at at time zone 'Africa/Casablanca')::date) >= p_d0
    and coalesce(p.payment_date, (p.created_at at time zone 'Africa/Casablanca')::date) <  p_d1
$$;
revoke execute on function public.teacher_side_revenue(uuid, date, date) from public, anon, authenticated;

-- ════════════════════════════════════════════════════════════
-- 2. Payroll suggests the share
-- ════════════════════════════════════════════════════════════

create or replace function public.founder_payroll(p_month date default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_month date := date_trunc('month', coalesce(p_month, (now() at time zone 'Africa/Casablanca')::date))::date;
  v_next  date;
  v_t0    timestamptz;
  v_t1    timestamptz;
  v_rows  jsonb;
begin
  if not public.is_founder(auth.uid()) then raise exception 'Founder only' using errcode = '42501'; end if;
  v_next := (v_month + interval '1 month')::date;
  v_t0 := public.casa_day_start(v_month);
  v_t1 := public.casa_day_start(v_next);

  select coalesce(jsonb_agg(row_to_json(t) order by t.role, t.name), '[]'::jsonb) into v_rows
  from (
    select p.id, p.role::text as role, p.email, p.phone, p.avatar_url, coalesce(p.blocked, false) as blocked,
           coalesce(nullif(tp.display_name, ''), nullif(p.full_name, ''), split_part(p.email, '@', 1)) as name,
           x.hours, x.sessions, tp.hourly_rate_mad, tp.pay_model, tp.revenue_share_pct,
           case when p.role::text = 'teacher' then public.teacher_side_revenue(p.id, v_month, v_next) end as revenue_brought,
           coalesce(ps.monthly_salary_mad, 0) as monthly_salary_mad,
           case
             when p.role::text = 'teacher' and tp.pay_model = 'revenue_share'
               then round(public.teacher_side_revenue(p.id, v_month, v_next) * coalesce(tp.revenue_share_pct, 0) / 100)
             when p.role::text = 'teacher' and coalesce(tp.pay_model, 'hourly') = 'hourly'
               then round(x.hours * coalesce(tp.hourly_rate_mad, 0))
             when p.role::text = 'assistant' then coalesce(ps.monthly_salary_mad, 0)
             else 0 end as suggested_base,
           (select to_jsonb(po) from staff_payouts po where po.payee_id = p.id and po.period = v_month) as payout
    from profiles p
    left join teacher_profiles tp on tp.id = p.id
    left join staff_pay_settings ps on ps.profile_id = p.id
    cross join lateral (
      select coalesce(round(sum(cs.duration_min)::numeric / 60, 2), 0) as hours, count(*)::int as sessions
      from class_sessions cs
      where cs.teacher_id = p.id and cs.status = 'done' and cs.starts_at >= v_t0 and cs.starts_at < v_t1
    ) x
    where p.role::text in ('assistant', 'teacher')
      and (not coalesce(p.blocked, false)
           or exists (select 1 from staff_payouts po where po.payee_id = p.id and po.period = v_month))
  ) t;

  return jsonb_build_object(
    'month', v_month,
    'rows', v_rows,
    'totals', (
      select jsonb_build_object(
        'paid',      coalesce(sum(amount_mad) filter (where status = 'paid'), 0),
        'pending',   coalesce(sum(amount_mad) filter (where status = 'pending'), 0),
        'n_paid',    count(*) filter (where status = 'paid'),
        'n_pending', count(*) filter (where status = 'pending'))
      from staff_payouts where period = v_month));
end;
$$;

-- ════════════════════════════════════════════════════════════
-- 3. The academy's note
-- ════════════════════════════════════════════════════════════

create table if not exists public.teacher_month_notes (
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  period     date not null check (period = date_trunc('month', period)::date),
  note       text not null,
  written_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (teacher_id, period)
);
alter table public.teacher_month_notes enable row level security;
drop policy if exists teacher_month_notes_read on public.teacher_month_notes;
create policy teacher_month_notes_read on public.teacher_month_notes
  for select using (public.is_crm_staff(auth.uid()) or teacher_id = auth.uid());
revoke insert, update, delete on public.teacher_month_notes from anon, authenticated;
revoke all on public.teacher_month_notes from anon;

create or replace function public.staff_set_teacher_month_note(p_teacher uuid, p_month date, p_note text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_month date := date_trunc('month', p_month)::date;
begin
  perform public.require_staff();
  if not exists (select 1 from profiles where id = p_teacher and role::text = 'teacher') then raise exception 'Unknown teacher'; end if;
  if nullif(btrim(p_note), '') is null then
    delete from teacher_month_notes where teacher_id = p_teacher and period = v_month;
    return jsonb_build_object('note', null);
  end if;
  insert into teacher_month_notes (teacher_id, period, note, written_by, updated_at)
  values (p_teacher, v_month, left(btrim(p_note), 2000), auth.uid(), now())
  on conflict (teacher_id, period) do update set note = excluded.note, written_by = excluded.written_by, updated_at = now();
  return jsonb_build_object('note', left(btrim(p_note), 2000));
end;
$$;

-- ════════════════════════════════════════════════════════════
-- 4. The report
-- ════════════════════════════════════════════════════════════

create or replace function public.teacher_month_report(p_teacher uuid, p_month date default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_me     uuid := auth.uid();
  v_month  date := date_trunc('month', coalesce(p_month, (now() at time zone 'Africa/Casablanca')::date))::date;
  v_next   date;
  v_prev   date;
  v_t0     timestamptz;
  v_t1     timestamptz;
  v_pt0    timestamptz;
  v_tp     teacher_profiles;
  v_out    jsonb;
begin
  if not ((v_me = p_teacher and public.is_teacher(v_me)) or public.is_crm_staff(v_me)) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  select * into v_tp from teacher_profiles where id = p_teacher;
  if not found then raise exception 'Unknown teacher'; end if;

  v_next := (v_month + interval '1 month')::date;
  v_prev := (v_month - interval '1 month')::date;
  v_t0   := public.casa_day_start(v_month);
  v_t1   := public.casa_day_start(v_next);
  v_pt0  := public.casa_day_start(v_prev);

  with
  sess as (
    select cs.* from class_sessions cs
    where cs.teacher_id = p_teacher and cs.starts_at >= v_t0 and cs.starts_at < v_t1
  ),
  att as (
    select a.student_id, a.status from class_attendance a join sess on sess.id = a.session_id
  ),
  roster as (select r.student_id, r.assigned, r.seated from teacher_roster(p_teacher) r),
  ids as (
    select student_id from roster
    union select student_id from att
    union select s.id from crm_students s where s.origin_teacher_id = p_teacher and s.deleted_at is null and s.review_status <> 'rejected'
  ),
  people as (
    select s.id, s.full_name, s.student_type, s.created_at, s.review_status,
           coalesce(s.origin_teacher_id = p_teacher, false) as brought,   -- null origin = the academy's
           coalesce((select r.assigned from roster r where r.student_id = s.id), false) as assigned,
           coalesce((select r.seated from roster r where r.student_id = s.id), false) as seated,
           (select count(*) from att where att.student_id = s.id and att.status = 'present') as present,
           (select count(*) from att where att.student_id = s.id and att.status = 'late') as late,
           (select count(*) from att where att.student_id = s.id and att.status = 'absent') as absent,
           (select count(*) from att where att.student_id = s.id and att.status = 'excused') as excused,
           (select coalesce(sum(p.amount_mad), 0) from crm_payments p where p.student_id = s.id
              and p.payment_status = 'paid' and p.amount_mad > 0 and not coalesce(p.excluded_from_revenue, false)
              and coalesce(p.payment_date, (p.created_at at time zone 'Africa/Casablanca')::date) >= v_month
              and coalesce(p.payment_date, (p.created_at at time zone 'Africa/Casablanca')::date) <  v_next) as paid,
           (select coalesce(sum(p.amount_mad), 0) from crm_payments p where p.student_id = s.id and p.payment_status = 'pending'
              and coalesce(p.payment_date, (p.created_at at time zone 'Africa/Casablanca')::date) <  v_next) as pending,
           (exists (select 1 from teacher_students ts where ts.teacher_id = p_teacher and ts.student_id = s.id
                      and ts.assigned_at >= v_t0 and ts.assigned_at < v_t1)
            or (s.origin_teacher_id = p_teacher and s.created_at >= v_t0 and s.created_at < v_t1)
            or exists (select 1 from online_class_enrollments e join online_classes c on c.id = e.class_id
                        where c.teacher_id = p_teacher and e.student_id = s.id
                          and e.activated_at >= v_t0 and e.activated_at < v_t1)) as is_new,
           exists (select 1 from online_class_enrollments e join online_classes c on c.id = e.class_id
                    where c.teacher_id = p_teacher and e.student_id = s.id and e.status = 'cancelled'
                      and e.ended_at >= v_t0 and e.ended_at < v_t1) as left_this_month
    from crm_students s join ids on ids.student_id = s.id
    where s.deleted_at is null
  )
  select jsonb_build_object(
    'month', v_month,
    'generated_at', now(),
    'teacher', jsonb_build_object(
      'id', p_teacher,
      'name', coalesce(nullif(v_tp.display_name, ''), (select coalesce(nullif(full_name, ''), email) from profiles where id = p_teacher)),
      'email', (select email from profiles where id = p_teacher),
      'pay_model', coalesce(v_tp.pay_model, 'hourly'),
      'hourly_rate_mad', v_tp.hourly_rate_mad,
      'revenue_share_pct', v_tp.revenue_share_pct,
      'rating_avg', v_tp.rating_avg, 'rating_count', v_tp.rating_count),
    'students', jsonb_build_object(
      'total', (select count(*) from people),
      'brought', (select count(*) from people where brought),
      'academy_assigned', (select count(*) from people where not brought),
      'group', (select count(*) from people where student_type <> 'private_student'),
      'private', (select count(*) from people where student_type = 'private_student'),
      'new', (select count(*) from people where is_new),
      'left', (select count(*) from people where left_this_month),
      'pending_review', (select count(*) from people where review_status = 'pending'),
      'list', coalesce((select jsonb_agg(jsonb_build_object(
          'id', id, 'name', full_name, 'kind', case when student_type = 'private_student' then 'private' else 'group' end,
          'brought', brought, 'is_new', is_new, 'left', left_this_month, 'review_status', review_status,
          'present', present, 'late', late, 'absent', absent, 'excused', excused,
          'paid', paid, 'pending', pending) order by full_name) from people), '[]'::jsonb)),
    'sessions', jsonb_build_object(
      'scheduled', (select count(*) from sess),
      'done', (select count(*) from sess where status = 'done'),
      'cancelled', (select count(*) from sess where status = 'cancelled'),
      'upcoming', (select count(*) from sess where status in ('scheduled', 'live')),
      'hours', (select coalesce(round(sum(duration_min)::numeric / 60, 1), 0) from sess where status = 'done'),
      'missing_reports', (select count(*) from sess where status = 'done'
                            and not exists (select 1 from lesson_reports lr where lr.session_id = sess.id)),
      'cancel_reasons', coalesce((select jsonb_agg(jsonb_build_object('date', starts_at, 'title', title, 'reason', cancel_reason) order by starts_at)
                                  from sess where status = 'cancelled'), '[]'::jsonb)),
    'attendance', jsonb_build_object(
      'marked', (select count(*) from att),
      'present', (select count(*) from att where status = 'present'),
      'late', (select count(*) from att where status = 'late'),
      'absent', (select count(*) from att where status = 'absent'),
      'excused', (select count(*) from att where status = 'excused')),
    'money', jsonb_build_object(
      'revenue_brought', public.teacher_side_revenue(p_teacher, v_month, v_next),
      'pending_brought', (select coalesce(sum(p.amount_mad), 0) from crm_payments p join crm_students s on s.id = p.student_id
                            where s.origin_teacher_id = p_teacher and s.deleted_at is null and p.payment_status = 'pending'),
      'paid_by_academy_students', (select coalesce(sum(paid), 0) from people where not brought),
      'payout', (select jsonb_build_object('base_mad', po.base_mad, 'bonus_mad', po.bonus_mad, 'deduction_mad', po.deduction_mad,
                   'amount_mad', po.amount_mad, 'status', po.status, 'method', po.method, 'paid_at', po.paid_at, 'note', po.note)
                 from staff_payouts po where po.payee_id = p_teacher and po.period = v_month and po.status <> 'cancelled')),
    'reviews', coalesce((select jsonb_agg(jsonb_build_object('rating', rating, 'comment', comment, 'date', created_at) order by created_at)
                          from teacher_reviews where teacher_id = p_teacher and created_at >= v_t0 and created_at < v_t1), '[]'::jsonb),
    'academy_note', (select jsonb_build_object('note', note, 'updated_at', updated_at)
                       from teacher_month_notes where teacher_id = p_teacher and period = v_month),
    'previous', jsonb_build_object(
      'sessions_done', (select count(*) from class_sessions cs where cs.teacher_id = p_teacher and cs.status = 'done'
                          and cs.starts_at >= v_pt0 and cs.starts_at < v_t0),
      'attendance', (select jsonb_build_object('marked', count(*), 'came', count(*) filter (where a.status in ('present', 'late')))
                       from class_attendance a join class_sessions cs on cs.id = a.session_id
                      where cs.teacher_id = p_teacher and cs.starts_at >= v_pt0 and cs.starts_at < v_t0),
      'revenue_brought', public.teacher_side_revenue(p_teacher, v_prev, v_month))
  ) into v_out;

  return v_out;
end;
$$;

-- ════════════════════════════════════════════════════════════
-- 5. Who may call what
-- ════════════════════════════════════════════════════════════

do $$
declare f text;
begin
  foreach f in array array[
    'public.staff_set_teacher_month_note(uuid,date,text)',
    'public.teacher_month_report(uuid,date)']
  loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated, service_role', f);
  end loop;
end $$;
