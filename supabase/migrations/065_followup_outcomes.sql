-- 065_followup_outcomes.sql
-- The follow-up queue (lib/lead-queue.ts) records one outcome per contact
-- (no answer · interested · will pay · paid · not interested). The status
-- alone can't tell "rang, nobody picked up" from "talked", so:
--
--   subscription_leads.last_outcome      the latest outcome
--   subscription_leads.contact_attempts  how many contacts were logged
--   staff_followup_report(from, to)      results of the follow-up work in a
--                                        period (Morocco days): new leads,
--                                        leads contacted, attempts, each
--                                        lead's latest outcome, who did it
--
-- Outcome events are crm_lead_events rows of type 'contacted'. Newer ones
-- carry after_value.outcome; the first ones (before this file) only have
-- the Arabic title, which starts with the outcome's label.
--
-- Re-running this file is a no-op.

alter table public.subscription_leads add column if not exists last_outcome text;
alter table public.subscription_leads add column if not exists contact_attempts integer not null default 0;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'subscription_leads_last_outcome_check') then
    alter table public.subscription_leads add constraint subscription_leads_last_outcome_check
      check (last_outcome is null or last_outcome in ('no_answer', 'interested', 'will_pay', 'paid', 'lost'));
  end if;
end $$;

create or replace function public.lead_event_outcome(p_after jsonb, p_title text)
returns text language sql immutable set search_path to 'public' as $$
  select coalesce(
    nullif(p_after ->> 'outcome', ''),
    nullif(p_after ->> 'last_outcome', ''),
    case
      when p_title like 'لم يرد%'   then 'no_answer'
      when p_title like 'مهتم%'     then 'interested'
      when p_title like 'وافق%'     then 'will_pay'
      when p_title like 'غير مهتم%' then 'lost'
      when p_title like 'دفع%'      then 'paid'
    end)
$$;

-- Backfill from the outcome events already logged (only rows not set yet).
update public.subscription_leads l
   set last_outcome = x.outcome
  from (select distinct on (lead_id) lead_id, public.lead_event_outcome(after_value, title) as outcome
          from public.crm_lead_events
         where event_type = 'contacted'
         order by lead_id, created_at desc) x
 where x.lead_id = l.id and l.last_outcome is null and x.outcome is not null;

update public.subscription_leads l
   set contact_attempts = x.n
  from (select lead_id, count(*)::int as n from public.crm_lead_events
         where event_type = 'contacted' group by lead_id) x
 where x.lead_id = l.id and l.contact_attempts = 0;

create or replace function public.staff_followup_report(p_from date default null, p_to date default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_from date := coalesce(p_from, date '2000-01-01');
  v_to   date := coalesce(p_to, (now() at time zone 'Africa/Casablanca')::date);
  v      jsonb;
begin
  perform public.require_staff();
  with
  real_leads as (
    select l.id, l.created_at from subscription_leads l
     where l.deleted_at is null and coalesce(l.plan_id, '') not in ('test_completed', 'inquiry')
  ),
  ev as (
    select e.lead_id, e.actor_id, e.created_at, public.lead_event_outcome(e.after_value, e.title) as outcome
      from crm_lead_events e join real_leads r on r.id = e.lead_id
     where e.event_type = 'contacted'
       and (e.created_at at time zone 'Africa/Casablanca')::date between v_from and v_to
  ),
  last_ev as (                                      -- each lead's latest outcome in the period
    select distinct on (lead_id) lead_id, outcome from ev order by lead_id, created_at desc
  ),
  new_in as (
    select id from real_leads where (created_at at time zone 'Africa/Casablanca')::date between v_from and v_to
  )
  select jsonb_build_object(
    'from', v_from, 'to', v_to,
    'new_leads',       (select count(*) from new_in),
    'new_waiting',     (select count(*) from new_in n
                         where not exists (select 1 from crm_lead_events e where e.lead_id = n.id and e.event_type = 'contacted')),
    'contacted_leads', (select count(*) from last_ev),
    'attempts',        (select count(*) from ev),
    'outcomes', jsonb_build_object(
      'no_answer',  (select count(*) from last_ev where outcome = 'no_answer'),
      'interested', (select count(*) from last_ev where outcome = 'interested'),
      'will_pay',   (select count(*) from last_ev where outcome = 'will_pay'),
      'paid',       (select count(*) from last_ev where outcome = 'paid'),
      'lost',       (select count(*) from last_ev where outcome = 'lost')),
    'by_staff', coalesce((
      select jsonb_agg(jsonb_build_object('staff_id', s.actor_id, 'name', coalesce(p.full_name, p.email, '—'),
                                          'attempts', s.attempts, 'leads', s.leads) order by s.attempts desc)
        from (select actor_id, count(*)::int as attempts, count(distinct lead_id)::int as leads
                from ev where actor_id is not null group by actor_id) s
        left join profiles p on p.id = s.actor_id), '[]'::jsonb)
  ) into v;
  return v;
end;
$$;

do $$ begin
  execute 'revoke execute on function public.staff_followup_report(date,date) from public, anon';
  execute 'grant execute on function public.staff_followup_report(date,date) to authenticated, service_role';
end $$;
