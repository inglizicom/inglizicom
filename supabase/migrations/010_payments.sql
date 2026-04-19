-- Phase 2: manual payment with receipt upload
-- User uploads a bank-transfer receipt, admin approves, which extends
-- the user's paid plan. Schema designed so a future Stripe webhook can
-- write rows with method='stripe' and external_id set, without changing
-- the receipt flow.

create table if not exists public.payments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  method            text not null default 'receipt'
                      check (method in ('receipt','stripe')),
  external_id       text,  -- Stripe charge/payment_intent id later
  plan_requested    text not null,        -- plan catalog id, e.g. 'paid-3m'
  amount            numeric(10,2) not null,
  currency          text not null default 'MAD',
  duration_months   integer not null default 1,
  receipt_path      text,  -- storage object key under payment-receipts bucket
  status            text not null default 'pending'
                      check (status in ('pending','approved','declined')),
  decline_reason    text,
  user_note         text,
  reviewed_by       uuid references auth.users(id) on delete set null,
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists payments_user_idx   on public.payments (user_id, created_at desc);
create index if not exists payments_status_idx on public.payments (status, created_at desc);

alter table public.payments enable row level security;

drop policy if exists payments_owner_read   on public.payments;
drop policy if exists payments_owner_insert on public.payments;
drop policy if exists payments_admin_all    on public.payments;

create policy payments_owner_read on public.payments
  for select using (auth.uid() = user_id);

-- User can insert only their own pending rows via receipt method
create policy payments_owner_insert on public.payments
  for insert with check (
    auth.uid() = user_id
    and method = 'receipt'
    and status = 'pending'
  );

create policy payments_admin_all on public.payments
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Storage: private bucket for receipts
insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

drop policy if exists "receipts_owner_upload"    on storage.objects;
drop policy if exists "receipts_owner_read"      on storage.objects;
drop policy if exists "receipts_admin_read_all"  on storage.objects;

-- Paths are "<user_id>/<payment_id>.<ext>". Owner can upload under their prefix.
create policy "receipts_owner_upload" on storage.objects
  for insert
  with check (
    bucket_id = 'payment-receipts'
    and auth.uid()::text = split_part(name, '/', 1)
  );

create policy "receipts_owner_read" on storage.objects
  for select
  using (
    bucket_id = 'payment-receipts'
    and auth.uid()::text = split_part(name, '/', 1)
  );

create policy "receipts_admin_read_all" on storage.objects
  for all
  using (
    bucket_id = 'payment-receipts'
    and public.is_admin(auth.uid())
  )
  with check (
    bucket_id = 'payment-receipts'
    and public.is_admin(auth.uid())
  );

-- Admin approval bumps the user's plan. Triggered when status flips to 'approved'.
create or replace function public.apply_payment_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_expiry timestamptz;
  base_from      timestamptz;
  new_expiry     timestamptz;
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    select plan_expires_at into current_expiry
      from public.profiles where id = new.user_id;
    -- Extend from existing expiry if still in the future, else from now
    base_from  := case when current_expiry > now() then current_expiry else now() end;
    new_expiry := base_from + (new.duration_months || ' months')::interval;

    update public.profiles
       set plan            = 'paid',
           plan_expires_at = new_expiry
     where id = new.user_id;

    new.reviewed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists on_payment_approve on public.payments;
create trigger on_payment_approve
  before update on public.payments
  for each row execute function public.apply_payment_approval();
