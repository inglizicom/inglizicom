-- 059_teacher_added_students.sql
-- Teachers add their own students; the CRM receives them, already linked.
--
-- Until now a teacher's student had to be typed into the CRM by staff and
-- then assigned by hand. Now the teacher adds the student from their space:
--
--   teacher_add_student(...)       creates the student in crm_students, linked
--                                  to the teacher (teacher_students), optionally
--                                  seated in one of the teacher's own classes.
--                                  A phone number already known to the CRM is
--                                  never duplicated: that student is linked.
--   teacher_declare_payment(...)   "this student paid X" — recorded as a
--                                  PENDING payment (with an optional receipt
--                                  photo); it is revenue only once staff
--                                  confirm it (payment_status = 'paid').
--   teacher_added_students()       the teacher's own additions and their status.
--
-- Staff (founders and assistants):
--   staff_teacher_intake()         students added by teachers waiting for
--                                  review, with their declared payments.
--   staff_review_teacher_student() approve → the student gets their access
--                                  code (no code = no student-space access);
--                                  reject → kept, inactive, with the reason.
--   staff_sides_breakdown(from,to) one row per side — each teacher, and "the
--                                  academy" for students staff added: students,
--                                  active, pending review, revenue in the
--                                  period and in total, payments awaiting
--                                  confirmation.
--
-- Attribution is exclusive: crm_students.origin_teacher_id is the teacher who
-- brought the student (null = the academy) and never changes when a student is
-- reassigned, so the sides add up exactly to total revenue. Revenue is what
-- the rest of the CRM counts: paid, amount > 0, not excluded_from_revenue,
-- dated by payment_date (or created_at when missing).
--
-- Re-running this file is a no-op.

-- ════════════════════════════════════════════════════════════
-- 1. Columns
-- ════════════════════════════════════════════════════════════

alter table public.crm_students
  add column if not exists origin_teacher_id uuid references public.profiles(id) on delete set null,
  add column if not exists review_status text not null default 'approved',
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'crm_students_review_status_check') then
    alter table public.crm_students add constraint crm_students_review_status_check
      check (review_status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

alter table public.crm_payments
  add column if not exists declared_by_teacher uuid references public.profiles(id) on delete set null;

create index if not exists crm_students_origin_teacher_idx on public.crm_students (origin_teacher_id) where deleted_at is null;
create index if not exists crm_students_review_pending_idx on public.crm_students (created_at) where review_status = 'pending';

-- Last nine digits: "0612…", "+212612…" and "212612…" are the same phone.
create or replace function public.phone_key(p text)
returns text language sql immutable set search_path to 'public' as $$
  select nullif(right(regexp_replace(coalesce(p, ''), '\D', '', 'g'), 9), '')
$$;

-- ════════════════════════════════════════════════════════════
-- 2. Teacher side
-- ════════════════════════════════════════════════════════════

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
     receipt_url, notes, added_by_id, declared_by_teacher)
  values
    (p_student, coalesce(p_kind, 'monthly'), (select course from crm_students where id = p_student), round(p_amount, 2),
     'pending', coalesce(p_paid_on, (now() at time zone 'Africa/Casablanca')::date), coalesce(nullif(p_method, ''), 'cash'),
     p_receipt_path,
     nullif(concat_ws(' · ', 'صرّح به الأستاذ', nullif(btrim(p_reference), ''), nullif(btrim(p_note), '')), ''),
     v_me, v_me)
  returning * into v_row;

  insert into crm_activity_log (actor_id, actor_email, actor_role, action, entity_type, entity_id, after_value, metadata)
  select v_me, p.email, 'teacher', 'payment_declared_by_teacher', 'payment', v_row.id,
         jsonb_build_object('amount_mad', v_row.amount_mad, 'payment_method', v_row.payment_method, 'student_id', p_student),
         jsonb_build_object('source', 'db')
    from profiles p where p.id = v_me;

  return jsonb_build_object('id', v_row.id, 'amount_mad', v_row.amount_mad, 'payment_status', v_row.payment_status);
end;
$$;

create or replace function public.teacher_added_students()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', s.id, 'full_name', s.full_name, 'phone', public.mask_phone(s.phone_number),
    'level', s.current_level, 'kind', case when s.student_type = 'private_student' then 'private' else 'group' end,
    'review_status', s.review_status, 'review_note', s.review_note, 'created_at', s.created_at,
    'paid', (select coalesce(sum(p.amount_mad), 0) from crm_payments p
              where p.student_id = s.id and p.payment_status = 'paid' and p.amount_mad > 0 and not coalesce(p.excluded_from_revenue, false)),
    'pending', (select coalesce(sum(p.amount_mad), 0) from crm_payments p
              where p.student_id = s.id and p.payment_status = 'pending' and p.declared_by_teacher = auth.uid())
  ) order by s.created_at desc), '[]'::jsonb)
  from crm_students s
  where s.origin_teacher_id = auth.uid() and s.deleted_at is null and public.is_teacher(auth.uid())
$$;

-- ════════════════════════════════════════════════════════════
-- 3. Staff side
-- ════════════════════════════════════════════════════════════

create or replace function public.staff_teacher_intake()
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v jsonb;
begin
  perform public.require_staff();
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', s.id, 'full_name', s.full_name, 'phone', s.phone_number, 'level', s.current_level,
    'kind', case when s.student_type = 'private_student' then 'private' else 'group' end,
    'note', s.notes, 'created_at', s.created_at, 'review_status', s.review_status,
    'teacher_id', s.origin_teacher_id,
    'teacher_name', (select coalesce(nullif(tp.display_name, ''), nullif(pp.full_name, ''), pp.email)
                       from profiles pp left join teacher_profiles tp on tp.id = pp.id where pp.id = s.origin_teacher_id),
    'payments', coalesce((select jsonb_agg(jsonb_build_object(
        'id', p.id, 'amount_mad', p.amount_mad, 'payment_method', p.payment_method, 'payment_date', p.payment_date,
        'notes', p.notes, 'receipt_path', p.receipt_url, 'payment_status', p.payment_status) order by p.created_at)
      from crm_payments p where p.student_id = s.id and p.declared_by_teacher is not null and p.payment_status = 'pending'), '[]'::jsonb)
  ) order by s.created_at), '[]'::jsonb) into v
  from crm_students s
  where s.deleted_at is null
    and (s.review_status = 'pending'
         or exists (select 1 from crm_payments p where p.student_id = s.id and p.declared_by_teacher is not null and p.payment_status = 'pending'));
  return v;
end;
$$;

create or replace function public.staff_review_teacher_student(p_student uuid, p_approve boolean, p_note text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_row crm_students;
begin
  perform public.require_staff();
  select * into v_row from crm_students where id = p_student and deleted_at is null;
  if not found then raise exception 'Unknown student'; end if;
  if v_row.review_status <> 'pending' then raise exception 'This student was already reviewed'; end if;

  if p_approve then
    update crm_students set
      review_status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), review_note = nullif(btrim(p_note), ''),
      is_active = true,
      verification_token = coalesce(verification_token, 'ING-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)))
    where id = p_student returning * into v_row;
  else
    update crm_students set
      review_status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now(), review_note = nullif(btrim(p_note), ''),
      is_active = false
    where id = p_student returning * into v_row;
  end if;

  return jsonb_build_object('id', v_row.id, 'review_status', v_row.review_status, 'verification_token', v_row.verification_token);
end;
$$;

create or replace function public.staff_sides_breakdown(p_from date default null, p_to date default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_from date := coalesce(p_from, date_trunc('month', now() at time zone 'Africa/Casablanca')::date);
  v_to   date := coalesce(p_to, (now() at time zone 'Africa/Casablanca')::date);
  v jsonb;
begin
  perform public.require_staff();
  with st as (
    select s.id, s.origin_teacher_id as side, s.is_active, s.review_status
    from crm_students s where s.deleted_at is null
  ),
  pay as (
    select st.side, p.amount_mad, p.payment_status, coalesce(p.payment_date, (p.created_at at time zone 'Africa/Casablanca')::date) as d,
           (p.payment_status = 'paid' and p.amount_mad > 0 and not coalesce(p.excluded_from_revenue, false)) as counts
    from crm_payments p join st on st.id = p.student_id
  ),
  sides as (select distinct side from st
            union select p.id from profiles p where p.role::text = 'teacher' and not coalesce(p.blocked, false))
  select coalesce(jsonb_agg(row_to_json(t) order by t.is_academy desc, t.revenue_period desc, t.name), '[]'::jsonb) into v
  from (
    select sd.side as teacher_id,
           sd.side is null as is_academy,
           case when sd.side is null then 'الأكاديمية'
                else (select coalesce(nullif(tp.display_name, ''), nullif(pp.full_name, ''), pp.email)
                        from profiles pp left join teacher_profiles tp on tp.id = pp.id where pp.id = sd.side) end as name,
           (select count(*) from st where st.side is not distinct from sd.side and st.review_status <> 'rejected') as students,
           (select count(*) from st where st.side is not distinct from sd.side and st.is_active and st.review_status = 'approved') as active,
           (select count(*) from st where st.side is not distinct from sd.side and st.review_status = 'pending') as pending_review,
           (select coalesce(sum(amount_mad), 0) from pay where pay.side is not distinct from sd.side and counts and d between v_from and v_to) as revenue_period,
           (select coalesce(sum(amount_mad), 0) from pay where pay.side is not distinct from sd.side and counts) as revenue_total,
           (select coalesce(sum(amount_mad), 0) from pay where pay.side is not distinct from sd.side and payment_status = 'pending') as awaiting_confirmation
    from sides sd
  ) t;
  return jsonb_build_object('from', v_from, 'to', v_to, 'sides', v);
end;
$$;

-- ════════════════════════════════════════════════════════════
-- 4. Who may call what
-- ════════════════════════════════════════════════════════════

do $$
declare f text;
begin
  foreach f in array array[
    'public.teacher_add_student(text,text,text,text,uuid,text,text)',
    'public.teacher_declare_payment(uuid,numeric,text,date,text,text,text,text)',
    'public.teacher_added_students()',
    'public.staff_teacher_intake()',
    'public.staff_review_teacher_student(uuid,boolean,text)',
    'public.staff_sides_breakdown(date,date)']
  loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated, service_role', f);
  end loop;
end $$;
