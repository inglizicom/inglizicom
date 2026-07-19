-- 036_lead_country.sql
-- GCC expansion: capture visitor country (ISO-3166 alpha-2, from Vercel's
-- x-vercel-ip-country header) on website leads, and carry it onto the student
-- when a lead converts.

alter table public.subscription_leads add column if not exists country text;
alter table public.crm_students       add column if not exists country text;

create or replace function public.convert_lead_to_student(p_lead_id uuid, p_actor_id uuid default auth.uid())
returns uuid
language plpgsql
security definer
as $function$
declare
  v_lead    record;
  v_student uuid;
begin
  select * into v_lead from public.subscription_leads where id = p_lead_id;
  if not found then raise exception 'Lead % not found', p_lead_id; end if;
  select id into v_student from public.crm_students where lead_id = p_lead_id;
  if v_student is not null then return v_student; end if;
  insert into public.crm_students
    (lead_id, full_name, phone_number, course, student_type, payment_status, added_by_id, country)
  values
    (p_lead_id, v_lead.full_name, v_lead.phone, coalesce(v_lead.course, v_lead.course_interested),
     case when v_lead.lead_type = 'private_class' then 'private_student' else 'course_student' end,
     'paid', p_actor_id, v_lead.country)
  returning id into v_student;
  insert into public.crm_lead_events (lead_id, actor_id, actor_email, event_type, title)
  values (p_lead_id, p_actor_id,
    (select email from public.profiles where id = p_actor_id),
    'converted_to_student', 'Lead converted to student');
  return v_student;
end; $function$;
