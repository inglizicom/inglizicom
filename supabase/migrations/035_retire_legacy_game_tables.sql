-- 035_retire_legacy_game_tables.sql
-- The public island-game and Listen pages were removed from the site
-- (redirected to mofradati.com / /level-test), so their tables no longer need
-- any public access. Data is kept; access becomes staff-only + service role.

drop policy if exists "attempts_public_select" on public.attempts;
drop policy if exists "attempts_public_insert" on public.attempts;
drop policy if exists "progress_public_select" on public.progress;
drop policy if exists "progress_public_insert" on public.progress;
drop policy if exists "progress_public_update" on public.progress;
drop policy if exists "Public read published" on public.content_items;
