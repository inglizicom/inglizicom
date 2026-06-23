-- 033_language_functions.sql
-- Move the A1/A2 Language Functions teaching content (opinions, agreeing/
-- disagreeing, suggestions, likes & preferences) out of the bundled source file
-- (src/data/functions.ts) and into the DB so the CRM/founder can edit it.
-- Staff-only RLS (same pattern as vocab_words). The bundled file stays as the
-- offline fallback the deck uses when the table is empty/unreachable.
create table if not exists public.language_functions (
  id          text primary key,
  title       text not null,
  ar          text not null default '',
  emoji       text not null default '',
  intro       text not null default '',                 -- Arabic one-line teaching note
  groups      jsonb not null default '[]'::jsonb,        -- [{label, ar, lines:[{en,ar}]}]
  examples    jsonb not null default '[]'::jsonb,        -- [{q:{en,ar}, a:{en,ar}}]
  sort_order  int not null default 0,
  is_published boolean not null default true,
  updated_at  timestamptz not null default now()
);

alter table public.language_functions enable row level security;
drop policy if exists language_functions_staff on public.language_functions;
create policy language_functions_staff on public.language_functions
  for all using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));

-- seed (generated from src/data/functions.ts) --
insert into public.language_functions
  (id, title, ar, emoji, intro, groups, examples, sort_order) values
  ('opinions', 'Expressing opinions', 'التعبير عن الرأي', '💭', 'نسأل عن رأي الآخرين ونُعطي رأينا بأدب.', '[{"label":"Ask for an opinion","ar":"اسأل عن الرأي","lines":[{"en":"What do you think?","ar":"ما رأيك؟"},{"en":"What do you think about …?","ar":"ما رأيك في …؟"},{"en":"How about you?","ar":"وأنت؟ / ماذا عنك؟"},{"en":"Do you like it?","ar":"هل يعجبك؟"}]},{"label":"Give an opinion","ar":"أعطِ رأيك","lines":[{"en":"I think (that) …","ar":"أعتقد أنّ …"},{"en":"In my opinion, …","ar":"في رأيي، …"},{"en":"I believe …","ar":"أؤمن بأنّ …"},{"en":"For me, …","ar":"بالنسبة لي، …"}]}]'::jsonb, '[{"q":{"en":"What do you think about this restaurant?","ar":"ما رأيك في هذا المطعم؟"},"a":{"en":"I think it’s really good.","ar":"أعتقد أنه جيد جداً."}},{"q":{"en":"How about you?","ar":"وأنت؟"},"a":{"en":"In my opinion, it’s a little expensive.","ar":"في رأيي، إنه غالٍ قليلاً."}}]'::jsonb, 0),
  ('agree-disagree', 'Agreeing & disagreeing', 'الموافقة والاعتراض', '🤝', 'نوافق أو نعترض بطريقة مهذّبة.', '[{"label":"Agree","ar":"الموافقة","lines":[{"en":"I agree.","ar":"أوافق."},{"en":"You’re right.","ar":"أنت محق."},{"en":"That’s true.","ar":"هذا صحيح."},{"en":"Me too.","ar":"وأنا كذلك."}]},{"label":"Disagree (politely)","ar":"الاعتراض بأدب","lines":[{"en":"I don’t think so.","ar":"لا أعتقد ذلك."},{"en":"I disagree.","ar":"لا أوافق."},{"en":"I’m not sure.","ar":"لست متأكداً."},{"en":"I see your point, but …","ar":"أفهم وجهة نظرك، لكن …"}]}]'::jsonb, '[{"q":{"en":"English is easy.","ar":"الإنجليزية سهلة."},"a":{"en":"I agree. It’s fun too!","ar":"أوافق. وهي ممتعة أيضاً!"}},{"q":{"en":"Coffee is better than tea.","ar":"القهوة أفضل من الشاي."},"a":{"en":"I see your point, but I prefer tea.","ar":"أفهم وجهة نظرك، لكنني أفضّل الشاي."}}]'::jsonb, 1),
  ('suggestions', 'Making suggestions', 'تقديم الاقتراحات', '💡', 'نقترح فكرة ونردّ على اقتراحات الآخرين.', '[{"label":"Make a suggestion","ar":"اقترح","lines":[{"en":"Let’s …","ar":"لنفعل … / هيا …"},{"en":"How about …?","ar":"ما رأيك بـ …؟"},{"en":"Why don’t we …?","ar":"لماذا لا …؟"},{"en":"We could …","ar":"يمكننا أن …"}]},{"label":"Respond","ar":"الردّ","lines":[{"en":"Good idea!","ar":"فكرة جيدة!"},{"en":"Sounds great.","ar":"يبدو رائعاً."},{"en":"Sorry, I can’t.","ar":"آسف، لا أستطيع."},{"en":"Maybe later.","ar":"ربما لاحقاً."}]}]'::jsonb, '[{"q":{"en":"Let’s go to the park.","ar":"لنذهب إلى الحديقة."},"a":{"en":"Good idea! Let’s go.","ar":"فكرة جيدة! هيا بنا."}},{"q":{"en":"How about a coffee?","ar":"ما رأيك بقهوة؟"},"a":{"en":"Sorry, I can’t. Maybe later.","ar":"آسف، لا أستطيع. ربما لاحقاً."}}]'::jsonb, 2),
  ('preferences', 'Likes & preferences', 'الإعجاب والتفضيل', '❤️', 'نتحدّث عمّا نحبّ ونفضّل.', '[{"label":"Likes / dislikes","ar":"الإعجاب والنفور","lines":[{"en":"I like …","ar":"أحبّ …"},{"en":"I love …","ar":"أعشق …"},{"en":"I don’t like …","ar":"لا أحبّ …"},{"en":"I hate …","ar":"أكره …"}]},{"label":"Preferences","ar":"التفضيل","lines":[{"en":"I prefer … (to …)","ar":"أفضّل … (على …)"},{"en":"I’d rather …","ar":"أفضّل أن …"},{"en":"My favourite … is …","ar":"المفضّل لديّ … هو …"}]}]'::jsonb, '[{"q":{"en":"Do you like tea or coffee?","ar":"هل تحبّ الشاي أم القهوة؟"},"a":{"en":"I prefer coffee.","ar":"أفضّل القهوة."}},{"q":{"en":"What’s your favourite food?","ar":"ما طعامك المفضّل؟"},"a":{"en":"My favourite food is couscous.","ar":"طعامي المفضّل هو الكسكس."}}]'::jsonb, 3)
on conflict (id) do nothing;
