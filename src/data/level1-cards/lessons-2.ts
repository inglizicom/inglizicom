import { call, kemelni, ratebni, sahehni, tarjemni, timer } from './build.ts'

/** Lessons 8–13: the classroom, verbs and pronouns, the house, the day and the time, the week, food. */
export const LESSONS_2 = [
  /* ── 8 · The classroom ─────────────────────────────────────────── */
  call(8, '🧽', 'ممحاة', 'An eraser', 'Look, this is an eraser.'),
  call(8, '📝', 'واجب منزلي', 'Homework', 'Your homework is page 13.'),
  timer(8, '🎒', 30, 'Name 6 things in your school bag!', 'اذكر ستة أشياء في حقيبتك المدرسية!',
    ['pen', 'pencil', 'ruler', 'eraser', 'notebook', 'book', 'pencil case', 'highlighter'], ['sharpener', 'scissors', 'glue', 'calculator']),
  tarjemni(8, 'لم أفهم.', "I don't understand."),
  ratebni(8, ['a', 'have', 'Excuse me,', 'question', 'I'], 'Excuse me, I have a question.', 'عذرًا، لدي سؤال.'),
  sahehni(8, 'I forget my book.', 'I forgot my book.', 'نسيت كتابي.', ['forget', 'forgot']),
  kemelni(8, 'answer', 'What page, please?', 'أي صفحة، من فضلك؟', 'Page 12.', 'الصفحة 12.', 'أي رقم صفحة، مع: Page…'),
  kemelni(8, 'question', 'Look, this is an eraser.', 'انظر، هذه ممحاة.', 'What does "eraser" mean?', 'ماذا تعني هذه الكلمة؟'),
  kemelni(8, 'next', 'Your homework is page 13.', 'واجبكم هو الصفحة 13.', 'Can you repeat, please?', 'هل يمكنك أن تعيد، من فضلك؟', 'نقبل أيضًا: Thank you, teacher!'),

  /* ── 9 · Verbs and pronouns ────────────────────────────────────── */
  call(9, '💡', 'لأنّ', 'Because', 'Because the tram is fast and cheap.'),
  call(9, '🚫', 'بدون', 'Without', 'I go without food.'),
  timer(9, '🗣️', 20, 'Say "to be" with every pronoun!', 'صرّف الفعل to be مع كل الضمائر!',
    ['I am', 'you are', 'he is', 'she is', 'it is', 'we are', 'they are']),
  tarjemni(9, 'عندنا جوج ديال لولاد.', 'We have two kids.', 'نقبل أيضًا: We have two children.'),
  ratebni(9, ['work', 'She', 'to', 'goes'], 'She goes to work.', 'هي تذهب إلى العمل.', 20),
  sahehni(9, 'He have a small car.', 'He has a small car.', 'عنده سيارة صغيرة.', ['have', 'has'], 'مع ضمائر الغائب نقول: has'),
  kemelni(9, 'answer', 'Do you have brothers or sisters?', 'هل لديك إخوة أو أخوات؟', 'Yes, I have one brother and two sisters.', 'نعم، عندي أخ وأختان.', "نقبل أيضًا: No, I don't."),
  kemelni(9, 'question', 'He is a nurse.', 'هو ممرض.', 'What does your brother do?', 'ماذا يعمل أخوك؟', "نقبل أيضًا: What's his job?"),
  kemelni(9, 'next', 'I have an English class!', 'عندي حصة إنجليزية!', 'Where is your class?', 'أين حصتك؟', 'نقبل أيضًا: Is your teacher good?'),

  /* ── 10 · The house & prepositions ─────────────────────────────── */
  call(10, '🛌', 'وسادة', 'A pillow', 'The pillow is on the bed.'),
  call(10, '⬇️', 'تحت', 'Under', 'The carpet is under the bed.'),
  timer(10, '🏠', 30, 'Name 6 things in your house!', 'اذكر ستة أشياء في بيتك!',
    ['bed', 'pillow', 'blanket', 'wardrobe', 'mirror', 'lamp', 'chair', 'sofa', 'table', 'carpet', 'stove', 'fridge', 'television', 'washing machine', 'dishwasher', 'dresser'],
    ['cushion', 'curtain', 'pouf', 'shelf']),
  tarjemni(10, 'المصباح بجانب السرير.', 'The lamp is next to the bed.'),
  ratebni(10, ['carpet', 'Where', 'the', 'is'], 'Where is the carpet?', 'أين السجادة؟', 20),
  sahehni(10, 'The pillow is in the bed.', 'The pillow is on the bed.', 'الوسادة على السرير.', ['in', 'on'], 'فوق الشيء نقول: on'),
  kemelni(10, 'answer', 'Where is the fridge?', 'أين الثلاجة؟', 'The fridge is in the kitchen.', 'الثلاجة في المطبخ.', 'أي مكان، مع: in / on / next to'),
  kemelni(10, 'question', 'The dresser is in front of the window.', 'الكومود أمام النافذة.', 'Where is the dresser?', 'أين الكومود؟'),
  kemelni(10, 'next', 'The bed is in the bedroom.', 'السرير في غرفة النوم.', 'Where is the lamp?', 'أين المصباح؟', 'أي سؤال يبدأ بـ: Where is…'),

  /* ── 11 · My day & the time ────────────────────────────────────── */
  call(11, '🚿', 'آخذ حمّامًا', 'Take a shower', 'Then I take a shower and get dressed.'),
  call(11, '🛏️', 'أرتّب سريري', 'Make my bed', 'I make my bed and have breakfast.'),
  timer(11, '⏰', 30, 'Say 5 things you do every morning!', 'قل خمسة أشياء تفعلها كل صباح!',
    ['I wake up', 'I wash my face', 'I brush my teeth', 'I have my breakfast', 'I make my bed', 'I get dressed', 'I take a shower', 'I go to work', 'I go to school']),
  tarjemni(11, 'كم الساعة؟', 'What time is it?', "نقبل أيضًا: What's the time?"),
  ratebni(11, ['up', 'time', 'you', 'What', 'wake', 'do'], 'What time do you wake up?', 'متى تستيقظ؟'),
  sahehni(11, 'I go to sleep in 10:00.', 'I go to sleep at 10:00.', 'أنام في العاشرة.', ['in', 'at'], 'مع الساعة نقول: at'),
  kemelni(11, 'answer', 'What time is it? 🕢', 'كم الساعة؟', "It's 7:30.", 'إنها السابعة والنصف.', "نقبل أيضًا: It's seven thirty."),
  kemelni(11, 'question', 'At 4:30. Then I go back home.', 'في الرابعة والنصف. ثم أرجع إلى البيت.', 'What time do you leave work?', 'متى تغادر العمل؟'),
  kemelni(11, 'next', "Oh no! I'm late!", 'يا إلهي! أنا متأخر!', 'What time do you go to work?', 'متى تذهب إلى العمل؟', 'نقبل أيضًا: What time is it?'),

  /* ── 12 · The week & how often ─────────────────────────────────── */
  call(12, '📅', 'الجمعة', 'Friday', 'I often watch films on Friday evening.'),
  call(12, '🔁', 'أحيانًا', 'Sometimes', 'I sometimes visit my aunt on Sunday.'),
  timer(12, '🗓️', 15, 'Say the 7 days of the week!', 'قل أيام الأسبوع السبعة!',
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  tarjemni(12, 'لا أعمل أبدًا في نهاية الأسبوع.', 'I never work on the weekend.'),
  ratebni(12, ['visit', 'always', 'on Sunday', 'I', 'my grandparents'], 'I always visit my grandparents on Sunday.', 'أزور دائمًا جدّيّ يوم الأحد.'),
  sahehni(12, 'I go always to the market.', 'I always go to the market.', 'أذهب دائمًا إلى السوق.', ['go always', 'always go'], 'كلمة التكرار تأتي قبل الفعل: always go'),
  kemelni(12, 'answer', 'What do you usually do on Saturday?', 'ماذا تفعل عادةً يوم السبت؟', 'I usually go to the market with my mother.', 'عادةً أذهب إلى السوق مع أمي.', 'أي نشاط، مع: I usually…'),
  kemelni(12, 'question', 'I go to the gym on Monday and Wednesday.', 'أذهب إلى النادي يومي الإثنين والأربعاء.', 'When do you go to the gym?', 'متى تذهب إلى النادي؟'),
  kemelni(12, 'next', 'No, I never work on the weekend.', 'لا، لا أعمل أبدًا في نهاية الأسبوع.', 'What do you do on Sunday?', 'ماذا تفعل يوم الأحد؟', 'نقبل أيضًا: When do you go to the gym?'),

  /* ── 13 · The food I like ──────────────────────────────────────── */
  call(13, '🧀', 'جبن', 'Cheese', 'I love cheese sandwiches.'),
  call(13, '🍗', 'دجاج مشوي', 'Roast chicken', 'I like roast chicken and bread.'),
  timer(13, '🍽️', 30, 'Name 5 foods you like!', 'اذكر خمسة أطعمة تحبها!',
    ['cheese', 'noodles', 'pizza', 'roast chicken', 'steak', 'fish', 'omelette', 'barbecue', 'cake', 'popcorn', 'potato chips', 'bread', 'ice cream', 'sandwich', 'tacos', 'salad'],
    ['tagine', 'couscous', 'harira', 'msemen', 'baghrir', 'pastilla', 'olives', 'honey']),
  tarjemni(13, 'هل تحب السمك؟', 'Do you like fish?'),
  ratebni(13, ['like', 'food', 'you', 'What', 'do'], 'What food do you like?', 'ما الطعام الذي تحبه؟'),
  sahehni(13, 'Do you like fish? Yes, I like.', 'Do you like fish? Yes, I do.', 'هل تحب السمك؟ نعم.', ['I like', 'I do']),
  kemelni(13, 'answer', 'Do you like pizza?', 'هل تحب البيتزا؟', "Yes, I do. / No, I don't.", 'نعم. / لا.'),
  kemelni(13, 'question', 'I like sandwiches and salad.', 'أحب الساندويتشات والسلطة.', 'What food do you like?', 'ما الطعام الذي تحبه؟'),
  kemelni(13, 'next', "No, I don't. I don't like fish.", 'لا، لا أحب السمك.', 'Do you like cheese?', 'هل تحب الجبن؟', 'أي سؤال يبدأ بـ: Do you like…'),
]
