-- Profiles table: one row per auth user, auto-created on signup
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  full_name    text,
  avatar_url   text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Feature-access config: admin controls which features are locked
create table if not exists public.feature_access (
  slug             text primary key,
  label_ar         text not null,
  requires_auth    boolean not null default false,
  requires_paid    boolean not null default false,
  updated_at       timestamptz not null default now()
);

-- Seed the map-city gate (first city open, rest require auth)
insert into public.feature_access (slug, label_ar, requires_auth)
values ('map.cities_past_first', 'خريطة الرحلة — المدن بعد الأولى', true)
on conflict (slug) do nothing;

-- Auto-create a profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- SECURITY DEFINER helper avoids infinite recursion in RLS policies
-- (a policy that does `select from profiles` re-triggers itself otherwise).
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

-- Row-level security
alter table public.profiles       enable row level security;
alter table public.feature_access enable row level security;

drop policy if exists "profiles_self_read"     on public.profiles;
drop policy if exists "profiles_self_update"   on public.profiles;
drop policy if exists "profiles_admin_read"    on public.profiles;
drop policy if exists "profiles_admin_update"  on public.profiles;

create policy "profiles_self_read"
  on public.profiles for select using (auth.uid() = id);

create policy "profiles_self_update"
  on public.profiles for update using (auth.uid() = id);

create policy "profiles_admin_read"
  on public.profiles for select using (public.is_admin(auth.uid()));

create policy "profiles_admin_update"
  on public.profiles for update using (public.is_admin(auth.uid()));

-- Feature access: public read, admin-only write
drop policy if exists "feature_access_public_read" on public.feature_access;
drop policy if exists "feature_access_admin_write" on public.feature_access;

create policy "feature_access_public_read"
  on public.feature_access for select
  using (true);

create policy "feature_access_admin_write"
  on public.feature_access for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
