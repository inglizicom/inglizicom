-- 061_academy_brings_students.sql
-- The academy brings the students; a teacher is paid on the lessons they give.
--
-- 059/060 counted a student's money for the teacher who brought them
-- (crm_students.origin_teacher_id). The academy now recruits every student and
-- assigns them, so "who brought whom" stops deciding money — it would only
-- breed disputes between teachers. Instead:
--
--   1. Adding students is a per-teacher permission (teacher_profiles.
--      can_add_students), off by default, set by a founder only. A teacher
--      without it cannot add a student or declare a payment.
--   2. Every payment says which teacher's lessons it pays for
--      (crm_payments.teacher_id). It fills itself in when the student has
--      exactly one teacher (assigned, or seated in their class) — on insert,
--      and again when an unlinked student is later assigned, for payments of
--      this month and last. A student with two teachers is linked by staff
--      (staff_set_payment_teacher); until then the payment counts for nobody.
--   3. A teacher's revenue — the base of their % — is the confirmed payments
--      linked to them (teacher_side_revenue keeps its name; founder_payroll
--      follows automatically). The CRM "sides" breakdown and the monthly
--      report use the same rule; payments linked to nobody are shown apart.
--
-- origin_teacher_id stays, as plain history of who entered the student.
--
-- Re-running this file is a no-op.

-- ════════════════════════════════════════════════════════════
-- 1. Who may add students
-- ════════════════════════════════════════════════════════════

alter table public.teacher_profiles add column if not exists can_add_students boolean not null default false;

create or replace function public.guard_teacher_profile_fields()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if public.is_founder(auth.uid()) then
    return new;                                    -- the founder sets pay and permissions
  end if;
  if public.is_crm_staff(auth.uid()) then
    if new.pay_model is distinct from old.pay_model
    or new.hourly_rate_mad is distinct from old.hourly_rate_mad
    or new.revenue_share_pct is distinct from old.revenue_share_pct then
      raise exception 'Only a founder can change a teacher''s pay' using errcode = '42501';
    end if;
    if new.can_add_students is distinct from old.can_add_students then
      raise exception 'Only a founder can change who adds students' using errcode = '42501';
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
  new.can_add_students  := old.can_add_students;
  new.hired_at          := old.hired_at;
  new.is_active         := old.is_active;
  return new;
end
$$;

-- The one teacher allowed today (decided 2026-10): فاطمة الزهراء المحفوضي.
-- Run without a signed-in user, so step past the guard for this one write.
alter table public.teacher_profiles disable trigger trg_teacher_profiles_guard;
update public.teacher_profiles set can_add_students = true
 where id = 'c2593d73-2d20-4082-a3af-45af1d4bb380' and not can_add_students;
alter table public.teacher_profiles enable trigger trg_teacher_profiles_guard;

-- ════════════════════════════════════════════════════════════
-- 2. Each payment → the teacher whose lessons it pays for
-- ════════════════════════════════════════════════════════════

alter table public.crm_payments
  add column if not exists teacher_id uuid references public.profiles(id) on delete set null;
create index if not exists crm_payments_teacher_idx on public.crm_payments (teacher_id) where teacher_id is not null;

-- A student's current teachers: assigned to them, or seated in their class
-- (the same rule as teacher_roster).
create or replace function public.student_teachers(p_student uuid)
returns setof uuid language sql stable security definer set search_path to 'public' as $$
  select ts.teacher_id from teacher_students ts
   where ts.student_id = p_student and ts.is_active
  union
  select c.teacher_id from online_class_enrollments e join online_classes c on c.id = e.class_id
   where e.student_id = p_student and e.status = 'active' and c.teacher_id is not null and c.archived_at is null
$$;

-- Their only teacher, or null when they have none or several.
create or replace function public.payment_default_teacher(p_student uuid)
returns uuid language sql stable security definer set search_path to 'public' as $$
  select case when count(*) = 1 then (array_agg(t))[1] end from public.student_teachers(p_student) t
$$;

create or replace function public.crm_payment_set_teacher()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if tg_op = 'UPDATE' and new.student_id is distinct from old.student_id
     and new.teacher_id is not distinct from old.teacher_id then
    new.teacher_id := null;                        -- moved to another student: decide again
  end if;
  if new.teacher_id is null and new.student_id is not null
     and (tg_op = 'INSERT' or new.student_id is distinct from old.student_id) then
    new.teacher_id := coalesce(new.declared_by_teacher, public.payment_default_teacher(new.student_id));
  end if;
  if new.teacher_id is not null
     and (tg_op = 'INSERT' or new.teacher_id is distinct from old.teacher_id)
     and not exists (select 1 from profiles where id = new.teacher_id and role::text = 'teacher') then
    raise exception 'A payment can only be linked to a teacher';
  end if;
  return new;
end
$$;
drop trigger if exists trg_crm_payments_teacher on public.crm_payments;
create trigger trg_crm_payments_teacher before insert or update of student_id, teacher_id on public.crm_payments
  for each row execute function public.crm_payment_set_teacher();

-- Link a student's unlinked payments (this month and last) once they have
-- exactly one teacher. Older payments are left alone: they predate the rule.
create or replace function public.link_student_payments(p_student uuid)
returns integer language plpgsql security definer set search_path to 'public' as $$
declare
  v_teacher uuid := public.payment_default_teacher(p_student);
  v_since   date := (date_trunc('month', (now() at time zone 'Africa/Casablanca')::date) - interval '1 month')::date;
  v_n       integer;
begin
  if v_teacher is null then return 0; end if;
  update crm_payments set teacher_id = v_teacher
   where student_id = p_student and teacher_id is null
     and coalesce(payment_date, (created_at at time zone 'Africa/Casablanca')::date) >= v_since;
  get diagnostics v_n = row_count;
  return v_n;
end
$$;

create or replace function public.link_payments_on_assign()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_row jsonb := to_jsonb(new);           -- the two tables differ: read fields by name
begin
  if (tg_table_name = 'teacher_students' and (v_row->>'is_active')::boolean)
  or (tg_table_name = 'online_class_enrollments' and v_row->>'status' = 'active') then
    perform public.link_student_payments(new.student_id);
  end if;
  return null;
end
$$;
drop trigger if exists trg_teacher_students_link_payments on public.teacher_students;
create trigger trg_teacher_students_link_payments after insert or update of is_active on public.teacher_students
  for each row execute function public.link_payments_on_assign();
drop trigger if exists trg_enrollments_link_payments on public.online_class_enrollments;
create trigger trg_enrollments_link_payments after insert or update of status on public.online_class_enrollments
  for each row execute function public.link_payments_on_assign();

-- The payments already recorded this month and last.
select public.link_student_payments(x.student_id)
  from (select distinct student_id from public.crm_payments where teacher_id is null and student_id is not null) x;

-- Staff: link a payment to a teacher (or unlink it with null).
create or replace function public.staff_set_payment_teacher(p_payment uuid, p_teacher uuid)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_row crm_payments;
begin
  perform public.require_staff();
  update crm_payments set teacher_id = p_teacher where id = p_payment returning * into v_row;
  if not found then raise exception 'Unknown payment'; end if;
  return jsonb_build_object('id', v_row.id, 'teacher_id', v_row.teacher_id);
end;
$$;

-- Staff: the teachers a payment can be linked to — every active teacher, and
-- for this student, the class or assignment that links them.
create or replace function public.staff_payment_teacher_options(p_student uuid)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v jsonb;
begin
  perform public.require_staff();
  select coalesce(jsonb_agg(jsonb_build_object('teacher_id', t.id, 'name', t.name, 'via', t.via)
                            order by (t.via is null), t.name), '[]'::jsonb) into v
  from (
    select p.id,
           coalesce(nullif(tp.display_name, ''), nullif(p.full_name, ''), split_part(p.email, '@', 1)) as name,
           nullif(concat_ws(' · ',
             (select 'مسنَد مباشرة' from teacher_students ts
               where ts.teacher_id = p.id and ts.student_id = p_student and ts.is_active limit 1),
             (select string_agg(c.title, '، ') from online_class_enrollments e join online_classes c on c.id = e.class_id
               where c.teacher_id = p.id and e.student_id = p_student and e.status = 'active' and c.archived_at is null)), '') as via
    from profiles p left join teacher_profiles tp on tp.id = p.id
    where p.role::text = 'teacher' and not coalesce(p.blocked, false)
  ) t;
  return v;
end;
$$;

-- ════════════════════════════════════════════════════════════
-- 3. Teacher money = payments linked to them
-- ════════════════════════════════════════════════════════════

-- Confirmed money for a teacher's lessons, in [d0, d1). founder_payroll (060)
-- calls this, so the suggested pay follows the new rule without a change.
create or replace function public.teacher_side_revenue(p_teacher uuid, p_d0 date, p_d1 date)
returns numeric language sql stable security definer set search_path to 'public' as $$
  select coalesce(sum(p.amount_mad), 0)
  from crm_payments p join crm_students s on s.id = p.student_id
  where p.teacher_id = p_teacher and s.deleted_at is null
    and p.payment_status = 'paid' and p.amount_mad > 0 and not coalesce(p.excluded_from_revenue, false)
    and coalesce(p.payment_date, (p.created_at at time zone 'Africa/Casablanca')::date) >= p_d0
    and coalesce(p.payment_date, (p.created_at at time zone 'Africa/Casablanca')::date) <  p_d1
$$;

-- One row per teacher, plus "no teacher": their students today, and the money
-- linked to them. Same shape as 059, so the CRM home reads it unchanged.
create or replace function public.staff_sides_breakdown(p_from date default null, p_to date default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_from date := coalesce(p_from, date_trunc('month', now() at time zone 'Africa/Casablanca')::date);
  v_to   date := coalesce(p_to, (now() at time zone 'Africa/Casablanca')::date);
  v jsonb;
begin
  perform public.require_staff();
  with
  st as (select s.id, s.is_active, s.review_status, s.origin_teacher_id from crm_students s where s.deleted_at is null),
  links as (
    select ts.teacher_id, ts.student_id from teacher_students ts join st on st.id = ts.student_id where ts.is_active
    union
    select c.teacher_id, e.student_id from online_class_enrollments e
      join online_classes c on c.id = e.class_id join st on st.id = e.student_id
     where e.status = 'active' and c.teacher_id is not null and c.archived_at is null
  ),
  pay as (
    select p.teacher_id as side, p.amount_mad, p.payment_status,
           coalesce(p.payment_date, (p.created_at at time zone 'Africa/Casablanca')::date) as d,
           (p.payment_status = 'paid' and p.amount_mad > 0 and not coalesce(p.excluded_from_revenue, false)) as counts
    from crm_payments p join st on st.id = p.student_id
  ),
  sides as (
    select p.id as side from profiles p where p.role::text = 'teacher' and not coalesce(p.blocked, false)
    union select side from pay where side is not null
    union select null::uuid
  )
  select coalesce(jsonb_agg(row_to_json(t) order by t.is_academy desc, t.revenue_period desc, t.name), '[]'::jsonb) into v
  from (
    select sd.side as teacher_id,
           sd.side is null as is_academy,
           case when sd.side is null then 'بدون أستاذ'
                else (select coalesce(nullif(tp.display_name, ''), nullif(pp.full_name, ''), pp.email)
                        from profiles pp left join teacher_profiles tp on tp.id = pp.id where pp.id = sd.side) end as name,
           case when sd.side is null
                then (select count(*) from st where st.review_status <> 'rejected' and not exists (select 1 from links l where l.student_id = st.id))
                else (select count(distinct l.student_id) from links l where l.teacher_id = sd.side) end as students,
           case when sd.side is null
                then (select count(*) from st where st.is_active and st.review_status = 'approved' and not exists (select 1 from links l where l.student_id = st.id))
                else (select count(distinct l.student_id) from links l join st on st.id = l.student_id
                       where l.teacher_id = sd.side and st.is_active and st.review_status = 'approved') end as active,
           (select count(*) from st where st.review_status = 'pending' and st.origin_teacher_id is not distinct from sd.side) as pending_review,
           (select coalesce(sum(amount_mad), 0) from pay where pay.side is not distinct from sd.side and counts and d between v_from and v_to) as revenue_period,
           (select coalesce(sum(amount_mad), 0) from pay where pay.side is not distinct from sd.side and counts) as revenue_total,
           (select coalesce(sum(amount_mad), 0) from pay where pay.side is not distinct from sd.side and payment_status = 'pending') as awaiting_confirmation
    from sides sd
  ) t;
  return jsonb_build_object('from', v_from, 'to', v_to, 'sides', v);
end;
$$;

-- ════════════════════════════════════════════════════════════
-- 4. Teachers: adding students and declaring payments need the permission
-- ════════════════════════════════════════════════════════════

create or replace function public.teacher_can_add_students(p_teacher uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select coalesce((select can_add_students from teacher_profiles where id = p_teacher), false)
$$;

create or replace function public.teacher_add_student(
  p_full_name text, p_phone text, p_level text default null, p_kind text default 'group',
  p_class_id uuid default null, p_note text default null, p_country text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_me      uuid := auth.uid();
  v_name    text := btrim(coalesce(p_full_name, ''));
  v_key     text := public.phone_key(p_phone);
  v_student uuid;
  v_lead    uuid;
  v_result  text;
  v_seat    text := null;
begin
  if not public.is_teacher(v_me) then raise exception 'Teachers only' using errcode = '42501'; end if;
  if not public.teacher_can_add_students(v_me) then
    raise exception 'Adding students is not enabled for this teacher' using errcode = '42501';
  end if;
  if length(v_name) < 2 then raise exception 'Enter the student''s full name'; end if;
  if v_key is null or length(v_key) < 9 then raise exception 'Enter a valid phone number'; end if;
  if coalesce(p_kind, 'group') not in ('group', 'private') then raise exception 'Unknown kind %', p_kind; end if;

  -- Already in the CRM (same phone)? Link, never duplicate.
  select id into v_student from crm_students
   where deleted_at is null and public.phone_key(phone_number) = v_key
   order by created_at limit 1;

  if v_student is not null then
    v_result := 'linked';
  else
    select id into v_lead from subscription_leads
     where deleted_at is null and public.phone_key(phone) = v_key
       and not exists (select 1 from crm_students s where s.lead_id = subscription_leads.id)
     order by created_at desc limit 1;

    insert into crm_students
      (full_name, phone_number, student_type, course, current_level, payment_status, total_paid_mad,
       enrollment_type, source, notes, country, lead_id, added_by_id,
       origin_teacher_id, review_status, verification_token)
    values
      (v_name, btrim(p_phone), case when p_kind = 'private' then 'private_student' else 'course_student' end,
       nullif(btrim(p_level), ''), nullif(btrim(p_level), ''), 'pending', 0,
       'paid', 'teacher', nullif(btrim(p_note), ''), nullif(btrim(p_country), ''), v_lead, v_me,
       v_me, 'pending', null)
    returning id into v_student;
    v_result := 'created';
  end if;

  insert into teacher_students (teacher_id, student_id, is_active, assigned_by)
  values (v_me, v_student, true, v_me)
  on conflict (teacher_id, student_id) do update set is_active = true;

  if p_class_id is not null then
    if not exists (select 1 from online_classes c where c.id = p_class_id and c.teacher_id = v_me and c.archived_at is null) then
      v_seat := 'not_your_class';
    elsif exists (select 1 from online_class_enrollments e where e.class_id = p_class_id and e.student_id = v_student
                   and e.status in ('active', 'waitlisted')) then
      v_seat := 'already_seated';
    else
      begin
        -- The guard may turn a full class into the waitlist: report what happened.
        insert into online_class_enrollments (class_id, student_id, status, start_date, created_by)
        values (p_class_id, v_student, 'active', (now() at time zone 'Africa/Casablanca')::date, v_me)
        returning case status when 'active' then 'seated' else status end into v_seat;
      exception when others then
        v_seat := 'seat_refused: ' || sqlerrm;    -- e.g. the class is full
      end;
    end if;
  end if;

  insert into crm_activity_log (actor_id, actor_email, actor_role, action, entity_type, entity_id, after_value, metadata)
  select v_me, p.email, 'teacher', case v_result when 'created' then 'student_added_by_teacher' else 'student_linked_by_teacher' end,
         'student', v_student, jsonb_build_object('full_name', v_name, 'level', p_level, 'kind', p_kind),
         jsonb_build_object('source', 'db', 'seat', v_seat)
    from profiles p where p.id = v_me;

  return jsonb_build_object('result', v_result, 'student_id', v_student, 'seat', v_seat,
    'review_status', (select review_status from crm_students where id = v_student));
end;
$$;

create or replace function public.teacher_declare_payment(
  p_student uuid, p_amount numeric, p_method text default 'cash', p_paid_on date default null,
  p_kind text default 'monthly', p_reference text default null, p_note text default null,
  p_receipt_path text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_me  uuid := auth.uid();
  v_row crm_payments;
begin
  if not public.is_teacher(v_me) then raise exception 'Teachers only' using errcode = '42501'; end if;
  if not public.teacher_can_add_students(v_me) then
    raise exception 'Adding students is not enabled for this teacher' using errcode = '42501';
  end if;
  if not exists (select 1 from teacher_roster(v_me) r where r.student_id = p_student)
     and not exists (select 1 from crm_students s where s.id = p_student and s.origin_teacher_id = v_me and s.deleted_at is null) then
    raise exception 'This student is not one of yours' using errcode = '42501';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 100000 then raise exception 'Enter a valid amount'; end if;
  if coalesce(p_kind, 'monthly') not in ('monthly', 'full_course', 'private_lessons', 'other') then raise exception 'Unknown kind %', p_kind; end if;
  if p_receipt_path is not null and split_part(p_receipt_path, '/', 1) <> v_me::text then
    raise exception 'Receipt must be one of your uploads';
  end if;

  insert into crm_payments
    (student_id, payment_type, course_or_service, amount_mad, payment_status, payment_date, payment_method,
     receipt_url, notes, added_by_id, declared_by_teacher, teacher_id)
  values
    (p_student, coalesce(p_kind, 'monthly'), (select course from crm_students where id = p_student), round(p_amount, 2),
     'pending', coalesce(p_paid_on, (now() at time zone 'Africa/Casablanca')::date), coalesce(nullif(p_method, ''), 'cash'),
     p_receipt_path,
     nullif(concat_ws(' · ', 'صرّح به الأستاذ', nullif(btrim(p_reference), ''), nullif(btrim(p_note), '')), ''),
     v_me, v_me, v_me)
  returning * into v_row;

  insert into crm_activity_log (actor_id, actor_email, actor_role, action, entity_type, entity_id, after_value, metadata)
  select v_me, p.email, 'teacher', 'payment_declared_by_teacher', 'payment', v_row.id,
         jsonb_build_object('amount_mad', v_row.amount_mad, 'payment_method', v_row.payment_method, 'student_id', p_student),
         jsonb_build_object('source', 'db')
    from profiles p where p.id = v_me;

  return jsonb_build_object('id', v_row.id, 'amount_mad', v_row.amount_mad, 'payment_status', v_row.payment_status);
end;
$$;

-- ════════════════════════════════════════════════════════════
-- 5. The monthly report on the new rule
-- ════════════════════════════════════════════════════════════
-- money.revenue      confirmed payments linked to the teacher, this month
-- money.pending      payments linked to them, awaiting confirmation
-- money.unlinked     paid this month by their students but linked to nobody
--                    (a student with two teachers, not yet linked by staff)
-- students.list[].paid / pending   that student's payments linked to this teacher

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
  pays as (
    select p.student_id, p.teacher_id, p.amount_mad, p.payment_status,
           (p.payment_status = 'paid' and p.amount_mad > 0 and not coalesce(p.excluded_from_revenue, false)) as counts,
           coalesce(p.payment_date, (p.created_at at time zone 'Africa/Casablanca')::date) as d
    from crm_payments p
  ),
  roster as (select r.student_id from teacher_roster(p_teacher) r),
  ids as (
    select student_id from roster
    union select student_id from att
    union select student_id from pays where teacher_id = p_teacher and counts and d >= v_month and d < v_next
    union select s.id from crm_students s where s.origin_teacher_id = p_teacher and s.deleted_at is null and s.review_status = 'pending'
  ),
  people as (
    select s.id, s.full_name, s.student_type, s.review_status,
           (select count(*) from att where att.student_id = s.id and att.status = 'present') as present,
           (select count(*) from att where att.student_id = s.id and att.status = 'late') as late,
           (select count(*) from att where att.student_id = s.id and att.status = 'absent') as absent,
           (select count(*) from att where att.student_id = s.id and att.status = 'excused') as excused,
           (select coalesce(sum(amount_mad), 0) from pays where pays.student_id = s.id and pays.teacher_id = p_teacher
              and counts and d >= v_month and d < v_next) as paid,
           (select coalesce(sum(amount_mad), 0) from pays where pays.student_id = s.id and pays.teacher_id = p_teacher
              and payment_status = 'pending' and d < v_next) as pending,
           (select coalesce(sum(amount_mad), 0) from pays where pays.student_id = s.id and pays.teacher_id is null
              and counts and d >= v_month and d < v_next) as unlinked,
           (exists (select 1 from teacher_students ts where ts.teacher_id = p_teacher and ts.student_id = s.id
                      and ts.assigned_at >= v_t0 and ts.assigned_at < v_t1)
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
      'group', (select count(*) from people where student_type <> 'private_student'),
      'private', (select count(*) from people where student_type = 'private_student'),
      'new', (select count(*) from people where is_new),
      'left', (select count(*) from people where left_this_month),
      'pending_review', (select count(*) from people where review_status = 'pending'),
      'list', coalesce((select jsonb_agg(jsonb_build_object(
          'id', id, 'name', full_name, 'kind', case when student_type = 'private_student' then 'private' else 'group' end,
          'is_new', is_new, 'left', left_this_month, 'review_status', review_status,
          'present', present, 'late', late, 'absent', absent, 'excused', excused,
          'paid', paid, 'pending', pending, 'unlinked', unlinked) order by full_name) from people), '[]'::jsonb)),
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
      'revenue', public.teacher_side_revenue(p_teacher, v_month, v_next),
      'pending', (select coalesce(sum(p.amount_mad), 0) from crm_payments p join crm_students s on s.id = p.student_id
                    where p.teacher_id = p_teacher and s.deleted_at is null and p.payment_status = 'pending'),
      'unlinked', (select coalesce(sum(unlinked), 0) from people),
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
      'revenue', public.teacher_side_revenue(p_teacher, v_prev, v_month))
  ) into v_out;

  return v_out;
end;
$$;

-- ════════════════════════════════════════════════════════════
-- 6. Who may call what
-- ════════════════════════════════════════════════════════════

do $$
declare f text;
begin
  foreach f in array array[
    'public.student_teachers(uuid)', 'public.payment_default_teacher(uuid)',
    'public.link_student_payments(uuid)', 'public.teacher_can_add_students(uuid)',
    'public.crm_payment_set_teacher()', 'public.link_payments_on_assign()']
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
  end loop;
  foreach f in array array[
    'public.staff_set_payment_teacher(uuid,uuid)',
    'public.staff_payment_teacher_options(uuid)',
    'public.staff_sides_breakdown(date,date)',
    'public.teacher_add_student(text,text,text,text,uuid,text,text)',
    'public.teacher_declare_payment(uuid,numeric,text,date,text,text,text,text)',
    'public.teacher_month_report(uuid,date)']
  loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated, service_role', f);
  end loop;
end $$;
