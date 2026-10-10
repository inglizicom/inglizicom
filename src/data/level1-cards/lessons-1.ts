import { call, kemelni, ratebni, sahehni, tarjemni, timer } from './build.ts'

/** Lessons 1–7 (the book's second edition): greetings, numbers, countries and jobs, the full conversation, family, Wh-questions, reading. */
export const LESSONS_1 = [
  /* ── 1 · Greetings & the alphabet ──────────────────────────────── */
  call(1, '🌅', 'صباح الخير', 'Good morning', 'Good morning! How are you?'),
  call(1, '👋', 'مع السلامة', 'Goodbye', 'Thank you. Goodbye!'),
  timer(1, '👋', 20, 'Say goodbye in 3 ways!', 'قل «وداعًا» بثلاث طرق!',
    ['Goodbye', 'Bye', 'See you later', 'See you tomorrow', 'Good night', 'Have a good day']),
  tarjemni(1, 'تشرّفت بمعرفتك.', 'Nice to meet you.'),
  ratebni(1, ['your', 'How', 'name', 'spell', 'do', 'you'], 'How do you spell your name?', 'كيف تتهجّى اسمك؟'),
  sahehni(1, 'Good night! How are you?', 'Good evening! How are you?', 'مساء الخير! كيف حالك؟', ['night', 'evening'], 'للتحية مساءً نقول: Good evening'),
  kemelni(1, 'answer', 'How are you?', 'كيف حالك؟', "I'm fine, thanks. And you?", 'بخير، شكرًا. وأنت؟', "نقبل أيضًا: I'm great."),
  kemelni(1, 'question', 'My name is Samir.', 'اسمي سمير.', "What's your name?", 'ما اسمك؟'),
  kemelni(1, 'next', 'My name is Walid Tazi.', 'اسمي وليد التازي.', 'How do you spell your first name?', 'كيف تتهجّى اسمك الشخصي؟', 'نقبل أيضًا: Nice to meet you.'),

  /* ── 2 · Numbers, age & phone ──────────────────────────────────── */
  call(2, '📱', 'رقم الهاتف', 'Phone number', "What's your phone number?"),
  call(2, '🔢', '13 و 30', 'Thirteen and thirty', 'She is thirteen and he is thirty.'),
  timer(2, '🔢', 15, 'Count from 10 to 20!', 'عُدّ من 10 إلى 20!',
    ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']),
  tarjemni(2, 'كم عمر أختك؟', 'How old is your sister?'),
  ratebni(2, ['number', 'phone', 'your', "What's"], "What's your phone number?", 'ما رقم هاتفك؟', 20),
  sahehni(2, 'I have 25 years old.', 'I am 25 years old.', 'عمري خمس وعشرون سنة.', ['have', 'am'], 'للعمر نستعمل الفعل: to be'),
  kemelni(2, 'answer', 'How old are you?', 'كم عمرك؟', "I'm 19.", 'عمري 19 سنة.', "أي عمر، مع: I'm … (years old)."),
  kemelni(2, 'question', "It's 0655 18 40 73.", 'إنه 0655 18 40 73.', "What's your phone number?", 'ما رقم هاتفك؟'),
  kemelni(2, 'next', 'Imane Berrada.', 'إيمان برادة.', 'How old are you, Imane?', 'كم عمرك يا إيمان؟', "نقبل أيضًا: What's your phone number?"),

  /* ── 3 · Countries, nationalities, jobs, marital status ────────── */
  call(3, '🧑‍🏫', 'أستاذ', 'A teacher', 'My wife is a teacher.'),
  call(3, '🧑‍🔧', 'ميكانيكي', 'A mechanic', "I'm a mechanic. I have a small garage."),
  timer(3, '🌍', 20, 'Name 3 Arab nationalities!', 'اذكر ثلاث جنسيات عربية!',
    ['Moroccan', 'Egyptian', 'Saudi', 'Tunisian'], ['Algerian', 'Mauritanian', 'Libyan', 'Lebanese', 'Jordanian', 'Emirati']),
  tarjemni(3, 'من أين أنت؟', 'Where are you from?'),
  ratebni(3, ['is', 'What', 'nationality', 'her'], 'What is her nationality?', 'ما جنسيتها؟', 20),
  sahehni(3, "She's a engineer.", "She's an engineer.", 'إنها مهندسة.', ['a engineer', 'an engineer'], 'قبل الحرف المتحرك نقول: an'),
  kemelni(3, 'answer', 'What do you do?', 'ما عملك؟', "I'm a chef.", 'أنا طبّاخ.', 'أي مهنة، مع: a / an'),
  kemelni(3, 'question', "I'm from the UK. I'm British.", 'أنا من بريطانيا. أنا بريطاني.', 'Where are you from?', 'من أين أنت؟', "نقبل أيضًا: What's your nationality?"),
  kemelni(3, 'next', "I'm not married. I'm engaged.", 'لست متزوجًا. أنا مخطوب.', 'Congratulations!', 'مبروك!', 'نقبل أيضًا: Is your fiancée British too?'),

  /* ── 4 · The full conversation (lessons 1–3) ───────────────────── */
  call(4, '💍', 'متزوّج', 'Married', "I'm married. My wife is a nurse."),
  call(4, '🧑‍🎓', 'طالبة', 'A student', "I'm a student. I study medicine."),
  timer(4, '💍', 20, 'Name 4 marital statuses!', 'اذكر أربع حالات اجتماعية!',
    ['single', 'engaged', 'married', 'divorced', 'widowed']),
  tarjemni(4, 'أنا من وجدة.', "I'm from Oujda."),
  ratebni(4, ['live', "I'm", 'Rabat', 'from', 'but', 'I', 'in', 'Meknes,'], "I'm from Meknes, but I live in Rabat.", 'أنا من مكناس، لكنني أسكن في الرباط.'),
  sahehni(4, 'Are you married? No, I single.', "Are you married? No, I'm single.", 'هل أنت متزوج؟ لا، أنا أعزب.', ['I single', "I'm single"]),
  kemelni(4, 'answer', 'How do you spell your name?', 'كيف تتهجّى اسمك؟', "It's B-I-L-A-L.", 'اسمي حرفًا حرفًا.', "أي اسم، حرفًا حرفًا: It's …"),
  kemelni(4, 'question', "I'm 23. And you?", 'عمري 23 سنة. وأنت؟', 'How old are you?', 'كم عمرك؟'),
  kemelni(4, 'next', "Sure. It's 0612 90 33 47.", 'طبعًا. إنه 0612 90 33 47.', 'Thanks. My number is 0700 41 25 86.', 'شكرًا. رقمي هو…', 'نقبل أيضًا: Thank you!'),

  /* ── 5 · Family & describing people ────────────────────────────── */
  call(5, '👵', 'جدّة', 'Grandmother', 'My grandmother is old but very strong.'),
  call(5, '😂', 'مضحك', 'Funny', 'My uncle is tall and funny.'),
  timer(5, '👨‍👩‍👧‍👦', 30, 'Name 6 people in a family!', 'اذكر ستة أفراد من العائلة!',
    ['grandfather', 'grandmother', 'father', 'mother', 'brother', 'sister', 'husband', 'wife', 'son', 'daughter', 'uncle', 'aunt', 'cousin', 'nephew', 'niece', 'grandson', 'granddaughter'],
    ['mother-in-law', 'father-in-law', 'twins']),
  tarjemni(5, 'أختي عندها شعر طويل ومجعّد.', 'My sister has long curly hair.'),
  ratebni(5, ['Yassine', 'Who', 'to', 'Driss', 'is'], 'Who is Driss to Yassine?', 'من يكون إدريس بالنسبة لياسين؟', 20),
  sahehni(5, 'Lina is Kawtar niece.', "Lina is Kawtar's niece.", 'لينا ابنة أخت كوثر.', ['Kawtar', "Kawtar's"], "للقرابة نضيف للاسم: Kawtar's niece"),
  kemelni(5, 'answer', "Who is your father's brother?", 'من يكون أخو أبيك؟', 'He is my uncle.', 'إنه عمّي.'),
  kemelni(5, 'question', "Reda is Ghita's brother.", 'رضا أخو غيثة.', 'Who is Reda to Ghita?', 'من يكون رضا بالنسبة لغيثة؟'),
  kemelni(5, 'next', 'My cousins are friendly and outgoing.', 'أبناء عمي لطفاء واجتماعيون.', 'How old are they?', 'كم أعمارهم؟', 'نقبل أيضًا: What are their names?'),

  /* ── 6 · Introductions & Wh-questions ──────────────────────────── */
  call(6, '🎂', 'عيد ميلاد', 'A birthday', 'When is your birthday?'),
  call(6, '💊', 'صيدلانية', 'A pharmacist', "I'm a pharmacist."),
  timer(6, '❓', 20, 'Say 6 question words!', 'قل ست كلمات للسؤال!',
    ['What', 'Where', 'When', 'Who', 'Why', 'How', 'How old']),
  tarjemni(6, 'مع من تسكن؟', 'Who do you live with?'),
  ratebni(6, ['English', 'you', 'Why', 'study', 'do'], 'Why do you study English?', 'لماذا تدرس الإنجليزية؟', 20),
  sahehni(6, 'Where you live?', 'Where do you live?', 'أين تسكن؟', ['you live', 'do you live'], 'ترتيب السؤال: Where do you live?'),
  kemelni(6, 'answer', 'Where are you from?', 'من أين أنت؟', "I'm from Larache.", 'أنا من العرائش.', "أي مدينة، مع: I'm from…"),
  kemelni(6, 'question', "By taxi. It's not far.", 'بالطاكسي. ليس بعيدًا.', 'How do you go to the hospital?', 'كيف تذهب إلى المستشفى؟', 'أي سؤال يبدأ بـ: How do you go…'),
  kemelni(6, 'next', "I'm a nurse at the hospital.", 'أنا ممرضة في المستشفى.', 'When do you start?', 'متى تبدئين؟', 'نقبل أيضًا: Where is the hospital?'),

  /* ── 7 · Reading: Anas and Salma ───────────────────────────────── */
  call(7, '🚌', 'سائق حافلة', 'A bus driver', 'I am a bus driver.'),
  call(7, '🏨', 'موظفة استقبال', 'A receptionist', 'She is a receptionist at a big hotel.'),
  timer(7, '🌅', 30, 'Say 5 things Anas does in the morning!', 'قل خمسة أشياء يفعلها أنس في الصباح!',
    ['He gets up at 5:30.', 'He washes his face.', 'He has a quick breakfast.', 'He drinks a glass of milk.', 'He starts work at 6:30.', 'He drives the number 12 bus.']),
  tarjemni(7, 'أذهب إلى العمل بالترام.', 'I go to work by tram.'),
  ratebni(7, ['up', 'gets', 'at 5:30', 'He'], 'He gets up at 5:30.', 'يستيقظ في الخامسة والنصف.', 20),
  sahehni(7, 'She watch TV in the evening.', 'She watches TV in the evening.', 'تشاهد التلفاز في المساء.', ['watch', 'watches'], 'مع ضمير الغائب نضيف: s / es'),
  kemelni(7, 'answer', 'What does Anas drive?', 'ماذا يسوق أنس؟', 'He drives the number 12 bus.', 'يسوق الحافلة رقم 12.'),
  kemelni(7, 'question', 'She goes to work by tram.', 'تذهب إلى العمل بالترام.', 'How does Salma go to work?', 'كيف تذهب سلمى إلى العمل؟'),
  kemelni(7, 'next', 'His name is Anas. He is 35 years old.', 'اسمه أنس. عمره 35 سنة.', 'Where does he live?', 'أين يسكن؟', 'نقبل أيضًا: What does he do?'),
]
