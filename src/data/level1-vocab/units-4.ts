import { d, g, pairs, tr, v, type VocabUnit } from '../workbook/vocab-book.ts'

/** Level 1 vocabulary book, lessons 16–19 (see index.ts). */
export const UNITS_16_19: VocabUnit[] = [
  /* ── 16 · Places & directions ────────────────────────────────────── */
  { n: 16, icon: '🧭',
    vocab: v(
      "😟 | lost | تائه | Excuse me, I'm lost. | عذرًا، أنا تائه.",
      '👉 | show | يُري | Can you show me the way? | هل يمكنك أن تريني الطريق؟',
      '🚸 | cross | يعبر | Cross the street at the traffic lights. | اعبر الشارع عند الإشارات.',
      '↩️ | go back | يرجع | Go back to the roundabout. | ارجع إلى الدوّار.',
      '🏁 | at the end of | في نهاية | The bank is at the end of the street. | البنك في نهاية الشارع.',
      '➡️ | on the right | على اليمين | The café is on the right. | المقهى على اليمين.',
      "🚶 | a five-minute walk | خمس دقائق مشيًا | The station is a five-minute walk. | المحطة على بعد خمس دقائق مشيًا.",
      '🏪 | corner shop | الحانوت | The corner shop is open late. | الحانوت مفتوح حتى وقت متأخر.',
      '🕌 | medina | المدينة القديمة | The medina has small streets. | المدينة القديمة فيها أزقّة صغيرة.',
      '🚪 | gate | باب المدينة | Meet me at Bab Boujloud. | التقِ بي عند باب بوجلود.',
    ),
    groups: [
      g('🏙️', 'More places', 'أماكن أخرى', 'town hall=البلدية|market=السوق|square=الساحة|bridge=قنطرة|stadium=ملعب|post box=صندوق البريد|zoo=حديقة الحيوانات|university=الجامعة|court=المحكمة|train station=محطة القطار'),
      g('🕌', 'In the medina', 'في المدينة القديمة', 'alley=زقاق|riad=رياض|public fountain=سقاية|craftsman=صانع تقليدي|leather=جلد|carpet shop=محل الزرابي|spices=توابل|tannery=دار الدباغة|pottery=فخار|mosque=مسجد'),
      g('🚦', 'On the road', 'في الطريق', 'zebra crossing=ممرّ الراجلين|pavement=الرصيف|crossroads=ملتقى الطرق|sign=لافتة|one way=اتجاه واحد|turning=منعطف|motorway=الطريق السيار|speed bump=ممهّل السرعة|tunnel=نفق|bus lane=ممر الحافلات'),
    ],
    talks: [
      d('Polite | مهذّب', 'Lost in the medina | تائه في المدينة القديمة', 'Tourist | Shopkeeper', [
        ["Excuse me, I'm lost. Where is the Blue Gate?", 'عذرًا، أنا تائه. أين الباب الأزرق؟'],
        ['Go straight on and take the first left.', 'امشِ إلى الأمام وخذ أول زقاق على اليسار.'],
        ['The first left…', 'أول زقاق على اليسار…'],
        ['Then walk to the end of the street. The gate is on the right.', 'ثم امشِ إلى نهاية الشارع. الباب على اليمين.'],
        ['Is it far?', 'هل هو بعيد؟'],
        ["No, it's a five-minute walk.", 'لا، خمس دقائق مشيًا.'],
      ]),
      d('On the phone | على الهاتف', 'Meeting a friend | لقاء صديقة', 'Sofia | Bilal', [
        ["Where are you? I'm at the square.", 'أين أنت؟ أنا في الساحة.'],
        ["I'm at the café opposite the town hall.", 'أنا في المقهى المقابل للبلدية.'],
        ['OK. How do I get there?', 'حسنًا. كيف أصل إلى هناك؟'],
        ['Cross the square and turn right at the bank.', 'اعبري الساحة وانعطفي يمينًا عند البنك.'],
        ['Next to the bank?', 'بجانب البنك؟'],
        ['Yes! I can see you now. Hi!', 'نعم! أراك الآن. مرحبًا!'],
      ]),
    ],
    ask: tr([
      ['Excuse me, where is the post office?', 'عذرًا، أين مكتب البريد؟'],
      ['Is there a bank near here?', 'هل يوجد بنك قريب من هنا؟'],
      ['How do I get to the station?', 'كيف أصل إلى المحطة؟'],
      ['Is it far from here?', 'هل هو بعيد عن هنا؟'],
    ]),
    answer: tr([
      ["It's opposite the park.", 'إنه مقابل الحديقة.'],
      ['Yes, at the end of this street.', 'نعم، في نهاية هذا الشارع.'],
      ['Take the bus number 3.', 'خذ الحافلة رقم 3.'],
      ["No, it's very near.", 'لا، إنه قريب جدًا.'],
    ]),
    reading: {
      icon: '🗺️', title: 'A tour of my town', titleAr: 'جولة في مدينتي',
      text: "Welcome to Ouarzazate! Our town is small but beautiful. In the centre, there is a big square with cafés. Opposite the square, there is the town hall. The market is behind the bus station. The cinema museum is near the Atlas hotel. To go to the kasbah, walk along the main street and turn left at the roundabout. The kasbah is at the end of the road. It's a ten-minute walk. Enjoy your visit!",
      gloss: pairs('centre=الوسط|kasbah=القصبة|along=على طول|main street=الشارع الرئيسي|enjoy=استمتع'),
      tf: [
        { s: 'Ouarzazate is a very big town.', ok: false },
        { s: 'The market is behind the bus station.', ok: true },
        { s: 'The kasbah is very far: take a taxi.', ok: false },
      ],
      qs: [
        { q: 'What is opposite the square?', a: 'The town hall.' },
        { q: 'How do you go to the kasbah?', a: 'Walk along the main street and turn left at the roundabout.' },
      ],
    } },

  /* ── 17 · My neighbourhood ───────────────────────────────────────── */
  { n: 17, icon: '🏘️',
    vocab: v(
      '🌳 | garden | حديقة | There is a small garden behind my house. | توجد حديقة صغيرة خلف بيتي.',
      '🔊 | noisy | صاخب | My street is noisy at night. | شارعي صاخب في الليل.',
      '✨ | clean | نظيف | Our neighbourhood is very clean. | حيّنا نظيف جدًا.',
      '🗑️ | dirty | متّسخ | The park is dirty. | الحديقة متّسخة.',
      '🔓 | open | مفتوح | The shops are open until ten. | المحلات مفتوحة حتى العاشرة.',
      '🔒 | closed | مغلق | The bank is closed on Sunday. | البنك مغلق يوم الأحد.',
      '🛡️ | safe | آمن | My neighbourhood is safe. | حيّي آمن.',
      '🆕 | new | جديد | There is a new café on my street. | يوجد مقهى جديد في شارعي.',
      '🏚️ | old | قديم | There are old houses in the medina. | توجد منازل قديمة في المدينة القديمة.',
      '🙋 | neighbour | جار | My neighbour helps me. | جاري يساعدني.',
    ),
    groups: [
      g('🏪', 'Shops', 'المحلات', "butcher's=الجزّار|baker's=المخبزة|grocer's=البقّال|greengrocer's=بائع الخضر|fishmonger's=بائع السمك|clothes shop=محل الملابس|phone shop=محل الهواتف|hardware shop=محل العقاقير|hairdresser's=محل الحلاقة|tailor's=الخيّاط"),
      g('🌴', 'Nature in town', 'الطبيعة في المدينة', 'palm tree=نخلة|olive tree=شجرة زيتون|flowers=أزهار|grass=عشب|birds=طيور|river=نهر|hill=تلّ|sea=بحر|sky=سماء|fresh air=هواء نقي'),
      g('🔢', 'How many?', 'كم عدد؟', 'a few=بعض (قليل)|many=كثير|lots of=الكثير من|some=بعض|any=أيّ|no=لا يوجد|every=كل|all=جميع|only one=واحد فقط|a lot of=الكثير من'),
    ],
    talks: [
      d('Friendly | ودّي', 'My new neighbourhood | حيّي الجديد', 'Ahmed | Mona', [
        ['Do you like your new neighbourhood?', 'هل يعجبك حيّك الجديد؟'],
        ["Yes! It's quiet and safe.", 'نعم! إنه هادئ وآمن.'],
        ['Are there any shops?', 'هل توجد محلات؟'],
        ["Yes, there is a grocer's and a baker's.", 'نعم، يوجد بقّال ومخبزة.'],
        ['Is there a park?', 'هل توجد حديقة؟'],
        ['Yes, there is a small park with palm trees.', 'نعم، توجد حديقة صغيرة فيها نخيل.'],
      ]),
      d('Questions | أسئلة', 'Looking for a flat | البحث عن شقة', 'Client | Agent', [
        ['Is there a bus stop near the flat?', 'هل يوجد موقف حافلة قرب الشقة؟'],
        ['Yes, there is one in front of the building.', 'نعم، يوجد واحد أمام العمارة.'],
        ['Are there any schools?', 'هل توجد مدارس؟'],
        ['Yes, there are two schools and a hospital.', 'نعم، توجد مدرستان ومستشفى.'],
        ['Is the street noisy?', 'هل الشارع صاخب؟'],
        ["No, it's very quiet at night.", 'لا، إنه هادئ جدًا في الليل.'],
      ]),
    ],
    ask: tr([
      ['Is there a pharmacy in your street?', 'هل توجد صيدلية في شارعك؟'],
      ['Are there any cafés?', 'هل توجد مقاهٍ؟'],
      ['Is your neighbourhood safe?', 'هل حيّك آمن؟'],
      ['What time does the shop open?', 'في أي ساعة يفتح المحل؟'],
    ]),
    answer: tr([
      ['Yes, there is one on the corner.', 'نعم، توجد واحدة في الزاوية.'],
      ['Yes, there are lots of cafés.', 'نعم، توجد مقاهٍ كثيرة.'],
      ["Yes, it's very safe.", 'نعم، إنه آمن جدًا.'],
      ["At eight o'clock.", 'في الثامنة.'],
    ]),
    reading: {
      icon: '🏘️', title: 'Hay Mohammadi', titleAr: 'الحي المحمدي',
      text: "I live in Hay Mohammadi, an old neighbourhood in Casablanca. There are many people and the streets are noisy. There is a big market with fruit, vegetables and fish. There are lots of small shops: a butcher's, a baker's, a tailor's and many grocers. There isn't a big park, but there is a football stadium. On Sunday, children play football in the street. My neighbours are friendly. I love my neighbourhood!",
      gloss: pairs("many people=ناس كثيرون|tailor's=الخيّاط|there isn't=لا يوجد|stadium=ملعب|friendly=ودودون"),
      tf: [
        { s: 'Hay Mohammadi is a new neighbourhood.', ok: false },
        { s: 'There is a big park.', ok: false },
        { s: 'There is a football stadium.', ok: true },
      ],
      qs: [
        { q: 'What can you buy at the market?', a: 'Fruit, vegetables and fish.' },
        { q: 'What do children do on Sunday?', a: 'They play football in the street.' },
      ],
    } },

  /* ── 18 · Action verbs, jobs & can ───────────────────────────────── */
  { n: 18, icon: '💪',
    vocab: v(
      '🍞 | bake | يخبز | My mother can bake bread. | أمي تستطيع أن تخبز الخبز.',
      '🧵 | sew | يخيط | My grandmother can sew. | جدتي تستطيع الخياطة.',
      '🧱 | build | يبني | Builders build houses. | البنّاؤون يبنون المنازل.',
      '🩺 | help sick people | يساعد المرضى | Doctors help sick people. | الأطباء يساعدون المرضى.',
      '🏇 | ride a horse | يركب الحصان | My uncle can ride a horse. | عمي يستطيع ركوب الحصان.',
      '💻 | use a computer | يستعمل الحاسوب | Can you use a computer? | هل تستطيع استعمال الحاسوب؟',
      '📞 | answer the phone | يجيب على الهاتف | A secretary answers the phone. | السكرتيرة تجيب على الهاتف.',
      '🌱 | grow vegetables | يزرع الخضر | Farmers grow vegetables. | الفلاحون يزرعون الخضر.',
      '👍 | well | جيدًا | She can swim very well. | تستطيع السباحة جيدًا جدًا.',
      "🙅 | not at all | إطلاقًا | I can't sing at all! | لا أستطيع الغناء إطلاقًا!",
    ),
    groups: [
      g('🧑‍🔧', 'Jobs and places', 'المهن وأماكنها', 'doctor – hospital=طبيب – مستشفى|teacher – school=أستاذ – مدرسة|chef – restaurant=طبّاخ – مطعم|pilot – plane=طيّار – طائرة|farmer – farm=فلّاح – ضيعة|mechanic – garage=ميكانيكي – مرأب|waiter – café=نادل – مقهى|nurse – clinic=ممرض – مصحّة|baker – bakery=خبّاز – مخبزة|cashier – supermarket=أمين صندوق – متجر كبير'),
      g('🌟', 'Abilities', 'القدرات', 'speak English=يتكلم الإنجليزية|play the piano=يعزف على البيانو|play tennis=يلعب التنس|ski=يتزلّج|type fast=يكتب بسرعة|draw well=يرسم جيدًا|fix a bike=يصلح دراجة|cook couscous=يطبخ الكسكس|whistle=يصفّر|juggle=يتلاعب بالكرات'),
      g('🛠️', 'Tools', 'الأدوات', 'hammer=مطرقة|screwdriver=مفكّ براغي|spanner=مفتاح ربط|needle=إبرة|brush=فرشاة|ladder=سلّم|bucket=سطل|saw=منشار|drill=مثقاب|tape measure=شريط القياس'),
    ],
    talks: [
      d('Questions | أسئلة', 'A job interview | مقابلة عمل', 'Manager | Khadija', [
        ['Can you use a computer?', 'هل تستطيعين استعمال الحاسوب؟'],
        ['Yes, I can. I can type fast.', 'نعم. أستطيع الكتابة بسرعة.'],
        ['Can you speak English?', 'هل تتكلمين الإنجليزية؟'],
        ['Yes, I can speak a little English.', 'نعم، أتكلم قليلًا من الإنجليزية.'],
        ['Can you work on Saturday?', 'هل تستطيعين العمل يوم السبت؟'],
        ['Yes, I can. No problem.', 'نعم. لا مشكلة.'],
      ]),
      d('Friendly | ودّي', 'Talents | مواهب', 'Ilyas | Aya', [
        ['Aya, can you sew?', 'آية، هل تستطيعين الخياطة؟'],
        ['Yes, I can. My grandmother teaches me.', 'نعم. جدتي تعلّمني.'],
        ["Wow! I can't sew at all.", 'رائع! أنا لا أستطيع الخياطة إطلاقًا.'],
        ['What can you do, Ilyas?', 'ماذا تستطيع أن تفعل يا إلياس؟'],
        ['I can fix bikes and I can ride a horse.', 'أستطيع إصلاح الدراجات وركوب الحصان.'],
        ['Cool! Can you teach me?', 'رائع! هل تستطيع أن تعلّمني؟'],
      ]),
    ],
    ask: tr([
      ['Can you swim?', 'هل تستطيع السباحة؟'],
      ['What can your brother do?', 'ماذا يستطيع أخوك أن يفعل؟'],
      ['Can you cook?', 'هل تستطيع الطبخ؟'],
      ['Who can help me?', 'من يستطيع مساعدتي؟'],
    ]),
    answer: tr([
      ['Yes, I can swim well.', 'نعم، أستطيع السباحة جيدًا.'],
      ['He can play the piano.', 'يستطيع العزف على البيانو.'],
      ['Yes, I can cook tagine.', 'نعم، أستطيع طبخ الطاجين.'],
      ["I can! What's the problem?", 'أنا أستطيع! ما المشكلة؟'],
    ]),
    reading: {
      icon: '🧑‍🔧', title: 'Jobs in my village', titleAr: 'المهن في قريتي',
      text: "My village is near Azilal. People in my village can do many things. My father is a farmer. He grows vegetables and olives. My mother can bake bread in a traditional oven. My uncle is a builder. He can build houses with stone. My aunt is a tailor. She can sew beautiful djellabas. My cousin can ride a horse very well. And me? I'm a student, and I can speak three languages: Amazigh, Arabic and English!",
      gloss: pairs('traditional oven=فرن تقليدي|stone=حجر|tailor=خيّاطة|beautiful=جميلة|three=ثلاث'),
      tf: [
        { s: 'The father is a builder.', ok: false },
        { s: 'The mother can bake bread.', ok: true },
        { s: 'The writer can speak three languages.', ok: true },
      ],
      qs: [
        { q: 'What does the father grow?', a: 'Vegetables and olives.' },
        { q: 'What can the aunt sew?', a: 'Beautiful djellabas.' },
      ],
    } },

  /* ── 19 · Hobbies ────────────────────────────────────────────────── */
  { n: 19, icon: '🎨',
    vocab: v(
      '🖌️ | painting | الرسم بالألوان | My sister likes painting. | أختي تحب الرسم بالألوان.',
      '📕 | novel | رواية | I read a novel every month. | أقرأ رواية كل شهر.',
      '📺 | series | مسلسل | I like watching Turkish series. | أحب مشاهدة المسلسلات التركية.',
      '🧩 | puzzle | لغز | My grandfather likes doing puzzles. | جدي يحب حلّ الألغاز.',
      '🪕 | play the oud | يعزف على العود | My uncle plays the oud. | عمي يعزف على العود.',
      '🏀 | team | فريق | I play in a basketball team. | ألعب في فريق لكرة السلة.',
      '🧘 | yoga | اليوغا | My mother does yoga on Saturday. | أمي تمارس اليوغا يوم السبت.',
      '📱 | social media | مواقع التواصل | Teenagers love social media. | يحب المراهقون مواقع التواصل.',
      '😒 | hate | يكره | I hate waiting. | أكره الانتظار.',
      '🤩 | enjoy | يستمتع بـ | I enjoy reading on the beach. | أستمتع بالقراءة على الشاطئ.',
    ),
    groups: [
      g('⚽', 'Sports', 'الرياضات', 'football=كرة القدم|basketball=كرة السلة|volleyball=الكرة الطائرة|tennis=التنس|handball=كرة اليد|surfing=ركوب الأمواج|boxing=الملاكمة|karate=الكاراطي|skiing=التزلج|athletics=ألعاب القوى'),
      g('🎵', 'Music', 'الموسيقى', 'song=أغنية|singer=مغنٍّ|band=فرقة|concert=حفلة موسيقية|guitar=قيثارة|drums=طبول|violin=كمان|piano=بيانو|gnawa music=موسيقى كناوة|listen to=يستمع إلى'),
      g('🏠', 'At home', 'في البيت', 'board games=ألعاب الطاولة|cards=الورق|cooking shows=برامج الطبخ|films=أفلام|cartoons=رسوم متحركة|crosswords=الكلمات المتقاطعة|podcasts=البودكاست|plants=النباتات|photos=الصور|baking cakes=صنع الحلويات'),
    ],
    talks: [
      d('Friendly | ودّي', 'The weekend | نهاية الأسبوع', 'Zineb | Hamid', [
        ['What do you like doing at the weekend?', 'ماذا تحب أن تفعل في نهاية الأسبوع؟'],
        ['I like playing basketball with my team.', 'أحب لعب كرة السلة مع فريقي.'],
        ['Do you like watching series?', 'هل تحب مشاهدة المسلسلات؟'],
        ['Not really. I prefer films. And you?', 'ليس كثيرًا. أفضّل الأفلام. وأنتِ؟'],
        ['I love Turkish series and I enjoy painting.', 'أعشق المسلسلات التركية وأستمتع بالرسم.'],
        ['Cool! Can you paint my portrait?', 'رائع! هل تستطيعين رسم صورتي؟'],
      ]),
      d('Questions | أسئلة', 'A hobby survey | استطلاع حول الهوايات', 'Reporter | Grandpa', [
        ['What are your hobbies, sir?', 'ما هواياتك يا سيدي؟'],
        ['I like gardening and doing puzzles.', 'أحب البستنة وحلّ الألغاز.'],
        ['Do you like music?', 'هل تحب الموسيقى؟'],
        ['Yes, I love gnawa music.', 'نعم، أعشق موسيقى كناوة.'],
        ['Do you like social media?', 'هل تحب مواقع التواصل؟'],
        ['No! I hate it. I prefer real people!', 'لا! أكرهها. أفضّل الناس الحقيقيين!'],
      ]),
    ],
    ask: tr([
      ['What are your hobbies?', 'ما هواياتك؟'],
      ['Do you like sports?', 'هل تحب الرياضة؟'],
      ['What kind of music do you like?', 'ما نوع الموسيقى الذي تحبه؟'],
      ['Does your sister like reading?', 'هل تحب أختك القراءة؟'],
    ]),
    answer: tr([
      ['I like reading and cooking.', 'أحب القراءة والطبخ.'],
      ['Yes, I love football.', 'نعم، أعشق كرة القدم.'],
      ['I like gnawa and pop music.', 'أحب موسيقى كناوة والبوب.'],
      ['Yes, she loves novels.', 'نعم، تعشق الروايات.'],
    ]),
    reading: {
      icon: '🎨', title: 'The hobby club', titleAr: 'نادي الهوايات',
      text: "In our neighbourhood, there is a hobby club for young people. It's open every afternoon. On Monday, there is a painting class. On Tuesday, there is music: you can learn the guitar or the oud. On Wednesday, the club has a chess team. On Saturday, there is a cooking class with a famous chef. My friend Salma loves painting. I enjoy music and I play the oud. The club is free, and everyone is welcome!",
      gloss: pairs('young people=الشباب|learn=يتعلّم|famous=مشهور|free=مجّاني|welcome=مرحَّب به'),
      tf: [
        { s: 'The club is open every morning.', ok: false },
        { s: 'There is a chess team on Wednesday.', ok: true },
        { s: 'The club is expensive.', ok: false },
      ],
      qs: [
        { q: 'What can you learn on Tuesday?', a: 'The guitar or the oud.' },
        { q: 'What does Salma love?', a: 'Painting.' },
      ],
    } },
]
