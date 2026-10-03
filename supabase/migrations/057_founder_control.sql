-- 057_founder_control.sql
-- The founder's control room: who is on the team, what each of them did,
-- and what each of them is paid.
--
--   1. Blocking that means something. profiles.blocked existed but nothing read
--      it. is_crm_staff / is_founder / is_teacher now return false for a
--      blocked account, so every RLS policy and staff RPC shuts at once.
--   2. Every staff move is recorded by the database. A trigger on the tables
--      staff work in writes one crm_activity_log row per insert / update /
--      delete made by a founder or assistant, with only the fields that
--      changed (before → after). The CRM pages used to log a handful of
--      actions from the browser — skippable, and silent on payments, students
--      and enrollments. Writes without a staff JWT (the public site, students,
--      server jobs) are not staff moves and are not logged here.
--   3. The log can be trusted: nobody inserts into it directly any more (only
--      the trigger and log_crm_activity, which stamps the real caller), and an
--      assistant reads only their own rows. The founder reads everything.
--   4. Sessions: staff_ping() keeps last-seen per staff member and logs a
--      'session_started' row when someone comes back after 30 minutes away.
--   5. Payroll: staff_pay_settings (an assistant's monthly salary) and
--      staff_payouts (one row per person per month: base + bonus − deduction,
--      status pending | paid | cancelled, method, reference, paid_at).
--      A teacher's suggested base is hours delivered that month × hourly rate.
--      Payees read their own rows; only the founder writes.
--
--   founder_team(from, to)          the team with what each did in the period
--   founder_activity(...)            the log, filtered, with readable names
--   founder_payroll(month)           everyone payable this month, suggested + saved
--   founder_save_payout(...)         create / update a month's payout
--   founder_set_pay_settings(...)    an assistant's monthly salary
--   founder_set_staff_blocked(...)   block / unblock (never a founder, never yourself)
--   my_payouts()                     a teacher's or assistant's own payouts
--   staff_ping(path)                 last-seen + session log, called by the CRM frame
--
-- Re-running this file is a no-op.

-- ════════════════════════════════════════════════════════════
-- 1. Blocking
-- ════════════════════════════════════════════════════════════

create or replace function public.is_crm_staff(uid uuid)
returns boolean language sql stable set search_path to 'public' as $$
  select exists(
    select 1 from public.profiles
    where id = uid and role in ('founder', 'assistant') and not coalesce(blocked, false)
  )
$$;

create or replace function public.is_founder(uid uuid)
returns boolean language sql stable set search_path to 'public' as $$
  select exists(
    select 1 from public.profiles
    where id = uid and role = 'founder' and not coalesce(blocked, false)
  )
$$;

create or replace function public.is_teacher(uid uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists(
    select 1 from public.profiles
    where id = uid and role::text = 'teacher' and not coalesce(blocked, false)
  )
$$;

-- ════════════════════════════════════════════════════════════
-- 2. The audit trigger
-- ════════════════════════════════════════════════════════════

create or replace function public.audit_staff_change()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_actor  uuid := auth.uid();
  v_role   text;
  v_email  text;
  v_entity text := tg_argv[0];
  v_idcol  text := coalesce(tg_argv[1], 'id');
  v_old    jsonb;
  v_new    jsonb;
  v_before jsonb := '{}'::jsonb;
  v_after  jsonb := '{}'::jsonb;
  v_action text;
  v_id     text;
  k        text;
  -- Housekeeping columns: they change on every write and say nothing.
  noise    text[] := array['updated_at', 'last_message_at', 'last_message_preview',
                           'unread_for_admin', 'unread_for_user', 'search_vector'];
  -- Never copied into the log.
  secret   text[] := array['verification_token', 'password', 'password_hash'];
begin
  if v_actor is null then return null; end if;
  select role::text, email into v_role, v_email from public.profiles where id = v_actor;
  if v_role is null or v_role not in ('founder', 'assistant') then return null; end if;

  if tg_op = 'INSERT' then
    v_after  := jsonb_strip_nulls(to_jsonb(new)) - secret - noise;
    v_id     := to_jsonb(new) ->> v_idcol;
    v_action := v_entity || '_created';
  elsif tg_op = 'DELETE' then
    v_before := jsonb_strip_nulls(to_jsonb(old)) - secret - noise;
    v_id     := to_jsonb(old) ->> v_idcol;
    v_action := v_entity || '_deleted';
  else
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_id  := v_new ->> v_idcol;
    for k in select jsonb_object_keys(v_new) loop
      continue when k = any(noise);
      if (v_new -> k) is distinct from (v_old -> k) then
        if k = any(secret) then
          v_before := v_before || jsonb_build_object(k, '••••');
          v_after  := v_after  || jsonb_build_object(k, '••••');
        else
          v_before := v_before || jsonb_build_object(k, v_old -> k);
          v_after  := v_after  || jsonb_build_object(k, v_new -> k);
        end if;
      end if;
    end loop;
    if v_after = '{}'::jsonb then return null; end if;
    v_action := v_entity || case
      when v_after ? 'deleted_at' and v_new ->> 'deleted_at' is not null then '_deleted'
      when v_after ? 'deleted_at' then '_restored'
      when v_after ? 'is_archived' and coalesce((v_new ->> 'is_archived')::boolean, false) then '_archived'
      when v_after ? 'is_archived' then '_unarchived'
      when v_after ? 'blocked' and coalesce((v_new ->> 'blocked')::boolean, false) then '_blocked'
      when v_after ? 'blocked' then '_unblocked'
      when v_after ? 'role' then '_role_changed'
      when v_after ? 'payment_status' or v_after ? 'status' then '_status_changed'
      when v_after ? 'is_active' and not coalesce((v_new ->> 'is_active')::boolean, true) then '_deactivated'
      when v_after ? 'is_active' then '_activated'
      else '_updated' end;
  end if;

  insert into public.crm_activity_log
    (actor_id, actor_email, actor_role, action, entity_type, entity_id, before_value, after_value, metadata)
  values
    (v_actor, v_email, v_role, v_action, v_entity,
     case when v_id ~ '^[0-9a-fA-F-]{36}$' then v_id::uuid end,
     nullif(v_before, '{}'::jsonb), nullif(v_after, '{}'::jsonb),
     jsonb_build_object('source', 'db', 'table', tg_table_name));
  return null;
end;
$$;

revoke execute on function public.audit_staff_change() from public, anon;

-- ════════════════════════════════════════════════════════════
-- 3. Payroll tables
-- ════════════════════════════════════════════════════════════

create table if not exists public.staff_pay_settings (
  profile_id         uuid primary key references public.profiles(id) on delete cascade,
  monthly_salary_mad numeric(10,2) not null default 0 check (monthly_salary_mad >= 0),
  note               text,
  updated_by         uuid references public.profiles(id) on delete set null,
  updated_at         timestamptz not null default now()
);

create table if not exists public.staff_payouts (
  id            uuid primary key default gen_random_uuid(),
  payee_id      uuid not null references public.profiles(id) on delete cascade,
  period        date not null check (period = date_trunc('month', period)::date),
  base_mad      numeric(10,2) not null default 0 check (base_mad >= 0),
  bonus_mad     numeric(10,2) not null default 0 check (bonus_mad >= 0),
  deduction_mad numeric(10,2) not null default 0 check (deduction_mad >= 0),
  amount_mad    numeric(10,2) generated always as (base_mad + bonus_mad - deduction_mad) stored,
  hours         numeric(8,2),
  sessions      integer,
  status        text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  method        text check (method is null or method in ('cash', 'bank_transfer', 'wafacash', 'cashplus', 'paypal', 'other')),
  reference     text,
  note          text,
  paid_at       timestamptz,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint staff_payouts_one_per_month unique (payee_id, period),
  constraint staff_payouts_not_negative check (base_mad + bonus_mad - deduction_mad >= 0)
);
create index if not exists staff_payouts_period_idx on public.staff_payouts (period);

create table if not exists public.staff_presence (
  profile_id         uuid primary key references public.profiles(id) on delete cascade,
  last_seen_at       timestamptz not null default now(),
  last_path          text,
  session_started_at timestamptz not null default now()
);

alter table public.staff_pay_settings enable row level security;
alter table public.staff_payouts      enable row level security;
alter table public.staff_presence     enable row level security;

drop policy if exists staff_pay_settings_read on public.staff_pay_settings;
create policy staff_pay_settings_read on public.staff_pay_settings
  for select using (public.is_founder(auth.uid()) or profile_id = auth.uid());

drop policy if exists staff_payouts_read on public.staff_payouts;
create policy staff_payouts_read on public.staff_payouts
  for select using (public.is_founder(auth.uid()) or payee_id = auth.uid());

drop policy if exists staff_presence_read on public.staff_presence;
create policy staff_presence_read on public.staff_presence
  for select using (public.is_founder(auth.uid()) or profile_id = auth.uid());

-- Writes go through the founder_* functions only.
revoke insert, update, delete on public.staff_pay_settings, public.staff_payouts, public.staff_presence from anon, authenticated;
revoke all on public.staff_pay_settings, public.staff_payouts, public.staff_presence from anon;

-- ════════════════════════════════════════════════════════════
-- 4. The log: trusted writes, private reads
-- ════════════════════════════════════════════════════════════

drop policy if exists crm_activity_log_insert on public.crm_activity_log;
drop policy if exists crm_activity_log_read on public.crm_activity_log;
create policy crm_activity_log_read on public.crm_activity_log
  for select using (public.is_founder(auth.uid()) or (actor_id = auth.uid() and public.is_crm_staff(auth.uid())));
revoke insert, update, delete on public.crm_activity_log from anon, authenticated;
create index if not exists crm_activity_log_actor_idx on public.crm_activity_log (actor_id, created_at desc);
create index if not exists crm_activity_log_created_idx on public.crm_activity_log (created_at desc);

-- ════════════════════════════════════════════════════════════
-- 5. Attach the audit trigger
-- ════════════════════════════════════════════════════════════

do $$
declare
  t record;
begin
  for t in
    select * from (values
      ('subscription_leads',       'lead',               'id'),
      ('crm_students',             'student',            'id'),
      ('crm_payments',             'payment',            'id'),
      ('online_classes',           'class',              'id'),
      ('online_class_enrollments', 'class_enrollment',   'id'),
      ('lms_enrollments',          'course_enrollment',  'id'),
      ('class_sessions',           'session',            'id'),
      ('teacher_students',         'teacher_assignment', 'id'),
      ('teacher_profiles',         'teacher',            'id'),
      ('profiles',                 'profile',            'id'),
      ('student_assignments',      'task',               'id'),
      ('announcements',            'announcement',       'id'),
      ('crm_broadcasts',           'broadcast',          'id'),
      ('staff_payouts',            'payout',             'id'),
      ('staff_pay_settings',       'pay_setting',        'profile_id')
    ) as v(tbl, entity, idcol)
  loop
    if to_regclass('public.' || t.tbl) is not null then
      execute format('drop trigger if exists trg_audit_staff on public.%I', t.tbl);
      execute format(
        'create trigger trg_audit_staff after insert or update or delete on public.%I
           for each row execute function public.audit_staff_change(%L, %L)',
        t.tbl, t.entity, t.idcol);
    end if;
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════
-- 6. Sessions
-- ════════════════════════════════════════════════════════════

create or replace function public.staff_ping(p_path text default null)
returns void language plpgsql security definer set search_path to 'public' as $$
declare
  v_me   uuid := auth.uid();
  v_last timestamptz;
  v_role text;
  v_email text;
begin
  if not public.is_crm_staff(v_me) then return; end if;
  select last_seen_at into v_last from public.staff_presence where profile_id = v_me;
  if v_last is null or v_last < now() - interval '30 minutes' then
    select role::text, email into v_role, v_email from public.profiles where id = v_me;
    insert into public.crm_activity_log (actor_id, actor_email, actor_role, action, entity_type, entity_id, metadata)
    values (v_me, v_email, v_role, 'session_started', 'session', v_me,
            jsonb_build_object('source', 'db', 'path', left(p_path, 200)));
    insert into public.staff_presence (profile_id, last_seen_at, last_path, session_started_at)
    values (v_me, now(), left(p_path, 200), now())
    on conflict (profile_id) do update
      set last_seen_at = now(), last_path = excluded.last_path, session_started_at = now();
  else
    update public.staff_presence set last_seen_at = now(), last_path = left(p_path, 200)
     where profile_id = v_me;
  end if;
end;
$$;

-- ════════════════════════════════════════════════════════════
-- 7. Founder reads
-- ════════════════════════════════════════════════════════════

create or replace function public.founder_team(p_from date default null, p_to date default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_from timestamptz;
  v_to   timestamptz;
  v_out  jsonb;
begin
  if not public.is_founder(auth.uid()) then raise exception 'Founder only' using errcode = '42501'; end if;
  v_from := public.casa_day_start(coalesce(p_from, date_trunc('month', now() at time zone 'Africa/Casablanca')::date));
  v_to   := public.casa_day_start(coalesce(p_to, (now() at time zone 'Africa/Casablanca')::date) + 1);

  select coalesce(jsonb_agg(row_to_json(t) order by t.sort_key, t.name), '[]'::jsonb) into v_out
  from (
    select p.id, p.email, p.phone, p.avatar_url, p.role::text as role, coalesce(p.blocked, false) as blocked,
           coalesce(nullif(tp.display_name, ''), nullif(p.full_name, ''), split_part(p.email, '@', 1)) as name,
           case p.role::text when 'founder' then 0 when 'assistant' then 1 else 2 end as sort_key,
           p.created_at,
           u.last_sign_in_at,
           pr.last_seen_at,
           pr.last_path,
           coalesce(ps.monthly_salary_mad, 0) as monthly_salary_mad,
           tp.hourly_rate_mad,
           tp.pay_model,
           tp.is_active as teacher_active,
           tp.rating_avg,
           tp.rating_count,
           -- what they did in the period (from the log)
           (select count(*) from crm_activity_log a where a.actor_id = p.id and a.created_at >= v_from and a.created_at < v_to
              and a.action <> 'session_started') as actions,
           (select count(*) from crm_activity_log a where a.actor_id = p.id and a.created_at >= v_from and a.created_at < v_to
              and a.action = 'session_started') as sessions_opened,
           (select count(*) from crm_activity_log a where a.actor_id = p.id and a.created_at >= v_from and a.created_at < v_to
              and a.entity_type = 'lead') as lead_actions,
           (select count(*) from crm_activity_log a where a.actor_id = p.id and a.created_at >= v_from and a.created_at < v_to
              and a.entity_type = 'lead' and a.action = 'lead_created') as leads_created,
           (select count(*) from crm_activity_log a where a.actor_id = p.id and a.created_at >= v_from and a.created_at < v_to
              and a.entity_type = 'payment') as payment_actions,
           (select max(a.created_at) from crm_activity_log a where a.actor_id = p.id) as last_action_at,
           -- what they own
           (select count(*) from crm_students s where s.added_by_id = p.id and s.deleted_at is null
              and s.created_at >= v_from and s.created_at < v_to) as students_added,
           (select count(*) from crm_payments pm where pm.added_by_id = p.id and pm.payment_status = 'paid' and pm.amount_mad > 0
              and pm.created_at >= v_from and pm.created_at < v_to) as payments_recorded,
           (select coalesce(sum(pm.amount_mad), 0) from crm_payments pm where pm.added_by_id = p.id and pm.payment_status = 'paid'
              and pm.amount_mad > 0 and pm.created_at >= v_from and pm.created_at < v_to) as revenue_recorded,
           (select count(*) from subscription_leads l where l.assigned_to_id = p.id and l.deleted_at is null
              and not coalesce(l.is_archived, false)) as leads_assigned,
           (select count(*) from subscription_leads l where l.assigned_to_id = p.id and l.deleted_at is null
              and not coalesce(l.is_archived, false) and l.next_followup_at < now()
              and l.status not in ('paid', 'cancelled', 'converted', 'rejected')) as followups_overdue,
           -- teachers
           (select count(*) from class_sessions cs where cs.teacher_id = p.id and cs.status = 'done'
              and cs.starts_at >= v_from and cs.starts_at < v_to) as sessions_done,
           (select coalesce(round(sum(cs.duration_min)::numeric / 60, 1), 0) from class_sessions cs where cs.teacher_id = p.id
              and cs.status = 'done' and cs.starts_at >= v_from and cs.starts_at < v_to) as hours_done,
           (select count(distinct ts.student_id) from teacher_students ts where ts.teacher_id = p.id and ts.is_active) as students_assigned
    from profiles p
    left join auth.users u on u.id = p.id
    left join teacher_profiles tp on tp.id = p.id
    left join staff_presence pr on pr.profile_id = p.id
    left join staff_pay_settings ps on ps.profile_id = p.id
    where p.role::text in ('founder', 'assistant', 'teacher')
  ) t;

  return jsonb_build_object('from', v_from, 'to', v_to, 'people', v_out);
end;
$$;

create or replace function public.founder_activity(
  p_actor uuid default null, p_from timestamptz default null, p_to timestamptz default null,
  p_entity text default null, p_limit integer default 200)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v_out jsonb;
begin
  if not public.is_founder(auth.uid()) then raise exception 'Founder only' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(row_to_json(r) order by r.created_at desc), '[]'::jsonb) into v_out
  from (
    select a.id, a.created_at, a.action, a.entity_type, a.entity_id, a.actor_id, a.actor_role,
           coalesce(nullif(ap.full_name, ''), split_part(coalesce(a.actor_email, ap.email), '@', 1)) as actor_name,
           a.before_value, a.after_value, a.metadata,
           case a.entity_type
             when 'lead'    then (select l.full_name from subscription_leads l where l.id = a.entity_id)
             when 'student' then (select s.full_name from crm_students s where s.id = a.entity_id)
             when 'payment' then (select s.full_name from crm_payments pm join crm_students s on s.id = pm.student_id where pm.id = a.entity_id)
             when 'class'   then (select c.title from online_classes c where c.id = a.entity_id)
             when 'teacher' then (select coalesce(tp.display_name, pp.full_name) from teacher_profiles tp join profiles pp on pp.id = tp.id where tp.id = a.entity_id)
             when 'profile' then (select coalesce(nullif(pp.full_name, ''), pp.email) from profiles pp where pp.id = a.entity_id)
             when 'payout'  then (select coalesce(nullif(pp.full_name, ''), pp.email) from staff_payouts po join profiles pp on pp.id = po.payee_id where po.id = a.entity_id)
             when 'pay_setting' then (select coalesce(nullif(pp.full_name, ''), pp.email) from profiles pp where pp.id = a.entity_id)
             else null end as entity_label
    from crm_activity_log a
    left join profiles ap on ap.id = a.actor_id
    where (p_actor is null or a.actor_id = p_actor)
      and (p_from is null or a.created_at >= p_from)
      and (p_to is null or a.created_at < p_to)
      and (p_entity is null or a.entity_type = p_entity)
    order by a.created_at desc
    limit least(greatest(coalesce(p_limit, 200), 1), 1000)
  ) r;
  return v_out;
end;
$$;

create or replace function public.founder_payroll(p_month date default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_month date := date_trunc('month', coalesce(p_month, (now() at time zone 'Africa/Casablanca')::date))::date;
  v_t0    timestamptz;
  v_t1    timestamptz;
  v_rows  jsonb;
begin
  if not public.is_founder(auth.uid()) then raise exception 'Founder only' using errcode = '42501'; end if;
  v_t0 := public.casa_day_start(v_month);
  v_t1 := public.casa_day_start((v_month + interval '1 month')::date);

  select coalesce(jsonb_agg(row_to_json(t) order by t.role, t.name), '[]'::jsonb) into v_rows
  from (
    select p.id, p.role::text as role, p.email, p.phone, p.avatar_url, coalesce(p.blocked, false) as blocked,
           coalesce(nullif(tp.display_name, ''), nullif(p.full_name, ''), split_part(p.email, '@', 1)) as name,
           x.hours, x.sessions, tp.hourly_rate_mad, tp.pay_model,
           coalesce(ps.monthly_salary_mad, 0) as monthly_salary_mad,
           case
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
-- 8. Founder writes
-- ════════════════════════════════════════════════════════════

create or replace function public.founder_save_payout(
  p_payee uuid, p_month date,
  p_base numeric, p_bonus numeric default 0, p_deduction numeric default 0,
  p_status text default 'pending', p_method text default null,
  p_reference text default null, p_note text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_me    uuid := auth.uid();
  v_month date := date_trunc('month', p_month)::date;
  v_role  text;
  v_hours numeric;
  v_sess  integer;
  v_row   staff_payouts;
begin
  if not public.is_founder(v_me) then raise exception 'Founder only' using errcode = '42501'; end if;
  select role::text into v_role from profiles where id = p_payee;
  if v_role is null or v_role not in ('assistant', 'teacher') then
    raise exception 'Payouts are for assistants and teachers';
  end if;
  if p_status not in ('pending', 'paid', 'cancelled') then raise exception 'Unknown status %', p_status; end if;
  if coalesce(p_base, 0) < 0 or coalesce(p_bonus, 0) < 0 or coalesce(p_deduction, 0) < 0 then
    raise exception 'Amounts cannot be negative';
  end if;
  if coalesce(p_base, 0) + coalesce(p_bonus, 0) - coalesce(p_deduction, 0) < 0 then
    raise exception 'The deduction is larger than the pay';
  end if;

  select coalesce(round(sum(duration_min)::numeric / 60, 2), 0), count(*)::int into v_hours, v_sess
  from class_sessions
  where teacher_id = p_payee and status = 'done'
    and starts_at >= public.casa_day_start(v_month)
    and starts_at <  public.casa_day_start((v_month + interval '1 month')::date);

  insert into staff_payouts as po
    (payee_id, period, base_mad, bonus_mad, deduction_mad, hours, sessions, status, method, reference, note, paid_at, created_by)
  values
    (p_payee, v_month, coalesce(p_base, 0), coalesce(p_bonus, 0), coalesce(p_deduction, 0),
     case when v_role = 'teacher' then v_hours end, case when v_role = 'teacher' then v_sess end,
     p_status, nullif(p_method, ''), nullif(btrim(p_reference), ''), nullif(btrim(p_note), ''),
     case when p_status = 'paid' then now() end, v_me)
  on conflict (payee_id, period) do update set
     base_mad      = excluded.base_mad,
     bonus_mad     = excluded.bonus_mad,
     deduction_mad = excluded.deduction_mad,
     hours         = coalesce(excluded.hours, po.hours),
     sessions      = coalesce(excluded.sessions, po.sessions),
     status        = excluded.status,
     method        = excluded.method,
     reference     = excluded.reference,
     note          = excluded.note,
     paid_at       = case when excluded.status = 'paid' then coalesce(po.paid_at, now()) else null end,
     updated_at    = now()
  returning * into v_row;

  return to_jsonb(v_row);
end;
$$;

create or replace function public.founder_set_pay_settings(p_profile uuid, p_monthly_salary numeric, p_note text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_row staff_pay_settings;
begin
  if not public.is_founder(auth.uid()) then raise exception 'Founder only' using errcode = '42501'; end if;
  if coalesce(p_monthly_salary, 0) < 0 then raise exception 'Salary cannot be negative'; end if;
  if not exists (select 1 from profiles where id = p_profile and role::text in ('assistant', 'teacher')) then
    raise exception 'Pay settings are for assistants and teachers';
  end if;
  insert into staff_pay_settings as s (profile_id, monthly_salary_mad, note, updated_by, updated_at)
  values (p_profile, coalesce(p_monthly_salary, 0), nullif(btrim(p_note), ''), auth.uid(), now())
  on conflict (profile_id) do update
    set monthly_salary_mad = excluded.monthly_salary_mad, note = excluded.note,
        updated_by = excluded.updated_by, updated_at = now()
  returning * into v_row;
  return to_jsonb(v_row);
end;
$$;

create or replace function public.founder_set_staff_blocked(p_profile uuid, p_blocked boolean)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_me   uuid := auth.uid();
  v_role text;
begin
  if not public.is_founder(v_me) then raise exception 'Founder only' using errcode = '42501'; end if;
  if p_profile = v_me then raise exception 'You cannot block yourself'; end if;
  select role::text into v_role from profiles where id = p_profile;
  if v_role is null then raise exception 'Unknown account'; end if;
  if v_role = 'founder' then raise exception 'A founder cannot be blocked here'; end if;
  update profiles set blocked = coalesce(p_blocked, false) where id = p_profile;
  -- A blocked teacher also leaves the public directory; unblocking brings them back.
  if v_role = 'teacher' then
    update teacher_profiles set is_active = not coalesce(p_blocked, false) where id = p_profile;
  end if;
  return jsonb_build_object('ok', true, 'blocked', coalesce(p_blocked, false));
end;
$$;

-- ════════════════════════════════════════════════════════════
-- 9. Payees read their own
-- ════════════════════════════════════════════════════════════

create or replace function public.my_payouts()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select jsonb_build_object(
    'salary', (select monthly_salary_mad from staff_pay_settings where profile_id = auth.uid()),
    'payouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'period', period, 'base_mad', base_mad, 'bonus_mad', bonus_mad,
        'deduction_mad', deduction_mad, 'amount_mad', amount_mad, 'hours', hours, 'sessions', sessions,
        'status', status, 'method', method, 'paid_at', paid_at, 'note', note) order by period desc)
      from staff_payouts
      where payee_id = auth.uid() and status <> 'cancelled'), '[]'::jsonb))
$$;

-- ════════════════════════════════════════════════════════════
-- 10. Who may call what
-- ════════════════════════════════════════════════════════════

do $$
declare f text;
begin
  foreach f in array array[
    'public.founder_team(date,date)', 'public.founder_activity(uuid,timestamp with time zone,timestamp with time zone,text,integer)',
    'public.founder_payroll(date)', 'public.founder_save_payout(uuid,date,numeric,numeric,numeric,text,text,text,text)',
    'public.founder_set_pay_settings(uuid,numeric,text)', 'public.founder_set_staff_blocked(uuid,boolean)',
    'public.my_payouts()', 'public.staff_ping(text)']
  loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated, service_role', f);
  end loop;
end $$;
