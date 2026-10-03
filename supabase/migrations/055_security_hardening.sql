-- 055_security_hardening.sql
-- Closes the gaps the Supabase security advisor and a review of every function
-- callable without a login turned up. Nothing here changes what a legitimate
-- caller sees; it removes what an illegitimate one could do.
--
--   1. convert_lead_to_student  — had no permission check and was callable by
--      anyone: knowing a lead id (a visitor knows their own) was enough to
--      create a CRM student marked "paid". Now staff only, and the actor is
--      always the caller (it could be set to anyone before).
--   2. log_lead_event           — anyone could write into a lead's timeline.
--      Now staff only.
--   3. leaderboard_weekly       — a SECURITY DEFINER view (advisor: ERROR):
--      any logged-in account could read every student's weekly points. It now
--      runs with the caller's rights, so coin_transactions' staff-only policy
--      applies. student_leaderboard_weekly() is SECURITY DEFINER and keeps
--      reading it for students exactly as before.
--   4. search_path pinned on 16 functions (advisor: function_search_path_mutable).
--      None of them calls an extension function, so 'public' is enough.
--   5. EXECUTE revoked from anon on staff-only and trigger functions. The
--      functions still guard themselves; this is the second lock. Trigger
--      functions keep firing — Postgres checks EXECUTE when a trigger is
--      created, not when it fires. Helpers used inside RLS policies
--      (is_admin, is_teacher, is_crm_staff, is_founder, teacher_can_*,
--      current_profile_id) are deliberately left callable: a policy runs as
--      the querying role, and revoking them would turn "no rows" into errors.
--
-- Re-running this file is a no-op.

-- ════════════════════════════════════════════════════════════
-- 1. convert_lead_to_student — staff only, actor is the caller
-- ════════════════════════════════════════════════════════════

create or replace function public.convert_lead_to_student(p_lead_id uuid, p_actor_id uuid default auth.uid())
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare
  v_actor   uuid := auth.uid();
  v_lead    record;
  v_student uuid;
begin
  -- p_actor_id is kept for callers that pass it, but never trusted.
  if not public.is_crm_staff(v_actor) then
    raise exception 'Only staff can convert a lead to a student';
  end if;
  select * into v_lead from public.subscription_leads where id = p_lead_id;
  if not found then raise exception 'Lead % not found', p_lead_id; end if;
  select id into v_student from public.crm_students where lead_id = p_lead_id;
  if v_student is not null then return v_student; end if;
  insert into public.crm_students
    (lead_id, full_name, phone_number, course, student_type, payment_status, added_by_id, country)
  values
    (p_lead_id, v_lead.full_name, v_lead.phone, coalesce(v_lead.course, v_lead.course_interested),
     case when v_lead.lead_type = 'private_class' then 'private_student' else 'course_student' end,
     'paid', v_actor, v_lead.country)
  returning id into v_student;
  insert into public.crm_lead_events (lead_id, actor_id, actor_email, event_type, title)
  values (p_lead_id, v_actor,
    (select email from public.profiles where id = v_actor),
    'converted_to_student', 'Lead converted to student');
  return v_student;
end;
$$;

-- ════════════════════════════════════════════════════════════
-- 2. log_lead_event — staff only
-- ════════════════════════════════════════════════════════════

create or replace function public.log_lead_event(
  p_lead_id uuid, p_event_type text, p_title text,
  p_body text default null, p_before jsonb default null, p_after jsonb default null)
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_id    uuid;
begin
  if not public.is_crm_staff(v_actor) then
    raise exception 'Only staff can write to a lead timeline';
  end if;
  select email into v_email from public.profiles where id = v_actor;
  insert into public.crm_lead_events
    (lead_id, actor_id, actor_email, event_type, title, body, before_value, after_value)
  values (p_lead_id, v_actor, v_email, p_event_type, p_title, p_body, p_before, p_after)
  returning id into v_id;
  return v_id;
end;
$$;

-- ════════════════════════════════════════════════════════════
-- 3. leaderboard_weekly — caller's rights
-- ════════════════════════════════════════════════════════════

alter view public.leaderboard_weekly set (security_invoker = true);

-- ════════════════════════════════════════════════════════════
-- 4 + 5. search_path, and EXECUTE for anon
-- ════════════════════════════════════════════════════════════

do $$
declare
  f text;
  pinned text[] := array[
    'public.set_updated_at()', 'public.set_updated_at_support_threads()', 'public.set_updated_at_course_meta()',
    'public.set_updated_at_teachers()', 'public.lms_enrollments_touch()', 'public.auto_create_receipt()',
    'public.casa_day_start(date)', 'public.casa_date(timestamp with time zone)', 'public.casa_now_trunc(text)',
    'public.enrollment_covers(text,timestamp with time zone,timestamp with time zone)',
    'public.mask_phone(text)', 'public._norm(text)', 'public.lms_quiz_question_count(jsonb)',
    'public.log_crm_activity(text,text,uuid,jsonb,jsonb,jsonb)'];
  -- Staff / founder / teacher functions: a logged-out caller has no use for them.
  staff_only text[] := array[
    'public.convert_lead_to_student(uuid,uuid)', 'public.log_lead_event(uuid,text,text,text,jsonb,jsonb)',
    'public.log_crm_activity(text,text,uuid,jsonb,jsonb,jsonb)', 'public.apply_path_template(uuid,uuid,uuid)',
    'public.owner_overview()', 'public.owner_revenue_trend()', 'public.owner_team()', 'public.owner_students()',
    'public.owner_courses()', 'public.owner_alerts()', 'public.teacher_profile_full(uuid)'];
  -- Trigger functions: never called directly.
  triggers text[] := array[
    'public.apply_payment_approval()', 'public.auto_create_receipt()', 'public.bump_support_thread()',
    'public.crm_student_autopayment()', 'public.handle_new_user()', 'public.log_absence_to_crm()',
    'public.refresh_teacher_rating()', 'public.guard_teacher_profile_fields()'];
begin
  foreach f in array pinned loop
    if to_regprocedure(f) is not null then
      execute format('alter function %s set search_path = public', f);
    end if;
  end loop;

  foreach f in array staff_only loop
    if to_regprocedure(f) is not null then
      execute format('revoke execute on function %s from public, anon', f);
      execute format('grant execute on function %s to authenticated, service_role', f);
    end if;
  end loop;

  foreach f in array triggers loop
    if to_regprocedure(f) is not null then
      execute format('revoke execute on function %s from public, anon', f);
    end if;
  end loop;
end $$;
