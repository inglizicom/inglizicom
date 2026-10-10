import { d, g, pairs, tr, v, type VocabUnit } from '../workbook/vocab-book.ts'

/** Level 1 vocabulary book, lessons 6–10 (see index.ts). */
export const UNITS_6_10: VocabUnit[] = [
  /* ── 6 · Introductions & Wh-questions ────────────────────────────── */
  { n: 6, icon: '❓',
    vocab: v(
      "🏠 | address | عنوان | What's your address? | ما عنوانك؟",
      '🏘️ | neighbourhood | حيّ | I live in a quiet neighbourhood. | أسكن في حيّ هادئ.',
      '👫 | live with | يعيش مع | I live with my parents. | أعيش مع والديّ.',
      '❤️ | love | يحب كثيرًا | I love my city. | أحب مدينتي كثيرًا.',
      '⭐ | favourite | مفضّل | My favourite colour is blue. | لوني المفضّل هو الأزرق.',
      '🎯 | free time | وقت الفراغ | In my free time, I read. | في وقت فراغي أقرأ.',
      '🗓️ | weekend | نهاية الأسبوع | I visit my family at the weekend. | أزور عائلتي في نهاية الأسبوع.',
      '🤔 | Which? | أيّ؟ | Which city are you from? | من أي مدينة أنت؟',
      '⏳ | How long? | كم من الوقت؟ | How long is the course? | كم مدة الدورة؟',
      '👤 | Whose? | لمن؟ | Whose bag is this? | لمن هذه الحقيبة؟',
    ),
    groups: [
      g('🏠', 'Where I live', 'أين أسكن', 'house=منزل|flat=شقة|building=عمارة|street=شارع|village=قرية|town=بلدة|city centre=وسط المدينة|near=قريب من|far from=بعيد عن|next to=بجانب'),
      g('🎯', 'Free time', 'وقت الفراغ', 'read=يقرأ|walk=يتمشّى|watch films=يشاهد أفلامًا|listen to music=يستمع إلى الموسيقى|play football=يلعب كرة القدم|go out=يخرج|visit friends=يزور الأصدقاء|sleep late=ينام متأخرًا|travel=يسافر|chat=يدردش'),
      g('📆', 'Days and dates', 'الأيام والتواريخ', 'today=اليوم|tomorrow=غدًا|yesterday=أمس|this week=هذا الأسبوع|next week=الأسبوع القادم|month=شهر|year=سنة|holiday=عطلة|date=تاريخ|now=الآن'),
    ],
    talks: [
      d('Friendly | ودّي', 'A new colleague | زميلة جديدة', 'Hassan | Leila', [
        ['Hello! Are you the new accountant?', 'مرحبًا! هل أنتِ المحاسبة الجديدة؟'],
        ["Yes, I am. I'm Leila.", 'نعم. أنا ليلى.'],
        ['Nice to meet you, Leila. Where do you live?', 'تشرّفت بمعرفتك يا ليلى. أين تسكنين؟'],
        ['In Hay Riad, near the park.', 'في حي الرياض، قرب الحديقة.'],
        ['How do you come to work?', 'كيف تأتين إلى العمل؟'],
        ["By tram. It's fast.", 'بالترام. إنه سريع.'],
      ]),
      d('Questions | أسئلة', 'An interview | مقابلة', 'Journalist | Amal', [
        ['Who do you live with?', 'مع من تسكنين؟'],
        ['With my husband and my son.', 'مع زوجي وابني.'],
        ['What do you do in your free time?', 'ماذا تفعلين في وقت فراغك؟'],
        ['I cook and I listen to music.', 'أطبخ وأستمع إلى الموسيقى.'],
        ["What's your favourite city?", 'ما مدينتك المفضّلة؟'],
        ["Chefchaouen. It's blue and beautiful!", 'شفشاون. إنها زرقاء وجميلة!'],
      ]),
    ],
    ask: tr([
      ['Where do you live?', 'أين تسكن؟'],
      ['Who is your best friend?', 'من أعزّ أصدقائك؟'],
      ['When is your birthday?', 'متى عيد ميلادك؟'],
      ['Why do you study English?', 'لماذا تدرس الإنجليزية؟'],
    ]),
    answer: tr([
      ['In Tangier, near the port.', 'في طنجة، قرب الميناء.'],
      ["Hajar. She's my neighbour.", 'هاجر. إنها جارتي.'],
      ["It's on the third of April.", 'إنه في الثالث من أبريل.'],
      ['For my job.', 'من أجل عملي.'],
    ]),
    reading: {
      icon: '🙋', title: 'Introducing Youssef', titleAr: 'تقديم يوسف',
      text: "This is my friend Youssef. He is twenty-two years old and he is from Essaouira. He lives in Rabat with his cousin. He is a student at the university. He studies computer science. In his free time, he plays football and listens to music. His favourite food is fish tagine. Why does he study English? Because he wants to work in a big company. Youssef is funny, kind and very helpful.",
      gloss: pairs('university=الجامعة|computer science=الإعلاميات|wants=يريد|company=شركة|helpful=خدوم'),
      tf: [
        { s: 'Youssef lives with his parents.', ok: false },
        { s: 'He is a student.', ok: true },
        { s: 'His favourite food is couscous.', ok: false },
      ],
      qs: [
        { q: 'Where is Youssef from?', a: 'From Essaouira.' },
        { q: 'Why does he study English?', a: 'Because he wants to work in a big company.' },
      ],
    } },

  /* ── 7 · Reading: a day's work ───────────────────────────────────── */
  { n: 7, icon: '📖',
    vocab: v(
      '🚏 | bus stop | موقف الحافلة | The bus stop is near my house. | موقف الحافلة قريب من بيتي.',
      '🎫 | ticket | تذكرة | The ticket is seven dirhams. | التذكرة بسبعة دراهم.',
      '🧑‍🤝‍🧑 | passenger | راكب | The bus has forty passengers. | في الحافلة أربعون راكبًا.',
      '🛑 | stop | يتوقف | The bus stops here. | تتوقف الحافلة هنا.',
      '🕔 | early | باكرًا | He gets up early. | ينهض باكرًا.',
      "😴 | tired | متعب | I'm tired after work. | أنا متعب بعد العمل.",
      '🧺 | housework | أعمال البيت | My husband helps with the housework. | يساعد زوجي في أعمال البيت.',
      '🛒 | go shopping | يتسوّق | She goes shopping on Saturday. | تتسوّق يوم السبت.',
      '📰 | newspaper | جريدة | My grandfather reads the newspaper. | جدي يقرأ الجريدة.',
      '🏨 | guest | نزيل | The guests are from Spain. | النزلاء من إسبانيا.',
    ),
    groups: [
      g('🔁', 'He / she verbs', 'أفعال مع هو / هي', 'gets up=ينهض|washes=يغسل|drinks=يشرب|eats=يأكل|drives=يسوق|works=يعمل|finishes=يُنهي|watches=يشاهد|reads=يقرأ|sleeps=ينام'),
      g('🏨', 'At a hotel', 'في الفندق', 'reception=الاستقبال|room=غرفة|key=مفتاح|towel=منشفة|lift=مصعد|floor=طابق|pool=مسبح|breakfast room=قاعة الفطور|suitcase=حقيبة سفر|check in=يسجّل الدخول'),
      g('⏰', 'Time of day', 'أوقات اليوم', 'morning=الصباح|noon=الظهر|afternoon=بعد الظهر|evening=المساء|night=الليل|midnight=منتصف الليل|every day=كل يوم|after=بعد|before=قبل|then=ثم'),
    ],
    talks: [
      d('Friendly | ودّي', 'On the bus | في الحافلة', 'Driver | Student', [
        ['Good morning! Does this bus go to the university?', 'صباح الخير! هل تذهب هذه الحافلة إلى الجامعة؟'],
        ['Yes, it does. Get on, please.', 'نعم. اصعد من فضلك.'],
        ['How much is the ticket?', 'بكم التذكرة؟'],
        ['Seven dirhams.', 'سبعة دراهم.'],
        ['Here you are. Where is the university stop?', 'تفضّل. أين موقف الجامعة؟'],
        ["It's the last stop.", 'إنه الموقف الأخير.'],
      ]),
      d('Polite | مهذّب', 'At the hotel | في الفندق', 'Receptionist | Guest', [
        ['Good evening. Welcome to Hotel Atlas.', 'مساء الخير. مرحبًا بك في فندق الأطلس.'],
        ['Good evening. I have a room for two nights.', 'مساء الخير. لديّ غرفة لليلتين.'],
        ["What's your name, please?", 'ما اسمك من فضلك؟'],
        ['Paul Martin.', 'بول مارتن.'],
        ['Here is your key. Room 215, second floor.', 'هذا مفتاحك. الغرفة 215، الطابق الثاني.'],
        ['Thank you. What time is breakfast?', 'شكرًا. في أي ساعة الفطور؟'],
      ]),
    ],
    ask: tr([
      ['What time do you get up?', 'في أي ساعة تنهض؟'],
      ['How do you go to work?', 'كيف تذهب إلى العمل؟'],
      ['What do you do after work?', 'ماذا تفعل بعد العمل؟'],
      ['When do you go to bed?', 'متى تنام؟'],
    ]),
    answer: tr([
      ["At six o'clock.", 'في السادسة.'],
      ['By bus.', 'بالحافلة.'],
      ['I play with my children.', 'ألعب مع أطفالي.'],
      ['At eleven.', 'في الحادية عشرة.'],
    ]),
    reading: {
      icon: '👩‍🍳', title: "Hajar's day", titleAr: 'يوم هاجر',
      text: "Hajar is twenty-nine. She is a cook in a restaurant in Fes. She gets up at eight and has breakfast with her sister. She goes to work by taxi. She starts work at ten. She cooks tagines, salads and harira. She has lunch at four with the waiters. She finishes work at eleven at night. She is very tired, but she is happy because she loves her job. On Mondays, she doesn't work. She goes shopping and visits her mother.",
      gloss: pairs('cook=طبّاخة|restaurant=مطعم|waiters=النُّدُل|loves=تحب|doesn\'t work=لا تعمل'),
      tf: [
        { s: 'Hajar goes to work by bus.', ok: false },
        { s: 'She works in a restaurant.', ok: true },
        { s: "She doesn't work on Mondays.", ok: true },
      ],
      qs: [
        { q: 'What does Hajar cook?', a: 'Tagines, salads and harira.' },
        { q: 'What time does she finish work?', a: 'At eleven at night.' },
      ],
    } },

  /* ── 8 · The classroom ───────────────────────────────────────────── */
  { n: 8, icon: '🎒',
    vocab: v(
      '✂️ | scissors | مقص | Can I borrow your scissors? | هل أستعير مقصك؟',
      '🧴 | glue | لصاق | I need some glue. | أحتاج إلى بعض اللصاق.',
      '🖍️ | crayons | أقلام تلوين | The children draw with crayons. | يرسم الأطفال بأقلام التلوين.',
      '✏️ | sharpener | مبراة | My pencil needs a sharpener. | قلمي يحتاج إلى مبراة.',
      '🗂️ | folder | ملف | Put the papers in your folder. | ضع الأوراق في ملفك.',
      '🖥️ | computer | حاسوب | We have a computer in the classroom. | لدينا حاسوب في القسم.',
      '🗺️ | map | خريطة | Look at the map of Morocco. | انظروا إلى خريطة المغرب.',
      '🔔 | bell | جرس | The bell rings at ten. | يرنّ الجرس في العاشرة.',
      '📄 | page | صفحة | Open your book at page 20. | افتحوا كتبكم على الصفحة 20.',
      '🙋 | raise your hand | ارفع يدك | Raise your hand, please. | ارفع يدك من فضلك.',
    ),
    groups: [
      g('📚', 'School subjects', 'المواد الدراسية', 'maths=الرياضيات|science=العلوم|history=التاريخ|geography=الجغرافيا|Arabic=العربية|French=الفرنسية|art=الفنون|music=الموسيقى|sport=التربية البدنية|computer studies=المعلوميات'),
      g('🏫', 'Places at school', 'أماكن في المدرسة', "classroom=القسم|library=المكتبة|playground=الساحة|office=الإدارة|toilets=المراحيض|canteen=المطعم المدرسي|gate=الباب الرئيسي|stairs=الدرج|corridor=الممر|teachers' room=قاعة الأساتذة"),
      g('🔁', 'Class verbs', 'أفعال القسم', 'open=افتح|close=أغلق|read=اقرأ|write=اكتب|listen=استمع|look=انظر|match=صِل|circle=ضع دائرة|underline=ضع خطًا تحت|check=صحّح'),
    ],
    talks: [
      d('Polite | مهذّب', 'In the library | في المكتبة', 'Librarian | Ziad', [
        ['Hello. Can I help you?', 'مرحبًا. هل يمكنني مساعدتك؟'],
        ['Yes, please. I need an English dictionary.', 'نعم من فضلك. أحتاج إلى قاموس إنجليزي.'],
        ['The dictionaries are on the second shelf.', 'القواميس في الرفّ الثاني.'],
        ['Can I take it home?', 'هل يمكنني أن آخذه إلى البيت؟'],
        ['Sorry, no. You can read it here.', 'آسفة، لا. يمكنك قراءته هنا.'],
        ['OK. Thank you.', 'حسنًا. شكرًا.'],
      ]),
      d('Friendly | ودّي', 'Before the test | قبل الاختبار', 'Nour | Sami', [
        ['Sami, do you have a pencil?', 'سامي، هل لديك قلم رصاص؟'],
        ['Yes. Here you are.', 'نعم. تفضّلي.'],
        ['Thanks! And a sharpener?', 'شكرًا! ومبراة؟'],
        ["Sorry, I don't have one. Ask Hiba.", 'آسف، ليست لديّ واحدة. اسألي هبة.'],
        ['Oh no, the bell! The test starts now.', 'يا إلهي، الجرس! يبدأ الاختبار الآن.'],
        ['Good luck, Nour!', 'بالتوفيق يا نور!'],
      ]),
    ],
    ask: tr([
      ['What page is it?', 'أي صفحة؟'],
      ['Can I borrow your ruler?', 'هل أستعير مسطرتك؟'],
      ['What is a map?', 'ما هي الخريطة؟'],
      ['Can I go out, please?', 'هل يمكنني الخروج من فضلك؟'],
    ]),
    answer: tr([
      ['Page twenty-five.', 'الصفحة خمس وعشرون.'],
      ['Sure, here you are.', 'طبعًا، تفضّل.'],
      ["It's a picture of a country.", 'إنها صورة لبلد.'],
      ['Yes, but come back quickly.', 'نعم، لكن ارجع بسرعة.'],
    ]),
    reading: {
      icon: '🎒', title: "Sami's school bag", titleAr: 'محفظة سامي',
      text: "Sami is eleven. He goes to a primary school in Kenitra. Every evening, his mother checks his school bag. In the bag, there are three books, two notebooks and a pencil case. In the pencil case, there are pens, pencils, a ruler, an eraser and a sharpener. Sami's favourite subject is maths. He doesn't like history. His teacher is Mrs Idrissi. She is kind but strict. Today, Sami has a maths test. He is ready!",
      gloss: pairs('checks=تتفقّد|there are=يوجد|subject=مادة|strict=صارمة|ready=مستعد'),
      tf: [
        { s: 'Sami goes to a primary school.', ok: true },
        { s: 'His favourite subject is history.', ok: false },
        { s: 'His teacher is a man.', ok: false },
      ],
      qs: [
        { q: 'How old is Sami?', a: 'He is eleven.' },
        { q: 'What is in the pencil case?', a: 'Pens, pencils, a ruler, an eraser and a sharpener.' },
      ],
    } },

  /* ── 9 · Pronouns & verbs ────────────────────────────────────────── */
  { n: 9, icon: '🗣️',
    vocab: v(
      '🤳 | video call | مكالمة فيديو | I make a video call to my mum every Sunday. | أجري مكالمة فيديو مع أمي كل يوم أحد.',
      '💌 | miss | يشتاق إلى | I miss my family. | أشتاق إلى عائلتي.',
      '🧹 | clean | ينظّف | They clean the house on Saturday. | ينظّفون البيت يوم السبت.',
      '🧺 | wash the clothes | يغسل الملابس | She washes the clothes on Monday. | تغسل الملابس يوم الإثنين.',
      '👨‍👩‍👦 | parents | الوالدان | My parents live in Settat. | والداي يعيشان في سطات.',
      '🏡 | at home | في البيت | We are at home tonight. | نحن في البيت الليلة.',
      '🎓 | study | يدرس | My sister studies law. | أختي تدرس القانون.',
      '💬 | talk to | يتحدث مع | I talk to my friends every day. | أتحدث مع أصدقائي كل يوم.',
      '🛵 | ride | يركب | He rides his motorbike to work. | يركب دراجته النارية إلى العمل.',
      '🤲 | help | يساعد | We help our parents. | نساعد والدينا.',
    ),
    groups: [
      g('🐾', 'Animals', 'الحيوانات', 'cat=قطة|dog=كلب|bird=طائر|fish=سمكة|rabbit=أرنب|horse=حصان|cow=بقرة|sheep=خروف|chicken=دجاجة|donkey=حمار'),
      g('👤', 'Pronouns and have', 'الضمائر وفعل have', 'I have=لديّ|you have=لديك|he has=لديه|she has=لديها|it has=لديه (لغير العاقل)|we have=لدينا|they have=لديهم|my=ـي|your=ـك|our=ـنا'),
      g('🏠', 'Housework', 'أعمال البيت', 'do the dishes=يغسل الأواني|make lunch=يحضّر الغداء|set the table=يرتّب المائدة|tidy up=يرتّب|sweep=يكنس|iron=يكوي|water the plants=يسقي النباتات|take out the rubbish=يُخرج القمامة|go to the market=يذهب إلى السوق|feed the cat=يطعم القطة'),
    ],
    talks: [
      d('On the phone | على الهاتف', 'Calling Grandma | مكالمة الجدة', 'Grandma | Adam', [
        ['Hello, Adam! How are you, my dear?', 'ألو يا آدم! كيف حالك يا عزيزي؟'],
        ["I'm fine, Grandma. I miss you!", 'أنا بخير يا جدتي. أشتاق إليك!'],
        ['I miss you too. Do you help your mum?', 'وأنا أشتاق إليك أيضًا. هل تساعد أمك؟'],
        ['Yes, I do. I tidy my room every day.', 'نعم. أرتّب غرفتي كل يوم.'],
        ['Good boy! Does your sister help too?', 'أحسنت! وهل تساعد أختك أيضًا؟'],
        ['Yes, she does the dishes.', 'نعم، تغسل الأواني.'],
      ]),
      d('Questions | أسئلة', 'New flatmates | سكن مشترك', 'Sara | Julie', [
        ['Do you have a cat?', 'هل لديك قطة؟'],
        ['No, I have a rabbit. Is that OK?', 'لا، لديّ أرنب. هل هذا مناسب؟'],
        ['Yes, of course! Do you cook?', 'نعم طبعًا! هل تطبخين؟'],
        ['Yes, I make good pasta.', 'نعم، أحضّر معكرونة جيدة.'],
        ['Great. I clean and you cook!', 'رائع. أنا أنظّف وأنتِ تطبخين!'],
        ['Deal!', 'اتفقنا!'],
      ]),
    ],
    ask: tr([
      ['Do you have a pet?', 'هل لديك حيوان أليف؟'],
      ['Who cooks in your family?', 'من يطبخ في عائلتك؟'],
      ['Does your brother help at home?', 'هل يساعد أخوك في البيت؟'],
      ['Do you miss your family?', 'هل تشتاق إلى عائلتك؟'],
    ]),
    answer: tr([
      ['Yes, I have a cat.', 'نعم، لديّ قطة.'],
      ['My mother and my father.', 'أمي وأبي.'],
      ['Yes, he does the dishes.', 'نعم، يغسل الأواني.'],
      ['Yes, I do. Very much.', 'نعم، كثيرًا.'],
    ]),
    reading: {
      icon: '🏠', title: 'A busy house', titleAr: 'بيت مشغول',
      text: "We are five in our family. My father works in a factory and my mother is a nurse. They work a lot, so we help at home. My brother Adam sweeps the floor and takes out the rubbish. My sister Rim does the dishes. I cook lunch on Saturday. My little sister Lina feeds the cat and waters the plants. On Sunday, we don't work. We go to the beach or we visit our grandparents in the village.",
      gloss: pairs('factory=مصنع|a lot=كثيرًا|so=لذلك|floor=الأرضية|village=القرية'),
      tf: [
        { s: 'The mother is a doctor.', ok: false },
        { s: 'Rim does the dishes.', ok: true },
        { s: 'Lina feeds the cat.', ok: true },
      ],
      qs: [
        { q: 'What does Adam do at home?', a: 'He sweeps the floor and takes out the rubbish.' },
        { q: 'What do they do on Sunday?', a: 'They go to the beach or visit their grandparents.' },
      ],
    } },

  /* ── 10 · My house ───────────────────────────────────────────────── */
  { n: 10, icon: '🛋️',
    vocab: v(
      '🪟 | curtains | ستائر | The curtains are blue. | الستائر زرقاء.',
      '🧶 | carpet | زربية | There is a big carpet in the living room. | توجد زربية كبيرة في الصالون.',
      '🛏️ | pillow | وسادة | The pillow is on the bed. | الوسادة على السرير.',
      '🟫 | cushion | مخدّة | The cushions are on the sofa. | المخدّات على الأريكة.',
      '⬆️ | upstairs | في الطابق العلوي | My bedroom is upstairs. | غرفتي في الطابق العلوي.',
      '⬇️ | downstairs | في الطابق السفلي | The kitchen is downstairs. | المطبخ في الطابق السفلي.',
      '🏡 | roof terrace | السطح | We dry the clothes on the roof terrace. | ننشر الملابس على السطح.',
      '🚿 | shower | دُش | The shower is in the bathroom. | الدُّش في الحمّام.',
      '🚰 | sink | حوض الغسيل | The plates are in the sink. | الصحون في الحوض.',
      '📚 | shelf | رفّ | My books are on the shelf. | كتبي على الرف.',
    ),
    groups: [
      g('🍳', 'In the kitchen', 'في المطبخ', 'plate=صحن|cup=كوب|glass=كأس|spoon=ملعقة|fork=شوكة|knife=سكين|pot=قِدر|teapot=برّاد|oven=فرن|microwave=ميكروويف'),
      g('🛁', 'In the bathroom', 'في الحمّام', 'toilet=مرحاض|towel=منشفة|soap=صابون|toothbrush=فرشاة الأسنان|toothpaste=معجون الأسنان|shampoo=شامبو|tap=صنبور|comb=مشط|basin=مغسلة|hairdryer=مجفّف الشعر'),
      g('🕌', 'A Moroccan house', 'البيت المغربي', 'Moroccan salon=الصالون المغربي|pouf=بوف|tea tray=صينية الشاي|lantern=فانوس|tiles=زليج|courtyard=صحن الدار|fountain=نافورة|blanket=غطاء|low table=مائدة صغيرة|door mat=دوّاسة'),
    ],
    talks: [
      d('Friendly | ودّي', 'Visiting a new flat | زيارة شقة جديدة', 'Kawtar | Imad', [
        ['Welcome to my new flat!', 'مرحبًا بك في شقتي الجديدة!'],
        ["Wow, it's beautiful! Where is the kitchen?", 'رائع، إنها جميلة! أين المطبخ؟'],
        ["It's next to the living room.", 'إنه بجانب الصالون.'],
        ['And your bedroom?', 'وغرفة نومك؟'],
        ["It's upstairs, next to the bathroom.", 'إنها في الطابق العلوي، بجانب الحمّام.'],
        ['I love the curtains and the carpet!', 'أحب الستائر والزربية!'],
      ]),
      d('Questions | أسئلة', 'Where is it? | أين هو؟', 'Dad | Lina', [
        ['Lina, where is the teapot?', 'لينا، أين البرّاد؟'],
        ["It's on the shelf, above the oven.", 'إنه على الرف فوق الفرن.'],
        ['And the glasses?', 'والكؤوس؟'],
        ["They're in the sink. I'm sorry!", 'إنها في الحوض. آسفة!'],
        ['No problem. Can you wash them, please?', 'لا مشكلة. هل يمكنك أن تغسليها من فضلك؟'],
        ['Yes, Dad. Right now!', 'نعم يا أبي. حالًا!'],
      ]),
    ],
    ask: tr([
      ['Where is the remote control?', 'أين جهاز التحكم؟'],
      ['Where are the towels?', 'أين المناشف؟'],
      ['Do you live in a house or a flat?', 'هل تسكن في منزل أم في شقة؟'],
      ['Is your bedroom big?', 'هل غرفة نومك كبيرة؟'],
    ]),
    answer: tr([
      ["It's under the cushion.", 'إنه تحت المخدّة.'],
      ["They're in the bathroom.", 'إنها في الحمّام.'],
      ['I live in a flat.', 'أسكن في شقة.'],
      ["No, it's small but nice.", 'لا، إنها صغيرة لكنها جميلة.'],
    ]),
    reading: {
      icon: '🏠', title: "My grandmother's house", titleAr: 'بيت جدتي',
      text: "My grandmother lives in an old house in the medina of Fes. In the middle of the house, there is a courtyard with a small fountain. The salon is big. There are poufs, cushions and a beautiful carpet. The kitchen is small, but it has everything: a big pot, a teapot and many glasses. The bedrooms are upstairs. My favourite place is the roof terrace. From there, I can see the whole medina!",
      gloss: pairs('old=قديم|in the middle of=في وسط|everything=كل شيء|place=مكان|the whole=بأكملها'),
      tf: [
        { s: 'The house is in Fes.', ok: true },
        { s: 'The kitchen is very big.', ok: false },
        { s: 'The bedrooms are downstairs.', ok: false },
      ],
      qs: [
        { q: 'What is in the middle of the house?', a: 'A courtyard with a small fountain.' },
        { q: "What is the writer's favourite place?", a: 'The roof terrace.' },
      ],
    } },
]
