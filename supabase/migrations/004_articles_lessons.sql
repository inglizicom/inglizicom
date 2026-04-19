-- ─── Articles ────────────────────────────────────────────────────────────────
create table if not exists public.articles (
  id              uuid        primary key default gen_random_uuid(),
  slug            text        unique not null,
  title           text        not null,
  excerpt         text        not null default '',
  content         jsonb       not null default '[]'::jsonb,
  category        text        not null default '',
  category_color  text        not null default '#3b82f6',
  tags            jsonb       not null default '[]'::jsonb,
  read_time       text        not null default '5 د',
  date            text        not null default '',
  img             text        not null default '',
  featured        boolean     not null default false,
  author          text        not null default '',
  status          text        not null default 'published',
  sort_order      int         not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists articles_status_sort_idx
  on public.articles (status, sort_order desc);

-- ─── Lessons ─────────────────────────────────────────────────────────────────
-- id is text to preserve the existing journey unit IDs (greetings, food, etc.)
create table if not exists public.lessons (
  id          text        primary key,
  title       text        not null,
  title_ar    text        not null,
  level       text        not null default 'A1',
  emoji       text        not null default '📚',
  color       text        not null default '#3b82f6',
  vocab       jsonb       not null default '[]'::jsonb,
  sentences   jsonb       not null default '[]'::jsonb,
  "natural"   jsonb       not null default '[]'::jsonb,
  dialogue    jsonb       not null default '[]'::jsonb,
  exercises   jsonb       not null default '[]'::jsonb,
  status      text        not null default 'published',
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists lessons_status_sort_idx
  on public.lessons (status, sort_order);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.articles enable row level security;
alter table public.lessons  enable row level security;

drop policy if exists "articles_public_read"  on public.articles;
drop policy if exists "articles_admin_write"  on public.articles;
drop policy if exists "lessons_public_read"   on public.lessons;
drop policy if exists "lessons_admin_write"   on public.lessons;

create policy "articles_public_read"
  on public.articles for select
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "articles_admin_write"
  on public.articles for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "lessons_public_read"
  on public.lessons for select
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "lessons_admin_write"
  on public.lessons for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists articles_updated_at on public.articles;
create trigger articles_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

drop trigger if exists lessons_updated_at on public.lessons;
create trigger lessons_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();
