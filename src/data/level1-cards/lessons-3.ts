import { call, kemelni, ratebni, sahehni, tarjemni, timer } from './build.ts'

/** Lessons 14–19 (the book's second edition): drinks, transport, the town, there is / are, can, hobbies. */
export const LESSONS_3 = [
  /* ── 14 · Drinks ───────────────────────────────────────────────── */
  call(14, '🍵', 'أتاي', 'Mint tea', "My favourite drink? It's mint tea."),
  call(14, '🥑', 'عصير أفوكا', 'Avocado juice', 'Can I have an avocado juice?'),
  timer(14, '🥤', 30, 'Name 5 drinks!', 'اذكر خمسة مشروبات!',
    ['water', 'mint tea', 'coffee', 'milk', 'orange juice', 'apple juice', 'lemonade', 'hot chocolate', 'smoothie', 'milkshake', 'fizzy drink', 'sparkling water', 'iced coffee', 'green tea', 'avocado juice', 'herbal tea'],
    ['nous-nous', 'banana milkshake', 'almond milk']),
  tarjemni(14, 'كأس ماء من فضلك.', 'A glass of water, please.'),
  ratebni(14, ['coffee', 'do', 'How', 'your', 'you', 'like'], 'How do you like your coffee?', 'كيف تحب قهوتك؟'),
  sahehni(14, 'Can I have a orange juice?', 'Can I have an orange juice?', 'هل يمكنني الحصول على عصير برتقال؟', ['a orange', 'an orange'], 'قبل الحرف المتحرك نقول: an'),
  kemelni(14, 'answer', 'Would you like a drink?', 'هل تريد مشروبًا؟', 'Yes, please. A glass of water.', 'نعم من فضلك، كأس ماء.', 'نقبل أيضًا: No, thank you.'),
  kemelni(14, 'question', 'With milk and no sugar.', 'بالحليب وبدون سكر.', 'How do you like your coffee?', 'كيف تحب قهوتك؟'),
  kemelni(14, 'next', 'A fresh orange juice, please.', 'عصير برتقال طازج، من فضلك.', 'Large or small?', 'كبير أم صغير؟', 'نقبل أيضًا: Anything else?'),

  /* ── 15 · Transport & this / that ──────────────────────────────── */
  call(15, '🚊', 'ترامواي', 'A tram', 'I go to work by tram.'),
  call(15, '🚚', 'شاحنة', 'A lorry', "That's a lorry."),
  timer(15, '🚦', 30, 'Name 6 ways to travel!', 'اذكر ست وسائل نقل!',
    ['bicycle', 'motorbike', 'car', 'bus', 'taxi', 'van', 'lorry', 'train', 'tram', 'plane', 'helicopter', 'boat', 'ship', 'scooter', 'metro', 'on foot'],
    ['grand taxi', 'horse cart']),
  tarjemni(15, 'هذه مفاتيحي.', 'These are my keys.'),
  ratebni(15, ['go', 'work', 'How', 'you', 'do', 'to'], 'How do you go to work?', 'كيف تذهب إلى العمل؟'),
  sahehni(15, 'I go to school by foot.', 'I go to school on foot.', 'أذهب إلى المدرسة مشيًا.', ['by foot', 'on foot'], 'نقول: by bus / on foot'),
  kemelni(15, 'answer', "What's that? ✈️ (far)", 'ما ذلك؟ (بعيد)', "That's a plane.", 'تلك طائرة.', "نقبل أيضًا: It's a plane."),
  kemelni(15, 'question', 'These plates are 80 dirhams each.', 'هذه الصحون بثمانين درهمًا للواحد.', 'How much are these plates?', 'بكم هذه الصحون؟'),
  kemelni(15, 'next', "This is a tagine. It's for cooking.", 'هذا طاجين. إنه للطبخ.', "And what's that?", 'وما ذلك؟', 'أي سؤال: What are these?'),

  /* ── 16 · The town & directions ────────────────────────────────── */
  call(16, '💊', 'صيدلية', 'A pharmacy', 'Where is the nearest pharmacy?'),
  call(16, '🔄', 'الدوّار', 'The roundabout', 'Turn right at the roundabout.'),
  timer(16, '🏙️', 30, 'Name 6 places in your town!', 'اذكر ستة أماكن في مدينتك!',
    ['bank', 'mosque', 'hospital', 'bakery', 'supermarket', 'school', 'park', 'pharmacy', 'petrol station', 'post office', 'police station', 'bus station', 'library', 'hotel', 'cinema', 'café'],
    ['medina', 'souk', 'hammam', 'train station']),
  tarjemni(16, 'امشِ إلى الأمام ثم انعطف يمينًا.', 'Go straight on, then turn right.'),
  ratebni(16, ['get to', 'do', 'how', 'I', 'the station', 'Excuse me,'], 'Excuse me, how do I get to the station?', 'عذرًا، كيف أصل إلى المحطة؟'),
  sahehni(16, 'The bank is next the post office.', 'The bank is next to the post office.', 'البنك بجانب مكتب البريد.', ['next', 'next to']),
  kemelni(16, 'answer', 'Is it far?', 'هل هو بعيد؟', "No, it's about five minutes on foot.", 'لا، حوالي خمس دقائق مشيًا.', "نقبل أيضًا: Yes, it's far. Take a taxi."),
  kemelni(16, 'question', "It's on the corner, opposite the bank.", 'إنها في الزاوية، مقابل البنك.', 'Where is the nearest pharmacy?', 'أين أقرب صيدلية؟', 'أي سؤال يبدأ بـ: Where is…'),
  kemelni(16, 'next', 'Excuse me, is there a post office near here?', 'عذرًا، هل يوجد مكتب بريد قريب من هنا؟', 'Yes, there is. Go straight on.', 'نعم، يوجد. امشِ إلى الأمام.'),

  /* ── 17 · There is / there are ─────────────────────────────────── */
  call(17, '🏊', 'مسبح', 'A swimming pool', 'There is a swimming pool!'),
  call(17, '🚏', 'موقف الحافلات', 'A bus stop', 'There is a bus stop in front of my building.'),
  timer(17, '🏘️', 30, 'Say 4 things in your neighbourhood!', 'قل أربعة أشياء موجودة في حيّك!',
    ['There is a park.', 'There is a market.', 'There is a mosque.', 'There are many shops.', 'There is a bus stop.', 'There are two cafés.'], ['There is a hammam.', 'There is a bakery.']),
  tarjemni(17, 'هل يوجد مقهى قريب من هنا؟', 'Is there a café near here?'),
  ratebni(17, ['there', 'parks', 'How many', 'are'], 'How many parks are there?', 'كم حديقة توجد؟', 20),
  sahehni(17, 'There is two cafés near the school.', 'There are two cafés near the school.', 'يوجد مقهيان قرب المدرسة.', ['is', 'are'], 'مع الجمع نقول: There are'),
  kemelni(17, 'answer', 'Is there a gym near here?', 'هل توجد قاعة رياضة قريبة؟', 'Yes, there is.', 'نعم، توجد.', "نقبل أيضًا: No, there isn't."),
  kemelni(17, 'question', 'There are three shops and a small market.', 'توجد ثلاثة محلات وسوق صغير.', 'Are there any shops?', 'هل توجد محلات؟'),
  kemelni(17, 'next', 'I love it! There is a big park near my flat.', 'أحبه! توجد حديقة كبيرة قرب شقتي.', 'Is there a gym?', 'هل توجد قاعة رياضة؟', 'أي سؤال يبدأ بـ: Is there / Are there'),

  /* ── 18 · Action verbs, jobs & can ─────────────────────────────── */
  call(18, '🎸', 'القيثارة', 'The guitar', 'Can you play the guitar?'),
  call(18, '🏊', 'يسبح', 'Swim', 'Yes, I can swim very well.'),
  timer(18, '👷', 30, 'Name 5 jobs!', 'اذكر خمس مهن!',
    ['doctor', 'teacher', 'chef', 'police officer', 'mechanic', 'hairdresser', 'programmer', 'farmer', 'nurse', 'pilot', 'firefighter', 'scientist', 'artist', 'factory worker', 'businessman', 'judge'],
    ['baker', 'butcher', 'tailor', 'taxi driver']),
  tarjemni(18, 'هل تستطيع أن تطبخ؟', 'Can you cook?'),
  ratebni(18, ['drive', 'She', 'a bus', "can't"], "She can't drive a bus.", 'لا تستطيع أن تسوق حافلة.', 20),
  sahehni(18, 'I can to swim.', 'I can swim.', 'أستطيع أن أسبح.', ['can to swim', 'can swim'], 'بعدها نضع الفعل مباشرة: I can swim'),
  kemelni(18, 'answer', 'Can your sister drive?', 'هل تستطيع أختك أن تسوق؟', "Yes, she can. She's a taxi driver!", 'نعم. إنها سائقة طاكسي!', "نقبل أيضًا: No, she can't."),
  kemelni(18, 'question', "No, I can't. But I can sing!", 'لا، لا أستطيع. لكنني أستطيع الغناء!', 'Can you play the guitar?', 'هل تستطيع العزف على القيثارة؟', 'أي سؤال يبدأ بـ: Can you…'),
  kemelni(18, 'next', 'Yes, I can swim very well.', 'نعم، أسبح جيدًا جدًا.', "Let's go to the pool on Sunday!", 'لنذهب إلى المسبح يوم الأحد!', 'نقبل أيضًا: Can you dance?'),

  /* ── 19 · Hobbies & like + -ing ────────────────────────────────── */
  call(19, '📷', 'التصوير', 'Taking photos', 'I like cycling and taking photos.'),
  call(19, '🎣', 'الصيد', 'Fishing', 'My dad likes fishing.'),
  timer(19, '🎨', 30, 'Name 5 hobbies!', 'اذكر خمس هوايات!',
    ['reading', 'swimming', 'cooking', 'drawing', 'singing', 'dancing', 'running', 'cycling', 'hiking', 'camping', 'fishing', 'gardening', 'taking photos', 'playing chess', 'playing video games', 'travelling'],
    ['playing football', 'baking', 'knitting']),
  tarjemni(19, 'أمي تحب البستنة.', 'My mum likes gardening.'),
  ratebni(19, ['in your free time', 'doing', 'do', 'you', 'What', 'like'], 'What do you like doing in your free time?', 'ماذا تحب أن تفعل في وقت فراغك؟'),
  sahehni(19, 'She likes cook.', 'She likes cooking.', 'تحب الطبخ.', ['cook', 'cooking'], 'بعد فعل الحب نضيف للفعل: like cooking'),
  kemelni(19, 'answer', 'Does your brother like cycling?', 'هل يحب أخوك ركوب الدراجة؟', "No, he doesn't. He likes video games.", 'لا. هو يحب ألعاب الفيديو.', 'نقبل أيضًا: Yes, he does.'),
  kemelni(19, 'question', 'He goes to the river near our village.', 'يذهب إلى النهر قرب قريتنا.', 'Where does he go?', 'إلى أين يذهب؟'),
  kemelni(19, 'next', 'I like fishing too!', 'أنا أيضًا أحب الصيد!', 'Can I go with him?', 'هل يمكنني الذهاب معه؟', 'نقبل أيضًا: Where do you go?'),
]
