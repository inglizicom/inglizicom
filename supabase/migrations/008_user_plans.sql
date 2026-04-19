-- Phase 3: admin user console
-- Adds subscription plan + block flag to profiles. No payments table yet —
-- admin sets plan manually after receipt verification.

alter table public.profiles
  add column if not exists plan            text        not null default 'free'
    check (plan in ('free','paid')),
  add column if not exists plan_expires_at timestamptz,
  add column if not exists plan_note       text,
  add column if not exists blocked         boolean     not null default false;

create index if not exists profiles_plan_idx
  on public.profiles (plan, plan_expires_at);

-- Convenience view: public.profiles already covered by existing RLS.
-- Admin write access is already granted via profiles_admin_update policy
-- from migration 002.
