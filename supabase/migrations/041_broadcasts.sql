-- ════════════════════════════════════════════════════════════════════════
-- 041: WhatsApp broadcasts — send one message to a filtered audience
--
-- The CRM "Broadcast" page resolves an audience from crm_students +
-- subscription_leads (by level, subscription date, payment status, …) and then
-- either
--   • sends automatically through the Meta WhatsApp Cloud API (channel
--     'cloud_api') when WHATSAPP_TOKEN + WHATSAPP_PHONE_ID are set, or
--   • hands back a click-to-chat queue of wa.me links (channel 'click_to_chat')
--     that the team presses send on, one by one.
--
-- This table is the audit log: who broadcast what, to whom, and how it went.
-- Rows are written server-side with the service-role key; staff read them for
-- the history panel.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.crm_broadcasts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id) on delete set null,
  created_by_email text,

  audience    text not null,                       -- students | leads | both
  filters     jsonb not null default '{}'::jsonb,  -- the exact filter set used
  message     text,                                -- the composed body ({{name}} un-rendered)
  template    text,                                -- Cloud API template name (null for click-to-chat)
  channel     text not null,                       -- cloud_api | click_to_chat

  total       integer not null default 0,          -- recipients resolved
  sent        integer not null default 0,          -- accepted by Meta
  failed      integer not null default 0,
  failures    jsonb not null default '[]'::jsonb   -- [{name, phone, error}] (capped)
);

comment on table public.crm_broadcasts is 'Audit log of WhatsApp broadcasts sent from the CRM.';

create index if not exists crm_broadcasts_created_at_idx on public.crm_broadcasts (created_at desc);

alter table public.crm_broadcasts enable row level security;

-- Staff-only. (The API route writes with the service-role key, which bypasses
-- RLS; these policies are what let the CRM page read the history.)
drop policy if exists "staff read broadcasts"   on public.crm_broadcasts;
drop policy if exists "staff insert broadcasts" on public.crm_broadcasts;

create policy "staff read broadcasts"
  on public.crm_broadcasts for select
  using (is_crm_staff(auth.uid()));

create policy "staff insert broadcasts"
  on public.crm_broadcasts for insert
  with check (is_crm_staff(auth.uid()));
