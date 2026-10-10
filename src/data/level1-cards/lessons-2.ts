import { call, kemelni, ratebni, sahehni, tarjemni, timer } from './build.ts'

/** Lessons 8–13 (the book's second edition): the classroom, pronouns and verbs, the house, the day and the time, the week, food. */
export const LESSONS_2 = [
  /* ── 8 · The classroom ─────────────────────────────────────────── */
  call(8, '🧽', 'ممحاة', 'An eraser', 'Can I borrow your eraser?'),
  call(8, '🧮', 'آلة حاسبة', 'A calculator', "It's a calculator."),
  timer(8, '🎒', 30, 'Name 6 things in your school bag!', 'اذكر ستة أشياء في محفظتك!',
    ['book', 'notebook', 'pen', 'pencil', 'eraser', 'ruler', 'pencil case', 'calculator', 'dictionary'], ['sharpener', 'scissors', 'glue']),
  tarjemni(8, 'لم أفهم.', "I don't understand."),
  ratebni(8, ['borrow', 'Can', 'pen', 'I', 'your'], 'Can I borrow your pen?', 'هل أستعير قلمك؟', 20),
  sahehni(8, 'Sorry, I late.', "Sorry, I'm late.", 'آسف على التأخّر.', ['I late', "I'm late"]),
  kemelni(8, 'answer', "What's this? 📏", 'ما هذا؟', "It's a ruler.", 'إنها مسطرة.'),
  kemelni(8, 'question', 'T-U-E-S-D-A-Y.', 'حرفًا حرفًا.', 'How do you spell "Tuesday"?', 'كيف تتهجّى هذه الكلمة؟', 'أي سؤال: How do you spell…?'),
  kemelni(8, 'next', "It's a calculator.", 'إنها آلة حاسبة.', 'Can you repeat that, please?', 'هل يمكنك أن تعيد، من فضلك؟', 'نقبل أيضًا: Thank you!'),

  /* ── 9 · Pronouns & verbs ──────────────────────────────────────── */
  call(9, '🐱', 'قطة', 'A cat', 'She has a cat and a dog.'),
  call(9, '🏖️', 'الشاطئ', 'The beach', 'We go to the beach on Sunday.'),
  timer(9, '🗣️', 20, 'Say "to be" with every pronoun!', 'صرّف الفعل to be مع كل الضمائر!',
    ['I am', 'you are', 'he is', 'she is', 'it is', 'we are', 'they are']),
  tarjemni(9, 'أعيش في الرباط مع عائلتي.', 'I live in Rabat with my family.'),
  ratebni(9, ['tea', 'drink', 'I', 'sugar', 'without'], 'I drink tea without sugar.', 'أشرب الشاي بدون سكر.', 20),
  sahehni(9, 'She have a cat.', 'She has a cat.', 'لديها قطة.', ['have', 'has'], 'مع ضمائر الغائب نقول: has'),
  kemelni(9, 'answer', 'Do you have food at home?', 'هل لديك طعام في البيت؟', 'Yes, I do. I cook every evening.', 'نعم. أطبخ كل مساء.', "نقبل أيضًا: No, I don't."),
  kemelni(9, 'question', 'He goes to school in the morning.', 'يذهب إلى المدرسة صباحًا.', 'What does Adam do now?', 'ماذا يفعل آدم الآن؟', 'نقبل أيضًا: What does he do?'),
  kemelni(9, 'next', "I'm good. I have a new friend.", 'أنا بخير. عندي صديقة جديدة.', "That's nice! Where is she from?", 'جميل! من أين هي؟', "نقبل أيضًا: What's her name?"),

  /* ── 10 · The house & prepositions ─────────────────────────────── */
  call(10, '🛋️', 'أريكة', 'A sofa', "They're on the sofa."),
  call(10, '🔑', 'مفاتيح', 'Keys', 'Where are my keys?'),
  timer(10, '🏠', 30, 'Name 6 things in your house!', 'اذكر ستة أشياء في بيتك!',
    ['sofa', 'bed', 'chair', 'table', 'door', 'window', 'lamp', 'mirror', 'wardrobe', 'fridge', 'cooker', 'TV', 'washing machine', 'bath', 'picture', 'plant'],
    ['pouf', 'cushion', 'carpet', 'curtain']),
  tarjemni(10, 'القطة تحت الطاولة.', 'The cat is under the table.'),
  ratebni(10, ['the window', 'between', "It's", 'and the door'], "It's between the window and the door.", 'إنها بين النافذة والباب.', 20),
  sahehni(10, 'The keys is on the sofa.', 'The keys are on the sofa.', 'المفاتيح فوق الأريكة.', ['is', 'are'], 'مع الجمع نقول: are'),
  kemelni(10, 'answer', 'Where is the TV?', 'أين التلفاز؟', "It's in front of the sofa.", 'إنه أمام الأريكة.', 'أي مكان، مع: on / under / next to…'),
  kemelni(10, 'question', "It's in my bag.", 'إنه في حقيبتي.', 'Where is your phone?', 'أين هاتفك؟'),
  kemelni(10, 'next', 'Mum, where are my keys?', 'أمي، أين مفاتيحي؟', 'Are they on the table?', 'هل هي على الطاولة؟', 'نقبل أيضًا: Look under the sofa.'),

  /* ── 11 · My day & the time ────────────────────────────────────── */
  call(11, '🚿', 'أستحمّ', 'Take a shower', 'I take a shower, have breakfast and get dressed.'),
  call(11, '🍲', 'أطبخ العشاء', 'Cook dinner', 'I go home, cook dinner and help my children.'),
  timer(11, '⏰', 30, 'Say 5 things you do every morning!', 'قل خمسة أشياء تفعلها كل صباح!',
    ['I wake up', 'I get up', 'I take a shower', 'I brush my teeth', 'I get dressed', 'I have breakfast', 'I go to work', 'I start work']),
  tarjemni(11, 'إنها السابعة والنصف.', "It's half past seven.", "نقبل أيضًا: It's seven thirty."),
  ratebni(11, ['get up', 'time', 'What', 'you', 'do'], 'What time do you get up?', 'متى تنهض؟', 20),
  sahehni(11, "I go to bed in ten o'clock.", "I go to bed at ten o'clock.", 'أنام في الساعة العاشرة.', ['in', 'at'], 'مع الساعة نقول: at'),
  kemelni(11, 'answer', 'What time is it? 🕖', 'كم الساعة؟', "It's seven o'clock.", 'إنها السابعة تمامًا.'),
  kemelni(11, 'question', "At three o'clock.", 'في الساعة الثالثة.', 'What time do you finish work?', 'متى تُنهي العمل؟', 'أي سؤال يبدأ بـ: What time…'),
  kemelni(11, 'next', "I get up at five o'clock.", 'أنهض في الساعة الخامسة.', "Five o'clock? That's early!", 'الخامسة؟ هذا مبكّر!', 'نقبل أيضًا: What do you do before work?'),

  /* ── 12 · The week & how often ─────────────────────────────────── */
  call(12, '🛁', 'الحمّام', 'The hammam', 'I usually go to the hammam with my sister.'),
  call(12, '🎬', 'السينما', 'The cinema', 'How often do you go to the cinema?'),
  timer(12, '🗓️', 15, 'Say the 7 days of the week!', 'قل أيام الأسبوع السبعة!',
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  tarjemni(12, 'أزور جدتي دائمًا يوم الأحد.', 'I always visit my grandmother on Sunday.'),
  ratebni(12, ['late', 'often', 'He', 'is'], 'He is often late.', 'غالبًا ما يتأخّر.', 20),
  sahehni(12, 'I drink always tea.', 'I always drink tea.', 'أشرب الشاي دائمًا.', ['drink always', 'always drink'], 'الظرف يأتي قبل الفعل: always drink'),
  kemelni(12, 'answer', 'How often do you go to the cinema?', 'كم مرة تذهب إلى السينما؟', 'Rarely. Maybe once a month.', 'نادرًا. ربما مرة في الشهر.', 'أي جواب: once a week / every day…'),
  kemelni(12, 'question', 'Yes, but only in the morning.', 'نعم، لكن في الصباح فقط.', 'Do you work on Saturday?', 'هل تعمل يوم السبت؟'),
  kemelni(12, 'next', 'Sorry, on Sunday I always visit my grandmother.', 'آسفة، يوم الأحد أزور جدتي دائمًا.', 'OK. What about Thursday?', 'حسنًا. وماذا عن الخميس؟'),

  /* ── 13 · Food ─────────────────────────────────────────────────── */
  call(13, '🐟', 'سمك', 'Fish', 'I like fish and rice.'),
  call(13, '🍗', 'دجاج', 'Chicken', 'Roast chicken is my favourite!'),
  timer(13, '🍽️', 30, 'Name 5 foods you like!', 'اذكر خمسة أطعمة تحبها!',
    ['bread', 'cheese', 'eggs', 'chicken', 'fish', 'meat', 'rice', 'pasta', 'salad', 'soup', 'pizza', 'burger', 'apple', 'banana', 'cake', 'chocolate'],
    ['tagine', 'couscous', 'harira', 'msemen', 'baghrir', 'pastilla', 'olives']),
  tarjemni(13, 'هل تحب البيتزا؟', 'Do you like pizza?'),
  ratebni(13, ['food', 'your', "What's", 'favourite'], "What's your favourite food?", 'ما طعامك المفضّل؟', 20),
  sahehni(13, 'Do you like fish? Yes, I like.', 'Do you like fish? Yes, I do.', 'هل تحب السمك؟ نعم.', ['I like', 'I do']),
  kemelni(13, 'answer', 'Does he like cake?', 'هل يحب الكعكة؟', 'Yes, he does.', 'نعم، يحبها.', "نقبل أيضًا: No, he doesn't."),
  kemelni(13, 'question', 'My favourite food is couscous.', 'طعامي المفضّل هو الكسكس.', "What's your favourite food?", 'ما طعامك المفضّل؟'),
  kemelni(13, 'next', "I don't like fish, Dad.", 'لا أحب السمك يا أبي.', 'OK. Do you like chicken?', 'حسنًا. هل تحبين الدجاج؟', 'أي سؤال يبدأ بـ: Do you like…'),
]
