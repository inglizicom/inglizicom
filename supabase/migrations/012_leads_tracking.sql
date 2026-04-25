-- Extend subscription_leads to support the WhatsApp-first conversion funnel:
--   - source / utm / referrer / device / page_path for attribution
--   - goal + plan_interest for lead qualification
--   - test_score + recommended_plan for level-test leads
-- Also relax phone + city: the new 4-field form doesn't collect them (user
-- messages us on WhatsApp — we don't need their phone to start the chat).

alter table public.subscription_leads
  alter column phone drop not null,
  alter column city  drop not null;

alter table public.subscription_leads
  add column if not exists source            text,
  add column if not exists goal              text,
  add column if not exists plan_interest     text,
  add column if not exists test_score        integer,
  add column if not exists recommended_plan  text,
  add column if not exists utm_source        text,
  add column if not exists utm_medium        text,
  add column if not exists utm_campaign      text,
  add column if not exists referrer          text,
  add column if not exists device            text,
  add column if not exists page_path         text;

create index if not exists subscription_leads_source_idx
  on public.subscription_leads (source, created_at desc);
