-- 063_lead_channels.sql
-- Which platform brings the students: leads → students → revenue per channel.
--
--   subscription_leads.landing_path   the first page the visitor opened (the
--                                     site now remembers the source for 30
--                                     days, lib/first-touch.ts)
--   lead_channel(utm, referrer, source, page_path)
--       instagram · tiktok · facebook · whatsapp · youtube · search · ai ·
--       referral · other · direct. A website lead is classified by its UTM
--       tags (the short links inglizi.com/ig, /tt … add them) and referrer;
--       a lead staff typed in (no web signals) by the source they chose.
--   staff_channel_report(from, to)
--       per channel: leads (and how many came through the site), the
--       students they became — linked by lead_id or, since most conversions
--       were never linked, by the same phone number — the paying ones, and
--       what those students paid. A student who sent several forms counts
--       once, for their earliest lead.
--
-- Re-running this file is a no-op.

alter table public.subscription_leads add column if not exists landing_path text;

create or replace function public.lead_channel(p_utm text, p_ref text, p_source text, p_page text)
returns text language sql immutable set search_path to 'public' as $$
  select case
    -- typed in by staff: no web signal at all → the source they picked
    when coalesce(p_utm, '') = '' and coalesce(p_ref, '') = '' and coalesce(p_page, '') = '' then
      case lower(coalesce(p_source, ''))
        when 'instagram' then 'instagram' when 'tiktok' then 'tiktok' when 'facebook' then 'facebook'
        when 'whatsapp' then 'whatsapp' when 'youtube' then 'youtube' when 'referral' then 'referral'
        when 'google' then 'search'
        else 'other' end
    when lower(coalesce(p_utm, '')) in ('ig', 'insta', 'instagram') or p_ref ~* 'instagram\.' then 'instagram'
    when lower(coalesce(p_utm, '')) in ('tt', 'tiktok') or p_ref ~* 'tiktok\.' then 'tiktok'
    when lower(coalesce(p_utm, '')) in ('fb', 'facebook', 'meta') or p_ref ~* 'facebook\.com|fb\.me|fb\.com' then 'facebook'
    when lower(coalesce(p_utm, '')) in ('wa', 'whatsapp') or p_ref ~* 'wa\.me|whatsapp|l\.wl\.co' then 'whatsapp'
    when lower(coalesce(p_utm, '')) in ('yt', 'youtube') or p_ref ~* 'youtube\.com|youtu\.be' then 'youtube'
    when lower(coalesce(p_utm, '')) ~ 'chatgpt|openai|perplexity|gemini|copilot'
      or p_ref ~* 'chatgpt|openai|perplexity|gemini\.google|copilot' then 'ai'
    when lower(coalesce(p_utm, '')) in ('google', 'bing') or p_ref ~* 'google\.|googlequicksearchbox|bing\.com|duckduckgo|yahoo\.' then 'search'
    when coalesce(p_utm, '') <> '' or coalesce(p_ref, '') <> '' then 'other'
    else 'direct' end
$$;

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
