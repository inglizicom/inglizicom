import { call, kemelni, ratebni, sahehni, tarjemni, timer } from './build.ts'

/** Lessons 14–19: drinks, transport, places and directions, there is / are, can, hobbies. */
export const LESSONS_3 = [
  /* ── 14 · The drink I like ─────────────────────────────────────── */
  call(14, '🍊', 'عصير البرتقال', 'Orange juice', 'Today I want an orange juice.'),
  call(14, '🥛', 'حليب', 'Milk', 'My favourite drink is chocolate milk.'),
  timer(14, '🥤', 30, 'Name 5 drinks!', 'اذكر خمسة مشروبات!',
    ['water', 'milk', 'orange juice', 'tea', 'coffee', 'lemon juice', 'soda', 'hot chocolate', 'energy drink', 'lemonade', 'chocolate milk', 'sparkling water', 'mineral water', 'milkshake', 'herbal tea', 'ginger tea'],
    ['mint tea', 'avocado juice', 'nous-nous', 'banana milkshake']),
  tarjemni(14, 'ما مشروبك المفضّل؟', 'What is your favourite drink?', "نقبل أيضًا: What's your favorite drink?"),
  ratebni(14, ['tea', 'When', 'drink', 'you', 'do'], 'When do you drink tea?', 'متى تشرب الشاي؟'),
  sahehni(14, 'I drinks tea every day.', 'I drink tea every day.', 'أشرب الشاي كل يوم.', ['drinks', 'drink'], 'مع ضمير المتكلم لا نضيف للفعل: s'),
  kemelni(14, 'answer', "What drink don't you like?", 'ما المشروب الذي لا تحبه؟', "I don't like ginger tea.", 'لا أحب شاي الزنجبيل.', "أي مشروب، مع: I don't like…"),
  kemelni(14, 'question', 'I drink coffee in the morning, before work.', 'أشرب القهوة صباحًا، قبل العمل.', 'When do you drink coffee?', 'متى تشرب القهوة؟'),
  kemelni(14, 'next', 'Waiter, one mint tea and one orange juice, please.', 'من فضلك، كأس شاي بالنعناع وعصير برتقال.', 'Anything else?', 'هل تريد شيئًا آخر؟', 'نقبل أيضًا: Sure!'),

  /* ── 15 · Transport & this / that ──────────────────────────────── */
  call(15, '🚊', 'الترام', 'The tram', 'Mum goes by tram.'),
  call(15, '🚌', 'حافلة', 'A bus', 'I go to school by bus.'),
  timer(15, '🚦', 30, 'Name 6 ways to travel!', 'اذكر ست وسائل نقل!',
    ['bicycle', 'motorcycle', 'car', 'bus', 'taxi', 'truck', 'train', 'metro', 'airplane', 'ship', 'boat', 'ferry', 'cable car', 'van', 'skateboard', 'tram'],
    ['grand taxi', 'scooter', 'horse cart']),
  tarjemni(15, 'هذه حقائبنا.', 'These are our bags.'),
  ratebni(15, ['to work', 'How', 'go', 'you', 'do'], 'How do you go to work?', 'كيف تذهب إلى العمل؟'),
  sahehni(15, 'This are our tickets.', 'These are our tickets.', 'هذه تذاكرنا.', ['This', 'These'], 'للجمع القريب نقول: These'),
  kemelni(15, 'answer', 'What is that? ✈️ (far)', 'ما ذلك؟ (بعيد)', 'That is a plane.', 'تلك طائرة.', "نقبل أيضًا: It's a plane."),
  kemelni(15, 'question', 'I go by car.', 'أذهب بالسيارة.', 'How do you go to work?', 'كيف تذهب إلى العمل؟'),
  kemelni(15, 'next', 'That is a train. It goes to Marrakech.', 'ذلك قطار. يذهب إلى مراكش.', 'What is this?', 'ما هذا؟', 'نقبل أيضًا: Are these our bags?'),

  /* ── 16 · Places in town & directions ──────────────────────────── */
  call(16, '💊', 'صيدلية', 'A pharmacy', 'Is there a pharmacy near here?'),
  call(16, '🔄', 'عند الدوّار', 'At the roundabout', 'Turn right at the roundabout.'),
  timer(16, '🏙️', 30, 'Name 6 places in your town!', 'اذكر ستة أماكن في مدينتك!',
    ['bank', 'mosque', 'hospital', 'bakery', 'supermarket', 'school', 'park', 'pharmacy', 'gas station', 'post office', 'police station', 'bus station', 'library', 'hotel', 'cinema', 'laundry'],
    ['medina', 'souk', 'hammam', 'café', 'train station']),
  tarjemni(16, 'انعطف يسارًا عند إشارات المرور.', 'Turn left at the traffic lights.'),
  ratebni(16, ['the bank', 'Excuse me,', 'is', 'where'], 'Excuse me, where is the bank?', 'عذرًا، أين البنك؟'),
  sahehni(16, 'The bank is next the post office.', 'The bank is next to the post office.', 'البنك بجانب مكتب البريد.', ['next', 'next to']),
  kemelni(16, 'answer', 'Is it far?', 'هل هو بعيد؟', "No, it's five minutes on foot.", 'لا، خمس دقائق مشيًا.', "نقبل أيضًا: Yes, it's far."),
  kemelni(16, 'question', 'Go straight and turn left at the traffic lights.', 'اذهب مباشرة وانعطف يسارًا عند إشارات المرور.', 'Excuse me, where is the bank?', 'عذرًا، أين البنك؟', 'أي سؤال يبدأ بـ: Where is…'),
  kemelni(16, 'next', 'The bank is next to the post office.', 'البنك بجانب مكتب البريد.', 'Is it far?', 'هل هو بعيد؟', 'نقبل أيضًا: Thank you!'),

  /* ── 17 · There is / there are ─────────────────────────────────── */
  call(17, '🛏️', 'غرفة', 'A room', 'There is a room in the hotel.'),
  call(17, '🎟️', 'تذكرة', 'A ticket', 'There is a ticket on the table.'),
  timer(17, '🏘️', 30, 'Say 4 things there are in your street!', 'قل أربعة أشياء موجودة في شارعك!',
    ['There is a bakery.', 'There is a pharmacy.', 'There is a mosque.', 'There are many shops.', 'There are many cars.', 'There is a school.'], ['There is a hammam.', 'There is a café.']),
  tarjemni(17, 'هل يوجد فندق قريب من هنا؟', 'Is there a hotel near here?'),
  ratebni(17, ['there', 'buses', 'How many', 'are'], 'How many buses are there?', 'كم عدد الحافلات؟', 20),
  sahehni(17, 'There is many restaurants.', 'There are many restaurants.', 'هناك مطاعم كثيرة.', ['is', 'are'], 'مع الجمع نقول: There are'),
  kemelni(17, 'answer', 'Is there a pharmacy on this street?', 'هل توجد صيدلية في هذا الشارع؟', "No, there isn't.", 'لا، لا توجد.', 'نقبل أيضًا: Yes, there is.'),
  kemelni(17, 'question', 'There are three buses every hour.', 'هناك ثلاث حافلات كل ساعة.', 'How many buses are there?', 'كم عدد الحافلات؟'),
  kemelni(17, 'next', 'Yes, there is. There is a hotel next to the library.', 'نعم، يوجد فندق بجانب المكتبة.', 'Are there any restaurants near the hotel?', 'هل توجد مطاعم قرب الفندق؟', 'أي سؤال يبدأ بـ: Is there / Are there'),

  /* ── 18 · Jobs & can / can't ───────────────────────────────────── */
  call(18, '🏊', 'يسبح', 'To swim', 'Can you swim? Yes, I can.'),
  call(18, '🧑‍⚕️', 'طبيب', 'A doctor', 'A doctor can help sick people.'),
  timer(18, '👷', 30, 'Name 5 jobs!', 'اذكر خمس مهن!',
    ['doctor', 'driver', 'cook', 'pilot', 'cleaner', 'teacher', 'manager', 'lawyer', 'judge', 'nurse', 'barber', 'farmer', 'engineer', 'student'],
    ['baker', 'butcher', 'mechanic', 'police officer', 'tailor']),
  tarjemni(18, 'هل يمكنه التحدث بالإنجليزية؟', 'Can he speak English?'),
  ratebni(18, ['a bus', 'I', 'drive', 'can'], 'I can drive a bus.', 'أستطيع قيادة حافلة.', 20),
  sahehni(18, 'He can speaks French.', 'He can speak French.', 'يستطيع التحدث بالفرنسية.', ['speaks', 'speak'], 'بعدها يبقى الفعل كما هو: can speak'),
  kemelni(18, 'answer', 'Can you fly an airplane?', 'هل يمكنك قيادة طائرة؟', "No, I can't.", 'لا، لا أستطيع.', 'نقبل أيضًا: Yes, I can.'),
  kemelni(18, 'question', 'Yes, I can speak a little English.', 'نعم، أستطيع التحدث بقليل من الإنجليزية.', 'Can you speak English?', 'هل تستطيع التحدث بالإنجليزية؟'),
  kemelni(18, 'next', "Yes, I can. But I can't work on Fridays.", 'نعم، لكن لا أستطيع العمل يوم الجمعة.', 'Can you start on Monday?', 'هل تستطيع البدء يوم الإثنين؟', 'أي سؤال يبدأ بـ: Can you…'),

  /* ── 19 · Hobbies & like ───────────────────────────────────────── */
  call(19, '♟️', 'الشطرنج', 'Chess', 'I like playing chess.'),
  call(19, '⛺', 'التخييم', 'Camping', 'Yes, I love camping!'),
  timer(19, '🎨', 30, 'Name 5 hobbies!', 'اذكر خمس هوايات!',
    ['cooking', 'playing football', 'reading books', 'swimming', 'learning English', 'riding horses', 'climbing', 'hiking', 'camping', 'drawing', 'travelling', 'helping others', 'exercising', 'playing chess', 'video games', 'baking'],
    ['fishing', 'gardening', 'singing', 'dancing']),
  tarjemni(19, 'أختي تحب الطبخ.', 'My sister likes cooking.'),
  ratebni(19, ['do', 'like', 'What', 'on the weekend', 'to do', 'you'], 'What do you like to do on the weekend?', 'ماذا تحب أن تفعل في نهاية الأسبوع؟'),
  sahehni(19, "She don't like video games.", "She doesn't like video games.", 'هي لا تحب ألعاب الفيديو.', ["don't", "doesn't"], "مع ضمير الغائبة نقول: doesn't"),
  kemelni(19, 'answer', 'Does your sister like sports?', 'هل تحب أختك الرياضة؟', "No, she doesn't. She likes cooking.", 'لا. هي تحب الطبخ.', 'نقبل أيضًا: Yes, she does.'),
  kemelni(19, 'question', 'I go to the Atlas mountains with my friends.', 'أذهب إلى جبال الأطلس مع أصدقائي.', 'Where do you go?', 'إلى أين تذهب؟'),
  kemelni(19, 'next', 'Yes, I love camping!', 'نعم، أحب التخييم!', 'Can I come with you next time?', 'هل يمكنني أن آتي معك في المرة القادمة؟', 'نقبل أيضًا: Do you like travelling?'),
]
