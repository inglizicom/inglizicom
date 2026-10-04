-- 062_notifications.sql
-- Notifications for everyone: a bell in each space, and a phone push.
--
-- Students already had theirs (student_notifications + push_subscriptions,
-- 042). This adds the same for staff and teachers, the events that create
-- them, targeted messages between people, and the push delivery.
--
--   notifications            one row per staff/teacher recipient (read_at,
--                            pushed_at). Read: the recipient; staff read all.
--   student_notifications    gains sender_profile, message_id, dedupe_key,
--                            pushed_at — the student side of the same system.
--   notification_messages    one row per message someone SENT (staff, teacher
--                            or student) with its recipients — the log staff
--                            read, so every teacher↔student message is seen
--                            by the founder and assistants.
--
-- Sending is targeted, never "everyone":
--   staff_send_notification     chosen teachers / students / one teacher's
--                               students / one class
--   teacher_send_notification   their own students (chosen, or one of their classes)
--   student_send_notification   their teacher, or the academy (staff)
--
-- Events (triggers, so every screen and RPC that writes is covered):
--   money     payment declared by a teacher → staff; paid payment linked to a
--             teacher → that teacher; payment confirmed → the student; paid but
--             not linked and the student has several teachers → staff; pay
--             (staff_payouts) marked paid → the payee
--   students  assigned to a teacher / seated in their class → teacher (and the
--             student); teacher added a student to review → staff; absent twice
--             in a row → the teacher and staff
--   classes   session cancelled or moved → its students (staff too when the
--             teacher cancelled)
--   reports   academy note written → the teacher
--   daily (notify_scheduled, called by the cron): lesson report still missing
--             a day after the session → teacher (+ one summary to staff); the
--             first days of a month: last month's report is ready → teachers, staff
--
-- Push: a statement trigger on both tables asks the site to deliver
-- (pg_net → /api/notifications/dispatch, authenticated by a secret kept in
-- notify_settings). Without pg_net nothing breaks: the daily cron and the
-- senders' own screens flush the queue. dedupe_key keeps an event from
-- notifying the same person twice.
--
-- Re-running this file is a no-op.

-- ════════════════════════════════════════════════════════════
-- 0. Delivery plumbing
-- ════════════════════════════════════════════════════════════

do $$ begin
  begin
    create extension if not exists pg_net;
  exception when others then
    raise notice 'pg_net unavailable (%): pushes go out with the cron and the senders'' screens', sqlerrm;
  end;
end $$;

create table if not exists public.notify_settings (
  id           integer primary key default 1 check (id = 1),
  dispatch_url text not null default 'https://www.inglizi.com/api/notifications/dispatch',
  secret       text not null default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  enabled      boolean not null default true
);
alter table public.notify_settings enable row level security;      -- no policy: nobody but the server
revoke all on public.notify_settings from anon, authenticated;
insert into public.notify_settings (id) values (1) on conflict (id) do nothing;

-- push_subscriptions: staff and teachers subscribe too (042 had students only).
alter table public.push_subscriptions add column if not exists profile_id uuid references public.profiles(id) on delete cascade;
create index if not exists push_subscriptions_profile_idx on public.push_subscriptions (profile_id);

-- ════════════════════════════════════════════════════════════
-- 1. Tables
-- ════════════════════════════════════════════════════════════

create table if not exists public.notification_messages (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  sender_profile  uuid references public.profiles(id) on delete set null,
  sender_student  uuid references public.crm_students(id) on delete set null,
  sender_role     text not null check (sender_role in ('founder', 'assistant', 'teacher', 'student')),
  sender_name     text,
  title           text not null,
  body            text,
  url             text,
  recipients      jsonb not null default '[]'::jsonb,     -- [{kind: teacher|student|staff, id, name}]
  recipient_count integer not null default 0
);
create index if not exists notification_messages_created_idx on public.notification_messages (created_at desc);
create index if not exists notification_messages_sender_idx on public.notification_messages (sender_profile, created_at desc);
alter table public.notification_messages enable row level security;
drop policy if exists notification_messages_read on public.notification_messages;
create policy notification_messages_read on public.notification_messages
  for select using (public.is_crm_staff(auth.uid()) or sender_profile = auth.uid());
revoke insert, update, delete on public.notification_messages from anon, authenticated;
revoke all on public.notification_messages from anon;

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  recipient   uuid not null references public.profiles(id) on delete cascade,
  kind        text not null default 'info',
  title       text not null,
  body        text,
  url         text,
  message_id  uuid references public.notification_messages(id) on delete set null,
  dedupe_key  text,
  read_at     timestamptz,
  pushed_at   timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_recipient_idx on public.notifications (recipient, created_at desc);
create unique index if not exists notifications_dedupe_idx on public.notifications (recipient, dedupe_key) where dedupe_key is not null;
create index if not exists notifications_unpushed_idx on public.notifications (created_at) where pushed_at is null;
alter table public.notifications enable row level security;
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications
  for select using (recipient = auth.uid() or public.is_crm_staff(auth.uid()));
revoke insert, update, delete on public.notifications from anon, authenticated;
revoke all on public.notifications from anon;

-- The student side: who sent it, the message it belongs to, dedupe, push state.
do $$ begin
  if not exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'student_notifications' and column_name = 'pushed_at') then
    alter table public.student_notifications add column pushed_at timestamptz;
    -- Everything already there is old news: never push it now.
    update public.student_notifications set pushed_at = created_at;
  end if;
end $$;
alter table public.student_notifications
  add column if not exists sender_profile uuid references public.profiles(id) on delete set null,
  add column if not exists message_id     uuid references public.notification_messages(id) on delete set null,
  add column if not exists dedupe_key     text;
create unique index if not exists student_notifications_dedupe_idx on public.student_notifications (student_id, dedupe_key) where dedupe_key is not null;
create index if not exists student_notifications_unpushed_idx on public.student_notifications (created_at) where pushed_at is null;

-- ════════════════════════════════════════════════════════════
-- 2. Helpers (internal)
-- ════════════════════════════════════════════════════════════

create or replace function public.profile_name(p_id uuid)
returns text language sql stable security definer set search_path to 'public' as $$
  select coalesce(nullif(tp.display_name, ''), nullif(p.full_name, ''), split_part(p.email, '@', 1))
  from profiles p left join teacher_profiles tp on tp.id = p.id where p.id = p_id
$$;

create or replace function public.mad_text(p numeric)
returns text language sql immutable set search_path to 'public' as $$
  select btrim(to_char(round(coalesce(p, 0)), '999,999,999')) || ' د.م'
$$;

create or replace function public.casa_time_text(p timestamptz)
returns text language sql stable set search_path to 'public' as $$
  select to_char(p at time zone 'Africa/Casablanca', 'DD/MM HH24:MI')
$$;

create or replace function public.notify_profile(
  p_recipient uuid, p_kind text, p_title text, p_body text, p_url text,
  p_dedupe text default null, p_message uuid default null)
returns void language sql security definer set search_path to 'public' as $$
  insert into notifications (recipient, kind, title, body, url, dedupe_key, message_id)
  select p_recipient, p_kind, p_title, p_body, p_url, p_dedupe, p_message
  where p_recipient is not null
  on conflict (recipient, dedupe_key) where dedupe_key is not null do nothing
$$;

-- Every active founder and assistant, except the one who caused the event.
create or replace function public.notify_staff(
  p_kind text, p_title text, p_body text, p_url text,
  p_dedupe text default null, p_message uuid default null)
returns void language sql security definer set search_path to 'public' as $$
  insert into notifications (recipient, kind, title, body, url, dedupe_key, message_id)
  select p.id, p_kind, p_title, p_body, p_url, p_dedupe, p_message
  from profiles p
  where public.is_crm_staff(p.id) and p.id is distinct from auth.uid()
  on conflict (recipient, dedupe_key) where dedupe_key is not null do nothing
$$;

create or replace function public.notify_student(
  p_student uuid, p_type text, p_title text, p_body text, p_tab text default null,
  p_dedupe text default null, p_sender uuid default null, p_message uuid default null)
returns void language sql security definer set search_path to 'public' as $$
  insert into student_notifications (student_id, type, title, body, tab, dedupe_key, sender_profile, message_id)
  select p_student, p_type, p_title, p_body, p_tab, p_dedupe, p_sender, p_message
  where p_student is not null
    and exists (select 1 from crm_students s where s.id = p_student and s.deleted_at is null)
  on conflict (student_id, dedupe_key) where dedupe_key is not null do nothing
$$;

-- Ask the site to deliver the pushes now (best effort, never blocks a write).
create or replace function public.notify_push_kick()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v notify_settings;
begin
  if to_regproc('net.http_post') is null then return null; end if;
  select * into v from notify_settings where id = 1 and enabled;
  if not found then return null; end if;
  execute 'select net.http_post(url := $1, body := $2, headers := $3)'
    using v.dispatch_url, '{}'::jsonb,
          jsonb_build_object('Content-Type', 'application/json', 'x-dispatch-secret', v.secret);
  return null;
exception when others then
  return null;
end
$$;
drop trigger if exists trg_notifications_push on public.notifications;
create trigger trg_notifications_push after insert on public.notifications
  for each statement execute function public.notify_push_kick();
drop trigger if exists trg_student_notifications_push on public.student_notifications;
create trigger trg_student_notifications_push after insert on public.student_notifications
  for each statement execute function public.notify_push_kick();

-- The site's dispatcher takes what has not been pushed yet (last 24 hours).
create or replace function public.notifications_claim_push(p_limit integer default 300)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_p jsonb; v_s jsonb;
begin
  with c as (
    update notifications n set pushed_at = now()
     where n.id in (select id from notifications
                     where pushed_at is null and created_at > now() - interval '1 day'
                     order by created_at limit p_limit for update skip locked)
    returning n.id, n.recipient, n.kind, n.title, n.body, n.url)
  select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) into v_p from c;
  with c as (
    update student_notifications n set pushed_at = now()
     where n.id in (select id from student_notifications
                     where pushed_at is null and created_at > now() - interval '1 day'
                     order by created_at limit p_limit for update skip locked)
    returning n.id, n.student_id, n.type, n.title, n.body, n.tab)
  select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) into v_s from c;
  return jsonb_build_object('profiles', v_p, 'students', v_s);
end
$$;

-- ════════════════════════════════════════════════════════════
-- 3. Events
-- ════════════════════════════════════════════════════════════

-- Money: crm_payments
create or replace function public.notify_on_payment()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_name     text;
  v_amount   text := public.mad_text(new.amount_mad);
  v_paid_now boolean := new.payment_status = 'paid' and coalesce(new.amount_mad, 0) > 0
                        and (tg_op = 'INSERT' or old.payment_status is distinct from 'paid');
begin
  select full_name into v_name from crm_students where id = new.student_id;

  if tg_op = 'INSERT' and new.payment_status = 'pending' and new.declared_by_teacher is not null then
    perform public.notify_staff('payment_pending', '💰 دفعة بانتظار التأكيد',
      format('%s صرّح بدفعة %s من %s.', public.profile_name(new.declared_by_teacher), v_amount, v_name),
      '/sales/dashboard', 'pay-pending:' || new.id);
  end if;

  if v_paid_now then
    if new.teacher_id is not null then
      perform public.notify_profile(new.teacher_id, 'payment', '💰 دفعة جديدة لحصصك',
        format('%s · %s', v_name, v_amount), '/teacher/earnings', 'pay:' || new.id || ':' || new.teacher_id);
    end if;
    perform public.notify_student(new.student_id, 'payment', '✅ تم تأكيد دفعتك',
      format('توصّلنا بدفعتك: %s. شكرًا لك!', v_amount), null, 'pay:' || new.id);
  elsif tg_op = 'UPDATE' and new.payment_status = 'paid' and coalesce(new.amount_mad, 0) > 0
        and new.teacher_id is not null and new.teacher_id is distinct from old.teacher_id then
    -- linked later (by staff, or when the student was assigned)
    perform public.notify_profile(new.teacher_id, 'payment', '💰 دفعة جديدة لحصصك',
      format('%s · %s', v_name, v_amount), '/teacher/earnings', 'pay:' || new.id || ':' || new.teacher_id);
  end if;

  if new.payment_status = 'paid' and coalesce(new.amount_mad, 0) > 0 and new.teacher_id is null
     and (v_paid_now or (tg_op = 'UPDATE' and old.teacher_id is not null))
     and (select count(*) from public.student_teachers(new.student_id)) > 1 then
    perform public.notify_staff('payment_unlinked', '🔗 دفعة غير مربوطة بأستاذ',
      format('%s (%s) يدرس عند أكثر من أستاذ — اختر أستاذ الحصص لهذه الدفعة.', v_name, v_amount),
      '/sales/students/' || new.student_id, 'pay-unlinked:' || new.id);
  end if;
  return null;
end
$$;
drop trigger if exists trg_crm_payments_notify on public.crm_payments;
create trigger trg_crm_payments_notify after insert or update of payment_status, teacher_id on public.crm_payments
  for each row execute function public.notify_on_payment();

-- Money: pay marked paid
create or replace function public.notify_on_payout()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if new.status = 'paid' and (tg_op = 'INSERT' or old.status is distinct from 'paid') then
    perform public.notify_profile(new.payee_id, 'payout', '💵 تم صرف أجرك',
      format('أجر شهر %s: %s', to_char(new.period, 'MM/YYYY'), public.mad_text(new.amount_mad)),
      case when public.is_teacher(new.payee_id) then '/teacher/earnings' else '/sales' end,
      'payout:' || new.id);
  end if;
  return null;
end
$$;
drop trigger if exists trg_staff_payouts_notify on public.staff_payouts;
create trigger trg_staff_payouts_notify after insert or update of status on public.staff_payouts
  for each row execute function public.notify_on_payout();

-- Students: assigned to a teacher
create or replace function public.notify_on_assign()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_name text;
begin
  if new.is_active and (tg_op = 'INSERT' or not old.is_active)
     and new.assigned_by is distinct from new.teacher_id then          -- not the teacher's own addition
    select full_name into v_name from crm_students where id = new.student_id and deleted_at is null;
    if v_name is null then return null; end if;
    perform public.notify_profile(new.teacher_id, 'student_assigned', '👤 طالب جديد مسنَد إليك',
      v_name, '/teacher/students');
    perform public.notify_student(new.student_id, 'info', '👩‍🏫 أستاذك',
      format('تم إسنادك إلى الأستاذ(ة) %s.', public.profile_name(new.teacher_id)));
  end if;
  return null;
end
$$;
drop trigger if exists trg_teacher_students_notify on public.teacher_students;
create trigger trg_teacher_students_notify after insert or update of is_active on public.teacher_students
  for each row execute function public.notify_on_assign();

-- Students: seated in a teacher's class
create or replace function public.notify_on_seat()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_class online_classes; v_name text;
begin
  if new.status = 'active' and (tg_op = 'INSERT' or old.status is distinct from 'active') then
    select * into v_class from online_classes where id = new.class_id;
    if v_class.teacher_id is null or new.created_by is not distinct from v_class.teacher_id then return null; end if;
    select full_name into v_name from crm_students where id = new.student_id and deleted_at is null;
    if v_name is null then return null; end if;
    perform public.notify_profile(v_class.teacher_id, 'student_assigned', '👤 طالب جديد في قسمك',
      format('%s — «%s»', v_name, v_class.title), '/teacher/students');
  end if;
  return null;
end
$$;
drop trigger if exists trg_enrollments_notify on public.online_class_enrollments;
create trigger trg_enrollments_notify after insert or update of status on public.online_class_enrollments
  for each row execute function public.notify_on_seat();

-- Students: a teacher added one (to review)
create or replace function public.notify_on_teacher_student()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if new.review_status = 'pending' and new.origin_teacher_id is not null then
    perform public.notify_staff('student_review', '🆕 طالب جديد بانتظار المراجعة',
      format('%s أضاف الطالب %s.', public.profile_name(new.origin_teacher_id), new.full_name),
      '/sales/dashboard', 'review:' || new.id);
  end if;
  return null;
end
$$;
drop trigger if exists trg_crm_students_notify on public.crm_students;
create trigger trg_crm_students_notify after insert on public.crm_students
  for each row execute function public.notify_on_teacher_student();

-- Students: absent twice in a row (their last two marked sessions)
create or replace function public.notify_on_absence()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_last text[]; v_newest uuid; v_teacher uuid; v_name text;
begin
  if new.status <> 'absent' or (tg_op = 'UPDATE' and old.status = 'absent') then return null; end if;
  select array_agg(x.status order by x.starts_at desc), (array_agg(x.session_id order by x.starts_at desc))[1]
    into v_last, v_newest
  from (select a.status, a.session_id, cs.starts_at from class_attendance a join class_sessions cs on cs.id = a.session_id
         where a.student_id = new.student_id order by cs.starts_at desc limit 2) x;
  if coalesce(array_length(v_last, 1), 0) < 2 or v_last[1] <> 'absent' or v_last[2] <> 'absent' then return null; end if;
  select teacher_id into v_teacher from class_sessions where id = v_newest;
  select full_name into v_name from crm_students where id = new.student_id;
  perform public.notify_profile(v_teacher, 'absence', '⚠️ غياب متكرر',
    format('%s غاب حصتين متتاليتين — تواصل معه.', v_name), '/teacher/students/' || new.student_id,
    'absent2:' || new.student_id || ':' || v_newest);
  perform public.notify_staff('absence', '⚠️ غياب متكرر',
    format('%s غاب حصتين متتاليتين (الأستاذ: %s).', v_name, public.profile_name(v_teacher)),
    '/sales/students/' || new.student_id, 'absent2:' || new.student_id || ':' || v_newest);
  return null;
end
$$;
drop trigger if exists trg_class_attendance_notify on public.class_attendance;
create trigger trg_class_attendance_notify after insert or update of status on public.class_attendance
  for each row execute function public.notify_on_absence();

-- Classes: cancelled or moved
create or replace function public.notify_on_session()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_s uuid; v_when text := public.casa_time_text(new.starts_at);
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    for v_s in select e.student_id from online_class_enrollments e where e.class_id = new.class_id and e.status = 'active' loop
      perform public.notify_student(v_s, 'info', '❌ أُلغيت حصة',
        format('%s — %s%s', new.title, v_when, coalesce(' · السبب: ' || nullif(btrim(new.cancel_reason), ''), '')),
        null, 'cancel:' || new.id);
    end loop;
    if public.is_teacher(auth.uid()) then
      perform public.notify_staff('session_cancelled', '❌ أستاذ ألغى حصة',
        format('%s ألغى «%s» (%s)%s', public.profile_name(new.teacher_id), new.title, v_when,
               coalesce(' · السبب: ' || nullif(btrim(new.cancel_reason), ''), ' · بدون سبب')),
        '/sales/classes', 'cancel:' || new.id);
    end if;
  elsif new.starts_at is distinct from old.starts_at and new.status in ('scheduled', 'live') then
    for v_s in select e.student_id from online_class_enrollments e where e.class_id = new.class_id and e.status = 'active' loop
      perform public.notify_student(v_s, 'info', '🕒 تغيّر موعد الحصة',
        format('%s: الموعد الجديد %s', new.title, v_when), null,
        'moved:' || new.id || ':' || extract(epoch from new.starts_at)::bigint);
    end loop;
  end if;
  return null;
end
$$;
drop trigger if exists trg_class_sessions_notify on public.class_sessions;
create trigger trg_class_sessions_notify after update of status, starts_at on public.class_sessions
  for each row execute function public.notify_on_session();

-- Reports: the academy's note on a month
create or replace function public.notify_on_month_note()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  perform public.notify_profile(new.teacher_id, 'month_note', '📝 ملاحظة الأكاديمية على تقريرك',
    format('شهر %s: %s', to_char(new.period, 'MM/YYYY'), left(new.note, 140)),
    '/teacher/monthly?month=' || to_char(new.period, 'YYYY-MM'), 'note:' || to_char(new.period, 'YYYY-MM'));
  return null;
end
$$;
drop trigger if exists trg_teacher_month_notes_notify on public.teacher_month_notes;
create trigger trg_teacher_month_notes_notify after insert or update of note on public.teacher_month_notes
  for each row execute function public.notify_on_month_note();

-- Daily (the cron): missing lesson reports, and last month's report ready.
create or replace function public.notify_scheduled()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_today  date := (now() at time zone 'Africa/Casablanca')::date;
  v_prev   date := (date_trunc('month', (now() at time zone 'Africa/Casablanca')::date) - interval '1 month')::date;
  v_r      record;
  v_n      integer := 0;
  v_months integer := 0;
begin
  for v_r in
    select cs.id, cs.teacher_id, cs.title, cs.starts_at from class_sessions cs
     where cs.status = 'done' and cs.teacher_id is not null
       and cs.starts_at < now() - interval '1 day' and cs.starts_at > now() - interval '8 days'
       and not exists (select 1 from lesson_reports lr where lr.session_id = cs.id)
  loop
    perform public.notify_profile(v_r.teacher_id, 'report_missing', '📝 تقرير حصة ناقص',
      format('«%s» (%s) بدون تقرير — اكتبه الآن.', v_r.title, public.casa_time_text(v_r.starts_at)),
      '/teacher/reports', 'report:' || v_r.id);
    v_n := v_n + 1;
  end loop;
  if v_n > 0 then
    perform public.notify_staff('report_missing', '📝 حصص بدون تقرير',
      format('%s حصة منجزة بدون تقرير منذ أكثر من يوم.', v_n), '/sales/classes', 'reports:' || v_today);
  end if;

  if extract(day from v_today) <= 3 then
    for v_r in select p.id from profiles p where p.role::text = 'teacher' and not coalesce(p.blocked, false) loop
      perform public.notify_profile(v_r.id, 'month_report', '📊 تقريرك الشهري جاهز',
        format('تقرير شهر %s جاهز — افتحه وحمّله PDF.', to_char(v_prev, 'MM/YYYY')),
        '/teacher/monthly?month=' || to_char(v_prev, 'YYYY-MM'), 'month:' || to_char(v_prev, 'YYYY-MM'));
      v_months := v_months + 1;
    end loop;
    perform public.notify_staff('month_report', '📊 تقارير الأساتذة جاهزة',
      format('تقارير شهر %s جاهزة لكل الأساتذة.', to_char(v_prev, 'MM/YYYY')),
      '/sales/teachers', 'month:' || to_char(v_prev, 'YYYY-MM'));
  end if;
  return jsonb_build_object('missing_reports', v_n, 'month_reports', v_months);
end
$$;

-- ════════════════════════════════════════════════════════════
-- 4. Reading
-- ════════════════════════════════════════════════════════════

create or replace function public.notifications_mark_read(p_ids uuid[] default null)
returns integer language plpgsql security definer set search_path to 'public' as $$
declare v_n integer;
begin
  update notifications set read_at = now()
   where recipient = auth.uid() and read_at is null and (p_ids is null or id = any(p_ids));
  get diagnostics v_n = row_count;
  return v_n;
end
$$;

-- ════════════════════════════════════════════════════════════
-- 5. Sending (targeted)
-- ════════════════════════════════════════════════════════════

create or replace function public.staff_send_notification(
  p_title text, p_body text,
  p_teachers uuid[] default '{}', p_students uuid[] default '{}',
  p_students_of_teacher uuid default null, p_students_of_class uuid default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_me       uuid := auth.uid();
  v_title    text := left(btrim(coalesce(p_title, '')), 120);
  v_body     text := left(btrim(coalesce(p_body, '')), 1000);
  v_teachers uuid[];
  v_students uuid[];
  v_msg      uuid;
  v_role     text;
begin
  perform public.require_staff();
  if v_title = '' then raise exception 'Write a title'; end if;

  select coalesce(array_agg(distinct p.id), '{}') into v_teachers
    from profiles p where p.id = any(coalesce(p_teachers, '{}')) and p.role::text = 'teacher';
  select coalesce(array_agg(distinct x.id), '{}') into v_students from (
    select s.id from crm_students s where s.id = any(coalesce(p_students, '{}')) and s.deleted_at is null
    union select r.student_id from public.teacher_roster(p_students_of_teacher) r where p_students_of_teacher is not null
    union select e.student_id from online_class_enrollments e join crm_students s on s.id = e.student_id and s.deleted_at is null
           where e.class_id = p_students_of_class and e.status = 'active'
  ) x;
  if cardinality(v_teachers) + cardinality(v_students) = 0 then raise exception 'Choose at least one recipient'; end if;
  if cardinality(v_teachers) + cardinality(v_students) > 500 then raise exception 'Too many recipients (500 max)'; end if;

  v_role := case when public.is_founder(v_me) then 'founder' else 'assistant' end;
  insert into notification_messages (sender_profile, sender_role, sender_name, title, body, recipients, recipient_count)
  values (v_me, v_role, public.profile_name(v_me), v_title, nullif(v_body, ''),
    (select coalesce(jsonb_agg(jsonb_build_object('kind', 'teacher', 'id', t, 'name', public.profile_name(t))), '[]'::jsonb) from unnest(v_teachers) t)
    || (select coalesce(jsonb_agg(jsonb_build_object('kind', 'student', 'id', s.id, 'name', s.full_name)), '[]'::jsonb)
          from crm_students s where s.id = any(v_students)),
    cardinality(v_teachers) + cardinality(v_students))
  returning id into v_msg;

  insert into notifications (recipient, kind, title, body, url, message_id)
  select t, 'message', v_title, nullif(v_body, ''), '/teacher/notifications', v_msg from unnest(v_teachers) t;
  insert into student_notifications (student_id, type, title, body, sender_profile, message_id)
  select s, 'message', v_title, nullif(v_body, ''), v_me, v_msg from unnest(v_students) s;

  return jsonb_build_object('message_id', v_msg, 'teachers', cardinality(v_teachers), 'students', cardinality(v_students));
end
$$;

create or replace function public.teacher_send_notification(
  p_title text, p_body text, p_students uuid[] default '{}', p_class uuid default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_me       uuid := auth.uid();
  v_title    text := left(btrim(coalesce(p_title, '')), 120);
  v_body     text := left(btrim(coalesce(p_body, '')), 1000);
  v_students uuid[];
  v_msg      uuid;
begin
  if not public.is_teacher(v_me) then raise exception 'Teachers only' using errcode = '42501'; end if;
  if v_title = '' then raise exception 'Write a title'; end if;
  if exists (select 1 from unnest(coalesce(p_students, '{}')) s
              where s not in (select r.student_id from public.teacher_roster(v_me) r)) then
    raise exception 'This student is not one of yours' using errcode = '42501';
  end if;
  if p_class is not null and not exists (select 1 from online_classes c where c.id = p_class and c.teacher_id = v_me) then
    raise exception 'Not your class' using errcode = '42501';
  end if;
  select coalesce(array_agg(distinct x), '{}') into v_students from (
    select unnest(coalesce(p_students, '{}')) x
    union select e.student_id from online_class_enrollments e where e.class_id = p_class and e.status = 'active'
  ) y;
  if cardinality(v_students) = 0 then raise exception 'Choose at least one recipient'; end if;
  if (select count(*) from notification_messages where sender_profile = v_me and created_at > now() - interval '1 day') >= 30 then
    raise exception 'Daily limit reached (30 messages)';
  end if;

  insert into notification_messages (sender_profile, sender_role, sender_name, title, body, recipients, recipient_count)
  values (v_me, 'teacher', public.profile_name(v_me), v_title, nullif(v_body, ''),
    (select coalesce(jsonb_agg(jsonb_build_object('kind', 'student', 'id', s.id, 'name', s.full_name)), '[]'::jsonb)
       from crm_students s where s.id = any(v_students)),
    cardinality(v_students))
  returning id into v_msg;

  insert into student_notifications (student_id, type, title, body, sender_profile, message_id)
  select s, 'message', format('%s · %s', public.profile_name(v_me), v_title), nullif(v_body, ''), v_me, v_msg
    from unnest(v_students) s;

  return jsonb_build_object('message_id', v_msg, 'students', cardinality(v_students));
end
$$;

-- The student's teachers, for "message my teacher".
create or replace function public.student_my_teachers(p_token text)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v_id uuid;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return '[]'::jsonb; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', t, 'name', public.profile_name(t)) order by public.profile_name(t))
                     from public.student_teachers(v_id) t), '[]'::jsonb);
end
$$;

create or replace function public.student_send_notification(p_token text, p_body text, p_teacher uuid default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  v_id    uuid;
  v_name  text;
  v_body  text := left(btrim(coalesce(p_body, '')), 1000);
  v_title text;
  v_msg   uuid;
begin
  select id, full_name into v_id, v_name from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then raise exception 'Not signed in' using errcode = '42501'; end if;
  if v_body = '' then raise exception 'Write your message'; end if;
  if p_teacher is not null and not exists (select 1 from public.student_teachers(v_id) t where t = p_teacher) then
    raise exception 'Not your teacher' using errcode = '42501';
  end if;
  if (select count(*) from notification_messages where sender_student = v_id and created_at > now() - interval '1 day') >= 10 then
    raise exception 'Daily limit reached (10 messages)';
  end if;

  v_title := format('✉️ رسالة من %s', v_name);
  insert into notification_messages (sender_student, sender_role, sender_name, title, body, recipients, recipient_count)
  values (v_id, 'student', v_name, v_title, v_body,
    case when p_teacher is not null
         then jsonb_build_array(jsonb_build_object('kind', 'teacher', 'id', p_teacher, 'name', public.profile_name(p_teacher)))
         else jsonb_build_array(jsonb_build_object('kind', 'staff', 'id', null, 'name', 'الأكاديمية')) end,
    case when p_teacher is not null then 1 else (select count(*) from profiles p where public.is_crm_staff(p.id))::int end)
  returning id into v_msg;

  if p_teacher is not null then
    perform public.notify_profile(p_teacher, 'message', v_title, v_body, '/teacher/notifications', null, v_msg);
  else
    perform public.notify_staff('message', v_title, v_body, '/sales/notifications', null, v_msg);
  end if;
  return jsonb_build_object('message_id', v_msg);
end
$$;

-- ════════════════════════════════════════════════════════════
-- 6. Who may call what
-- ════════════════════════════════════════════════════════════

do $$
declare f text;
begin
  foreach f in array array[
    'public.notify_profile(uuid,text,text,text,text,text,uuid)',
    'public.notify_staff(text,text,text,text,text,uuid)',
    'public.notify_student(uuid,text,text,text,text,text,uuid,uuid)',
    'public.notify_push_kick()', 'public.notify_on_payment()', 'public.notify_on_payout()',
    'public.notify_on_assign()', 'public.notify_on_seat()', 'public.notify_on_teacher_student()',
    'public.notify_on_absence()', 'public.notify_on_session()', 'public.notify_on_month_note()',
    'public.notifications_claim_push(integer)', 'public.notify_scheduled()',
    'public.profile_name(uuid)']
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
  end loop;
  foreach f in array array['public.notifications_claim_push(integer)', 'public.notify_scheduled()'] loop
    execute format('grant execute on function %s to service_role', f);
  end loop;
  foreach f in array array[
    'public.notifications_mark_read(uuid[])',
    'public.staff_send_notification(text,text,uuid[],uuid[],uuid,uuid)',
    'public.teacher_send_notification(text,text,uuid[],uuid)']
  loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated, service_role', f);
  end loop;
  -- Students use the portal token, like every other student_* function.
  foreach f in array array['public.student_my_teachers(text)', 'public.student_send_notification(text,text,uuid)'] loop
    execute format('grant execute on function %s to anon, authenticated, service_role', f);
  end loop;
end $$;
