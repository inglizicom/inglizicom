import { call, kemelni, ratebni, sahehni, tarjemni, timer } from './build.ts'

/** Lessons 1–7: greetings, numbers, countries and jobs, the full conversation, family, Wh-questions, reading. */
export const LESSONS_1 = [
  /* ── 1 · Greetings ─────────────────────────────────────────────── */
  call(1, '🌅', 'صباح الخير', 'Good morning', 'Good morning! How are you?'),
  call(1, '🌙', 'تصبح على خير', 'Good night', 'Good night! See you tomorrow.'),
  timer(1, '👋', 20, 'Say goodbye in 4 ways!', 'قل «وداعًا» بأربع طرق!',
    ['Goodbye', 'Bye-bye', 'See you tomorrow', 'See you later', 'See you soon', 'Have a good day', 'Have a good night', 'Good night']),
  tarjemni(1, 'ما اسمك؟', "What's your name?", 'نقبل أيضًا: What is your name?'),
  ratebni(1, ['spell', 'name', 'How', 'your', 'you', 'do'], 'How do you spell your name?', 'كيف تتهجّى اسمك؟'),
  sahehni(1, 'My name are Yassine.', 'My name is Yassine.', 'اسمي ياسين.', ['are', 'is']),
  kemelni(1, 'answer', 'How are you?', 'كيف حالك؟', "I'm fine, thank you. And you?", 'أنا بخير، شكرًا. وأنت؟', "نقبل أيضًا: I'm very well. / I'm OK."),
  kemelni(1, 'question', 'My name is Nora.', 'اسمي نورة.', "What's your name?", 'ما اسمك؟'),
  kemelni(1, 'next', 'My name is Rim.', 'اسمي ريم.', 'How do you spell it?', 'كيف تتهجّاه؟', 'نقبل أيضًا: Nice to meet you, Rim.'),

  /* ── 2 · Numbers, age & phone ──────────────────────────────────── */
  call(2, '📱', 'رقم الهاتف', 'Phone number', "What's your phone number?"),
  call(2, '🔢', '13 و 30', 'Thirteen and thirty', 'She is thirteen and he is thirty.'),
  timer(2, '🔢', 15, 'Count from 10 to 20!', 'عُدّ من 10 إلى 20!',
    ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']),
  tarjemni(2, 'كم عمرك؟', 'How old are you?'),
  ratebni(2, ['sister', 'old', 'your', 'How', 'is'], 'How old is your sister?', 'كم عمر أختك؟'),
  sahehni(2, 'I have 25 years old.', 'I am 25 years old.', 'عمري خمس وعشرون سنة.', ['have', 'am'], 'للعمر نستعمل الفعل: to be'),
  kemelni(2, 'answer', "What's your phone number?", 'ما رقم هاتفك؟', 'My phone number is 0661 23 45 78.', 'رقم هاتفي هو…', 'أي رقم، يبدأ بـ: My phone number is…'),
  kemelni(2, 'question', 'She is 47 years old.', 'عمرها 47 سنة.', 'How old is she?', 'كم عمرها؟'),
  kemelni(2, 'next', "It's 0661 23 45 78.", 'إنه 0661 23 45 78.', 'Can you say it again, please?', 'هل يمكنك أن تعيده، من فضلك؟', 'نقبل أيضًا: Thank you!'),

  /* ── 3 · Countries, nationalities & jobs ───────────────────────── */
  call(3, '🧑‍🏫', 'أستاذ', 'A teacher', "I'm a teacher."),
  call(3, '💈', 'حلّاق', 'A barber', 'He is a barber.'),
  timer(3, '🌍', 20, 'Name 3 Arab nationalities!', 'اذكر ثلاث جنسيات عربية!',
    ['Moroccan', 'Egyptian', 'Saudi', 'Algerian', 'Tunisian'], ['Mauritanian', 'Libyan', 'Lebanese', 'Jordanian', 'Emirati']),
  tarjemni(3, 'من أين أنت؟', 'Where are you from?'),
  ratebni(3, ['nationality', 'your', 'is', 'What'], 'What is your nationality?', 'ما جنسيتك؟'),
  sahehni(3, 'I am teacher.', 'I am a teacher.', 'أنا أستاذ.', ['teacher', 'a teacher'], 'قبل المهنة نضع: a / an'),
  kemelni(3, 'answer', 'What do you do?', 'ما عملك؟', "I'm a taxi driver.", 'أنا سائق طاكسي.', 'أي مهنة، مع: a / an'),
  kemelni(3, 'question', "I'm from Italy. I'm Italian.", 'أنا من إيطاليا. أنا إيطالية.', 'Where are you from?', 'من أين أنت؟', 'نقبل أيضًا: What is your nationality?'),
  kemelni(3, 'next', "I'm from Morocco. I'm Moroccan.", 'أنا من المغرب. أنا مغربي.', 'What do you do?', 'ما عملك؟', 'أي سؤال من الدرس: Are you married?'),

  /* ── 4 · The full conversation (lessons 1–3) ───────────────────── */
  call(4, '💍', 'متزوّج', 'Married', 'Are you married? Yes, I am.'),
  call(4, '👦', 'ابن', 'A son', 'I have a son and a daughter.'),
  timer(4, '💍', 20, 'Name 4 marital statuses!', 'اذكر أربع حالات عائلية!',
    ['single', 'engaged', 'married', 'divorced', 'widowed', 'separated']),
  tarjemni(4, 'أنا من فرنسا. أنا فرنسية.', "I'm from France. I'm French."),
  ratebni(4, ['too', 'meet', 'Nice', 'you', 'to'], 'Nice to meet you too.', 'تشرّفت بمعرفتك أيضًا.'),
  sahehni(4, 'Are you married? Yes, I married.', 'Are you married? Yes, I am.', 'هل أنت متزوج؟ نعم.', ['I married', 'I am']),
  kemelni(4, 'answer', 'How old are you?', 'كم عمرك؟', "I'm 29 years old.", 'عمري 29 سنة.', "أي عمر، مع: I'm … years old."),
  kemelni(4, 'question', 'E-M-M-A.', 'إ-م-م-ا.', 'How do you spell your name?', 'كيف تتهجّى اسمك؟'),
  kemelni(4, 'next', "I'm from Morocco. I live in Fez.", 'أنا من المغرب. أسكن في فاس.', 'What do you do?', 'ما عملك؟', 'أي سؤال من الدروس 1–3: How old are you?'),

  /* ── 5 · Family & describing people ────────────────────────────── */
  call(5, '👵', 'جدّة', 'Grandmother', 'My grandmother is generous.'),
  call(5, '😂', 'مضحك', 'Funny', 'My brother is funny.'),
  timer(5, '👨‍👩‍👧‍👦', 30, 'Name 6 people in a family!', 'اذكر ستة أفراد من العائلة!',
    ['father', 'mother', 'brother', 'sister', 'son', 'daughter', 'husband', 'wife', 'grandfather', 'grandmother', 'uncle', 'aunt', 'cousin', 'nephew', 'niece'], ['parents', 'grandparents', 'twins']),
  tarjemni(5, 'أخي طويل وذكي.', 'My brother is tall and smart.'),
  ratebni(5, ['to', 'Adil', 'is', 'Maysoun', 'Who'], 'Who is Adil to Maysoun?', 'من يكون عادل بالنسبة لميسون؟'),
  sahehni(5, 'Ahmed is Safiya son.', "Ahmed is Safiya's son.", 'أحمد ابن صفية.', ['Safiya', "Safiya's"], "للقرابة نضيف للاسم: Safiya's son"),
  kemelni(5, 'answer', "Who is your father's brother?", 'من يكون أخو أبيك؟', 'He is my uncle.', 'إنه عمّي.'),
  kemelni(5, 'question', "Abdurrahman is Ahmed's father.", 'عبد الرحمن أبو أحمد.', 'Who is Abdurrahman to Ahmed?', 'من يكون عبد الرحمن بالنسبة لأحمد؟'),
  kemelni(5, 'next', 'I have two brothers.', 'عندي أخوان.', 'How old are they?', 'كم عمرهما؟', 'نقبل أيضًا: What are their names?'),

  /* ── 6 · Introductions & Wh-questions ──────────────────────────── */
  call(6, '🎂', 'عيد ميلاد', 'A birthday', 'When is your birthday?'),
  call(6, '🚉', 'محطة القطار', 'The train station', 'I live in Rabat, near the train station.'),
  timer(6, '❓', 20, 'Say 6 question words!', 'قل ست كلمات للسؤال!',
    ['What', 'Where', 'When', 'Why', 'How', 'Who', 'How old']),
  tarjemni(6, 'أين تسكن؟', 'Where do you live?'),
  ratebni(6, ['English', 'you', 'Why', 'like', 'do'], 'Why do you like English?', 'لماذا تحب الإنجليزية؟'),
  sahehni(6, 'Where she lives?', 'Where does she live?', 'أين تسكن؟', ['she lives', 'does she live']),
  kemelni(6, 'answer', 'Where do you live now?', 'أين تسكن الآن؟', 'I live in Rabat, near the train station.', 'أسكن في الرباط، قرب محطة القطار.', 'أي مدينة، مع: I live in…'),
  kemelni(6, 'question', 'Because I love numbers!', 'لأنني أحب الأرقام!', 'Why do you like this job?', 'لماذا تحب هذا العمل؟', 'أي سؤال يبدأ بـ: Why'),
  kemelni(6, 'next', 'This is my friend. Her name is Salma.', 'هذه صديقتي. اسمها سلمى.', 'Where is she from?', 'من أين هي؟', 'نقبل أيضًا: How old is she?'),

  /* ── 7 · Reading: a day in Zaid's life ─────────────────────────── */
  call(7, '👔', 'أرتدي ملابسي', 'Get dressed', 'I wash my face, brush my teeth, and get dressed.'),
  call(7, '📖', 'رواية', 'A novel', 'She likes to read a novel before bed.'),
  timer(7, '🌅', 30, "Say 5 things Zaid does in the morning!", 'قل خمسة أشياء يفعلها زيد في الصباح!',
    ['wakes up', 'washes his face', 'brushes his teeth', 'gets dressed', 'drinks a cup of tea', 'goes to work']),
  tarjemni(7, 'أنا متزوج ولدي طفلان.', 'I am married, and I have two kids.'),
  ratebni(7, ['to', 'at 10 PM', 'He', 'sleep', 'goes'], 'He goes to sleep at 10 PM.', 'ينام في العاشرة ليلًا.'),
  sahehni(7, 'He wake up at 7:00 AM.', 'He wakes up at 7:00 AM.', 'يستيقظ في السابعة صباحًا.', ['wake', 'wakes'], 'مع ضمير الغائب نضيف للفعل: s'),
  kemelni(7, 'answer', 'What does Zaid teach?', 'ماذا يدرّس زيد؟', 'He teaches Maths.', 'يدرّس الرياضيات.'),
  kemelni(7, 'question', 'She is 27 years old.', 'عمرها 27 سنة.', 'How old is Diae?', 'كم عمر ضحى؟', 'نقبل أيضًا: How old is she?'),
  kemelni(7, 'next', 'Her name is Diae. She is from Morocco.', 'اسمها ضحى. هي من المغرب.', 'Where does she live?', 'أين تسكن؟', 'نقبل أيضًا: What does she do?'),
]
