-- ============================================================
-- Conversational English Learning System
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT    NOT NULL,
  title_ar    TEXT    NOT NULL,
  level       TEXT    NOT NULL DEFAULT 'A1',
  emoji       TEXT    NOT NULL DEFAULT '📚',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vocabulary table (3 words per lesson)
CREATE TABLE IF NOT EXISTS vocabulary (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id       UUID REFERENCES lessons(id) ON DELETE CASCADE,
  word            TEXT NOT NULL,
  translation_ar  TEXT NOT NULL,
  emoji           TEXT NOT NULL DEFAULT '📝',
  order_index     INT  DEFAULT 0
);

-- 3. Conversation lines (all lesson content)
-- type: 'simple' | 'natural' | 'dialogue' | 'fill_blank' | 'translation'
CREATE TABLE IF NOT EXISTS conversation_lines (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id     UUID REFERENCES lessons(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  english       TEXT NOT NULL,
  arabic        TEXT,
  speaker       TEXT,       -- 'A' or 'B' (for dialogue type)
  blank_word    TEXT,       -- missing word (for fill_blank type)
  options       JSONB,      -- answer choices (for fill_blank / translation)
  correct_index INT,        -- index into options (for fill_blank / translation)
  order_index   INT DEFAULT 0
);

-- Row Level Security (read-only public access)
ALTER TABLE lessons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary        ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_lines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lessons' AND policyname='Public read lessons') THEN
    CREATE POLICY "Public read lessons" ON lessons FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vocabulary' AND policyname='Public read vocabulary') THEN
    CREATE POLICY "Public read vocabulary" ON vocabulary FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='conversation_lines' AND policyname='Public read conversation_lines') THEN
    CREATE POLICY "Public read conversation_lines" ON conversation_lines FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================================
-- SEED DATA — 3 Sample Lessons
-- ============================================================

-- ── Lesson 1: At the Coffee Shop ───────────────────────────

INSERT INTO lessons (id, title, title_ar, level, emoji) VALUES
  ('11111111-0000-0000-0000-000000000001', 'At the Coffee Shop', 'في المقهى', 'A1', '☕');

INSERT INTO vocabulary (lesson_id, word, translation_ar, emoji, order_index) VALUES
  ('11111111-0000-0000-0000-000000000001', 'order',   'يطلب',    '🛒', 0),
  ('11111111-0000-0000-0000-000000000001', 'ready',   'جاهز',    '✅', 1),
  ('11111111-0000-0000-0000-000000000001', 'wait',    'ينتظر',   '⏳', 2);

INSERT INTO conversation_lines (lesson_id, type, english, arabic, order_index) VALUES
  -- simple sentences
  ('11111111-0000-0000-0000-000000000001', 'simple', 'I want to order coffee.',      'أريد أن أطلب قهوة.',        0),
  ('11111111-0000-0000-0000-000000000001', 'simple', 'Your order is ready.',         'طلبك جاهز.',                1),
  ('11111111-0000-0000-0000-000000000001', 'simple', 'Please wait a moment.',        'من فضلك انتظر لحظة.',       2),
  -- natural sentences
  ('11111111-0000-0000-0000-000000000001', 'natural', 'Can I order a large coffee, please?',   'هل يمكنني طلب قهوة كبيرة من فضلك؟',  0),
  ('11111111-0000-0000-0000-000000000001', 'natural', 'Your order will be ready in 5 minutes.','طلبك سيكون جاهزاً في 5 دقائق.',       1),
  ('11111111-0000-0000-0000-000000000001', 'natural', 'I''ll wait here, no problem.',           'سأنتظر هنا، لا مشكلة.',               2);

INSERT INTO conversation_lines (lesson_id, type, english, arabic, speaker, order_index) VALUES
  -- dialogue
  ('11111111-0000-0000-0000-000000000001', 'dialogue', 'Hi! Can I take your order?',         'مرحباً! هل يمكنني أخذ طلبك؟',   'A', 0),
  ('11111111-0000-0000-0000-000000000001', 'dialogue', 'Yes, I''d like a coffee please.',     'نعم، أريد قهوة من فضلك.',        'B', 1),
  ('11111111-0000-0000-0000-000000000001', 'dialogue', 'Perfect! It''ll be ready in 2 minutes.', 'ممتاز! ستكون جاهزة في دقيقتين.', 'A', 2);

INSERT INTO conversation_lines (lesson_id, type, english, arabic, blank_word, options, correct_index, order_index) VALUES
  -- fill_blank (english has ___ for the missing word)
  ('11111111-0000-0000-0000-000000000001', 'fill_blank', 'I want to ___ a coffee.',       'أريد أن أطلب قهوة.',      'order', '["order","make","drink","find"]', 0, 0),
  ('11111111-0000-0000-0000-000000000001', 'fill_blank', 'Your coffee is ___ now.',        'قهوتك جاهزة الآن.',       'ready', '["cold","ready","here","big"]',  1, 1),
  ('11111111-0000-0000-0000-000000000001', 'fill_blank', 'Please ___ here for a minute.', 'من فضلك انتظر هنا دقيقة.','wait',  '["go","wait","sit","come"]',    1, 2);

INSERT INTO conversation_lines (lesson_id, type, english, arabic, options, correct_index, order_index) VALUES
  -- translation (pick correct arabic)
  ('11111111-0000-0000-0000-000000000001', 'translation', 'I want to order coffee.',    'أريد أن أطلب قهوة.',   '["أريد أن أطلب قهوة.","أريد أن أنتظر.","طلبك جاهز."]',           0, 0),
  ('11111111-0000-0000-0000-000000000001', 'translation', 'Your order is ready.',       'طلبك جاهز.',           '["سأنتظر هنا.","من فضلك انتظر.","طلبك جاهز."]',                   2, 1),
  ('11111111-0000-0000-0000-000000000001', 'translation', 'Please wait a moment.',      'من فضلك انتظر لحظة.', '["طلبك سيكون جاهزاً.","من فضلك انتظر لحظة.","هل يمكنني الطلب؟"]', 1, 2);

-- ── Lesson 2: Morning Routine ──────────────────────────────

INSERT INTO lessons (id, title, title_ar, level, emoji) VALUES
  ('22222222-0000-0000-0000-000000000002', 'Morning Routine', 'الروتين الصباحي', 'A1', '🌅');

INSERT INTO vocabulary (lesson_id, word, translation_ar, emoji, order_index) VALUES
  ('22222222-0000-0000-0000-000000000002', 'wake up',    'يستيقظ',  '⏰', 0),
  ('22222222-0000-0000-0000-000000000002', 'breakfast',  'الفطور',  '🥐', 1),
  ('22222222-0000-0000-0000-000000000002', 'ready',      'جاهز',    '✅', 2);

INSERT INTO conversation_lines (lesson_id, type, english, arabic, order_index) VALUES
  ('22222222-0000-0000-0000-000000000002', 'simple', 'I wake up at 7.',               'أستيقظ في الساعة 7.',          0),
  ('22222222-0000-0000-0000-000000000002', 'simple', 'I eat breakfast every morning.','آكل الفطور كل صباح.',          1),
  ('22222222-0000-0000-0000-000000000002', 'simple', 'I am ready for the day.',       'أنا جاهز لهذا اليوم.',         2),
  ('22222222-0000-0000-0000-000000000002', 'natural', 'I usually wake up at 6:30 AM.',            'عادةً أستيقظ في الساعة 6:30 صباحاً.',  0),
  ('22222222-0000-0000-0000-000000000002', 'natural', 'Breakfast is my favorite meal of the day.', 'الفطور هو وجبتي المفضلة في اليوم.',    1),
  ('22222222-0000-0000-0000-000000000002', 'natural', 'I''m not ready to go yet, give me 5 minutes.','لست جاهزاً للذهاب بعد، أعطني 5 دقائق.', 2);

INSERT INTO conversation_lines (lesson_id, type, english, arabic, speaker, order_index) VALUES
  ('22222222-0000-0000-0000-000000000002', 'dialogue', 'Did you wake up early today?',     'هل استيقظت مبكراً اليوم؟',  'A', 0),
  ('22222222-0000-0000-0000-000000000002', 'dialogue', 'Yes! I had breakfast too.',        'نعم! وأكلت الفطور أيضاً.',  'B', 1),
  ('22222222-0000-0000-0000-000000000002', 'dialogue', 'Great, you''re ready then!',       'رائع، أنت جاهز إذن!',       'A', 2);

INSERT INTO conversation_lines (lesson_id, type, english, arabic, blank_word, options, correct_index, order_index) VALUES
  ('22222222-0000-0000-0000-000000000002', 'fill_blank', 'I ___ at 7 every morning.',         'أستيقظ في الساعة 7 كل صباح.',  'wake up',   '["wake up","sit down","go out","come back"]', 0, 0),
  ('22222222-0000-0000-0000-000000000002', 'fill_blank', 'I eat ___ before work.',            'آكل الفطور قبل العمل.',         'breakfast', '["lunch","dinner","breakfast","snacks"]',     2, 1),
  ('22222222-0000-0000-0000-000000000002', 'fill_blank', 'Are you ___ to go?',                'هل أنت جاهز للذهاب؟',           'ready',     '["tired","ready","late","busy"]',             1, 2);

INSERT INTO conversation_lines (lesson_id, type, english, arabic, options, correct_index, order_index) VALUES
  ('22222222-0000-0000-0000-000000000002', 'translation', 'I wake up at 7.',              'أستيقظ في الساعة 7.',  '["آكل الفطور.","أنا جاهز.","أستيقظ في الساعة 7."]', 2, 0),
  ('22222222-0000-0000-0000-000000000002', 'translation', 'I eat breakfast every morning.','آكل الفطور كل صباح.', '["آكل الفطور كل صباح.","أستيقظ مبكراً.","أنا جاهز."]', 0, 1),
  ('22222222-0000-0000-0000-000000000002', 'translation', 'I am ready for the day.',      'أنا جاهز لهذا اليوم.','["الفطور وجبتي المفضلة.","أنا جاهز لهذا اليوم.","استيقظت مبكراً."]', 1, 2);

-- ── Lesson 3: At the Store (A2) ────────────────────────────

INSERT INTO lessons (id, title, title_ar, level, emoji) VALUES
  ('33333333-0000-0000-0000-000000000003', 'At the Store', 'في المتجر', 'A2', '🛍️');

INSERT INTO vocabulary (lesson_id, word, translation_ar, emoji, order_index) VALUES
  ('33333333-0000-0000-0000-000000000003', 'buy',   'يشتري',  '🛒', 0),
  ('33333333-0000-0000-0000-000000000003', 'price', 'السعر',  '💰', 1),
  ('33333333-0000-0000-0000-000000000003', 'cheap', 'رخيص',   '🏷️', 2);

INSERT INTO conversation_lines (lesson_id, type, english, arabic, order_index) VALUES
  ('33333333-0000-0000-0000-000000000003', 'simple', 'I want to buy this.',          'أريد أن أشتري هذا.',      0),
  ('33333333-0000-0000-0000-000000000003', 'simple', 'What is the price?',           'ما هو السعر؟',            1),
  ('33333333-0000-0000-0000-000000000003', 'simple', 'This is very cheap.',          'هذا رخيص جداً.',          2),
  ('33333333-0000-0000-0000-000000000003', 'natural', 'I''m looking to buy a new phone.',         'أبحث عن شراء هاتف جديد.',        0),
  ('33333333-0000-0000-0000-000000000003', 'natural', 'What''s the best price you can give me?', 'ما هو أفضل سعر يمكنك تقديمه لي؟', 1),
  ('33333333-0000-0000-0000-000000000003', 'natural', 'That''s actually pretty cheap for quality.', 'هذا رخيص جداً مقابل الجودة في الواقع.', 2);

INSERT INTO conversation_lines (lesson_id, type, english, arabic, speaker, order_index) VALUES
  ('33333333-0000-0000-0000-000000000003', 'dialogue', 'Can I help you?',                  'هل يمكنني مساعدتك؟',         'A', 0),
  ('33333333-0000-0000-0000-000000000003', 'dialogue', 'Yes, I want to buy this bag. What''s the price?', 'نعم، أريد شراء هذه الحقيبة. ما السعر؟', 'B', 1),
  ('33333333-0000-0000-0000-000000000003', 'dialogue', 'It''s only $15 — very cheap!',     'إنها 15$ فقط — رخيصة جداً!', 'A', 2);

INSERT INTO conversation_lines (lesson_id, type, english, arabic, blank_word, options, correct_index, order_index) VALUES
  ('33333333-0000-0000-0000-000000000003', 'fill_blank', 'I want to ___ this shirt.',   'أريد أن أشتري هذا القميص.', 'buy',   '["buy","sell","make","use"]',    0, 0),
  ('33333333-0000-0000-0000-000000000003', 'fill_blank', 'What is the ___ of this?',    'ما هو سعر هذا؟',             'price', '["color","name","price","size"]', 2, 1),
  ('33333333-0000-0000-0000-000000000003', 'fill_blank', 'This phone is very ___.',     'هذا الهاتف رخيص جداً.',      'cheap', '["new","cheap","old","big"]',    1, 2);

INSERT INTO conversation_lines (lesson_id, type, english, arabic, options, correct_index, order_index) VALUES
  ('33333333-0000-0000-0000-000000000003', 'translation', 'I want to buy this.',   'أريد أن أشتري هذا.',  '["أريد أن أشتري هذا.","ما هو السعر؟","هذا رخيص جداً."]',    0, 0),
  ('33333333-0000-0000-0000-000000000003', 'translation', 'What is the price?',    'ما هو السعر؟',         '["أريد المساعدة.","ما هو السعر؟","هذا غالي."]',              1, 1),
  ('33333333-0000-0000-0000-000000000003', 'translation', 'This is very cheap.',   'هذا رخيص جداً.',       '["هذا رخيص جداً.","السعر مرتفع.","أريد أن أشتري."]',        0, 2);
