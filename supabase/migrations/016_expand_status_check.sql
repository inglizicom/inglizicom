-- Migration 016: Expand subscription_leads status check constraint
--
-- The original constraint (migration 011) only allowed:
--   'new' | 'contacted' | 'converted' | 'rejected'
--
-- The CRM now uses a full sales funnel. Drop the old constraint and
-- replace it with one that covers all current + legacy values.

alter table public.subscription_leads
  drop constraint if exists subscription_leads_status_check;

alter table public.subscription_leads
  add constraint subscription_leads_status_check
    check (status in (
      'new',
      'contacted',
      'interested',
      'follow_up',
      'confirmed',
      'paid',
      'delayed',
      'cancelled',
      'vip',
      'converted',   -- legacy alias for paid
      'rejected'     -- legacy alias for cancelled
    ));
