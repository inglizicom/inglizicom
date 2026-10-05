-- 064_channel_report_real_leads.sql
-- staff_channel_report (063) counted every subscription_leads row, but rows
-- with plan_id 'test_completed' (a finished level test, no phone) and
-- 'inquiry' are not leads: the CRM leads page already hides them
-- (lib/leads-db NON_LEAD_PLAN_IDS). In production they were 234 of 471 rows,
-- which inflated "leads" — mostly "direct" — and halved conversion.
-- Same function, now restricted to real leads.
--
-- Re-running this file is a no-op.

create or replace function public.staff_channel_report(p_from date default null, p_to date default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_from date := coalesce(p_from, date '2000-01-01');
  v_to   date := coalesce(p_to, (now() at time zone 'Africa/Casablanca')::date);
  v      jsonb;
begin
  perform public.require_staff();
  with
  leads as (
    select l.id, l.created_at, public.phone_key(l.phone) as pk,
           public.lead_channel(l.utm_source, l.referrer, coalesce(l.lead_source, l.source), l.page_path) as channel,
           (coalesce(l.page_path, '') <> '' or coalesce(l.utm_source, '') <> '' or coalesce(l.referrer, '') <> '') as from_site
    from subscription_leads l
    where l.deleted_at is null
      and coalesce(l.plan_id, '') not in ('test_completed', 'inquiry')
      and (l.created_at at time zone 'Africa/Casablanca')::date between v_from and v_to
  ),
  matched as (
    select ld.id as lead_id, ld.created_at, ld.channel, s.id as student_id
    from leads ld
    join lateral (
      select s.id from crm_students s
       where s.deleted_at is null
         and (s.lead_id = ld.id or (ld.pk is not null and length(ld.pk) >= 9 and public.phone_key(s.phone_number) = ld.pk))
       order by (s.lead_id = ld.id) desc, s.created_at
       limit 1
    ) s on true
  ),
  students as (                                   -- each student once, for their earliest lead
    select distinct on (student_id) student_id, channel
    from matched order by student_id, created_at
  ),
  paid as (
    select st.student_id, st.channel,
           coalesce(sum(p.amount_mad) filter (where p.payment_status = 'paid' and p.amount_mad > 0
                                               and not coalesce(p.excluded_from_revenue, false)), 0) as revenue
    from students st left join crm_payments p on p.student_id = st.student_id
    group by st.student_id, st.channel
  ),
  per_channel as (
    select c.channel,
           (select count(*) from leads where leads.channel = c.channel)::int as leads,
           (select count(*) from leads where leads.channel = c.channel and from_site)::int as from_site,
           (select count(*) from paid where paid.channel = c.channel)::int as students,
           (select count(*) from paid where paid.channel = c.channel and revenue > 0)::int as paying,
           (select coalesce(sum(revenue), 0) from paid where paid.channel = c.channel) as revenue
    from (select distinct channel from leads) c
  )
  select coalesce(jsonb_agg(row_to_json(per_channel) order by revenue desc, leads desc), '[]'::jsonb) into v from per_channel;
  return jsonb_build_object('from', v_from, 'to', v_to, 'channels', v);
end;
$$;

do $$ begin
  execute 'revoke execute on function public.staff_channel_report(date,date) from public, anon';
  execute 'grant execute on function public.staff_channel_report(date,date) to authenticated, service_role';
end $$;
