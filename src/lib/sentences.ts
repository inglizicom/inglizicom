// ─── Types ────────────────────────────────────────────────────────────────────

export type Level = 'A1' | 'A2' | 'B1'

export interface Sentence {
  id: string
  english: string
  arabic: string
  level: Level
  topic: string
}

// ─── Sentence Pool ───────────────────────────────────────────────────────────
// 200+ sentences per level = 600+ total
// Topics: daily-life, introductions, travel, work, education, food, shopping,
//         weather, health, family, hobbies, feelings, transport, places,
//         technology, opinions, environment, communication, goals, culture

export const SENTENCE_POOL: Sentence[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  //  A1 — BEGINNER (200 sentences)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Introductions ──
  { id: 'a1_001', level: 'A1', topic: 'introductions', english: 'My name is Sara and I live in Morocco.', arabic: 'اسمي سارة وأنا أسكن في المغرب.' },
  { id: 'a1_002', level: 'A1', topic: 'introductions', english: 'I am twenty years old and I am a student.', arabic: 'عمري عشرون سنة وأنا طالب.' },
  { id: 'a1_003', level: 'A1', topic: 'introductions', english: 'Nice to meet you. Where are you from?', arabic: 'يسعدني مقابلتك. من أين أنت؟' },
  { id: 'a1_004', level: 'A1', topic: 'introductions', english: 'I am from Casablanca. It is a big city.', arabic: 'أنا من الدار البيضاء. إنها مدينة كبيرة.' },
  { id: 'a1_005', level: 'A1', topic: 'introductions', english: 'What is your name? My name is Ahmed.', arabic: 'ما اسمك؟ اسمي أحمد.' },
  { id: 'a1_006', level: 'A1', topic: 'introductions', english: 'I speak Arabic and a little English.', arabic: 'أتحدث العربية وقليل من الإنجليزية.' },
  { id: 'a1_007', level: 'A1', topic: 'introductions', english: 'This is my friend Youssef. He is very nice.', arabic: 'هذا صديقي يوسف. هو لطيف جداً.' },
  { id: 'a1_008', level: 'A1', topic: 'introductions', english: 'How old are you? I am fifteen years old.', arabic: 'كم عمرك؟ عمري خمسة عشر سنة.' },
  { id: 'a1_009', level: 'A1', topic: 'introductions', english: 'I am a new student in this school.', arabic: 'أنا طالب جديد في هذه المدرسة.' },
  { id: 'a1_010', level: 'A1', topic: 'introductions', english: 'She is my sister. Her name is Fatima.', arabic: 'هي أختي. اسمها فاطمة.' },

  // ── Daily life ──
  { id: 'a1_011', level: 'A1', topic: 'daily-life', english: 'I wake up at seven o\'clock every morning.', arabic: 'أستيقظ الساعة السابعة كل صباح.' },
  { id: 'a1_012', level: 'A1', topic: 'daily-life', english: 'I eat breakfast before I go to school.', arabic: 'آكل الفطور قبل أن أذهب إلى المدرسة.' },
  { id: 'a1_013', level: 'A1', topic: 'daily-life', english: 'I go to the market every Saturday morning.', arabic: 'أذهب إلى السوق كل صباح يوم السبت.' },
  { id: 'a1_014', level: 'A1', topic: 'daily-life', english: 'I usually sleep at eleven at night.', arabic: 'عادةً أنام الساعة الحادية عشرة ليلاً.' },
  { id: 'a1_015', level: 'A1', topic: 'daily-life', english: 'I brush my teeth before I go to bed.', arabic: 'أفرش أسناني قبل أن أذهب للنوم.' },
  { id: 'a1_016', level: 'A1', topic: 'daily-life', english: 'I take a shower every morning before work.', arabic: 'أستحم كل صباح قبل العمل.' },
  { id: 'a1_017', level: 'A1', topic: 'daily-life', english: 'She reads a book before she sleeps.', arabic: 'تقرأ كتاباً قبل أن تنام.' },
  { id: 'a1_018', level: 'A1', topic: 'daily-life', english: 'I watch television after dinner.', arabic: 'أشاهد التلفاز بعد العشاء.' },
  { id: 'a1_019', level: 'A1', topic: 'daily-life', english: 'He gets dressed and goes to work at eight.', arabic: 'يرتدي ملابسه ويذهب إلى العمل في الثامنة.' },
  { id: 'a1_020', level: 'A1', topic: 'daily-life', english: 'We eat lunch together at one o\'clock.', arabic: 'نأكل الغداء معاً في الساعة الواحدة.' },
  { id: 'a1_021', level: 'A1', topic: 'daily-life', english: 'I clean my room every weekend.', arabic: 'أنظف غرفتي كل عطلة نهاية الأسبوع.' },
  { id: 'a1_022', level: 'A1', topic: 'daily-life', english: 'She cooks dinner for her family every evening.', arabic: 'تطبخ العشاء لعائلتها كل مساء.' },
  { id: 'a1_023', level: 'A1', topic: 'daily-life', english: 'I do my homework after school.', arabic: 'أعمل واجبي المنزلي بعد المدرسة.' },
  { id: 'a1_024', level: 'A1', topic: 'daily-life', english: 'He walks to school because it is close.', arabic: 'يمشي إلى المدرسة لأنها قريبة.' },
  { id: 'a1_025', level: 'A1', topic: 'daily-life', english: 'I listen to music on the bus.', arabic: 'أستمع إلى الموسيقى في الحافلة.' },

  // ── Family ──
  { id: 'a1_026', level: 'A1', topic: 'family', english: 'She has two brothers and one sister.', arabic: 'عندها أخان وأخت واحدة.' },
  { id: 'a1_027', level: 'A1', topic: 'family', english: 'She always helps her mother in the kitchen.', arabic: 'تساعد أمها دائماً في المطبخ.' },
  { id: 'a1_028', level: 'A1', topic: 'family', english: 'I live with my parents and my little brother.', arabic: 'أعيش مع والديّ وأخي الصغير.' },
  { id: 'a1_029', level: 'A1', topic: 'family', english: 'My father works in a hospital.', arabic: 'أبي يعمل في مستشفى.' },
  { id: 'a1_030', level: 'A1', topic: 'family', english: 'My mother is a very good cook.', arabic: 'أمي طباخة ممتازة.' },
  { id: 'a1_031', level: 'A1', topic: 'family', english: 'My grandfather tells us stories every night.', arabic: 'جدي يحكي لنا قصصاً كل ليلة.' },
  { id: 'a1_032', level: 'A1', topic: 'family', english: 'I have a big family. We are seven people.', arabic: 'عندي عائلة كبيرة. نحن سبعة أفراد.' },
  { id: 'a1_033', level: 'A1', topic: 'family', english: 'My baby sister is only two years old.', arabic: 'أختي الصغيرة عمرها سنتين فقط.' },
  { id: 'a1_034', level: 'A1', topic: 'family', english: 'We visit our grandparents every Friday.', arabic: 'نزور أجدادنا كل يوم جمعة.' },
  { id: 'a1_035', level: 'A1', topic: 'family', english: 'My uncle lives in another city.', arabic: 'عمي يعيش في مدينة أخرى.' },

  // ── Polite phrases ──
  { id: 'a1_036', level: 'A1', topic: 'polite-phrases', english: 'Can I have a glass of water, please?', arabic: 'هل يمكنني الحصول على كوب ماء من فضلك؟' },
  { id: 'a1_037', level: 'A1', topic: 'polite-phrases', english: 'Can you speak more slowly, please?', arabic: 'هل يمكنك التحدث ببطء أكثر من فضلك؟' },
  { id: 'a1_038', level: 'A1', topic: 'polite-phrases', english: 'I do not understand. Can you repeat that?', arabic: 'لم أفهم. هل يمكنك تكرار ذلك؟' },
  { id: 'a1_039', level: 'A1', topic: 'polite-phrases', english: 'Thank you very much for your help.', arabic: 'شكراً جزيلاً على مساعدتك.' },
  { id: 'a1_040', level: 'A1', topic: 'polite-phrases', english: 'Excuse me, where is the bathroom?', arabic: 'عفواً، أين الحمام؟' },
  { id: 'a1_041', level: 'A1', topic: 'polite-phrases', english: 'I am sorry. I did not mean to do that.', arabic: 'أنا آسف. لم أقصد فعل ذلك.' },
  { id: 'a1_042', level: 'A1', topic: 'polite-phrases', english: 'Could you help me, please?', arabic: 'هل يمكنك مساعدتي من فضلك؟' },
  { id: 'a1_043', level: 'A1', topic: 'polite-phrases', english: 'You are welcome. It was no problem.', arabic: 'على الرحب والسعة. لم تكن مشكلة.' },
  { id: 'a1_044', level: 'A1', topic: 'polite-phrases', english: 'Please wait here for a moment.', arabic: 'من فضلك انتظر هنا لحظة.' },
  { id: 'a1_045', level: 'A1', topic: 'polite-phrases', english: 'May I sit here? Is this seat free?', arabic: 'هل يمكنني الجلوس هنا؟ هل هذا المقعد فارغ؟' },

  // ── Food & drink ──
  { id: 'a1_046', level: 'A1', topic: 'food', english: 'I like tea with milk in the morning.', arabic: 'أحب الشاي بالحليب في الصباح.' },
  { id: 'a1_047', level: 'A1', topic: 'food', english: 'What is your favourite food?', arabic: 'ما هو طعامك المفضل؟' },
  { id: 'a1_048', level: 'A1', topic: 'food', english: 'I need to buy bread and milk from the shop.', arabic: 'أحتاج لشراء الخبز والحليب من الدكان.' },
  { id: 'a1_049', level: 'A1', topic: 'food', english: 'He drinks coffee every day at work.', arabic: 'يشرب القهوة كل يوم في العمل.' },
  { id: 'a1_050', level: 'A1', topic: 'food', english: 'I want a sandwich and some orange juice.', arabic: 'أريد ساندويش وبعض عصير البرتقال.' },
  { id: 'a1_051', level: 'A1', topic: 'food', english: 'This cake is very delicious. I love it.', arabic: 'هذه الكعكة لذيذة جداً. أحبها.' },
  { id: 'a1_052', level: 'A1', topic: 'food', english: 'We always have couscous on Friday.', arabic: 'دائماً نأكل الكسكس يوم الجمعة.' },
  { id: 'a1_053', level: 'A1', topic: 'food', english: 'I do not eat meat. I am vegetarian.', arabic: 'لا آكل اللحم. أنا نباتي.' },
  { id: 'a1_054', level: 'A1', topic: 'food', english: 'Can I have the menu, please?', arabic: 'هل يمكنني الحصول على القائمة من فضلك؟' },
  { id: 'a1_055', level: 'A1', topic: 'food', english: 'The soup is hot. Be careful.', arabic: 'الحساء ساخن. كن حذراً.' },
  { id: 'a1_056', level: 'A1', topic: 'food', english: 'She likes to eat fruits after lunch.', arabic: 'تحب أكل الفواكه بعد الغداء.' },
  { id: 'a1_057', level: 'A1', topic: 'food', english: 'I am very hungry. Let us eat now.', arabic: 'أنا جائع جداً. هيا نأكل الآن.' },

  // ── Places & directions ──
  { id: 'a1_058', level: 'A1', topic: 'places', english: 'The café is near the train station.', arabic: 'المقهى قريب من محطة القطار.' },
  { id: 'a1_059', level: 'A1', topic: 'places', english: 'The school is on the left and the park is on the right.', arabic: 'المدرسة على اليسار والحديقة على اليمين.' },
  { id: 'a1_060', level: 'A1', topic: 'places', english: 'Where is the nearest supermarket?', arabic: 'أين أقرب سوبرماركت؟' },
  { id: 'a1_061', level: 'A1', topic: 'places', english: 'The hospital is behind the big mosque.', arabic: 'المستشفى خلف المسجد الكبير.' },
  { id: 'a1_062', level: 'A1', topic: 'places', english: 'Go straight and then turn right.', arabic: 'امشِ مستقيماً ثم انعطف يميناً.' },
  { id: 'a1_063', level: 'A1', topic: 'places', english: 'The bank is next to the post office.', arabic: 'البنك بجانب مكتب البريد.' },
  { id: 'a1_064', level: 'A1', topic: 'places', english: 'Is there a pharmacy near here?', arabic: 'هل هناك صيدلية قريبة من هنا؟' },
  { id: 'a1_065', level: 'A1', topic: 'places', english: 'The library is on the second floor.', arabic: 'المكتبة في الطابق الثاني.' },

  // ── Weather ──
  { id: 'a1_066', level: 'A1', topic: 'weather', english: 'It is cold today. Please wear a jacket.', arabic: 'الجو بارد اليوم. من فضلك ارتدِ سترة.' },
  { id: 'a1_067', level: 'A1', topic: 'weather', english: 'The weather is nice today. Let us go for a walk.', arabic: 'الطقس جميل اليوم. هيا نذهب في نزهة.' },
  { id: 'a1_068', level: 'A1', topic: 'weather', english: 'It is very hot in summer in Morocco.', arabic: 'الجو حار جداً في الصيف في المغرب.' },
  { id: 'a1_069', level: 'A1', topic: 'weather', english: 'It is raining outside. Take your umbrella.', arabic: 'إنها تمطر بالخارج. خذ مظلتك.' },
  { id: 'a1_070', level: 'A1', topic: 'weather', english: 'I love spring because the flowers bloom.', arabic: 'أحب الربيع لأن الأزهار تتفتح.' },
  { id: 'a1_071', level: 'A1', topic: 'weather', english: 'It is windy today. Close the window.', arabic: 'الجو عاصف اليوم. أغلق النافذة.' },
  { id: 'a1_072', level: 'A1', topic: 'weather', english: 'The sun is shining. It is a beautiful day.', arabic: 'الشمس مشرقة. إنه يوم جميل.' },

  // ── Work & school ──
  { id: 'a1_073', level: 'A1', topic: 'work', english: 'He is a doctor and she is a teacher.', arabic: 'هو طبيب وهي معلمة.' },
  { id: 'a1_074', level: 'A1', topic: 'education', english: 'We have English class on Monday and Wednesday.', arabic: 'لدينا درس إنجليزي يوم الاثنين والأربعاء.' },
  { id: 'a1_075', level: 'A1', topic: 'education', english: 'She studies English every evening for one hour.', arabic: 'تدرس الإنجليزية كل مساء لمدة ساعة.' },
  { id: 'a1_076', level: 'A1', topic: 'work', english: 'My brother is a taxi driver in the city.', arabic: 'أخي سائق تاكسي في المدينة.' },
  { id: 'a1_077', level: 'A1', topic: 'education', english: 'The exam is next week. I must study hard.', arabic: 'الامتحان الأسبوع القادم. يجب أن أدرس بجد.' },
  { id: 'a1_078', level: 'A1', topic: 'work', english: 'She works in a bakery. She makes bread.', arabic: 'تعمل في مخبزة. تصنع الخبز.' },
  { id: 'a1_079', level: 'A1', topic: 'education', english: 'I learn new words every day.', arabic: 'أتعلم كلمات جديدة كل يوم.' },
  { id: 'a1_080', level: 'A1', topic: 'work', english: 'He starts work at nine and finishes at five.', arabic: 'يبدأ العمل في التاسعة وينتهي في الخامسة.' },

  // ── Shopping ──
  { id: 'a1_081', level: 'A1', topic: 'shopping', english: 'How much does this shirt cost?', arabic: 'بكم هذا القميص؟' },
  { id: 'a1_082', level: 'A1', topic: 'shopping', english: 'I want to buy a new phone.', arabic: 'أريد شراء هاتف جديد.' },
  { id: 'a1_083', level: 'A1', topic: 'shopping', english: 'This is too expensive. Do you have something cheaper?', arabic: 'هذا غالي جداً. هل عندك شيء أرخص؟' },
  { id: 'a1_084', level: 'A1', topic: 'shopping', english: 'I need a pair of shoes for school.', arabic: 'أحتاج حذاءً للمدرسة.' },
  { id: 'a1_085', level: 'A1', topic: 'shopping', english: 'Can I try this on? Where is the fitting room?', arabic: 'هل يمكنني تجربة هذا؟ أين غرفة القياس؟' },
  { id: 'a1_086', level: 'A1', topic: 'shopping', english: 'I pay with cash, not with a card.', arabic: 'أدفع نقداً وليس بالبطاقة.' },
  { id: 'a1_087', level: 'A1', topic: 'shopping', english: 'The store closes at nine in the evening.', arabic: 'المتجر يغلق في التاسعة مساءً.' },

  // ── Transport ──
  { id: 'a1_088', level: 'A1', topic: 'transport', english: 'The bus stops in front of the big hotel.', arabic: 'الحافلة تتوقف أمام الفندق الكبير.' },
  { id: 'a1_089', level: 'A1', topic: 'transport', english: 'I take the bus to school every day.', arabic: 'آخذ الحافلة إلى المدرسة كل يوم.' },
  { id: 'a1_090', level: 'A1', topic: 'transport', english: 'The train leaves at three o\'clock.', arabic: 'القطار يغادر في الساعة الثالثة.' },
  { id: 'a1_091', level: 'A1', topic: 'transport', english: 'How do I get to the airport from here?', arabic: 'كيف أصل إلى المطار من هنا؟' },
  { id: 'a1_092', level: 'A1', topic: 'transport', english: 'She drives her car to work.', arabic: 'تقود سيارتها إلى العمل.' },
  { id: 'a1_093', level: 'A1', topic: 'transport', english: 'I ride my bicycle in the park.', arabic: 'أركب دراجتي في الحديقة.' },

  // ── Feelings ──
  { id: 'a1_094', level: 'A1', topic: 'feelings', english: 'I am happy because today is my birthday.', arabic: 'أنا سعيد لأن اليوم عيد ميلادي.' },
  { id: 'a1_095', level: 'A1', topic: 'feelings', english: 'She is tired because she studied all night.', arabic: 'هي متعبة لأنها درست طوال الليل.' },
  { id: 'a1_096', level: 'A1', topic: 'feelings', english: 'I am bored. There is nothing to do.', arabic: 'أنا ملول. ليس هناك ما أفعله.' },
  { id: 'a1_097', level: 'A1', topic: 'feelings', english: 'He is angry because he lost his keys.', arabic: 'هو غاضب لأنه فقد مفاتيحه.' },
  { id: 'a1_098', level: 'A1', topic: 'feelings', english: 'I am excited about the trip tomorrow.', arabic: 'أنا متحمس للرحلة غداً.' },
  { id: 'a1_099', level: 'A1', topic: 'feelings', english: 'She is sad because her friend moved away.', arabic: 'هي حزينة لأن صديقتها انتقلت بعيداً.' },
  { id: 'a1_100', level: 'A1', topic: 'feelings', english: 'I feel great today. I slept very well.', arabic: 'أشعر بحال ممتاز اليوم. نمت جيداً جداً.' },

  // ── Hobbies ──
  { id: 'a1_101', level: 'A1', topic: 'hobbies', english: 'I love watching football with my friends on weekends.', arabic: 'أحب مشاهدة كرة القدم مع أصدقائي في عطلة نهاية الأسبوع.' },
  { id: 'a1_102', level: 'A1', topic: 'hobbies', english: 'My favourite colour is blue and I like green too.', arabic: 'لوني المفضل هو الأزرق وأحب الأخضر أيضاً.' },
  { id: 'a1_103', level: 'A1', topic: 'hobbies', english: 'I play football every afternoon with my friends.', arabic: 'ألعب كرة القدم كل بعد ظهر مع أصدقائي.' },
  { id: 'a1_104', level: 'A1', topic: 'hobbies', english: 'She likes to draw pictures of animals.', arabic: 'تحب رسم صور الحيوانات.' },
  { id: 'a1_105', level: 'A1', topic: 'hobbies', english: 'I enjoy swimming in the sea during summer.', arabic: 'أستمتع بالسباحة في البحر خلال الصيف.' },
  { id: 'a1_106', level: 'A1', topic: 'hobbies', english: 'He likes to play video games after school.', arabic: 'يحب لعب ألعاب الفيديو بعد المدرسة.' },
  { id: 'a1_107', level: 'A1', topic: 'hobbies', english: 'I read books every night before I sleep.', arabic: 'أقرأ الكتب كل ليلة قبل أن أنام.' },
  { id: 'a1_108', level: 'A1', topic: 'hobbies', english: 'We go to the cinema on Saturday nights.', arabic: 'نذهب إلى السينما ليالي السبت.' },
  { id: 'a1_109', level: 'A1', topic: 'hobbies', english: 'I like to take photos with my phone.', arabic: 'أحب التقاط الصور بهاتفي.' },
  { id: 'a1_110', level: 'A1', topic: 'hobbies', english: 'She sings beautifully. She loves music.', arabic: 'تغني بشكل جميل. تحب الموسيقى.' },

  // ── Health ──
  { id: 'a1_111', level: 'A1', topic: 'health', english: 'I have a headache. I need some medicine.', arabic: 'عندي صداع. أحتاج دواء.' },
  { id: 'a1_112', level: 'A1', topic: 'health', english: 'He is sick. He has a cold and a fever.', arabic: 'هو مريض. عنده زكام وحمى.' },
  { id: 'a1_113', level: 'A1', topic: 'health', english: 'I drink a lot of water every day.', arabic: 'أشرب الكثير من الماء كل يوم.' },
  { id: 'a1_114', level: 'A1', topic: 'health', english: 'My stomach hurts. I ate too much.', arabic: 'بطني يؤلمني. أكلت كثيراً.' },
  { id: 'a1_115', level: 'A1', topic: 'health', english: 'You should wash your hands before eating.', arabic: 'يجب أن تغسل يديك قبل الأكل.' },

  // ── Time & numbers ──
  { id: 'a1_116', level: 'A1', topic: 'time', english: 'What time is it? It is half past three.', arabic: 'كم الساعة؟ إنها الثالثة والنصف.' },
  { id: 'a1_117', level: 'A1', topic: 'time', english: 'The class starts at nine in the morning.', arabic: 'الحصة تبدأ في التاسعة صباحاً.' },
  { id: 'a1_118', level: 'A1', topic: 'time', english: 'Today is Wednesday. Tomorrow is Thursday.', arabic: 'اليوم الأربعاء. غداً الخميس.' },
  { id: 'a1_119', level: 'A1', topic: 'time', english: 'My birthday is in March.', arabic: 'عيد ميلادي في شهر مارس.' },
  { id: 'a1_120', level: 'A1', topic: 'time', english: 'There are twelve months in a year.', arabic: 'هناك اثنا عشر شهراً في السنة.' },

  // ── Home & objects ──
  { id: 'a1_121', level: 'A1', topic: 'home', english: 'My house has three bedrooms and a garden.', arabic: 'بيتي فيه ثلاث غرف نوم وحديقة.' },
  { id: 'a1_122', level: 'A1', topic: 'home', english: 'The kitchen is next to the living room.', arabic: 'المطبخ بجانب غرفة المعيشة.' },
  { id: 'a1_123', level: 'A1', topic: 'home', english: 'I put my books on the table.', arabic: 'أضع كتبي على الطاولة.' },
  { id: 'a1_124', level: 'A1', topic: 'home', english: 'Please close the door. It is cold outside.', arabic: 'من فضلك أغلق الباب. الجو بارد بالخارج.' },
  { id: 'a1_125', level: 'A1', topic: 'home', english: 'There is a big window in my bedroom.', arabic: 'هناك نافذة كبيرة في غرفة نومي.' },

  // ── Animals & nature ──
  { id: 'a1_126', level: 'A1', topic: 'animals', english: 'I have a cat. Her name is Luna.', arabic: 'عندي قطة. اسمها لونا.' },
  { id: 'a1_127', level: 'A1', topic: 'animals', english: 'Dogs are very loyal animals.', arabic: 'الكلاب حيوانات وفية جداً.' },
  { id: 'a1_128', level: 'A1', topic: 'animals', english: 'There are many birds in the garden.', arabic: 'هناك طيور كثيرة في الحديقة.' },
  { id: 'a1_129', level: 'A1', topic: 'animals', english: 'I am afraid of spiders.', arabic: 'أخاف من العناكب.' },
  { id: 'a1_130', level: 'A1', topic: 'animals', english: 'The fish in the sea are very colorful.', arabic: 'الأسماك في البحر ملونة جداً.' },

  // ── More daily situations ──
  { id: 'a1_131', level: 'A1', topic: 'daily-life', english: 'I forgot my keys at home.', arabic: 'نسيت مفاتيحي في البيت.' },
  { id: 'a1_132', level: 'A1', topic: 'daily-life', english: 'She is waiting for the bus.', arabic: 'هي تنتظر الحافلة.' },
  { id: 'a1_133', level: 'A1', topic: 'daily-life', english: 'I need to charge my phone.', arabic: 'أحتاج أن أشحن هاتفي.' },
  { id: 'a1_134', level: 'A1', topic: 'daily-life', english: 'He is looking for his wallet.', arabic: 'هو يبحث عن محفظته.' },
  { id: 'a1_135', level: 'A1', topic: 'daily-life', english: 'The alarm rings at six thirty.', arabic: 'المنبه يرن في السادسة والنصف.' },
  { id: 'a1_136', level: 'A1', topic: 'daily-life', english: 'I always carry a water bottle with me.', arabic: 'دائماً أحمل زجاجة ماء معي.' },
  { id: 'a1_137', level: 'A1', topic: 'daily-life', english: 'She is talking on the phone now.', arabic: 'هي تتحدث بالهاتف الآن.' },
  { id: 'a1_138', level: 'A1', topic: 'daily-life', english: 'I open the window every morning.', arabic: 'أفتح النافذة كل صباح.' },
  { id: 'a1_139', level: 'A1', topic: 'daily-life', english: 'He is wearing a red jacket today.', arabic: 'هو يلبس سترة حمراء اليوم.' },
  { id: 'a1_140', level: 'A1', topic: 'daily-life', english: 'I am going to the dentist tomorrow.', arabic: 'سأذهب إلى طبيب الأسنان غداً.' },
  { id: 'a1_141', level: 'A1', topic: 'daily-life', english: 'We have guests tonight for dinner.', arabic: 'عندنا ضيوف الليلة على العشاء.' },
  { id: 'a1_142', level: 'A1', topic: 'daily-life', english: 'The children are playing in the park.', arabic: 'الأطفال يلعبون في الحديقة.' },
  { id: 'a1_143', level: 'A1', topic: 'daily-life', english: 'I like this song. It makes me happy.', arabic: 'أحب هذه الأغنية. تجعلني سعيداً.' },
  { id: 'a1_144', level: 'A1', topic: 'daily-life', english: 'She gives me a gift on my birthday.', arabic: 'تعطيني هدية في عيد ميلادي.' },
  { id: 'a1_145', level: 'A1', topic: 'daily-life', english: 'I write my name in English.', arabic: 'أكتب اسمي بالإنجليزية.' },
  { id: 'a1_146', level: 'A1', topic: 'daily-life', english: 'The door is open. Please come in.', arabic: 'الباب مفتوح. تفضل ادخل.' },
  { id: 'a1_147', level: 'A1', topic: 'daily-life', english: 'I need a pen and some paper.', arabic: 'أحتاج قلماً وبعض الورق.' },
  { id: 'a1_148', level: 'A1', topic: 'daily-life', english: 'He is running because he is late.', arabic: 'هو يركض لأنه متأخر.' },
  { id: 'a1_149', level: 'A1', topic: 'daily-life', english: 'The light is off. It is very dark.', arabic: 'الضوء مطفأ. الجو مظلم جداً.' },
  { id: 'a1_150', level: 'A1', topic: 'daily-life', english: 'I want to learn something new every day.', arabic: 'أريد أن أتعلم شيئاً جديداً كل يوم.' },

  // ── Travel basics ──
  { id: 'a1_151', level: 'A1', topic: 'travel', english: 'I have a passport. I can travel now.', arabic: 'عندي جواز سفر. يمكنني السفر الآن.' },
  { id: 'a1_152', level: 'A1', topic: 'travel', english: 'The hotel is close to the beach.', arabic: 'الفندق قريب من الشاطئ.' },
  { id: 'a1_153', level: 'A1', topic: 'travel', english: 'I want to visit Paris one day.', arabic: 'أريد زيارة باريس يوماً ما.' },
  { id: 'a1_154', level: 'A1', topic: 'travel', english: 'We travel by plane to London.', arabic: 'نسافر بالطائرة إلى لندن.' },
  { id: 'a1_155', level: 'A1', topic: 'travel', english: 'Do you have a map of the city?', arabic: 'هل عندك خريطة المدينة؟' },

  // ── Technology basics ──
  { id: 'a1_156', level: 'A1', topic: 'technology', english: 'I use my phone to send messages.', arabic: 'أستعمل هاتفي لإرسال الرسائل.' },
  { id: 'a1_157', level: 'A1', topic: 'technology', english: 'The internet is not working today.', arabic: 'الإنترنت لا يعمل اليوم.' },
  { id: 'a1_158', level: 'A1', topic: 'technology', english: 'I have a new laptop for school.', arabic: 'عندي حاسوب محمول جديد للمدرسة.' },
  { id: 'a1_159', level: 'A1', topic: 'technology', english: 'She watches videos on YouTube.', arabic: 'تشاهد فيديوهات على يوتيوب.' },
  { id: 'a1_160', level: 'A1', topic: 'technology', english: 'Can you send me a photo on WhatsApp?', arabic: 'هل يمكنك إرسال صورة لي على واتساب؟' },

  // ── More polite / useful ──
  { id: 'a1_161', level: 'A1', topic: 'polite-phrases', english: 'Good morning. How are you today?', arabic: 'صباح الخير. كيف حالك اليوم؟' },
  { id: 'a1_162', level: 'A1', topic: 'polite-phrases', english: 'See you tomorrow. Have a nice evening.', arabic: 'أراك غداً. أتمنى لك مساءً جميلاً.' },
  { id: 'a1_163', level: 'A1', topic: 'polite-phrases', english: 'Happy birthday! I hope you have a great day.', arabic: 'عيد ميلاد سعيد! أتمنى لك يوماً رائعاً.' },
  { id: 'a1_164', level: 'A1', topic: 'polite-phrases', english: 'I am fine, thank you. And you?', arabic: 'أنا بخير شكراً. وأنت؟' },
  { id: 'a1_165', level: 'A1', topic: 'polite-phrases', english: 'Goodbye. See you next week.', arabic: 'وداعاً. أراك الأسبوع القادم.' },

  // ── Extra A1 ──
  { id: 'a1_166', level: 'A1', topic: 'education', english: 'The teacher is kind and very patient.', arabic: 'المعلم لطيف وصبور جداً.' },
  { id: 'a1_167', level: 'A1', topic: 'education', english: 'I have a pencil and a notebook.', arabic: 'عندي قلم رصاص ودفتر.' },
  { id: 'a1_168', level: 'A1', topic: 'food', english: 'Breakfast is the most important meal.', arabic: 'الفطور هو أهم وجبة.' },
  { id: 'a1_169', level: 'A1', topic: 'feelings', english: 'I am proud of my sister. She works hard.', arabic: 'أنا فخور بأختي. إنها تعمل بجد.' },
  { id: 'a1_170', level: 'A1', topic: 'family', english: 'My cousin is coming to visit us next week.', arabic: 'ابن عمي قادم لزيارتنا الأسبوع القادم.' },
  { id: 'a1_171', level: 'A1', topic: 'daily-life', english: 'I turn off the lights before I leave.', arabic: 'أطفئ الأضواء قبل أن أغادر.' },
  { id: 'a1_172', level: 'A1', topic: 'daily-life', english: 'She puts her bag on the chair.', arabic: 'تضع حقيبتها على الكرسي.' },
  { id: 'a1_173', level: 'A1', topic: 'shopping', english: 'I want two kilos of tomatoes, please.', arabic: 'أريد كيلوين من الطماطم من فضلك.' },
  { id: 'a1_174', level: 'A1', topic: 'home', english: 'The bathroom is at the end of the hall.', arabic: 'الحمام في آخر الممر.' },
  { id: 'a1_175', level: 'A1', topic: 'transport', english: 'The taxi is yellow and very fast.', arabic: 'التاكسي أصفر وسريع جداً.' },
  { id: 'a1_176', level: 'A1', topic: 'weather', english: 'It snows in the mountains in winter.', arabic: 'تتساقط الثلوج في الجبال في الشتاء.' },
  { id: 'a1_177', level: 'A1', topic: 'health', english: 'I go to the doctor when I feel sick.', arabic: 'أذهب إلى الطبيب عندما أشعر بالمرض.' },
  { id: 'a1_178', level: 'A1', topic: 'food', english: 'She puts sugar in her tea.', arabic: 'تضع السكر في شايها.' },
  { id: 'a1_179', level: 'A1', topic: 'hobbies', english: 'I like to walk by the river in the evening.', arabic: 'أحب المشي بجانب النهر في المساء.' },
  { id: 'a1_180', level: 'A1', topic: 'animals', english: 'The cat sleeps on the sofa all day.', arabic: 'القطة تنام على الأريكة طوال اليوم.' },
  { id: 'a1_181', level: 'A1', topic: 'daily-life', english: 'I set the table before we eat.', arabic: 'أرتب الطاولة قبل أن نأكل.' },
  { id: 'a1_182', level: 'A1', topic: 'daily-life', english: 'He is very tall and has black hair.', arabic: 'هو طويل جداً وله شعر أسود.' },
  { id: 'a1_183', level: 'A1', topic: 'daily-life', english: 'I wake up early on school days.', arabic: 'أستيقظ مبكراً في أيام المدرسة.' },
  { id: 'a1_184', level: 'A1', topic: 'daily-life', english: 'We sit together and talk after dinner.', arabic: 'نجلس معاً ونتحدث بعد العشاء.' },
  { id: 'a1_185', level: 'A1', topic: 'daily-life', english: 'She loves ice cream. It is her favourite.', arabic: 'تحب المثلجات. إنها مفضلتها.' },
  { id: 'a1_186', level: 'A1', topic: 'education', english: 'I practice my English with my friend.', arabic: 'أتدرب على إنجليزيتي مع صديقي.' },
  { id: 'a1_187', level: 'A1', topic: 'places', english: 'The park is very big and very green.', arabic: 'الحديقة كبيرة جداً وخضراء جداً.' },
  { id: 'a1_188', level: 'A1', topic: 'food', english: 'I drink water, not soda.', arabic: 'أشرب الماء وليس المشروب الغازي.' },
  { id: 'a1_189', level: 'A1', topic: 'daily-life', english: 'He closes the shop at ten o\'clock.', arabic: 'يغلق المحل في الساعة العاشرة.' },
  { id: 'a1_190', level: 'A1', topic: 'daily-life', english: 'I carry my bag to school every morning.', arabic: 'أحمل حقيبتي إلى المدرسة كل صباح.' },
  { id: 'a1_191', level: 'A1', topic: 'time', english: 'I am always late for school on Monday.', arabic: 'أتأخر دائماً عن المدرسة يوم الاثنين.' },
  { id: 'a1_192', level: 'A1', topic: 'feelings', english: 'I am nervous about the exam.', arabic: 'أنا متوتر بشأن الامتحان.' },
  { id: 'a1_193', level: 'A1', topic: 'family', english: 'My mother wakes up before everyone.', arabic: 'أمي تستيقظ قبل الجميع.' },
  { id: 'a1_194', level: 'A1', topic: 'food', english: 'I eat rice and chicken for lunch.', arabic: 'آكل الأرز والدجاج على الغداء.' },
  { id: 'a1_195', level: 'A1', topic: 'hobbies', english: 'We play cards together on Friday nights.', arabic: 'نلعب الورق معاً ليالي الجمعة.' },
  { id: 'a1_196', level: 'A1', topic: 'daily-life', english: 'I dry my hair after the shower.', arabic: 'أجفف شعري بعد الاستحمام.' },
  { id: 'a1_197', level: 'A1', topic: 'home', english: 'The garden has many beautiful flowers.', arabic: 'الحديقة فيها أزهار جميلة كثيرة.' },
  { id: 'a1_198', level: 'A1', topic: 'daily-life', english: 'He eats an apple every afternoon.', arabic: 'يأكل تفاحة كل بعد ظهر.' },
  { id: 'a1_199', level: 'A1', topic: 'daily-life', english: 'I count from one to ten in English.', arabic: 'أعدّ من واحد إلى عشرة بالإنجليزية.' },
  { id: 'a1_200', level: 'A1', topic: 'feelings', english: 'She smiles because she is very happy.', arabic: 'تبتسم لأنها سعيدة جداً.' },

  // ═══════════════════════════════════════════════════════════════════════════
  //  A2 — ELEMENTARY (200 sentences)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Travel ──
  { id: 'a2_001', level: 'A2', topic: 'travel', english: 'I went to the beach last weekend with my family.', arabic: 'ذهبت إلى الشاطئ نهاية الأسبوع الماضي مع عائلتي.' },
  { id: 'a2_002', level: 'A2', topic: 'travel', english: 'We are planning to visit Spain during the summer.', arabic: 'نخطط لزيارة إسبانيا خلال الصيف.' },
  { id: 'a2_003', level: 'A2', topic: 'travel', english: 'What time does your flight arrive tomorrow morning?', arabic: 'في أي ساعة تصل رحلتك الجوية صباح الغد؟' },
  { id: 'a2_004', level: 'A2', topic: 'travel', english: 'I forgot to bring my umbrella and it started to rain.', arabic: 'نسيت إحضار مظلتي وبدأت الأمطار.' },
  { id: 'a2_005', level: 'A2', topic: 'travel', english: 'The hotel room has a beautiful view of the mountain.', arabic: 'غرفة الفندق فيها منظر جميل للجبل.' },
  { id: 'a2_006', level: 'A2', topic: 'travel', english: 'I took many photos during my trip to Turkey.', arabic: 'التقطت صوراً كثيرة خلال رحلتي إلى تركيا.' },
  { id: 'a2_007', level: 'A2', topic: 'travel', english: 'We stayed at a small hotel near the old city.', arabic: 'أقمنا في فندق صغير بالقرب من المدينة القديمة.' },
  { id: 'a2_008', level: 'A2', topic: 'travel', english: 'The flight was delayed by two hours because of the weather.', arabic: 'تأخرت الرحلة ساعتين بسبب الطقس.' },
  { id: 'a2_009', level: 'A2', topic: 'travel', english: 'I lost my luggage at the airport. I need help.', arabic: 'فقدت حقائبي في المطار. أحتاج مساعدة.' },
  { id: 'a2_010', level: 'A2', topic: 'travel', english: 'She booked the tickets online two weeks ago.', arabic: 'حجزت التذاكر عبر الإنترنت قبل أسبوعين.' },
  { id: 'a2_011', level: 'A2', topic: 'travel', english: 'I would like to travel around Europe next year.', arabic: 'أريد السفر حول أوروبا السنة القادمة.' },
  { id: 'a2_012', level: 'A2', topic: 'travel', english: 'We rented a car and drove along the coast.', arabic: 'استأجرنا سيارة وقدنا على طول الساحل.' },

  // ── Work ──
  { id: 'a2_013', level: 'A2', topic: 'work', english: 'She is going to start a new job next month.', arabic: 'ستبدأ وظيفة جديدة الشهر القادم.' },
  { id: 'a2_014', level: 'A2', topic: 'work', english: 'He decided to change his career and study medicine.', arabic: 'قرر تغيير مساره المهني ودراسة الطب.' },
  { id: 'a2_015', level: 'A2', topic: 'work', english: 'He works from home and finds it more comfortable.', arabic: 'يعمل من المنزل ويجد ذلك أكثر راحة.' },
  { id: 'a2_016', level: 'A2', topic: 'work', english: 'I had a meeting with my boss this morning.', arabic: 'كان لدي اجتماع مع مديري هذا الصباح.' },
  { id: 'a2_017', level: 'A2', topic: 'work', english: 'She got promoted because she works very hard.', arabic: 'حصلت على ترقية لأنها تعمل بجد كبير.' },
  { id: 'a2_018', level: 'A2', topic: 'work', english: 'I need to finish this project before Friday.', arabic: 'أحتاج لإنهاء هذا المشروع قبل يوم الجمعة.' },
  { id: 'a2_019', level: 'A2', topic: 'work', english: 'He sent the email but did not get a reply.', arabic: 'أرسل البريد الإلكتروني لكنه لم يحصل على رد.' },
  { id: 'a2_020', level: 'A2', topic: 'work', english: 'My colleague helped me solve the problem.', arabic: 'زميلي ساعدني في حل المشكلة.' },
  { id: 'a2_021', level: 'A2', topic: 'work', english: 'She is looking for a part-time job near her house.', arabic: 'تبحث عن عمل بدوام جزئي قريب من بيتها.' },
  { id: 'a2_022', level: 'A2', topic: 'work', english: 'I want to become an engineer in the future.', arabic: 'أريد أن أصبح مهندساً في المستقبل.' },

  // ── Education ──
  { id: 'a2_023', level: 'A2', topic: 'education', english: 'I prefer studying in the morning when it is quiet.', arabic: 'أفضّل الدراسة في الصباح عندما يكون الجو هادئاً.' },
  { id: 'a2_024', level: 'A2', topic: 'education', english: 'I have been learning English for two years now.', arabic: 'أتعلم الإنجليزية منذ سنتين الآن.' },
  { id: 'a2_025', level: 'A2', topic: 'education', english: 'I need to practice English more often to get better.', arabic: 'أحتاج لممارسة الإنجليزية أكثر لكي أتحسن.' },
  { id: 'a2_026', level: 'A2', topic: 'education', english: 'The teacher explained the grammar very clearly.', arabic: 'شرح المعلم القواعد بشكل واضح جداً.' },
  { id: 'a2_027', level: 'A2', topic: 'education', english: 'I passed the test but my score was not very high.', arabic: 'نجحت في الاختبار لكن درجتي لم تكن عالية جداً.' },
  { id: 'a2_028', level: 'A2', topic: 'education', english: 'She borrowed a book from the library yesterday.', arabic: 'استعارت كتاباً من المكتبة أمس.' },
  { id: 'a2_029', level: 'A2', topic: 'education', english: 'I made many mistakes but I learned from them.', arabic: 'ارتكبت أخطاء كثيرة لكنني تعلمت منها.' },
  { id: 'a2_030', level: 'A2', topic: 'education', english: 'He studies three hours every day to prepare for the exam.', arabic: 'يدرس ثلاث ساعات كل يوم للتحضير للامتحان.' },
  { id: 'a2_031', level: 'A2', topic: 'education', english: 'I found an online course that teaches English for free.', arabic: 'وجدت دورة عبر الإنترنت تُعلّم الإنجليزية مجاناً.' },
  { id: 'a2_032', level: 'A2', topic: 'education', english: 'The university is far from my house so I take the bus.', arabic: 'الجامعة بعيدة عن بيتي لذا آخذ الحافلة.' },

  // ── Daily life ──
  { id: 'a2_033', level: 'A2', topic: 'daily-life', english: 'The restaurant was very crowded because of the holiday.', arabic: 'كان المطعم مزدحماً جداً بسبب العطلة.' },
  { id: 'a2_034', level: 'A2', topic: 'daily-life', english: 'He told me that he lost his wallet on the train.', arabic: 'أخبرني أنه فقد محفظته في القطار.' },
  { id: 'a2_035', level: 'A2', topic: 'daily-life', english: 'What do you usually do on your day off?', arabic: 'ماذا تفعل عادةً في يوم إجازتك؟' },
  { id: 'a2_036', level: 'A2', topic: 'daily-life', english: 'I woke up late today because my alarm did not ring.', arabic: 'استيقظت متأخراً اليوم لأن المنبه لم يرن.' },
  { id: 'a2_037', level: 'A2', topic: 'daily-life', english: 'She moved to a new apartment closer to her office.', arabic: 'انتقلت إلى شقة جديدة أقرب إلى مكتبها.' },
  { id: 'a2_038', level: 'A2', topic: 'daily-life', english: 'I usually spend my weekends with my family.', arabic: 'عادةً أقضي عطلة نهاية الأسبوع مع عائلتي.' },
  { id: 'a2_039', level: 'A2', topic: 'daily-life', english: 'He forgot to lock the door when he left the house.', arabic: 'نسي أن يقفل الباب عندما غادر المنزل.' },
  { id: 'a2_040', level: 'A2', topic: 'daily-life', english: 'We had a power cut last night for three hours.', arabic: 'انقطعت الكهرباء البارحة لمدة ثلاث ساعات.' },

  // ── Transport ──
  { id: 'a2_041', level: 'A2', topic: 'transport', english: 'I usually take the bus but today I walked to work.', arabic: 'عادةً آخذ الحافلة لكن اليوم مشيت إلى العمل.' },
  { id: 'a2_042', level: 'A2', topic: 'transport', english: 'We should leave early to avoid traffic.', arabic: 'يجب أن نغادر مبكراً لتجنب الازدحام.' },
  { id: 'a2_043', level: 'A2', topic: 'transport', english: 'She is learning to drive and takes lessons twice a week.', arabic: 'تتعلم قيادة السيارة وتأخذ دروساً مرتين في الأسبوع.' },
  { id: 'a2_044', level: 'A2', topic: 'transport', english: 'The new metro line is faster than the bus.', arabic: 'خط المترو الجديد أسرع من الحافلة.' },
  { id: 'a2_045', level: 'A2', topic: 'transport', english: 'I got stuck in traffic for over an hour this morning.', arabic: 'علقت في الازدحام لأكثر من ساعة هذا الصباح.' },

  // ── Hobbies & entertainment ──
  { id: 'a2_046', level: 'A2', topic: 'hobbies', english: 'Did you watch the football match last night?', arabic: 'هل شاهدت مباراة كرة القدم البارحة؟' },
  { id: 'a2_047', level: 'A2', topic: 'hobbies', english: 'I enjoy cooking new recipes on weekends.', arabic: 'أستمتع بطهي وصفات جديدة في عطلة نهاية الأسبوع.' },
  { id: 'a2_048', level: 'A2', topic: 'entertainment', english: 'The movie was interesting but a little bit long.', arabic: 'الفيلم كان مثيراً للاهتمام لكنه طويل قليلاً.' },
  { id: 'a2_049', level: 'A2', topic: 'entertainment', english: 'The concert was amazing and the crowd was very energetic.', arabic: 'كان الحفل رائعاً والجمهور كان متحمساً جداً.' },
  { id: 'a2_050', level: 'A2', topic: 'hobbies', english: 'I started learning to play the guitar last month.', arabic: 'بدأت تعلم العزف على الغيتار الشهر الماضي.' },
  { id: 'a2_051', level: 'A2', topic: 'hobbies', english: 'She runs five kilometers every morning before work.', arabic: 'تجري خمسة كيلومترات كل صباح قبل العمل.' },
  { id: 'a2_052', level: 'A2', topic: 'hobbies', english: 'I like reading novels because they improve my vocabulary.', arabic: 'أحب قراءة الروايات لأنها تحسن مفرداتي.' },
  { id: 'a2_053', level: 'A2', topic: 'entertainment', english: 'We watched a documentary about the ocean last night.', arabic: 'شاهدنا فيلماً وثائقياً عن المحيط البارحة.' },
  { id: 'a2_054', level: 'A2', topic: 'hobbies', english: 'He joined a gym to get fit and lose some weight.', arabic: 'انضم إلى نادٍ رياضي ليحصل على لياقة ويفقد بعض الوزن.' },
  { id: 'a2_055', level: 'A2', topic: 'hobbies', english: 'I write in my journal every night before bed.', arabic: 'أكتب في يومياتي كل ليلة قبل النوم.' },

  // ── Feelings ──
  { id: 'a2_056', level: 'A2', topic: 'feelings', english: 'She felt nervous before her first job interview.', arabic: 'شعرت بالتوتر قبل أول مقابلة عمل لها.' },
  { id: 'a2_057', level: 'A2', topic: 'feelings', english: 'I was surprised when I saw my old friend at the mall.', arabic: 'تفاجأت عندما رأيت صديقي القديم في المركز التجاري.' },
  { id: 'a2_058', level: 'A2', topic: 'feelings', english: 'He felt disappointed because he did not get the job.', arabic: 'شعر بخيبة أمل لأنه لم يحصل على الوظيفة.' },
  { id: 'a2_059', level: 'A2', topic: 'feelings', english: 'I was very stressed during the exam period.', arabic: 'كنت متوتراً جداً خلال فترة الامتحانات.' },
  { id: 'a2_060', level: 'A2', topic: 'feelings', english: 'She felt relieved after finishing the presentation.', arabic: 'شعرت بالارتياح بعد إنهاء العرض التقديمي.' },

  // ── Health ──
  { id: 'a2_061', level: 'A2', topic: 'health', english: 'I went to the gym three times last week.', arabic: 'ذهبت إلى النادي الرياضي ثلاث مرات الأسبوع الماضي.' },
  { id: 'a2_062', level: 'A2', topic: 'health', english: 'I drink a lot of water because it is good for my health.', arabic: 'أشرب الكثير من الماء لأنه مفيد لصحتي.' },
  { id: 'a2_063', level: 'A2', topic: 'health', english: 'She went to the doctor because she had a bad cough.', arabic: 'ذهبت إلى الطبيب لأنها كانت تعاني من سعال شديد.' },
  { id: 'a2_064', level: 'A2', topic: 'health', english: 'I try to eat healthy food and exercise regularly.', arabic: 'أحاول أكل طعام صحي وممارسة الرياضة بانتظام.' },
  { id: 'a2_065', level: 'A2', topic: 'health', english: 'He takes vitamins every morning to stay healthy.', arabic: 'يأخذ فيتامينات كل صباح ليبقى بصحة جيدة.' },

  // ── Goals ──
  { id: 'a2_066', level: 'A2', topic: 'goals', english: 'I would like to improve my speaking skills this year.', arabic: 'أريد تحسين مهاراتي في الكلام هذا العام.' },
  { id: 'a2_067', level: 'A2', topic: 'goals', english: 'I am saving money to buy a new laptop next year.', arabic: 'أوفّر المال لشراء حاسوب محمول جديد السنة القادمة.' },
  { id: 'a2_068', level: 'A2', topic: 'goals', english: 'She wants to open her own business one day.', arabic: 'تريد فتح مشروعها الخاص يوماً ما.' },
  { id: 'a2_069', level: 'A2', topic: 'goals', english: 'My goal is to speak English fluently by next year.', arabic: 'هدفي أن أتحدث الإنجليزية بطلاقة بحلول السنة القادمة.' },
  { id: 'a2_070', level: 'A2', topic: 'goals', english: 'He is working hard to get a scholarship abroad.', arabic: 'يعمل بجد للحصول على منحة دراسية في الخارج.' },

  // ── Communication ──
  { id: 'a2_071', level: 'A2', topic: 'communication', english: 'She called me three times but I did not answer.', arabic: 'اتصلت بي ثلاث مرات لكنني لم أرد.' },
  { id: 'a2_072', level: 'A2', topic: 'communication', english: 'Can you help me find the nearest pharmacy?', arabic: 'هل يمكنك مساعدتي في إيجاد أقرب صيدلية؟' },
  { id: 'a2_073', level: 'A2', topic: 'communication', english: 'I sent him a message but he has not replied yet.', arabic: 'أرسلت له رسالة لكنه لم يرد بعد.' },
  { id: 'a2_074', level: 'A2', topic: 'communication', english: 'Could you explain this word to me in simple English?', arabic: 'هل يمكنك شرح هذه الكلمة لي بإنجليزية بسيطة؟' },
  { id: 'a2_075', level: 'A2', topic: 'communication', english: 'I did not understand the instructions. Can you show me?', arabic: 'لم أفهم التعليمات. هل يمكنك أن تريني؟' },

  // ── Shopping ──
  { id: 'a2_076', level: 'A2', topic: 'shopping', english: 'This jacket is too expensive. Do you have a cheaper one?', arabic: 'هذه السترة غالية جداً. هل عندك واحدة أرخص؟' },
  { id: 'a2_077', level: 'A2', topic: 'shopping', english: 'I bought a new dress for my sister\'s wedding.', arabic: 'اشتريت فستاناً جديداً لعرس أختي.' },
  { id: 'a2_078', level: 'A2', topic: 'shopping', english: 'The shop has a sale. Everything is fifty percent off.', arabic: 'المحل فيه تخفيضات. كل شيء بنصف السعر.' },
  { id: 'a2_079', level: 'A2', topic: 'shopping', english: 'I returned the shirt because it was the wrong size.', arabic: 'أرجعت القميص لأن المقاس كان خاطئاً.' },
  { id: 'a2_080', level: 'A2', topic: 'shopping', english: 'She ordered new shoes online and they arrived today.', arabic: 'طلبت أحذية جديدة عبر الإنترنت ووصلت اليوم.' },

  // ── Food ──
  { id: 'a2_081', level: 'A2', topic: 'food', english: 'I booked a table at the restaurant for seven o\'clock.', arabic: 'حجزت طاولة في المطعم للساعة السابعة.' },
  { id: 'a2_082', level: 'A2', topic: 'food', english: 'The waiter brought us the wrong order by mistake.', arabic: 'أحضر لنا النادل الطلب الخاطئ عن طريق الخطأ.' },
  { id: 'a2_083', level: 'A2', topic: 'food', english: 'I tried sushi for the first time and I liked it.', arabic: 'جربت السوشي لأول مرة وأعجبني.' },
  { id: 'a2_084', level: 'A2', topic: 'food', english: 'She is allergic to nuts so she has to be careful.', arabic: 'لديها حساسية من المكسرات لذا عليها أن تكون حذرة.' },
  { id: 'a2_085', level: 'A2', topic: 'food', english: 'We had a barbecue in the garden last Saturday.', arabic: 'أقمنا حفل شواء في الحديقة يوم السبت الماضي.' },

  // ── Technology ──
  { id: 'a2_086', level: 'A2', topic: 'technology', english: 'My phone screen is broken. I need to fix it.', arabic: 'شاشة هاتفي مكسورة. أحتاج لإصلاحها.' },
  { id: 'a2_087', level: 'A2', topic: 'technology', english: 'I use Google Maps to find places I have not been to.', arabic: 'أستعمل خرائط جوجل لإيجاد أماكن لم أذهب إليها.' },
  { id: 'a2_088', level: 'A2', topic: 'technology', english: 'She learns English by watching YouTube videos every day.', arabic: 'تتعلم الإنجليزية بمشاهدة فيديوهات يوتيوب كل يوم.' },
  { id: 'a2_089', level: 'A2', topic: 'technology', english: 'I changed my password because someone tried to hack my account.', arabic: 'غيّرت كلمة المرور لأن شخصاً حاول اختراق حسابي.' },
  { id: 'a2_090', level: 'A2', topic: 'technology', english: 'The app crashed and I lost all my progress.', arabic: 'توقف التطبيق وفقدت كل تقدمي.' },

  // ── Family & relationships ──
  { id: 'a2_091', level: 'A2', topic: 'family', english: 'My parents got married twenty-five years ago.', arabic: 'تزوج والداي قبل خمسة وعشرين سنة.' },
  { id: 'a2_092', level: 'A2', topic: 'family', english: 'My little brother is learning to ride a bicycle.', arabic: 'أخي الصغير يتعلم ركوب الدراجة.' },
  { id: 'a2_093', level: 'A2', topic: 'family', english: 'We had a big family dinner for my grandmother\'s birthday.', arabic: 'أقمنا عشاءً عائلياً كبيراً لعيد ميلاد جدتي.' },
  { id: 'a2_094', level: 'A2', topic: 'family', english: 'She looks like her mother but acts like her father.', arabic: 'تشبه أمها في الشكل لكنها تتصرف مثل أبيها.' },
  { id: 'a2_095', level: 'A2', topic: 'family', english: 'My older sister lives in Canada with her husband.', arabic: 'أختي الكبرى تعيش في كندا مع زوجها.' },

  // ── Weather & seasons ──
  { id: 'a2_096', level: 'A2', topic: 'weather', english: 'The weather forecast says it will be sunny tomorrow.', arabic: 'توقعات الطقس تقول أنه سيكون مشمساً غداً.' },
  { id: 'a2_097', level: 'A2', topic: 'weather', english: 'Summer in Morocco can be extremely hot especially in August.', arabic: 'الصيف في المغرب يمكن أن يكون حاراً جداً خاصة في أغسطس.' },
  { id: 'a2_098', level: 'A2', topic: 'weather', english: 'I prefer autumn because the weather is mild and pleasant.', arabic: 'أفضّل الخريف لأن الطقس معتدل ولطيف.' },
  { id: 'a2_099', level: 'A2', topic: 'weather', english: 'It rained heavily last night and some streets were flooded.', arabic: 'أمطرت بغزارة البارحة وبعض الشوارع غُمرت بالمياه.' },
  { id: 'a2_100', level: 'A2', topic: 'weather', english: 'We stayed inside because of the strong wind outside.', arabic: 'بقينا في الداخل بسبب الرياح القوية بالخارج.' },

  // ── More daily situations ──
  { id: 'a2_101', level: 'A2', topic: 'daily-life', english: 'I accidentally deleted an important file from my computer.', arabic: 'حذفت ملفاً مهماً من حاسوبي عن طريق الخطأ.' },
  { id: 'a2_102', level: 'A2', topic: 'daily-life', english: 'He was late because the bus did not come on time.', arabic: 'تأخر لأن الحافلة لم تأتِ في الوقت المحدد.' },
  { id: 'a2_103', level: 'A2', topic: 'daily-life', english: 'She cleaned the whole house before the guests arrived.', arabic: 'نظفت المنزل بأكمله قبل وصول الضيوف.' },
  { id: 'a2_104', level: 'A2', topic: 'daily-life', english: 'I ran into my old teacher at the supermarket yesterday.', arabic: 'صادفت معلمي القديم في السوبرماركت أمس.' },
  { id: 'a2_105', level: 'A2', topic: 'daily-life', english: 'We decorated the house for the holiday celebration.', arabic: 'زيّنا المنزل للاحتفال بالعيد.' },
  { id: 'a2_106', level: 'A2', topic: 'daily-life', english: 'I need to renew my passport before it expires next month.', arabic: 'أحتاج لتجديد جواز سفري قبل انتهاء صلاحيته الشهر القادم.' },
  { id: 'a2_107', level: 'A2', topic: 'daily-life', english: 'She fixed the broken chair instead of buying a new one.', arabic: 'أصلحت الكرسي المكسور بدل شراء واحد جديد.' },
  { id: 'a2_108', level: 'A2', topic: 'daily-life', english: 'I need to wake up earlier to have time for breakfast.', arabic: 'أحتاج للاستيقاظ مبكراً ليكون لدي وقت للفطور.' },
  { id: 'a2_109', level: 'A2', topic: 'daily-life', english: 'He borrowed money from his friend and will return it next week.', arabic: 'اقترض مالاً من صديقه وسيعيده الأسبوع القادم.' },
  { id: 'a2_110', level: 'A2', topic: 'daily-life', english: 'The elevator is not working. We have to use the stairs.', arabic: 'المصعد لا يعمل. يجب أن نستخدم الدرج.' },
  { id: 'a2_111', level: 'A2', topic: 'daily-life', english: 'I left my jacket at the restaurant. I hope they found it.', arabic: 'تركت سترتي في المطعم. أتمنى أنهم وجدوها.' },
  { id: 'a2_112', level: 'A2', topic: 'daily-life', english: 'She prepared everything the night before so she would not rush.', arabic: 'جهزت كل شيء الليلة السابقة حتى لا تستعجل.' },
  { id: 'a2_113', level: 'A2', topic: 'daily-life', english: 'I finally organized my closet after months of putting it off.', arabic: 'أخيراً رتبت خزانتي بعد أشهر من التأجيل.' },
  { id: 'a2_114', level: 'A2', topic: 'daily-life', english: 'He asked his neighbor to water the plants while he was away.', arabic: 'طلب من جاره أن يسقي النباتات أثناء غيابه.' },
  { id: 'a2_115', level: 'A2', topic: 'daily-life', english: 'I was so tired that I fell asleep on the couch.', arabic: 'كنت متعباً جداً لدرجة أنني نمت على الأريكة.' },

  // ── Opinions & comparisons ──
  { id: 'a2_116', level: 'A2', topic: 'opinions', english: 'I think learning online is easier than going to a school.', arabic: 'أعتقد أن التعلم عبر الإنترنت أسهل من الذهاب إلى المدرسة.' },
  { id: 'a2_117', level: 'A2', topic: 'opinions', english: 'In my opinion, breakfast is the most important meal of the day.', arabic: 'في رأيي، الفطور هو أهم وجبة في اليوم.' },
  { id: 'a2_118', level: 'A2', topic: 'opinions', english: 'He thinks that football is more exciting than basketball.', arabic: 'يعتقد أن كرة القدم أكثر إثارة من كرة السلة.' },
  { id: 'a2_119', level: 'A2', topic: 'opinions', english: 'She believes that reading is better than watching television.', arabic: 'تعتقد أن القراءة أفضل من مشاهدة التلفاز.' },
  { id: 'a2_120', level: 'A2', topic: 'opinions', english: 'I agree with you. That is a very good idea.', arabic: 'أتفق معك. هذه فكرة جيدة جداً.' },

  // ── Places & culture ──
  { id: 'a2_121', level: 'A2', topic: 'culture', english: 'Marrakech is one of the most popular tourist cities in Morocco.', arabic: 'مراكش من أكثر المدن السياحية شهرة في المغرب.' },
  { id: 'a2_122', level: 'A2', topic: 'culture', english: 'During Ramadan, we eat together after sunset.', arabic: 'خلال رمضان نأكل معاً بعد غروب الشمس.' },
  { id: 'a2_123', level: 'A2', topic: 'culture', english: 'Traditional Moroccan food is famous around the world.', arabic: 'الأكل المغربي التقليدي مشهور حول العالم.' },
  { id: 'a2_124', level: 'A2', topic: 'culture', english: 'We celebrate Eid by visiting family and sharing food.', arabic: 'نحتفل بالعيد بزيارة العائلة ومشاركة الطعام.' },
  { id: 'a2_125', level: 'A2', topic: 'culture', english: 'The medina in Fez is the largest old city in the world.', arabic: 'المدينة القديمة في فاس هي أكبر مدينة قديمة في العالم.' },

  // ── More A2 ──
  { id: 'a2_126', level: 'A2', topic: 'work', english: 'The interview went well but I am still waiting for the answer.', arabic: 'المقابلة كانت جيدة لكنني لا أزال أنتظر الإجابة.' },
  { id: 'a2_127', level: 'A2', topic: 'education', english: 'Watching movies with subtitles helps me learn new words.', arabic: 'مشاهدة الأفلام مع ترجمة تساعدني في تعلم كلمات جديدة.' },
  { id: 'a2_128', level: 'A2', topic: 'hobbies', english: 'I took a painting class and discovered I really enjoy it.', arabic: 'أخذت دورة رسم واكتشفت أنني أستمتع بها حقاً.' },
  { id: 'a2_129', level: 'A2', topic: 'communication', english: 'He apologized for being late and explained what happened.', arabic: 'اعتذر عن التأخير وشرح ما حدث.' },
  { id: 'a2_130', level: 'A2', topic: 'health', english: 'I stopped eating fast food because it is not healthy.', arabic: 'توقفت عن أكل الوجبات السريعة لأنها غير صحية.' },
  { id: 'a2_131', level: 'A2', topic: 'daily-life', english: 'The neighbor\'s dog barks every night and wakes me up.', arabic: 'كلب الجيران ينبح كل ليلة ويوقظني.' },
  { id: 'a2_132', level: 'A2', topic: 'shopping', english: 'I compared prices online before buying the new television.', arabic: 'قارنت الأسعار على الإنترنت قبل شراء التلفاز الجديد.' },
  { id: 'a2_133', level: 'A2', topic: 'feelings', english: 'I was so happy when I heard the good news.', arabic: 'كنت سعيداً جداً عندما سمعت الخبر السار.' },
  { id: 'a2_134', level: 'A2', topic: 'technology', english: 'I downloaded a new app to help me learn vocabulary.', arabic: 'حمّلت تطبيقاً جديداً لمساعدتي في تعلم المفردات.' },
  { id: 'a2_135', level: 'A2', topic: 'goals', english: 'I made a plan to study one hour of English every day.', arabic: 'وضعت خطة لدراسة ساعة إنجليزية كل يوم.' },
  { id: 'a2_136', level: 'A2', topic: 'work', english: 'She asked for a day off because she was feeling unwell.', arabic: 'طلبت يوم إجازة لأنها لم تكن تشعر بخير.' },
  { id: 'a2_137', level: 'A2', topic: 'daily-life', english: 'The children made a mess in the living room while playing.', arabic: 'الأطفال أحدثوا فوضى في غرفة المعيشة أثناء اللعب.' },
  { id: 'a2_138', level: 'A2', topic: 'food', english: 'I learned how to make pancakes from a YouTube video.', arabic: 'تعلمت كيف أصنع الفطائر من فيديو على يوتيوب.' },
  { id: 'a2_139', level: 'A2', topic: 'travel', english: 'We visited three different cities during our vacation.', arabic: 'زرنا ثلاث مدن مختلفة خلال عطلتنا.' },
  { id: 'a2_140', level: 'A2', topic: 'education', english: 'She finished her homework early and had time to relax.', arabic: 'أنهت واجبها مبكراً وكان لديها وقت للاسترخاء.' },
  { id: 'a2_141', level: 'A2', topic: 'daily-life', english: 'I prefer to shop in the morning when the stores are less crowded.', arabic: 'أفضل التسوق في الصباح عندما تكون المتاجر أقل ازدحاماً.' },
  { id: 'a2_142', level: 'A2', topic: 'feelings', english: 'He was proud of himself for finishing the marathon.', arabic: 'كان فخوراً بنفسه لأنه أنهى سباق الماراثون.' },
  { id: 'a2_143', level: 'A2', topic: 'communication', english: 'I tried to explain the problem but she did not understand.', arabic: 'حاولت شرح المشكلة لكنها لم تفهم.' },
  { id: 'a2_144', level: 'A2', topic: 'daily-life', english: 'My phone battery died in the middle of an important call.', arabic: 'نفدت بطارية هاتفي في منتصف مكالمة مهمة.' },
  { id: 'a2_145', level: 'A2', topic: 'hobbies', english: 'We organized a small football tournament in our neighborhood.', arabic: 'نظمنا دورة كرة قدم صغيرة في حينا.' },
  { id: 'a2_146', level: 'A2', topic: 'work', english: 'He received a certificate after completing the training course.', arabic: 'حصل على شهادة بعد إتمام الدورة التدريبية.' },
  { id: 'a2_147', level: 'A2', topic: 'daily-life', english: 'I watered the plants and swept the floor this morning.', arabic: 'سقيت النباتات وكنست الأرضية هذا الصباح.' },
  { id: 'a2_148', level: 'A2', topic: 'food', english: 'He ordered pizza because he did not feel like cooking.', arabic: 'طلب بيتزا لأنه لم يكن يريد الطبخ.' },
  { id: 'a2_149', level: 'A2', topic: 'technology', english: 'She updated her phone and now it works much faster.', arabic: 'حدّثت هاتفها والآن يعمل بشكل أسرع بكثير.' },
  { id: 'a2_150', level: 'A2', topic: 'family', english: 'We are expecting a new baby in the family next month.', arabic: 'ننتظر مولوداً جديداً في العائلة الشهر القادم.' },
  { id: 'a2_151', level: 'A2', topic: 'daily-life', english: 'I spent the whole afternoon organizing my desk and files.', arabic: 'قضيت فترة ما بعد الظهر كلها في ترتيب مكتبي وملفاتي.' },
  { id: 'a2_152', level: 'A2', topic: 'education', english: 'The best way to remember new words is to use them in sentences.', arabic: 'أفضل طريقة لتذكر الكلمات الجديدة هي استخدامها في جمل.' },
  { id: 'a2_153', level: 'A2', topic: 'travel', english: 'I always pack my bag the night before a trip.', arabic: 'دائماً أرتب حقيبتي الليلة التي تسبق السفر.' },
  { id: 'a2_154', level: 'A2', topic: 'work', english: 'She organized a team meeting to discuss the new project.', arabic: 'نظّمت اجتماعاً للفريق لمناقشة المشروع الجديد.' },
  { id: 'a2_155', level: 'A2', topic: 'goals', english: 'I set three goals at the beginning of the year and achieved two.', arabic: 'وضعت ثلاثة أهداف في بداية السنة وحققت اثنين.' },
  { id: 'a2_156', level: 'A2', topic: 'health', english: 'Walking thirty minutes a day is good for your heart.', arabic: 'المشي ثلاثين دقيقة يومياً مفيد لقلبك.' },
  { id: 'a2_157', level: 'A2', topic: 'feelings', english: 'I feel much better after talking to my best friend.', arabic: 'أشعر بتحسن كبير بعد التحدث مع أعز أصدقائي.' },
  { id: 'a2_158', level: 'A2', topic: 'daily-life', english: 'She wakes up at five to pray and then goes back to sleep.', arabic: 'تستيقظ في الخامسة للصلاة ثم تعود للنوم.' },
  { id: 'a2_159', level: 'A2', topic: 'culture', english: 'Mint tea is the most popular drink in Morocco.', arabic: 'الشاي بالنعناع هو المشروب الأكثر شعبية في المغرب.' },
  { id: 'a2_160', level: 'A2', topic: 'daily-life', english: 'I try to go to bed early so I can wake up refreshed.', arabic: 'أحاول النوم مبكراً حتى أستيقظ بنشاط.' },
  { id: 'a2_161', level: 'A2', topic: 'education', english: 'She asked the teacher to repeat the explanation one more time.', arabic: 'طلبت من المعلم تكرار الشرح مرة أخرى.' },
  { id: 'a2_162', level: 'A2', topic: 'work', english: 'He works night shifts and sleeps during the day.', arabic: 'يعمل في الورديات الليلية وينام خلال النهار.' },
  { id: 'a2_163', level: 'A2', topic: 'hobbies', english: 'I collect stamps from different countries as a hobby.', arabic: 'أجمع طوابع بريدية من بلدان مختلفة كهواية.' },
  { id: 'a2_164', level: 'A2', topic: 'daily-life', english: 'The traffic is terrible during rush hour in the city center.', arabic: 'حركة المرور فظيعة في ساعات الذروة في وسط المدينة.' },
  { id: 'a2_165', level: 'A2', topic: 'food', english: 'My mother makes the best tagine in the whole neighborhood.', arabic: 'أمي تصنع أفضل طاجين في الحي كله.' },
  { id: 'a2_166', level: 'A2', topic: 'feelings', english: 'She was embarrassed when she realized her mistake.', arabic: 'شعرت بالحرج عندما أدركت خطأها.' },
  { id: 'a2_167', level: 'A2', topic: 'technology', english: 'I backed up all my photos to the cloud in case I lose my phone.', arabic: 'حفظت نسخة احتياطية من كل صوري على السحابة في حال فقدت هاتفي.' },
  { id: 'a2_168', level: 'A2', topic: 'daily-life', english: 'We planted some tomatoes and herbs in the backyard garden.', arabic: 'زرعنا بعض الطماطم والأعشاب في حديقة الفناء الخلفي.' },
  { id: 'a2_169', level: 'A2', topic: 'education', english: 'He improved his pronunciation by listening to native speakers.', arabic: 'حسّن نطقه بالاستماع إلى متحدثين أصليين.' },
  { id: 'a2_170', level: 'A2', topic: 'communication', english: 'I wrote a thank you message to my teacher at the end of the year.', arabic: 'كتبت رسالة شكر لمعلمي في نهاية السنة.' },
  { id: 'a2_171', level: 'A2', topic: 'daily-life', english: 'She always puts on sunscreen before going outside in summer.', arabic: 'دائماً تضع واقي الشمس قبل الخروج في الصيف.' },
  { id: 'a2_172', level: 'A2', topic: 'work', english: 'He completed the report on time and his manager was pleased.', arabic: 'أنهى التقرير في الوقت المحدد وكان مديره سعيداً.' },
  { id: 'a2_173', level: 'A2', topic: 'daily-life', english: 'I need to pay the electricity bill before the end of the month.', arabic: 'أحتاج لدفع فاتورة الكهرباء قبل نهاية الشهر.' },
  { id: 'a2_174', level: 'A2', topic: 'hobbies', english: 'We go hiking in the mountains when the weather is nice.', arabic: 'نذهب للمشي في الجبال عندما يكون الطقس جميلاً.' },
  { id: 'a2_175', level: 'A2', topic: 'food', english: 'I prefer home-cooked food over restaurant food.', arabic: 'أفضل الطعام المنزلي على طعام المطاعم.' },
  { id: 'a2_176', level: 'A2', topic: 'family', english: 'Her parents are very supportive and always encourage her.', arabic: 'والداها داعمان جداً ويشجعانها دائماً.' },
  { id: 'a2_177', level: 'A2', topic: 'education', english: 'I highlighted the important parts of the text while studying.', arabic: 'ظلّلت الأجزاء المهمة من النص أثناء الدراسة.' },
  { id: 'a2_178', level: 'A2', topic: 'daily-life', english: 'He checks the weather forecast before deciding what to wear.', arabic: 'يتحقق من توقعات الطقس قبل تحديد ما سيلبسه.' },
  { id: 'a2_179', level: 'A2', topic: 'goals', english: 'She wrote a list of things she wants to do before turning thirty.', arabic: 'كتبت قائمة بالأشياء التي تريد فعلها قبل بلوغ الثلاثين.' },
  { id: 'a2_180', level: 'A2', topic: 'daily-life', english: 'I enjoy having my morning coffee while reading the news.', arabic: 'أستمتع بشرب قهوتي الصباحية أثناء قراءة الأخبار.' },
  { id: 'a2_181', level: 'A2', topic: 'shopping', english: 'She bought gifts for all her friends before the holiday.', arabic: 'اشترت هدايا لجميع صديقاتها قبل العيد.' },
  { id: 'a2_182', level: 'A2', topic: 'daily-life', english: 'The neighbors invited us to their house for tea yesterday.', arabic: 'الجيران دعونا إلى بيتهم لشرب الشاي أمس.' },
  { id: 'a2_183', level: 'A2', topic: 'transport', english: 'She missed the train by two minutes and had to wait an hour.', arabic: 'فاتها القطار بدقيقتين واضطرت للانتظار ساعة.' },
  { id: 'a2_184', level: 'A2', topic: 'work', english: 'I have a job interview next Tuesday and I am preparing for it.', arabic: 'لدي مقابلة عمل يوم الثلاثاء القادم وأحضر لها.' },
  { id: 'a2_185', level: 'A2', topic: 'daily-life', english: 'He fixed the leaking faucet in the bathroom by himself.', arabic: 'أصلح صنبور الماء المتسرب في الحمام بنفسه.' },
  { id: 'a2_186', level: 'A2', topic: 'feelings', english: 'I was worried about her but she called and said she was fine.', arabic: 'كنت قلقاً عليها لكنها اتصلت وقالت أنها بخير.' },
  { id: 'a2_187', level: 'A2', topic: 'education', english: 'They announced the exam results and I passed with a good grade.', arabic: 'أعلنوا نتائج الامتحان ونجحت بدرجة جيدة.' },
  { id: 'a2_188', level: 'A2', topic: 'daily-life', english: 'I volunteered to help organize the school event.', arabic: 'تطوعت للمساعدة في تنظيم حدث المدرسة.' },
  { id: 'a2_189', level: 'A2', topic: 'food', english: 'She made a chocolate cake for her daughter\'s birthday party.', arabic: 'صنعت كعكة شوكولاتة لحفلة عيد ميلاد ابنتها.' },
  { id: 'a2_190', level: 'A2', topic: 'daily-life', english: 'I washed all the clothes and hung them outside to dry.', arabic: 'غسلت كل الملابس وعلقتها بالخارج لتجف.' },
  { id: 'a2_191', level: 'A2', topic: 'communication', english: 'He left a voicemail because I could not answer the phone.', arabic: 'ترك رسالة صوتية لأنني لم أستطع الرد على الهاتف.' },
  { id: 'a2_192', level: 'A2', topic: 'hobbies', english: 'I listen to English podcasts while walking to work.', arabic: 'أستمع إلى بودكاست بالإنجليزية أثناء المشي إلى العمل.' },
  { id: 'a2_193', level: 'A2', topic: 'daily-life', english: 'She keeps a small notebook in her bag to write down new words.', arabic: 'تحتفظ بدفتر صغير في حقيبتها لكتابة الكلمات الجديدة.' },
  { id: 'a2_194', level: 'A2', topic: 'family', english: 'My father taught me how to ride a bicycle when I was five.', arabic: 'أبي علمني ركوب الدراجة عندما كان عمري خمس سنوات.' },
  { id: 'a2_195', level: 'A2', topic: 'daily-life', english: 'We have to take our shoes off before entering the house.', arabic: 'يجب أن نخلع أحذيتنا قبل دخول المنزل.' },
  { id: 'a2_196', level: 'A2', topic: 'work', english: 'She manages a team of ten people at her company.', arabic: 'تدير فريقاً من عشرة أشخاص في شركتها.' },
  { id: 'a2_197', level: 'A2', topic: 'education', english: 'I signed up for an English course that starts next Monday.', arabic: 'سجلت في دورة إنجليزية تبدأ يوم الاثنين القادم.' },
  { id: 'a2_198', level: 'A2', topic: 'daily-life', english: 'He always remembers to lock the door before going to bed.', arabic: 'دائماً يتذكر قفل الباب قبل النوم.' },
  { id: 'a2_199', level: 'A2', topic: 'culture', english: 'We visited the Hassan II Mosque in Casablanca and it was incredible.', arabic: 'زرنا مسجد الحسن الثاني في الدار البيضاء وكان مذهلاً.' },
  { id: 'a2_200', level: 'A2', topic: 'feelings', english: 'I feel more confident now when I speak English than before.', arabic: 'أشعر بثقة أكبر الآن عندما أتحدث الإنجليزية مقارنة بالماضي.' },

  // ═══════════════════════════════════════════════════════════════════════════
  //  B1 — INTERMEDIATE (200 sentences)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Education & learning ──
  { id: 'b1_001', level: 'B1', topic: 'education', english: 'Learning a language requires consistent effort and daily practice.', arabic: 'تعلم لغة يتطلب جهداً منتظماً وممارسة يومية.' },
  { id: 'b1_002', level: 'B1', topic: 'education', english: 'I think it is important to read books every day to expand your vocabulary.', arabic: 'أعتقد أنه من المهم قراءة الكتب كل يوم لتوسيع مفرداتك.' },
  { id: 'b1_003', level: 'B1', topic: 'education', english: 'The more you practice speaking, the more confident you will become.', arabic: 'كلما مارست الكلام أكثر، كلما أصبحت أكثر ثقة.' },
  { id: 'b1_004', level: 'B1', topic: 'education', english: 'I have always been interested in how languages develop over time.', arabic: 'لطالما اهتممت بكيفية تطور اللغات عبر الزمن.' },
  { id: 'b1_005', level: 'B1', topic: 'education', english: 'If you had listened to the advice, you would not be in this situation.', arabic: 'لو كنت أصغيت للنصيحة لما كنت في هذا الوضع.' },
  { id: 'b1_006', level: 'B1', topic: 'education', english: 'Reading novels in English is one of the best ways to improve fluency.', arabic: 'قراءة الروايات بالإنجليزية هي من أفضل طرق تحسين الطلاقة.' },
  { id: 'b1_007', level: 'B1', topic: 'education', english: 'Critical thinking is one of the most valuable skills in today\'s world.', arabic: 'التفكير النقدي هو أحد أكثر المهارات قيمةً في عالم اليوم.' },
  { id: 'b1_008', level: 'B1', topic: 'education', english: 'The more time you invest in learning, the better your results will be.', arabic: 'كلما استثمرت وقتاً أكبر في التعلم، كانت نتائجك أفضل.' },
  { id: 'b1_009', level: 'B1', topic: 'education', english: 'She struggled with grammar at first but eventually mastered it through practice.', arabic: 'واجهت صعوبة مع القواعد في البداية لكنها أتقنتها في النهاية بالممارسة.' },
  { id: 'b1_010', level: 'B1', topic: 'education', english: 'It is better to understand a concept deeply than to memorize it superficially.', arabic: 'من الأفضل فهم المفهوم بعمق بدلاً من حفظه بشكل سطحي.' },
  { id: 'b1_011', level: 'B1', topic: 'education', english: 'Many students underestimate the importance of listening practice.', arabic: 'كثير من الطلاب يقللون من أهمية ممارسة الاستماع.' },
  { id: 'b1_012', level: 'B1', topic: 'education', english: 'I realized that making mistakes is an essential part of the learning process.', arabic: 'أدركت أن ارتكاب الأخطاء جزء أساسي من عملية التعلم.' },

  // ── Work & career ──
  { id: 'b1_013', level: 'B1', topic: 'work', english: 'She has been working at the same company for over five years.', arabic: 'تعمل في نفس الشركة منذ أكثر من خمس سنوات.' },
  { id: 'b1_014', level: 'B1', topic: 'work', english: 'I would rather work independently than in a large corporate team.', arabic: 'أفضّل العمل باستقلالية على العمل في فريق مؤسسي كبير.' },
  { id: 'b1_015', level: 'B1', topic: 'work', english: 'She convinced her manager to let the whole team work remotely.', arabic: 'أقنعت مديرها بالسماح للفريق بأكمله بالعمل عن بُعد.' },
  { id: 'b1_016', level: 'B1', topic: 'work', english: 'Although she was tired, she continued working until midnight.', arabic: 'على الرغم من تعبها، واصلت العمل حتى منتصف الليل.' },
  { id: 'b1_017', level: 'B1', topic: 'work', english: 'The company announced plans to expand into new international markets.', arabic: 'أعلنت الشركة عن خطط للتوسع في أسواق دولية جديدة.' },
  { id: 'b1_018', level: 'B1', topic: 'work', english: 'She spoke so confidently that everyone was impressed by her presentation.', arabic: 'تحدثت بثقة كبيرة لدرجة أن الجميع أُعجب بعرضها التقديمي.' },
  { id: 'b1_019', level: 'B1', topic: 'work', english: 'The main challenge in my job is dealing with tight deadlines.', arabic: 'التحدي الرئيسي في عملي هو التعامل مع المواعيد النهائية الضيقة.' },
  { id: 'b1_020', level: 'B1', topic: 'work', english: 'He was offered a promotion but decided to change companies instead.', arabic: 'عُرضت عليه ترقية لكنه قرر تغيير الشركة بدلاً من ذلك.' },
  { id: 'b1_021', level: 'B1', topic: 'work', english: 'Effective communication is crucial for building strong professional relationships.', arabic: 'التواصل الفعال ضروري لبناء علاقات مهنية قوية.' },
  { id: 'b1_022', level: 'B1', topic: 'work', english: 'I believe that teamwork produces better results than working alone.', arabic: 'أعتقد أن العمل الجماعي ينتج نتائج أفضل من العمل بمفردك.' },

  // ── Technology ──
  { id: 'b1_023', level: 'B1', topic: 'technology', english: 'Social media has both positive and negative effects on our society.', arabic: 'وسائل التواصل الاجتماعي لها تأثيرات إيجابية وسلبية على مجتمعنا.' },
  { id: 'b1_024', level: 'B1', topic: 'technology', english: 'The development of technology has completely changed the way we communicate.', arabic: 'تطور التكنولوجيا غيّر تماماً طريقة تواصلنا.' },
  { id: 'b1_025', level: 'B1', topic: 'technology', english: 'Many people prefer online shopping because it saves time and effort.', arabic: 'يفضل كثير من الناس التسوق الإلكتروني لأنه يوفر الوقت والجهد.' },
  { id: 'b1_026', level: 'B1', topic: 'technology', english: 'Artificial intelligence is expected to transform many industries in the coming years.', arabic: 'من المتوقع أن يحوّل الذكاء الاصطناعي العديد من الصناعات في السنوات القادمة.' },
  { id: 'b1_027', level: 'B1', topic: 'technology', english: 'While technology makes life easier, it can also lead to over-dependence.', arabic: 'بينما التكنولوجيا تجعل الحياة أسهل، يمكن أن تؤدي أيضاً إلى الاعتماد المفرط.' },
  { id: 'b1_028', level: 'B1', topic: 'technology', english: 'The way we consume information has drastically changed in the last decade.', arabic: 'طريقة استهلاكنا للمعلومات تغيّرت بشكل جذري في العقد الأخير.' },
  { id: 'b1_029', level: 'B1', topic: 'technology', english: 'Online learning platforms have made education accessible to people worldwide.', arabic: 'منصات التعلم عبر الإنترنت جعلت التعليم في متناول الناس حول العالم.' },
  { id: 'b1_030', level: 'B1', topic: 'technology', english: 'Data privacy has become one of the biggest concerns of the digital age.', arabic: 'خصوصية البيانات أصبحت واحدة من أكبر المخاوف في العصر الرقمي.' },

  // ── Travel & culture ──
  { id: 'b1_031', level: 'B1', topic: 'travel', english: 'If I could travel anywhere in the world, I would choose Japan.', arabic: 'لو استطعت السفر إلى أي مكان في العالم لاخترت اليابان.' },
  { id: 'b1_032', level: 'B1', topic: 'travel', english: 'Volunteering abroad helped her develop a truly global perspective.', arabic: 'ساعد العمل التطوعي في الخارج على تطوير منظورها العالمي.' },
  { id: 'b1_033', level: 'B1', topic: 'travel', english: 'Travelling alone teaches you to be independent and make quick decisions.', arabic: 'السفر بمفردك يعلمك أن تكون مستقلاً وتتخذ قرارات سريعة.' },
  { id: 'b1_034', level: 'B1', topic: 'culture', english: 'Experiencing different cultures broadens your understanding of the world.', arabic: 'تجربة ثقافات مختلفة توسع فهمك للعالم.' },
  { id: 'b1_035', level: 'B1', topic: 'travel', english: 'The locals were incredibly welcoming and showed us around the city.', arabic: 'السكان المحليون كانوا مرحبين بشكل لا يصدق وأروونا المدينة.' },
  { id: 'b1_036', level: 'B1', topic: 'culture', english: 'Language is not just a communication tool; it is a window into a culture.', arabic: 'اللغة ليست مجرد أداة تواصل؛ إنها نافذة على ثقافة.' },
  { id: 'b1_037', level: 'B1', topic: 'travel', english: 'I prefer staying in local guesthouses rather than expensive international hotels.', arabic: 'أفضل الإقامة في بيوت الضيافة المحلية بدلاً من الفنادق الدولية الغالية.' },
  { id: 'b1_038', level: 'B1', topic: 'travel', english: 'One of the highlights of my trip was trying street food in different cities.', arabic: 'من أبرز لحظات رحلتي كان تجربة طعام الشارع في مدن مختلفة.' },

  // ── Goals & motivation ──
  { id: 'b1_039', level: 'B1', topic: 'goals', english: 'Despite the challenges, he managed to pass all his exams with high grades.', arabic: 'على الرغم من الصعوبات، تمكن من اجتياز جميع امتحاناته بدرجات عالية.' },
  { id: 'b1_040', level: 'B1', topic: 'goals', english: 'It is worth trying new things even if you might fail at first.', arabic: 'يستحق تجربة أشياء جديدة حتى لو فشلت في البداية.' },
  { id: 'b1_041', level: 'B1', topic: 'goals', english: 'I wish I had taken the opportunity when it was available.', arabic: 'أتمنى لو كنت قد اغتنمت الفرصة حين كانت متاحة.' },
  { id: 'b1_042', level: 'B1', topic: 'goals', english: 'I am not sure whether to accept the job offer or continue studying.', arabic: 'لست متأكداً من قبول عرض العمل أو الاستمرار في الدراسة.' },
  { id: 'b1_043', level: 'B1', topic: 'goals', english: 'Setting realistic goals helps you stay motivated throughout the process.', arabic: 'وضع أهداف واقعية يساعدك على البقاء متحفزاً طوال العملية.' },
  { id: 'b1_044', level: 'B1', topic: 'goals', english: 'Success is not about talent alone; it requires discipline and perseverance.', arabic: 'النجاح ليس عن الموهبة وحدها؛ يتطلب انضباطاً ومثابرة.' },
  { id: 'b1_045', level: 'B1', topic: 'goals', english: 'She overcame her fear of public speaking by practicing in front of small groups.', arabic: 'تغلبت على خوفها من التحدث أمام الجمهور بالتدرب أمام مجموعات صغيرة.' },
  { id: 'b1_046', level: 'B1', topic: 'goals', english: 'The biggest regret people have is not taking enough risks when they were young.', arabic: 'أكبر ندم يشعر به الناس هو عدم المخاطرة بشكل كافٍ عندما كانوا شباباً.' },

  // ── Feelings & relationships ──
  { id: 'b1_047', level: 'B1', topic: 'feelings', english: 'He regrets not studying harder when he was at school.', arabic: 'يندم على عدم دراسته بجدية أكبر حين كان في المدرسة.' },
  { id: 'b1_048', level: 'B1', topic: 'feelings', english: 'He takes great pride in the quality of his work and never cuts corners.', arabic: 'يفخر كثيراً بجودة عمله ولا يتهاون أبداً.' },
  { id: 'b1_049', level: 'B1', topic: 'feelings', english: 'True friendship is not about how often you meet but about the quality of the connection.', arabic: 'الصداقة الحقيقية ليست عن عدد مرات اللقاء بل عن جودة العلاقة.' },
  { id: 'b1_050', level: 'B1', topic: 'feelings', english: 'She was deeply moved by the kindness she received from complete strangers.', arabic: 'تأثرت بعمق بلطف أشخاص لا تعرفهم إطلاقاً.' },
  { id: 'b1_051', level: 'B1', topic: 'feelings', english: 'It took me a long time to accept that not everyone will understand my choices.', arabic: 'استغرق الأمر وقتاً طويلاً لأقبل أنه لن يفهم الجميع خياراتي.' },
  { id: 'b1_052', level: 'B1', topic: 'feelings', english: 'The ability to forgive is a sign of emotional strength, not weakness.', arabic: 'القدرة على المسامحة علامة على القوة العاطفية وليس الضعف.' },

  // ── Health & lifestyle ──
  { id: 'b1_053', level: 'B1', topic: 'health', english: 'We need to find a balance between work and our personal life.', arabic: 'نحتاج إلى إيجاد توازن بين العمل والحياة الشخصية.' },
  { id: 'b1_054', level: 'B1', topic: 'health', english: 'Regular exercise not only improves your fitness but also boosts your mood.', arabic: 'الرياضة المنتظمة لا تحسن لياقتك فحسب، بل تحسن مزاجك أيضاً.' },
  { id: 'b1_055', level: 'B1', topic: 'health', english: 'Mental health is just as important as physical health and should not be ignored.', arabic: 'الصحة النفسية مهمة بقدر الصحة الجسدية ولا ينبغي تجاهلها.' },
  { id: 'b1_056', level: 'B1', topic: 'health', english: 'Getting enough sleep is essential for maintaining focus and productivity.', arabic: 'الحصول على نوم كافٍ ضروري للحفاظ على التركيز والإنتاجية.' },
  { id: 'b1_057', level: 'B1', topic: 'health', english: 'Stress management techniques like meditation can significantly improve your quality of life.', arabic: 'تقنيات إدارة التوتر مثل التأمل يمكن أن تحسن نوعية حياتك بشكل كبير.' },
  { id: 'b1_058', level: 'B1', topic: 'health', english: 'A healthy diet combined with regular exercise is the foundation of a good lifestyle.', arabic: 'نظام غذائي صحي مع رياضة منتظمة هو أساس نمط حياة جيد.' },

  // ── Environment ──
  { id: 'b1_059', level: 'B1', topic: 'environment', english: 'Environmental issues such as pollution must be addressed urgently.', arabic: 'يجب معالجة القضايا البيئية مثل التلوث بشكل عاجل.' },
  { id: 'b1_060', level: 'B1', topic: 'environment', english: 'Reducing plastic waste is something every individual can contribute to.', arabic: 'تقليل النفايات البلاستيكية أمر يستطيع كل فرد المساهمة فيه.' },
  { id: 'b1_061', level: 'B1', topic: 'environment', english: 'Climate change is one of the greatest challenges facing humanity today.', arabic: 'تغير المناخ واحد من أكبر التحديات التي تواجه البشرية اليوم.' },
  { id: 'b1_062', level: 'B1', topic: 'environment', english: 'Renewable energy sources like solar and wind power are becoming more affordable.', arabic: 'مصادر الطاقة المتجددة مثل الشمسية والرياح أصبحت أكثر ملاءمة من حيث التكلفة.' },
  { id: 'b1_063', level: 'B1', topic: 'environment', english: 'Every small action, from recycling to using public transport, makes a difference.', arabic: 'كل عمل صغير، من إعادة التدوير إلى استخدام النقل العام، يصنع فرقاً.' },
  { id: 'b1_064', level: 'B1', topic: 'environment', english: 'Deforestation is destroying habitats and contributing to climate change.', arabic: 'إزالة الغابات تدمر الموائل الطبيعية وتساهم في تغير المناخ.' },

  // ── Communication ──
  { id: 'b1_065', level: 'B1', topic: 'communication', english: 'Listening carefully is just as important as speaking clearly.', arabic: 'الإنصات بعناية لا يقل أهمية عن التحدث بوضوح.' },
  { id: 'b1_066', level: 'B1', topic: 'communication', english: 'Body language often communicates more than the words we actually say.', arabic: 'لغة الجسد غالباً تنقل أكثر من الكلمات التي نقولها فعلاً.' },
  { id: 'b1_067', level: 'B1', topic: 'communication', english: 'The ability to express your ideas clearly is a skill that can be developed.', arabic: 'القدرة على التعبير عن أفكارك بوضوح مهارة يمكن تطويرها.' },
  { id: 'b1_068', level: 'B1', topic: 'communication', english: 'Asking the right questions is sometimes more important than having all the answers.', arabic: 'طرح الأسئلة الصحيحة أحياناً أهم من امتلاك كل الإجابات.' },

  // ── Opinions & society ──
  { id: 'b1_069', level: 'B1', topic: 'opinions', english: 'I strongly believe that education should be accessible to everyone regardless of income.', arabic: 'أؤمن بشدة أن التعليم يجب أن يكون متاحاً للجميع بغض النظر عن الدخل.' },
  { id: 'b1_070', level: 'B1', topic: 'opinions', english: 'Some people argue that working from home increases productivity while others disagree.', arabic: 'يرى البعض أن العمل من المنزل يزيد الإنتاجية بينما يختلف آخرون.' },
  { id: 'b1_071', level: 'B1', topic: 'opinions', english: 'The gap between the rich and the poor continues to grow in many countries.', arabic: 'الفجوة بين الأغنياء والفقراء تستمر في الاتساع في كثير من الدول.' },
  { id: 'b1_072', level: 'B1', topic: 'opinions', english: 'Freedom of expression is a fundamental right but it comes with responsibilities.', arabic: 'حرية التعبير حق أساسي لكنها تأتي مع مسؤوليات.' },
  { id: 'b1_073', level: 'B1', topic: 'opinions', english: 'Equal opportunities should be given to everyone regardless of their background.', arabic: 'يجب إعطاء فرص متساوية للجميع بغض النظر عن خلفيتهم.' },
  { id: 'b1_074', level: 'B1', topic: 'opinions', english: 'The media plays a significant role in shaping public opinion.', arabic: 'الإعلام يلعب دوراً مهماً في تشكيل الرأي العام.' },
  { id: 'b1_075', level: 'B1', topic: 'opinions', english: 'I think volunteering should be encouraged more in schools and universities.', arabic: 'أعتقد أنه يجب تشجيع العمل التطوعي أكثر في المدارس والجامعات.' },

  // ── Daily life (complex) ──
  { id: 'b1_076', level: 'B1', topic: 'daily-life', english: 'Living in a big city has its advantages but it also comes with a lot of stress.', arabic: 'العيش في مدينة كبيرة له مميزاته لكنه يأتي أيضاً بالكثير من التوتر.' },
  { id: 'b1_077', level: 'B1', topic: 'daily-life', english: 'I have been trying to reduce my screen time and spend more time outdoors.', arabic: 'أحاول تقليل وقتي أمام الشاشة وقضاء وقت أكثر في الهواء الطلق.' },
  { id: 'b1_078', level: 'B1', topic: 'daily-life', english: 'She made a budget to track her spending and save more money each month.', arabic: 'وضعت ميزانية لتتبع مصاريفها وتوفير المزيد من المال كل شهر.' },
  { id: 'b1_079', level: 'B1', topic: 'daily-life', english: 'One of the things I appreciate most about my routine is having quiet mornings.', arabic: 'من أكثر الأشياء التي أقدرها في روتيني هو الصباحات الهادئة.' },
  { id: 'b1_080', level: 'B1', topic: 'daily-life', english: 'He learned to manage his time better after realizing how much he was wasting.', arabic: 'تعلم إدارة وقته بشكل أفضل بعد أن أدرك كم كان يضيعه.' },

  // ── Economy & money ──
  { id: 'b1_081', level: 'B1', topic: 'economy', english: 'The cost of living has increased significantly in the past few years.', arabic: 'تكلفة المعيشة ارتفعت بشكل كبير في السنوات القليلة الماضية.' },
  { id: 'b1_082', level: 'B1', topic: 'economy', english: 'Financial literacy should be taught in schools to prepare young people for adulthood.', arabic: 'الثقافة المالية يجب أن تُدرّس في المدارس لتحضير الشباب لمرحلة البلوغ.' },
  { id: 'b1_083', level: 'B1', topic: 'economy', english: 'Starting a small business requires careful planning and a good understanding of the market.', arabic: 'بدء مشروع صغير يتطلب تخطيطاً دقيقاً وفهماً جيداً للسوق.' },
  { id: 'b1_084', level: 'B1', topic: 'economy', english: 'Investing in yourself through education and skills development is always worthwhile.', arabic: 'الاستثمار في نفسك من خلال التعليم وتطوير المهارات دائماً يستحق العناء.' },

  // ── More education ──
  { id: 'b1_085', level: 'B1', topic: 'education', english: 'The traditional education system does not always prepare students for real-world challenges.', arabic: 'نظام التعليم التقليدي لا يُعدّ الطلاب دائماً لتحديات العالم الحقيقي.' },
  { id: 'b1_086', level: 'B1', topic: 'education', english: 'Self-directed learning has become increasingly popular thanks to online resources.', arabic: 'التعلم الذاتي أصبح شائعاً بشكل متزايد بفضل الموارد الإلكترونية.' },
  { id: 'b1_087', level: 'B1', topic: 'education', english: 'Teachers play a crucial role in shaping the future of their students.', arabic: 'المعلمون يلعبون دوراً حاسماً في تشكيل مستقبل طلابهم.' },
  { id: 'b1_088', level: 'B1', topic: 'education', english: 'A growth mindset is the belief that abilities can be developed through hard work.', arabic: 'عقلية النمو هي الإيمان بأن القدرات يمكن تطويرها من خلال العمل الجاد.' },

  // ── More work ──
  { id: 'b1_089', level: 'B1', topic: 'work', english: 'Remote work has become the norm for many companies since the pandemic.', arabic: 'العمل عن بُعد أصبح المعتاد لشركات كثيرة منذ الجائحة.' },
  { id: 'b1_090', level: 'B1', topic: 'work', english: 'Networking is essential for finding new career opportunities and building connections.', arabic: 'بناء العلاقات المهنية ضروري لإيجاد فرص عمل جديدة وبناء الصلات.' },
  { id: 'b1_091', level: 'B1', topic: 'work', english: 'She decided to leave her stable job to pursue her passion for photography.', arabic: 'قررت ترك وظيفتها المستقرة لتتبع شغفها بالتصوير.' },
  { id: 'b1_092', level: 'B1', topic: 'work', english: 'A good leader inspires their team rather than just giving orders.', arabic: 'القائد الجيد يُلهم فريقه بدلاً من مجرد إعطاء الأوامر.' },

  // ── More technology ──
  { id: 'b1_093', level: 'B1', topic: 'technology', english: 'The rapid growth of e-commerce has completely transformed the retail industry.', arabic: 'النمو السريع للتجارة الإلكترونية حوّل صناعة البيع بالتجزئة بالكامل.' },
  { id: 'b1_094', level: 'B1', topic: 'technology', english: 'Cybersecurity threats are becoming more sophisticated and harder to detect.', arabic: 'تهديدات الأمن السيبراني أصبحت أكثر تطوراً وأصعب في الاكتشاف.' },
  { id: 'b1_095', level: 'B1', topic: 'technology', english: 'Some experts worry that automation will replace many jobs in the near future.', arabic: 'يقلق بعض الخبراء من أن الأتمتة ستحل محل وظائف كثيرة في المستقبل القريب.' },
  { id: 'b1_096', level: 'B1', topic: 'technology', english: 'Virtual reality is opening new possibilities in education, medicine, and entertainment.', arabic: 'الواقع الافتراضي يفتح إمكانيات جديدة في التعليم والطب والترفيه.' },

  // ── More travel / culture ──
  { id: 'b1_097', level: 'B1', topic: 'travel', english: 'Sustainable tourism aims to minimize the negative impact of travel on local communities.', arabic: 'السياحة المستدامة تهدف لتقليل التأثير السلبي للسفر على المجتمعات المحلية.' },
  { id: 'b1_098', level: 'B1', topic: 'culture', english: 'Learning about other cultures helps us become more empathetic and open-minded.', arabic: 'التعرف على ثقافات أخرى يساعدنا لنصبح أكثر تعاطفاً وانفتاحاً.' },
  { id: 'b1_099', level: 'B1', topic: 'culture', english: 'Preserving cultural heritage is important for maintaining our identity as a nation.', arabic: 'الحفاظ على التراث الثقافي مهم للحفاظ على هويتنا كأمة.' },
  { id: 'b1_100', level: 'B1', topic: 'travel', english: 'I have always dreamed of taking a road trip across the United States.', arabic: 'لطالما حلمت بالقيام برحلة بالسيارة عبر الولايات المتحدة.' },

  // ── More opinions ──
  { id: 'b1_101', level: 'B1', topic: 'opinions', english: 'People who read regularly tend to have a broader perspective on life.', arabic: 'الأشخاص الذين يقرأون بانتظام يميلون لأن يكون لديهم منظور أوسع للحياة.' },
  { id: 'b1_102', level: 'B1', topic: 'opinions', english: 'I believe that kindness is the most underrated quality a person can have.', arabic: 'أعتقد أن اللطف هو أكثر صفة يُستهان بها يمكن أن يملكها الإنسان.' },
  { id: 'b1_103', level: 'B1', topic: 'opinions', english: 'It is easier to criticize others than to take responsibility for your own actions.', arabic: 'انتقاد الآخرين أسهل من تحمل مسؤولية أفعالك.' },
  { id: 'b1_104', level: 'B1', topic: 'opinions', english: 'The way a society treats its elderly says a lot about its values.', arabic: 'طريقة تعامل المجتمع مع كبار السن تقول الكثير عن قيمه.' },
  { id: 'b1_105', level: 'B1', topic: 'opinions', english: 'Patience is a virtue that becomes more valuable the older you get.', arabic: 'الصبر فضيلة تصبح أكثر قيمة كلما تقدمت في العمر.' },

  // ── More feelings ──
  { id: 'b1_106', level: 'B1', topic: 'feelings', english: 'He felt overwhelmed by the amount of work he had to finish before the deadline.', arabic: 'شعر بالإرهاق من كمية العمل التي كان عليه إنهاؤها قبل الموعد النهائي.' },
  { id: 'b1_107', level: 'B1', topic: 'feelings', english: 'Sometimes the best thing you can do for yourself is to take a step back and rest.', arabic: 'أحياناً أفضل شيء يمكنك فعله لنفسك هو التراجع خطوة والراحة.' },
  { id: 'b1_108', level: 'B1', topic: 'feelings', english: 'She was grateful for all the support she received during a difficult period.', arabic: 'كانت ممتنة لكل الدعم الذي تلقته خلال فترة صعبة.' },
  { id: 'b1_109', level: 'B1', topic: 'feelings', english: 'The fear of failure should not stop you from trying something new.', arabic: 'الخوف من الفشل لا ينبغي أن يمنعك من تجربة شيء جديد.' },
  { id: 'b1_110', level: 'B1', topic: 'feelings', english: 'Self-confidence is built gradually through consistent effort and small victories.', arabic: 'الثقة بالنفس تُبنى تدريجياً من خلال الجهد المستمر والانتصارات الصغيرة.' },

  // ── More complex situations ──
  { id: 'b1_111', level: 'B1', topic: 'daily-life', english: 'After much consideration, they decided to move to a smaller town for a quieter life.', arabic: 'بعد تفكير طويل، قرروا الانتقال إلى بلدة أصغر لحياة أكثر هدوءاً.' },
  { id: 'b1_112', level: 'B1', topic: 'daily-life', english: 'Managing a household budget effectively requires discipline and planning.', arabic: 'إدارة ميزانية الأسرة بفعالية تتطلب انضباطاً وتخطيطاً.' },
  { id: 'b1_113', level: 'B1', topic: 'work', english: 'The ability to adapt quickly to change is one of the most important skills in modern workplaces.', arabic: 'القدرة على التكيف السريع مع التغيير هي من أهم المهارات في بيئات العمل الحديثة.' },
  { id: 'b1_114', level: 'B1', topic: 'education', english: 'Bilingual people often have better problem-solving skills and cognitive flexibility.', arabic: 'الأشخاص ثنائيو اللغة غالباً لديهم مهارات أفضل في حل المشكلات ومرونة ذهنية.' },
  { id: 'b1_115', level: 'B1', topic: 'communication', english: 'The art of negotiation lies in finding a solution that satisfies both parties.', arabic: 'فن التفاوض يكمن في إيجاد حل يُرضي كلا الطرفين.' },
  { id: 'b1_116', level: 'B1', topic: 'goals', english: 'Long-term thinking is what separates those who succeed from those who give up.', arabic: 'التفكير طويل المدى هو ما يفصل بين الناجحين ومن يستسلمون.' },
  { id: 'b1_117', level: 'B1', topic: 'health', english: 'The relationship between what you eat and how you feel is stronger than most people realize.', arabic: 'العلاقة بين ما تأكله وكيف تشعر أقوى مما يدركه معظم الناس.' },
  { id: 'b1_118', level: 'B1', topic: 'technology', english: 'The ethical implications of artificial intelligence are a topic of growing debate worldwide.', arabic: 'التبعات الأخلاقية للذكاء الاصطناعي موضوع نقاش متزايد حول العالم.' },
  { id: 'b1_119', level: 'B1', topic: 'environment', english: 'If we do not take action now, the consequences of climate change will be irreversible.', arabic: 'إذا لم نتخذ إجراءات الآن، ستكون عواقب تغير المناخ غير قابلة للإصلاح.' },
  { id: 'b1_120', level: 'B1', topic: 'culture', english: 'Globalization has made the world more connected but has also threatened local traditions.', arabic: 'العولمة جعلت العالم أكثر ترابطاً لكنها هددت أيضاً التقاليد المحلية.' },

  // ── More B1 (mixed topics) ──
  { id: 'b1_121', level: 'B1', topic: 'work', english: 'She prepared a detailed business plan before presenting it to potential investors.', arabic: 'أعدت خطة عمل مفصلة قبل تقديمها للمستثمرين المحتملين.' },
  { id: 'b1_122', level: 'B1', topic: 'education', english: 'The most effective way to retain information is to teach it to someone else.', arabic: 'أكثر طريقة فعالة للاحتفاظ بالمعلومات هي تعليمها لشخص آخر.' },
  { id: 'b1_123', level: 'B1', topic: 'daily-life', english: 'Moving to a new country forces you to step out of your comfort zone.', arabic: 'الانتقال إلى بلد جديد يجبرك على الخروج من منطقة راحتك.' },
  { id: 'b1_124', level: 'B1', topic: 'feelings', english: 'He found it difficult to express his emotions because he was raised to hide them.', arabic: 'وجد صعوبة في التعبير عن مشاعره لأنه تربى على إخفائها.' },
  { id: 'b1_125', level: 'B1', topic: 'opinions', english: 'Quality is more important than quantity whether we are talking about friendships or possessions.', arabic: 'الجودة أهم من الكمية سواء كنا نتحدث عن الصداقات أو الممتلكات.' },
  { id: 'b1_126', level: 'B1', topic: 'health', english: 'Many people struggle with anxiety but are too afraid to seek professional help.', arabic: 'كثير من الناس يعانون من القلق لكنهم يخافون من طلب المساعدة المتخصصة.' },
  { id: 'b1_127', level: 'B1', topic: 'technology', english: 'The convenience of technology sometimes comes at the cost of our attention span.', arabic: 'راحة التكنولوجيا أحياناً تأتي على حساب فترة تركيزنا.' },
  { id: 'b1_128', level: 'B1', topic: 'goals', english: 'He saved money for three years to fund his dream of starting a café.', arabic: 'وفّر المال لثلاث سنوات لتمويل حلمه بافتتاح مقهى.' },
  { id: 'b1_129', level: 'B1', topic: 'work', english: 'Constructive feedback is one of the best tools for personal and professional growth.', arabic: 'الملاحظات البناءة واحدة من أفضل أدوات النمو الشخصي والمهني.' },
  { id: 'b1_130', level: 'B1', topic: 'education', english: 'She decided to study abroad to gain international experience and improve her English.', arabic: 'قررت الدراسة في الخارج لاكتساب خبرة دولية وتحسين إنجليزيتها.' },
  { id: 'b1_131', level: 'B1', topic: 'opinions', english: 'We should judge people based on their character not on their appearance.', arabic: 'يجب أن نحكم على الناس بناءً على شخصيتهم وليس مظهرهم.' },
  { id: 'b1_132', level: 'B1', topic: 'communication', english: 'Empathy is the ability to put yourself in someone else\'s shoes and understand their feelings.', arabic: 'التعاطف هو القدرة على أن تضع نفسك مكان شخص آخر وتفهم مشاعره.' },
  { id: 'b1_133', level: 'B1', topic: 'daily-life', english: 'The best memories are often the simple moments spent with the people you love.', arabic: 'أفضل الذكريات غالباً هي اللحظات البسيطة التي تقضيها مع من تحب.' },
  { id: 'b1_134', level: 'B1', topic: 'environment', english: 'Planting trees is one of the simplest yet most effective ways to fight global warming.', arabic: 'زراعة الأشجار من أبسط الطرق وأكثرها فعالية لمكافحة الاحتباس الحراري.' },
  { id: 'b1_135', level: 'B1', topic: 'work', english: 'She turned her hobby into a successful online business that earns her a full income.', arabic: 'حولت هوايتها إلى مشروع ناجح على الإنترنت يدر عليها دخلاً كاملاً.' },
  { id: 'b1_136', level: 'B1', topic: 'goals', english: 'Consistency matters more than intensity when it comes to developing new habits.', arabic: 'الاستمرارية أهم من الشدة عندما يتعلق الأمر بتطوير عادات جديدة.' },
  { id: 'b1_137', level: 'B1', topic: 'education', english: 'Learning how to learn is arguably the most important skill you can develop.', arabic: 'تعلم كيف تتعلم هو يمكن القول أهم مهارة يمكنك تطويرها.' },
  { id: 'b1_138', level: 'B1', topic: 'feelings', english: 'Gratitude is a powerful practice that can transform your outlook on life.', arabic: 'الامتنان ممارسة قوية يمكن أن تحوّل نظرتك إلى الحياة.' },
  { id: 'b1_139', level: 'B1', topic: 'technology', english: 'Social media algorithms are designed to keep you scrolling as long as possible.', arabic: 'خوارزميات وسائل التواصل مصممة لإبقائك تتصفح أطول فترة ممكنة.' },
  { id: 'b1_140', level: 'B1', topic: 'culture', english: 'Music has the unique ability to connect people across different languages and cultures.', arabic: 'الموسيقى لها قدرة فريدة على ربط الناس عبر لغات وثقافات مختلفة.' },
  { id: 'b1_141', level: 'B1', topic: 'opinions', english: 'A society that invests in education is investing in its own future.', arabic: 'مجتمع يستثمر في التعليم يستثمر في مستقبله الخاص.' },
  { id: 'b1_142', level: 'B1', topic: 'daily-life', english: 'He realized that having fewer possessions actually made him feel more free.', arabic: 'أدرك أن امتلاك أشياء أقل جعله يشعر بحرية أكبر فعلاً.' },
  { id: 'b1_143', level: 'B1', topic: 'health', english: 'Spending time in nature has been scientifically proven to reduce stress levels.', arabic: 'قضاء الوقت في الطبيعة ثبت علمياً أنه يقلل مستويات التوتر.' },
  { id: 'b1_144', level: 'B1', topic: 'work', english: 'Creativity is not a talent you are born with; it is a skill you can practice and improve.', arabic: 'الإبداع ليس موهبة تولد بها؛ إنها مهارة يمكنك ممارستها وتحسينها.' },
  { id: 'b1_145', level: 'B1', topic: 'goals', english: 'It is never too late to start learning something new no matter how old you are.', arabic: 'لم يفت الأوان أبداً لبدء تعلم شيء جديد مهما كان عمرك.' },
  { id: 'b1_146', level: 'B1', topic: 'communication', english: 'A sincere apology can repair relationships that seem beyond repair.', arabic: 'الاعتذار الصادق يمكن أن يُصلح علاقات تبدو غير قابلة للإصلاح.' },
  { id: 'b1_147', level: 'B1', topic: 'daily-life', english: 'She started waking up at five every morning and it completely changed her productivity.', arabic: 'بدأت تستيقظ في الخامسة كل صباح وغيّر ذلك إنتاجيتها بالكامل.' },
  { id: 'b1_148', level: 'B1', topic: 'opinions', english: 'True intelligence is not about knowing everything but about being curious and asking questions.', arabic: 'الذكاء الحقيقي ليس عن معرفة كل شيء بل عن الفضول وطرح الأسئلة.' },
  { id: 'b1_149', level: 'B1', topic: 'economy', english: 'Understanding basic economics helps you make better decisions about money and investments.', arabic: 'فهم أساسيات الاقتصاد يساعدك في اتخاذ قرارات أفضل بشأن المال والاستثمارات.' },
  { id: 'b1_150', level: 'B1', topic: 'feelings', english: 'The hardest part of any journey is taking the first step.', arabic: 'أصعب جزء في أي رحلة هو اتخاذ الخطوة الأولى.' },
  { id: 'b1_151', level: 'B1', topic: 'education', english: 'She credits her success to the mentors who guided her during her early career.', arabic: 'تنسب نجاحها إلى الموجهين الذين أرشدوها خلال بداية مسيرتها المهنية.' },
  { id: 'b1_152', level: 'B1', topic: 'work', english: 'Time management is not about doing more things but about doing the right things.', arabic: 'إدارة الوقت ليست عن فعل أشياء أكثر بل عن فعل الأشياء الصحيحة.' },
  { id: 'b1_153', level: 'B1', topic: 'technology', english: 'Digital detox weekends can help restore your focus and mental clarity.', arabic: 'عطلات الأسبوع بدون أجهزة رقمية يمكن أن تساعد في استعادة تركيزك وصفاء ذهنك.' },
  { id: 'b1_154', level: 'B1', topic: 'culture', english: 'Traditional craftsmanship is slowly disappearing as mass production takes over.', arabic: 'الحرف التقليدية تختفي ببطء مع سيطرة الإنتاج الضخم.' },
  { id: 'b1_155', level: 'B1', topic: 'environment', english: 'Responsible consumption means being mindful of the environmental impact of our purchases.', arabic: 'الاستهلاك المسؤول يعني الوعي بالأثر البيئي لمشترياتنا.' },
  { id: 'b1_156', level: 'B1', topic: 'opinions', english: 'The measure of a person\'s character is how they treat those who can do nothing for them.', arabic: 'مقياس شخصية الإنسان هو كيف يعامل من لا يستطيع فعل شيء له.' },
  { id: 'b1_157', level: 'B1', topic: 'goals', english: 'She wrote down her goals every morning as a way to stay focused and motivated.', arabic: 'كانت تكتب أهدافها كل صباح كطريقة للبقاء مركزة ومتحفزة.' },
  { id: 'b1_158', level: 'B1', topic: 'health', english: 'Burnout is a serious issue that can affect anyone who does not set proper boundaries.', arabic: 'الاحتراق الوظيفي مشكلة جدية يمكن أن تؤثر على أي شخص لا يضع حدوداً مناسبة.' },
  { id: 'b1_159', level: 'B1', topic: 'daily-life', english: 'Learning to say no is one of the most important skills for protecting your time and energy.', arabic: 'تعلم قول لا هو واحد من أهم المهارات لحماية وقتك وطاقتك.' },
  { id: 'b1_160', level: 'B1', topic: 'communication', english: 'The most meaningful conversations happen when both people are genuinely listening.', arabic: 'أكثر المحادثات معنى تحدث عندما يكون كلا الشخصين يستمعان بصدق.' },
  { id: 'b1_161', level: 'B1', topic: 'work', english: 'Innovation often comes from questioning the way things have always been done.', arabic: 'الابتكار غالباً يأتي من التشكيك في الطريقة التي كانت تُعمل بها الأشياء دائماً.' },
  { id: 'b1_162', level: 'B1', topic: 'education', english: 'Studying in a group can be more effective than studying alone if everyone is focused.', arabic: 'الدراسة في مجموعة يمكن أن تكون أكثر فعالية من الدراسة بمفردك إذا كان الجميع مركزين.' },
  { id: 'b1_163', level: 'B1', topic: 'goals', english: 'He turned his biggest failure into a learning experience that shaped his entire career.', arabic: 'حوّل أكبر فشل له إلى تجربة تعلم شكّلت مسيرته المهنية بأكملها.' },
  { id: 'b1_164', level: 'B1', topic: 'opinions', english: 'The most dangerous phrase in any language is: we have always done it this way.', arabic: 'أخطر عبارة في أي لغة هي: لطالما فعلناها بهذه الطريقة.' },
  { id: 'b1_165', level: 'B1', topic: 'daily-life', english: 'She found that journaling helped her process her thoughts and make better decisions.', arabic: 'وجدت أن الكتابة اليومية ساعدتها في معالجة أفكارها واتخاذ قرارات أفضل.' },
  { id: 'b1_166', level: 'B1', topic: 'feelings', english: 'Learning to be comfortable with uncertainty is a sign of emotional maturity.', arabic: 'تعلم الراحة مع عدم اليقين علامة على النضج العاطفي.' },
  { id: 'b1_167', level: 'B1', topic: 'culture', english: 'Every country has its own unique customs and traditions that deserve to be respected.', arabic: 'كل بلد له عاداته وتقاليده الفريدة التي تستحق الاحترام.' },
  { id: 'b1_168', level: 'B1', topic: 'technology', english: 'The way we store and access information has changed more in the last twenty years than in the previous thousand.', arabic: 'طريقة تخزيننا والوصول إلى المعلومات تغيّرت في آخر عشرين سنة أكثر من الألف سنة السابقة.' },
  { id: 'b1_169', level: 'B1', topic: 'environment', english: 'Governments and individuals both have a responsibility to protect the environment for future generations.', arabic: 'الحكومات والأفراد كلاهما يتحملان مسؤولية حماية البيئة للأجيال القادمة.' },
  { id: 'b1_170', level: 'B1', topic: 'work', english: 'Finding work that aligns with your values is more fulfilling than simply chasing a high salary.', arabic: 'إيجاد عمل يتوافق مع قيمك أكثر إشباعاً من مجرد ملاحقة راتب عالي.' },
  { id: 'b1_171', level: 'B1', topic: 'education', english: 'The internet has democratized access to knowledge in ways that were unimaginable a generation ago.', arabic: 'الإنترنت جعل الوصول إلى المعرفة ديمقراطياً بطرق لم تكن متصورة قبل جيل.' },
  { id: 'b1_172', level: 'B1', topic: 'opinions', english: 'Reading widely exposes you to different perspectives and challenges your own assumptions.', arabic: 'القراءة الواسعة تعرضك لوجهات نظر مختلفة وتتحدى افتراضاتك الخاصة.' },
  { id: 'b1_173', level: 'B1', topic: 'health', english: 'Building healthy habits takes time but the long-term benefits are worth the initial effort.', arabic: 'بناء عادات صحية يأخذ وقتاً لكن الفوائد طويلة المدى تستحق الجهد الأولي.' },
  { id: 'b1_174', level: 'B1', topic: 'goals', english: 'She believes that the key to success is showing up every day even when you do not feel like it.', arabic: 'تعتقد أن مفتاح النجاح هو الحضور كل يوم حتى عندما لا تشعر بالرغبة.' },
  { id: 'b1_175', level: 'B1', topic: 'daily-life', english: 'The older I get the more I appreciate the value of spending time with family.', arabic: 'كلما كبرت أكثر قدّرت قيمة قضاء الوقت مع العائلة.' },
  { id: 'b1_176', level: 'B1', topic: 'communication', english: 'Learning to give and receive constructive criticism gracefully is a lifelong skill.', arabic: 'تعلم تقديم وتلقي النقد البناء بلباقة مهارة تستمر مدى الحياة.' },
  { id: 'b1_177', level: 'B1', topic: 'work', english: 'Many successful entrepreneurs started with nothing but an idea and a lot of determination.', arabic: 'كثير من رواد الأعمال الناجحين بدأوا بلا شيء سوى فكرة والكثير من العزيمة.' },
  { id: 'b1_178', level: 'B1', topic: 'education', english: 'A good teacher does not just transfer knowledge; they inspire a love of learning.', arabic: 'المعلم الجيد لا ينقل المعرفة فحسب؛ بل يُلهم حب التعلم.' },
  { id: 'b1_179', level: 'B1', topic: 'feelings', english: 'Comparison is the thief of joy; focus on your own progress instead of looking at others.', arabic: 'المقارنة لصة الفرح؛ ركز على تقدمك بدلاً من النظر إلى الآخرين.' },
  { id: 'b1_180', level: 'B1', topic: 'culture', english: 'The food of a country often tells the story of its history and the influences it has received.', arabic: 'طعام بلد ما غالباً يروي قصة تاريخه والتأثيرات التي تلقاها.' },
  { id: 'b1_181', level: 'B1', topic: 'technology', english: 'We need to teach children digital literacy so they can navigate the online world safely.', arabic: 'نحتاج لتعليم الأطفال الثقافة الرقمية حتى يتمكنوا من تصفح العالم الإلكتروني بأمان.' },
  { id: 'b1_182', level: 'B1', topic: 'environment', english: 'Small changes in daily habits can have a significant positive impact on the environment.', arabic: 'تغييرات صغيرة في العادات اليومية يمكن أن يكون لها تأثير إيجابي كبير على البيئة.' },
  { id: 'b1_183', level: 'B1', topic: 'opinions', english: 'A person who admits their mistakes earns more respect than one who pretends to be perfect.', arabic: 'شخص يعترف بأخطائه يكسب احتراماً أكثر من شخص يتظاهر بالكمال.' },
  { id: 'b1_184', level: 'B1', topic: 'daily-life', english: 'He discovered that cooking meals from scratch was both cheaper and healthier than eating out.', arabic: 'اكتشف أن طهي الوجبات من الصفر كان أرخص وأصح من الأكل بالخارج.' },
  { id: 'b1_185', level: 'B1', topic: 'goals', english: 'The difference between a dream and a goal is a plan and a deadline.', arabic: 'الفرق بين الحلم والهدف هو خطة وموعد نهائي.' },
  { id: 'b1_186', level: 'B1', topic: 'work', english: 'She realized that her greatest professional asset was her ability to solve problems creatively.', arabic: 'أدركت أن أعظم ميزة مهنية لها هي قدرتها على حل المشكلات بإبداع.' },
  { id: 'b1_187', level: 'B1', topic: 'health', english: 'Developing a consistent morning routine can set a positive tone for the entire day.', arabic: 'تطوير روتين صباحي ثابت يمكن أن يضع نغمة إيجابية لليوم بأكمله.' },
  { id: 'b1_188', level: 'B1', topic: 'communication', english: 'The words you choose can either build bridges or create barriers between people.', arabic: 'الكلمات التي تختارها يمكن أن تبني جسوراً أو تخلق حواجز بين الناس.' },
  { id: 'b1_189', level: 'B1', topic: 'education', english: 'Curiosity is the engine that drives all meaningful learning and discovery.', arabic: 'الفضول هو المحرك الذي يقود كل تعلم واكتشاف ذي معنى.' },
  { id: 'b1_190', level: 'B1', topic: 'feelings', english: 'She learned that vulnerability is not a weakness but a form of courage.', arabic: 'تعلمت أن الهشاشة ليست ضعفاً بل شكل من أشكال الشجاعة.' },
  { id: 'b1_191', level: 'B1', topic: 'opinions', english: 'The way you react to adversity reveals more about you than the adversity itself.', arabic: 'طريقة تفاعلك مع المحن تكشف عنك أكثر من المحنة نفسها.' },
  { id: 'b1_192', level: 'B1', topic: 'daily-life', english: 'He promised himself to spend less time worrying about the future and more time enjoying the present.', arabic: 'وعد نفسه بقضاء وقت أقل في القلق بشأن المستقبل ووقت أكثر في الاستمتاع بالحاضر.' },
  { id: 'b1_193', level: 'B1', topic: 'work', english: 'Building a personal brand online has become essential for professionals in almost every field.', arabic: 'بناء علامة شخصية على الإنترنت أصبح ضرورياً للمحترفين في كل مجال تقريباً.' },
  { id: 'b1_194', level: 'B1', topic: 'culture', english: 'Respect for others is the foundation of any strong and healthy community.', arabic: 'احترام الآخرين هو أساس أي مجتمع قوي وصحي.' },
  { id: 'b1_195', level: 'B1', topic: 'environment', english: 'We owe it to the next generation to leave behind a planet that is livable and green.', arabic: 'مدينون للجيل القادم بترك كوكب صالح للعيش وأخضر.' },
  { id: 'b1_196', level: 'B1', topic: 'goals', english: 'She proved that with enough dedication anything is possible regardless of where you start.', arabic: 'أثبتت أنه مع الإخلاص الكافي أي شيء ممكن بغض النظر عن نقطة البداية.' },
  { id: 'b1_197', level: 'B1', topic: 'technology', english: 'The challenge of the digital age is learning to use technology without letting it control us.', arabic: 'تحدي العصر الرقمي هو تعلم استخدام التكنولوجيا دون أن ندعها تتحكم بنا.' },
  { id: 'b1_198', level: 'B1', topic: 'education', english: 'Every mistake is a lesson in disguise if you are willing to reflect on what went wrong.', arabic: 'كل خطأ هو درس متنكر إذا كنت مستعداً للتأمل فيما حدث خطأ.' },
  { id: 'b1_199', level: 'B1', topic: 'daily-life', english: 'Happiness is not about having everything you want but about appreciating everything you have.', arabic: 'السعادة ليست عن امتلاك كل ما تريد بل عن تقدير كل ما تملك.' },
  { id: 'b1_200', level: 'B1', topic: 'feelings', english: 'At the end of the day what matters most is not what you achieved but who you became along the way.', arabic: 'في نهاية المطاف ما يهم أكثر ليس ما حققته بل من أصبحت خلال الرحلة.' },
]

// ─── Session Selection (anti-repetition) ─────────────────────────────────────

/** Fisher-Yates shuffle (pure, no mutation of input) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Returns `count` random sentences for the given level.
 * Skips recently-used IDs to prevent repetition.
 * If the unused pool is smaller than `count`, resets and uses the full pool.
 */
export function getSessionSentences(
  level: Level,
  usedIds: string[],
  count = 6,
): Sentence[] {
  const levelPool = SENTENCE_POOL.filter(s => s.level === level)
  const unused = levelPool.filter(s => !usedIds.includes(s.id))

  // Not enough unused sentences → use full level pool (natural reset)
  const source = unused.length >= count ? unused : levelPool

  return shuffle(source).slice(0, Math.min(count, source.length))
}
