import { d, g, pairs, tr, v, type VocabUnit } from '../workbook/vocab-book.ts'

/** Level 1 vocabulary book, lessons 11–15 (see index.ts). */
export const UNITS_11_15: VocabUnit[] = [
  /* ── 11 · My day & the time ──────────────────────────────────────── */
  { n: 11, icon: '⏰',
    vocab: v(
      '⏰ | alarm clock | منبّه | My alarm clock rings at six. | يرنّ منبّهي في السادسة.',
      '🛌 | stay in bed | يبقى في السرير | On Sunday, I stay in bed late. | يوم الأحد أبقى في السرير حتى وقت متأخر.',
      '☕ | have a coffee | يشرب قهوة | I have a coffee at ten. | أشرب قهوة في العاشرة.',
      '🧥 | put on | يلبس | I put on my jacket. | ألبس سترتي.',
      '🚪 | leave home | يغادر البيت | I leave home at half past seven. | أغادر البيت في السابعة والنصف.',
      '🕐 | on time | في الوقت | The bus is always on time. | الحافلة دائمًا في الوقت.',
      '🏃 | hurry up | يستعجل | Hurry up! The bus is here! | أسرع! الحافلة هنا!',
      '🥱 | have a nap | يأخذ قيلولة | My grandfather has a nap after lunch. | جدي يأخذ قيلولة بعد الغداء.',
      '🛋️ | relax | يسترخي | In the evening, I relax. | في المساء أسترخي.',
      '🌙 | at night | في الليل | I read at night. | أقرأ في الليل.',
    ),
    groups: [
      g('🕐', 'Telling the time', 'قول الساعة', "o'clock=تمامًا|half past=والنصف|quarter past=والربع|quarter to=إلا ربعًا|five past=وخمس دقائق|ten to=إلا عشر دقائق|noon=الظهر|midnight=منتصف الليل|minute=دقيقة|hour=ساعة"),
      g('🍽️', 'Meals', 'الوجبات', 'breakfast=الفطور|lunch=الغداء|dinner=العشاء|snack=وجبة خفيفة|tea time=وقت الشاي|meal=وجبة|early=باكرًا|late=متأخرًا|hungry=جائع|full=شبعان'),
      g('👕', 'Clothes', 'الملابس', 'shirt=قميص|T-shirt=تيشيرت|trousers=سروال|jeans=جينز|dress=فستان|skirt=تنّورة|jacket=سترة|shoes=حذاء|socks=جوارب|djellaba=جلابة'),
    ],
    talks: [
      d('Friendly | ودّي', 'Late again! | متأخر مرة أخرى!', 'Mum | Rayan', [
        ["Rayan, get up! It's quarter past seven!", 'ريان، انهض! إنها السابعة والربع!'],
        ['Five more minutes, Mum…', 'خمس دقائق أخرى يا أمي…'],
        ['No! The school bus comes at half past seven.', 'لا! حافلة المدرسة تأتي في السابعة والنصف.'],
        ['OK, OK. Where is my uniform?', 'حسنًا، حسنًا. أين زيّي المدرسي؟'],
        ["It's on the chair. Hurry up!", 'إنه على الكرسي. أسرع!'],
        ["I'm ready! Bye, Mum!", 'أنا جاهز! مع السلامة يا أمي!'],
      ]),
      d('Questions | أسئلة', 'A survey | استطلاع', 'Student | Teacher', [
        ['What time do you wake up?', 'في أي ساعة تستيقظ؟'],
        ["At six o'clock. I have an alarm clock.", 'في السادسة. لديّ منبّه.'],
        ['When do you have lunch?', 'متى تتناول الغداء؟'],
        ["At one o'clock, at school.", 'في الواحدة، في المدرسة.'],
        ['Do you have a nap?', 'هل تأخذ قيلولة؟'],
        ["No, I don't. I don't have time!", 'لا. ليس لديّ وقت!'],
      ]),
    ],
    ask: tr([
      ['What time is it?', 'كم الساعة؟'],
      ['When do you leave home?', 'متى تغادر البيت؟'],
      ['Do you have breakfast every day?', 'هل تتناول الفطور كل يوم؟'],
      ['What time do you go to bed?', 'في أي ساعة تنام؟'],
    ]),
    answer: tr([
      ["It's ten to nine.", 'إنها التاسعة إلا عشر دقائق.'],
      ['At half past seven.', 'في السابعة والنصف.'],
      ['Yes, always.', 'نعم، دائمًا.'],
      ["At eleven o'clock.", 'في الحادية عشرة.'],
    ]),
    reading: {
      icon: '🥖', title: "A baker's day", titleAr: 'يوم خبّاز',
      text: "Brahim is a baker in Safi. His day is different! He gets up at three in the morning. He puts on his white clothes and goes to the bakery. He makes bread, croissants and msemen. At six o'clock, the first customers arrive. He finishes work at noon and goes home. He has lunch with his family and then he has a long nap. In the evening, he plays with his children. He goes to bed at eight o'clock.",
      gloss: pairs('different=مختلف|bakery=مخبزة|customers=الزبائن|arrive=يصلون|then=ثم'),
      tf: [
        { s: 'Brahim gets up at three.', ok: true },
        { s: 'He works in a restaurant.', ok: false },
        { s: 'He goes to bed at eleven.', ok: false },
      ],
      qs: [
        { q: 'What does Brahim make?', a: 'Bread, croissants and msemen.' },
        { q: 'What does he do after lunch?', a: 'He has a long nap.' },
      ],
    } },

  /* ── 12 · The week ───────────────────────────────────────────────── */
  { n: 12, icon: '🗓️',
    vocab: v(
      '📅 | calendar | تقويم | Look at the calendar. Today is Monday. | انظر إلى التقويم. اليوم الإثنين.',
      '⚽ | match | مباراة | There is a football match on Sunday. | توجد مباراة كرة قدم يوم الأحد.',
      '🛍️ | souk | السوق الأسبوعي | The souk is on Wednesday in my village. | السوق في قريتي يوم الأربعاء.',
      '📆 | next week | الأسبوع القادم | See you next week! | أراك الأسبوع القادم!',
      '😌 | day off | يوم عطلة | Sunday is my day off. | الأحد يوم عطلتي.',
      '🎉 | party | حفلة | There is a party on Saturday evening. | توجد حفلة مساء السبت.',
      "💼 | busy | مشغول | I'm busy on Tuesday. | أنا مشغول يوم الثلاثاء.",
      '🆓 | free | متفرّغ | Are you free on Saturday? | هل أنت متفرّغ يوم السبت؟',
      '📝 | plans | خطط | What are your plans for the weekend? | ما خططك لنهاية الأسبوع؟',
      "⏰ | appointment | موعد | I have a doctor's appointment on Friday. | لديّ موعد عند الطبيب يوم الجمعة.",
    ),
    groups: [
      g('🌦️', 'Seasons and weather', 'الفصول والطقس', 'spring=الربيع|summer=الصيف|autumn=الخريف|winter=الشتاء|sunny=مشمس|rainy=ممطر|windy=عاصف|cold=بارد|hot=حار|cloudy=غائم'),
      g('🎯', 'Weekly activities', 'أنشطة أسبوعية', 'go to the souk=يذهب إلى السوق|go to the hammam=يذهب إلى الحمّام|visit family=يزور العائلة|play football=يلعب كرة القدم|go swimming=يذهب للسباحة|do the shopping=يتسوّق|clean the house=ينظّف البيت|have a picnic=يقوم بنزهة|go to the mosque=يذهب إلى المسجد|watch a match=يشاهد مباراة'),
      g('🔁', 'How often?', 'كم مرة؟', 'once=مرة|twice=مرتين|three times=ثلاث مرات|every day=كل يوم|every week=كل أسبوع|every month=كل شهر|on Mondays=أيام الإثنين|at weekends=في نهايات الأسبوع|hardly ever=نادرًا جدًا|from time to time=من حين لآخر'),
    ],
    talks: [
      d('Friendly | ودّي', 'Plans for the weekend | خطط نهاية الأسبوع', 'Ghita | Reda', [
        ['Are you free on Saturday?', 'هل أنت متفرّغ يوم السبت؟'],
        ['In the morning, no. I go to the souk with my dad.', 'في الصباح لا. أذهب إلى السوق مع أبي.'],
        ['And in the afternoon?', 'وبعد الظهر؟'],
        ["I'm free. Why?", 'أنا متفرّغ. لماذا؟'],
        ['There is a football match. Do you want to come?', 'توجد مباراة كرة قدم. هل تريد أن تأتي؟'],
        ['Yes, great idea!', 'نعم، فكرة رائعة!'],
      ]),
      d('Polite | مهذّب', 'At the dentist | عند طبيب الأسنان', 'Secretary | Mr Alami', [
        ['Good morning. I want an appointment, please.', 'صباح الخير. أريد موعدًا من فضلك.'],
        ['Is Tuesday at ten OK?', 'هل يناسبك الثلاثاء في العاشرة؟'],
        ['Sorry, I work on Tuesday. Is Friday possible?', 'آسف، أعمل يوم الثلاثاء. هل الجمعة ممكنة؟'],
        ["Yes. Friday at four o'clock.", 'نعم. الجمعة في الرابعة.'],
        ['Perfect. Thank you.', 'ممتاز. شكرًا.'],
        ["You're welcome. See you on Friday.", 'عفوًا. أراك يوم الجمعة.'],
      ]),
    ],
    ask: tr([
      ['What do you do on Sundays?', 'ماذا تفعل أيام الأحد؟'],
      ['How often do you go to the hammam?', 'كم مرة تذهب إلى الحمّام؟'],
      ['Are you busy tomorrow?', 'هل أنت مشغول غدًا؟'],
      ['What day is it today?', 'ما اليوم؟'],
    ]),
    answer: tr([
      ['I usually visit my family.', 'عادةً أزور عائلتي.'],
      ['Once a week.', 'مرة في الأسبوع.'],
      ['Yes, I am. Sorry.', 'نعم، آسف.'],
      ["It's Thursday.", 'إنه الخميس.'],
    ]),
    reading: {
      icon: '📅', title: "Karim's week", titleAr: 'أسبوع كريم',
      text: "Karim is a mechanic in Beni Mellal. He works from Monday to Saturday. On Monday and Thursday evenings, he plays football with his friends. On Wednesday, he goes to the souk with his wife. On Friday, the family always has couscous for lunch. Karim usually goes to the hammam on Saturday evening. Sunday is his day off. He sometimes goes to the countryside with his children. He never works on Sunday!",
      gloss: pairs('from … to=من … إلى|countryside=البادية|children=أطفال|sometimes=أحيانًا|never=أبدًا'),
      tf: [
        { s: 'Karim is a mechanic.', ok: true },
        { s: 'He plays football on Wednesday.', ok: false },
        { s: 'He never works on Sunday.', ok: true },
      ],
      qs: [
        { q: 'What does the family eat on Friday?', a: 'Couscous.' },
        { q: 'When does Karim go to the hammam?', a: 'On Saturday evening.' },
      ],
    } },

  /* ── 13 · Food ───────────────────────────────────────────────────── */
  { n: 13, icon: '🍲',
    vocab: v(
      '🥘 | tagine | طاجين | We eat chicken tagine with olives. | نأكل طاجين الدجاج بالزيتون.',
      '🍲 | harira | حريرة | My mother makes harira on Friday. | تحضّر أمي الحريرة يوم الجمعة.',
      '🫓 | msemen | مسمّن | I have msemen with honey for breakfast. | آكل المسمّن بالعسل في الفطور.',
      '🍛 | couscous | كسكس | We eat couscous on Friday. | نأكل الكسكس يوم الجمعة.',
      '🫒 | olives | زيتون | Moroccan olives are delicious. | الزيتون المغربي لذيذ.',
      '🍯 | honey | عسل | I love bread with honey. | أحب الخبز بالعسل.',
      '😋 | delicious | لذيذ | This tagine is delicious! | هذا الطاجين لذيذ!',
      '🧂 | salt | ملح | Can you pass the salt, please? | هل يمكنك أن تناولني الملح من فضلك؟',
      "🍽️ | hungry | جائع | I'm hungry! What's for lunch? | أنا جائع! ماذا يوجد للغداء؟",
      '🥄 | taste | يتذوّق | Taste this soup! | تذوّق هذا الحساء!',
    ),
    groups: [
      g('🥕', 'Vegetables', 'الخضر', 'carrots=جزر|potatoes=بطاطس|tomatoes=طماطم|onions=بصل|peppers=فلفل|courgettes=كورجيت|aubergines=باذنجان|beans=فاصوليا|peas=جلبانة|garlic=ثوم'),
      g('🍊', 'Fruit', 'الفواكه', 'orange=برتقالة|grapes=عنب|strawberries=فراولة|watermelon=دلّاح|melon=بطيخ|figs=كرموس|dates=تمر|pomegranate=رمان|lemon=ليمون|pear=إجاص'),
      g('🫓', 'Moroccan dishes', 'أطباق مغربية', 'pastilla=بسطيلة|rfissa=رفيسة|baghrir=بغرير|sfenj=سفنج|zaalouk=زعلوك|tanjia=طنجية|briouats=بريوات|chebakia=شباكية|sellou=سلّو|kefta=كفتة'),
    ],
    talks: [
      d('Friendly | ودّي', "At a friend's house | عند صديقة", 'Fatima | Emma', [
        ['Emma, come and eat! We have couscous.', 'إيما، تعالي لتأكلي! لدينا كسكس.'],
        ['Thank you! It smells delicious.', 'شكرًا! رائحته لذيذة.'],
        ['Do you like vegetables?', 'هل تحبين الخضر؟'],
        ['Yes, I love carrots and courgettes.', 'نعم، أحب الجزر والكورجيت.'],
        ['Taste it. Do you like it?', 'تذوّقيه. هل يعجبك؟'],
        ["Mmm, yes! It's the best couscous in the world!", 'ممم، نعم! إنه أفضل كسكس في العالم!'],
      ]),
      d('Polite | مهذّب', 'In a restaurant | في مطعم', 'Waiter | Customer', [
        ['Good evening. Are you ready to order?', 'مساء الخير. هل أنت مستعد للطلب؟'],
        ['Yes. A chicken tagine with olives, please.', 'نعم. طاجين دجاج بالزيتون من فضلك.'],
        ['With bread?', 'مع الخبز؟'],
        ['Yes, please. And a salad.', 'نعم من فضلك. وسلطة.'],
        ['Anything for dessert?', 'هل تريد تحلية؟'],
        ['Some fruit, please. Oranges.', 'بعض الفواكه من فضلك. برتقال.'],
      ]),
    ],
    ask: tr([
      ["What's for lunch?", 'ماذا يوجد للغداء؟'],
      ['Do you like fish?', 'هل تحب السمك؟'],
      ['Can you pass the bread, please?', 'هل يمكنك أن تناولني الخبز من فضلك؟'],
      ["What's your favourite dish?", 'ما طبقك المفضّل؟'],
    ]),
    answer: tr([
      ['Chicken tagine.', 'طاجين الدجاج.'],
      ['Yes, I love it!', 'نعم، أحبه كثيرًا!'],
      ['Sure. Here you are.', 'طبعًا. تفضّل.'],
      ['Pastilla!', 'البسطيلة!'],
    ]),
    reading: {
      icon: '🍲', title: 'Friday lunch', titleAr: 'غداء الجمعة',
      text: "In Morocco, Friday lunch is special. In my family, my grandmother makes couscous with seven vegetables: carrots, courgettes, potatoes, onions, tomatoes, pumpkin and cabbage. We all sit around a big plate. We eat with our hands or with a spoon. After lunch, we drink mint tea and eat some fruit: grapes, figs or watermelon. My grandmother's couscous is delicious. Everyone is happy on Friday!",
      gloss: pairs('special=خاصّ|seven=سبع|pumpkin=قرعة|cabbage=كرنب|around=حول'),
      tf: [
        { s: 'Friday lunch is special.', ok: true },
        { s: 'The couscous has five vegetables.', ok: false },
        { s: 'They drink coffee after lunch.', ok: false },
      ],
      qs: [
        { q: 'Who makes the couscous?', a: 'The grandmother.' },
        { q: 'What fruit do they eat?', a: 'Grapes, figs or watermelon.' },
      ],
    } },

  /* ── 14 · Drinks ─────────────────────────────────────────────────── */
  { n: 14, icon: '🍵',
    vocab: v(
      '🍵 | a glass of tea | كأس شاي | Can I have a glass of tea? | هل يمكنني الحصول على كأس شاي؟',
      '🌿 | mint | نعناع | Put some mint in the tea. | ضع بعض النعناع في الشاي.',
      '🍬 | sugar | سكر | No sugar, please. | بدون سكر من فضلك.',
      '🧊 | ice | ثلج | A cold juice with ice, please. | عصير بارد مع الثلج من فضلك.',
      '🥤 | straw | قصبة شرب | Can I have a straw? | هل يمكنني الحصول على قصبة؟',
      "🔥 | hot | ساخن | Careful! The tea is hot. | انتبه! الشاي ساخن.",
      '❄️ | cold | بارد | I want a cold drink. | أريد مشروبًا باردًا.',
      "😮‍💨 | thirsty | عطشان | I'm thirsty. Can I have some water? | أنا عطشان. هل يمكنني الحصول على بعض الماء؟",
      '🫖 | pour | يصبّ | My grandfather pours the tea. | جدي يصبّ الشاي.',
      '💵 | the bill | الحساب | Can I have the bill, please? | الحساب من فضلك.',
    ),
    groups: [
      g('☕', 'At the café', 'في المقهى', 'waiter=نادل|menu=قائمة|table=طاولة|chair=كرسي|cup=فنجان|glass=كأس|tray=صينية|napkin=منديل|tip=بقشيش|terrace=الشرفة'),
      g('🥤', 'More drinks', 'مشروبات أخرى', 'nous-nous=نص نص|almond milk=حليب اللوز|raib=رائب|banana milk=حليب بالموز|ginger tea=شاي بالزنجبيل|verbena tea=شاي اللويزة|soda=مشروب غازي|cola=كولا|still water=ماء غير غازي|tap water=ماء الصنبور'),
      g('📏', 'Sizes and amounts', 'الأحجام والكميات', 'small=صغير|medium=متوسط|large=كبير|a little=قليل|a lot=كثير|half=نصف|full=ممتلئ|empty=فارغ|one more=واحد آخر|enough=كافٍ'),
    ],
    talks: [
      d('Friendly | ودّي', 'Tea time | وقت الشاي', 'Grandpa | Yasmine', [
        ['Yasmine, do you want some tea?', 'ياسمين، هل تريدين بعض الشاي؟'],
        ['Yes, please, Grandpa. With a lot of mint!', 'نعم من فضلك يا جدي. مع نعناع كثير!'],
        ['And sugar?', 'والسكر؟'],
        ['Just a little, please.', 'قليل فقط من فضلك.'],
        ["Here you are. Careful, it's hot!", 'تفضّلي. انتبهي، إنه ساخن!'],
        ['Thank you. Your tea is the best!', 'شكرًا. شايك هو الأفضل!'],
      ]),
      d('Polite | مهذّب', 'At a café | في مقهى', 'Waiter | Omar', [
        ['Hello, sir. What would you like?', 'مرحبًا يا سيدي. ماذا تريد؟'],
        ['A nous-nous, please.', 'نص نص من فضلك.'],
        ['Small or large?', 'صغير أم كبير؟'],
        ['Large. And a bottle of still water.', 'كبير. وقنينة ماء غير غازي.'],
        ['Anything else?', 'شيء آخر؟'],
        ['No, thank you. Can I have the bill?', 'لا، شكرًا. الحساب من فضلك.'],
      ]),
    ],
    ask: tr([
      ['Are you thirsty?', 'هل أنت عطشان؟'],
      ['Do you want sugar?', 'هل تريد سكرًا؟'],
      ['Hot or cold?', 'ساخن أم بارد؟'],
      ['How much is a mint tea?', 'بكم الشاي بالنعناع؟'],
    ]),
    answer: tr([
      ['Yes, very thirsty!', 'نعم، عطشان جدًا!'],
      ['No, thank you.', 'لا، شكرًا.'],
      ['Cold, please.', 'بارد من فضلك.'],
      ["It's eight dirhams.", 'إنه بثمانية دراهم.'],
    ]),
    reading: {
      icon: '🍵', title: 'Moroccan tea', titleAr: 'الشاي المغربي',
      text: "In Morocco, tea is more than a drink. It is a welcome. When a guest arrives, the family makes mint tea. They put green tea, fresh mint and sugar in the teapot. Then they pour the tea from high above into small glasses. The tea is hot and sweet. People drink it in the morning, after lunch and in the evening. In winter, some people put verbena in their tea. Tea time is family time!",
      gloss: pairs('more than=أكثر من|guest=ضيف|fresh=طازج|from high above=من مكان مرتفع|sweet=حلو'),
      tf: [
        { s: 'In Morocco, tea is only a drink.', ok: false },
        { s: 'They put mint in the teapot.', ok: true },
        { s: 'Moroccan tea is cold.', ok: false },
      ],
      qs: [
        { q: 'What do they put in the teapot?', a: 'Green tea, fresh mint and sugar.' },
        { q: 'When do people drink tea?', a: 'In the morning, after lunch and in the evening.' },
      ],
    } },

  /* ── 15 · Transport ──────────────────────────────────────────────── */
  { n: 15, icon: '🚕',
    vocab: v(
      '🚕 | grand taxi | طاكسي كبير | We take a grand taxi to the village. | نأخذ طاكسي كبيرًا إلى القرية.',
      '🚌 | coach | حافلة المسافات الطويلة | The coach to Agadir leaves at nine. | تغادر الحافلة إلى أكادير في التاسعة.',
      '🎫 | ticket office | شبّاك التذاكر | Buy your ticket at the ticket office. | اشترِ تذكرتك من شبّاك التذاكر.',
      '🧳 | suitcase | حقيبة سفر | My suitcase is very heavy. | حقيبة سفري ثقيلة جدًا.',
      '🛣️ | road | طريق | The road to Ifrane is beautiful. | الطريق إلى إفران جميل.',
      '⛽ | petrol | بنزين | The car needs petrol. | السيارة تحتاج إلى بنزين.',
      '🅿️ | park | يركن | You can park here. | يمكنك أن تركن هنا.',
      '🚦 | traffic | زحمة السير | There is a lot of traffic in the morning. | توجد زحمة سير كثيرة في الصباح.',
      '🧭 | journey | رحلة | The journey takes two hours. | تستغرق الرحلة ساعتين.',
      "🚌 | driver | سائق | The bus driver is very nice. | سائق الحافلة لطيف جدًا.",
    ),
    groups: [
      g('🚉', 'At the station', 'في المحطة', 'platform=رصيف|timetable=جدول المواعيد|departure=المغادرة|arrival=الوصول|single ticket=تذكرة ذهاب|return ticket=تذكرة ذهاب وإياب|first class=الدرجة الأولى|second class=الدرجة الثانية|seat=مقعد|delay=تأخير'),
      g('🚗', 'The car', 'السيارة', 'wheel=عجلة|seat belt=حزام الأمان|driving licence=رخصة السياقة|brakes=الفرامل|engine=المحرك|horn=المنبّه|garage=مرأب|car park=موقف السيارات|speed=السرعة|tyre=إطار العجلة'),
      g('🧭', 'Going places', 'التنقّل', 'get on=يصعد|get off=ينزل|take=يأخذ|catch=يلحق بـ|miss=يفوته|walk=يمشي|arrive=يصل|leave=يغادر|wait=ينتظر|change=يغيّر'),
    ],
    talks: [
      d('Polite | مهذّب', 'At the train station | في محطة القطار', 'Clerk | Traveller', [
        ['Good morning. A ticket to Marrakech, please.', 'صباح الخير. تذكرة إلى مراكش من فضلك.'],
        ['Single or return?', 'ذهاب فقط أم ذهاب وإياب؟'],
        ['Return, please. Second class.', 'ذهاب وإياب من فضلك. الدرجة الثانية.'],
        ["That's two hundred dirhams.", 'هذا بمئتي درهم.'],
        ['What time is the next train?', 'في أي ساعة القطار القادم؟'],
        ['At half past ten, from platform 3.', 'في العاشرة والنصف، من الرصيف 3.'],
      ]),
      d('Friendly | ودّي', 'Going to the village | الذهاب إلى القرية', 'Anas | Dad', [
        ["Dad, how do we go to Grandma's village?", 'أبي، كيف نذهب إلى قرية جدتي؟'],
        ['We take the coach to Taroudant, then a grand taxi.', 'نأخذ الحافلة إلى تارودانت، ثم طاكسي كبيرًا.'],
        ['How long is the journey?', 'كم تستغرق الرحلة؟'],
        ['About four hours.', 'حوالي أربع ساعات.'],
        ['Four hours! Can I take my tablet?', 'أربع ساعات! هل يمكنني أن آخذ لوحتي؟'],
        ["Yes, but don't forget the charger!", 'نعم، لكن لا تنسَ الشاحن!'],
      ]),
    ],
    ask: tr([
      ['How do you go to school?', 'كيف تذهب إلى المدرسة؟'],
      ['Where is the bus station?', 'أين محطة الحافلات؟'],
      ['How long is the journey?', 'كم تستغرق الرحلة؟'],
      ['Is this seat free?', 'هل هذا المقعد فارغ؟'],
    ]),
    answer: tr([
      ["On foot. It's near.", 'مشيًا. إنها قريبة.'],
      ["It's next to the market.", 'إنها بجانب السوق.'],
      ['About two hours.', 'حوالي ساعتين.'],
      ['Yes, it is. Sit down.', 'نعم. اجلس.'],
    ]),
    reading: {
      icon: '🚆', title: 'A trip to Tangier', titleAr: 'رحلة إلى طنجة',
      text: "Every summer, Nadia goes to Tangier to visit her aunt. She lives in Casablanca. She takes the fast train, Al Boraq. The journey takes two hours. Nadia buys a return ticket at the ticket office. On the train, she reads a book and looks out of the window. At Tangier station, her aunt is always there. They take a taxi to her aunt's house near the sea. Nadia loves Tangier and the fast train!",
      gloss: pairs('every summer=كل صيف|fast=سريع|looks out of the window=تنظر من النافذة|always=دائمًا|near the sea=قرب البحر'),
      tf: [
        { s: 'Nadia lives in Tangier.', ok: false },
        { s: 'The journey takes two hours.', ok: true },
        { s: "They take a bus to her aunt's house.", ok: false },
      ],
      qs: [
        { q: 'Who does Nadia visit in Tangier?', a: 'Her aunt.' },
        { q: 'What does she do on the train?', a: 'She reads a book and looks out of the window.' },
      ],
    } },
]
