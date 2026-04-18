-- Add category + sort_order for grouping in admin UI
alter table public.feature_access
  add column if not exists category   text not null default 'other',
  add column if not exists sort_order int  not null default 0;

-- Allow public to read all features (already public, just re-asserting)
-- Drop the legacy seed row from migration 002 (replaced by per-city rows)
delete from public.feature_access where slug = 'map.cities_past_first';

-- ─── Pages ────────────────────────────────────────────────────────────────────
insert into public.feature_access (slug, label_ar, category, requires_auth, sort_order) values
  ('page.corrector',  'صفحة المصحح بالذكاء الاصطناعي', 'pages', true,  10),
  ('page.practice',   'صفحة التدريب',                    'pages', true,  20),
  ('page.listen',     'صفحة الاستماع',                   'pages', false, 30),
  ('page.exams',      'صفحة الامتحانات',                 'pages', true,  40),
  ('page.play',       'صفحة الألعاب',                    'pages', false, 50),
  ('page.live',       'صفحة البث المباشر',               'pages', false, 60),
  ('page.learn',      'صفحة التعلم',                     'pages', false, 70),
  ('page.level-test', 'اختبار المستوى',                  'pages', false, 80),
  ('page.a0',         'مستوى A0',                        'pages', false, 90),
  ('page.a1',         'مستوى A1',                        'pages', true, 100)
on conflict (slug) do update set
  label_ar   = excluded.label_ar,
  category   = excluded.category,
  sort_order = excluded.sort_order;

-- ─── Map cities (in journey order) ────────────────────────────────────────────
insert into public.feature_access (slug, label_ar, category, requires_auth, sort_order) values
  ('map.city.oued-zem',    'واد زم',         'cities', false,  10),
  ('map.city.khouribga',   'خريبكة',         'cities', true,   20),
  ('map.city.beni-mellal', 'بني ملال',       'cities', true,   30),
  ('map.city.settat',      'سطات',           'cities', true,   40),
  ('map.city.el-jadida',   'الجديدة',        'cities', true,   50),
  ('map.city.mohammedia',  'المحمدية',       'cities', true,   60),
  ('map.city.casablanca',  'الدار البيضاء',  'cities', true,   70),
  ('map.city.rabat',       'الرباط',         'cities', true,   80),
  ('map.city.sale',        'سلا',            'cities', true,   90),
  ('map.city.kenitra',     'القنيطرة',       'cities', true,  100),
  ('map.city.fes',         'فاس',            'cities', true,  110),
  ('map.city.meknes',      'مكناس',          'cities', true,  120),
  ('map.city.ifrane',      'إفران',          'cities', true,  130),
  ('map.city.tangier',     'طنجة',           'cities', true,  140),
  ('map.city.marrakech',   'مراكش',          'cities', true,  150),
  ('map.city.agadir',      'أكادير',         'cities', true,  160)
on conflict (slug) do update set
  label_ar   = excluded.label_ar,
  category   = excluded.category,
  sort_order = excluded.sort_order;

-- ─── Courses ──────────────────────────────────────────────────────────────────
insert into public.feature_access (slug, label_ar, category, requires_auth, sort_order) values
  ('course.a0-a1', 'كورس A0 → A1', 'courses', false, 10),
  ('course.a1-a2', 'كورس A1 → A2', 'courses', true,  20),
  ('course.a2-b1', 'كورس A2 → B1', 'courses', true,  30),
  ('course.b1-b2', 'كورس B1 → B2', 'courses', true,  40)
on conflict (slug) do update set
  label_ar   = excluded.label_ar,
  category   = excluded.category,
  sort_order = excluded.sort_order;
