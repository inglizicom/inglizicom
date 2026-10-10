import { d, g, pairs, tr, v, type VocabUnit } from '../workbook/vocab-book.ts'

/** Level 1 vocabulary book, lessons 1–5 (see index.ts). */
export const UNITS_1_5: VocabUnit[] = [
  /* ── 1 · Greetings ───────────────────────────────────────────────── */
  { n: 1, icon: '👋',
    vocab: v(
      '🤗 | Welcome! | مرحبًا بك! | Welcome to our class, Sara! | مرحبًا بك في قسمنا يا سارة!',
      '🙏 | please | من فضلك | Sit down, please. | اجلس من فضلك.',
      '😊 | Thank you. | شكرًا لك. | Thank you, teacher! | شكرًا لك يا أستاذ!',
      "🙂 | You're welcome. | عفوًا. | Thank you! You're welcome. | شكرًا! عفوًا.",
      "😔 | Sorry. | آسف. | Sorry, I'm late. | آسف، لقد تأخرت.",
      '🙋 | Excuse me. | عذرًا. | Excuse me, are you Mr Alami? | عذرًا، هل أنت السيد العلمي؟',
      '👨 | Mr | السيد | Good morning, Mr Bennani. | صباح الخير يا سيد بناني.',
      '👩 | Mrs / Miss | السيدة / الآنسة | This is Mrs Tazi, our teacher. | هذه السيدة التازي، أستاذتنا.',
      '🪪 | first name | الاسم الشخصي | My first name is Omar. | اسمي الشخصي هو عمر.',
      '👪 | family name | الاسم العائلي | My family name is Alaoui. | اسمي العائلي هو العلوي.',
    ),
    groups: [
      g('🙂', 'Feelings', 'المشاعر', 'happy=سعيد|sad=حزين|tired=متعب|great=رائع|OK=لا بأس|not bad=لا بأس به|hungry=جائع|busy=مشغول|sick=مريض|bored=ضجِر'),
      g('👥', 'People', 'الناس', 'man=رجل|woman=امرأة|boy=ولد|girl=بنت|friend=صديق|neighbour=جار|classmate=زميل في القسم|guest=ضيف|baby=رضيع|people=ناس'),
      g('🔤', 'Spelling words', 'كلمات التهجئة', 'letter=حرف|capital letter=حرف كبير|small letter=حرف صغير|double=مزدوج|vowel=حرف متحرك|alphabet=الأبجدية|write=يكتب|say=يقول|repeat=يكرّر|again=مرة أخرى'),
    ],
    talks: [
      d('Friendly | ودّي', 'Meeting a neighbour | لقاء جار', 'Nabil | Hana', [
        ["Hi! I'm Nabil. I'm your new neighbour.", 'مرحبًا! أنا نبيل. أنا جارك الجديد.'],
        ["Welcome, Nabil! I'm Hana. Nice to meet you.", 'مرحبًا بك يا نبيل! أنا هناء. تشرّفت بمعرفتك.'],
        ['Nice to meet you too. How are you?', 'تشرّفت بمعرفتك أيضًا. كيف حالك؟'],
        ["I'm a bit tired today. And you?", 'أنا متعبة قليلًا اليوم. وأنت؟'],
        ['Not bad, thanks. See you later!', 'لا بأس، شكرًا. أراك لاحقًا!'],
        ['Bye, Nabil!', 'مع السلامة يا نبيل!'],
      ]),
      d('Polite | مهذّب', 'At the bank | في البنك', 'Clerk | Mrs Fassi', [
        ['Good morning, madam. Can I help you?', 'صباح الخير يا سيدتي. هل يمكنني مساعدتك؟'],
        ['Good morning. Yes, please.', 'صباح الخير. نعم، من فضلك.'],
        ["What's your family name, please?", 'ما اسمك العائلي، من فضلك؟'],
        ['Fassi. F-A-S-S-I.', 'الفاسي، حرفًا حرفًا.'],
        ['Thank you, Mrs Fassi. One moment, please.', 'شكرًا لك يا سيدة الفاسي. لحظة من فضلك.'],
        ["Thank you. You're very kind.", 'شكرًا لك. أنت لطيف جدًا.'],
      ]),
    ],
    ask: tr([
      ['How are you today?', 'كيف حالك اليوم؟'],
      ["How's it going?", 'كيف الأحوال؟'],
      ["What's your first name?", 'ما اسمك الشخصي؟'],
      ['How do you spell that?', 'كيف تتهجّى ذلك؟'],
    ]),
    answer: tr([
      ["I'm great, thanks.", 'أنا بخير جدًا، شكرًا.'],
      ['Not bad. And you?', 'لا بأس. وأنت؟'],
      ["It's Omar.", 'إنه عمر.'],
      ['O-M-A-R.', 'حرفًا حرفًا.'],
    ]),
    reading: {
      icon: '🏫', title: 'A new student', titleAr: 'طالبة جديدة',
      text: "Hello! My name is Meryem. I'm a new student at an English school in Fes. My teacher is Mrs Bennani. She is very kind. In class, we say 'Good morning' and 'How are you?'. I always say 'I'm fine, thank you.' My friend Ali sits next to me. He is from Ifrane. We spell our names in English: M-E-R-Y-E-M and A-L-I. After class, we say 'Goodbye! See you tomorrow!'",
      gloss: pairs('new=جديد|school=مدرسة|kind=لطيفة|class=القسم|next to=بجانب'),
      tf: [
        { s: 'Meryem is a new student.', ok: true },
        { s: 'Her teacher is a man.', ok: false },
        { s: 'Ali is from Fes.', ok: false },
      ],
      qs: [
        { q: "Where is Meryem's school?", a: 'In Fes.' },
        { q: 'Who is Ali?', a: "Meryem's friend." },
      ],
    } },

  /* ── 2 · Numbers, age & phone ────────────────────────────────────── */
  { n: 2, icon: '🔢',
    vocab: v(
      '🎂 | birthday | عيد ميلاد | My birthday is in May. | عيد ميلادي في شهر ماي.',
      '📞 | call | يتصل | Call me tomorrow, please. | اتصل بي غدًا من فضلك.',
      '📱 | mobile number | رقم الهاتف المحمول | Can I have your mobile number? | هل يمكنني الحصول على رقم هاتفك المحمول؟',
      "📧 | email address | البريد الإلكتروني | What's your email address? | ما بريدك الإلكتروني؟",
      "👶 | young | صغير السن | My brother is young. He's five. | أخي صغير السن. عمره خمس سنوات.",
      "👴 | old | كبير السن | My grandfather is old. He's eighty. | جدي كبير في السن. عمره ثمانون سنة.",
      '🔢 | count | يعدّ | Count from one to ten. | عُدّ من واحد إلى عشرة.',
      '➕ | plus | زائد | Two plus three is five. | اثنان زائد ثلاثة يساوي خمسة.',
      '➖ | minus | ناقص | Ten minus four is six. | عشرة ناقص أربعة يساوي ستة.',
      '💰 | How much? | بكم؟ | How much is this bag? | بكم هذه الحقيبة؟',
    ),
    groups: [
      g('💯', 'Big numbers', 'الأعداد الكبيرة', 'one hundred=مئة|two hundred=مئتان|five hundred=خمسمئة|one thousand=ألف|first=الأول|second=الثاني|third=الثالث|half=نصف|a dozen=دزينة (اثنا عشر)|million=مليون'),
      g('📅', 'Months', 'الشهور', 'January=يناير|February=فبراير|March=مارس|April=أبريل|May=ماي|June=يونيو|July=يوليوز|August=غشت|September=شتنبر|October=أكتوبر|November=نونبر|December=دجنبر'),
      g('🎉', 'Age and birthdays', 'العمر وأعياد الميلاد', 'child=طفل|teenager=مراهق|adult=بالغ|birthday cake=كعكة عيد الميلاد|candles=شموع|party=حفلة|present=هدية|Happy birthday!=عيد ميلاد سعيد!|years old=سنة من العمر|born=مولود'),
    ],
    talks: [
      d('Friendly | ودّي', 'A birthday | عيد ميلاد', 'Sara | Adam', [
        ['Happy birthday, Adam!', 'عيد ميلاد سعيد يا آدم!'],
        ['Thank you, Sara!', 'شكرًا يا سارة!'],
        ['How old are you today?', 'كم عمرك اليوم؟'],
        ["I'm sixteen.", 'عمري ست عشرة سنة.'],
        ['Here is a present for you.', 'هذه هدية لك.'],
        ["Wow, thank you! You're very kind.", 'رائع، شكرًا! أنت لطيفة جدًا.'],
      ]),
      d('On the phone | على الهاتف', 'A wrong number | رقم خاطئ', 'Man | Lina', [
        ['Hello? Is this Karim?', 'ألو؟ هل هذا كريم؟'],
        ['No, sorry. This is Lina.', 'لا، آسفة. أنا لينا.'],
        ['Is this 0661 22 45 80?', 'هل هذا هو الرقم 0661 22 45 80؟'],
        ["No, it's 0661 22 45 18.", 'لا، إنه 0661 22 45 18.'],
        ['Oh, sorry! Wrong number.', 'آه، آسف! رقم خاطئ.'],
        ['No problem. Goodbye!', 'لا مشكلة. مع السلامة!'],
      ]),
    ],
    ask: tr([
      ['When is your birthday?', 'متى عيد ميلادك؟'],
      ['How old is your brother?', 'كم عمر أخيك؟'],
      ['Can I have your number?', 'هل يمكنني الحصول على رقمك؟'],
      ['How much is it?', 'بكم هذا؟'],
    ]),
    answer: tr([
      ["It's in March.", 'إنه في شهر مارس.'],
      ["He's twelve.", 'عمره اثنتا عشرة سنة.'],
      ["Sure. It's 0700 12 34 56.", 'طبعًا. إنه 0700 12 34 56.'],
      ["It's twenty dirhams.", 'إنه بعشرين درهمًا.'],
    ]),
    reading: {
      icon: '🎂', title: "Grandma's birthday", titleAr: 'عيد ميلاد الجدة',
      text: "Today is a big day in our family. It's my grandmother's birthday. She is seventy-five years old! My mother makes a big cake with many candles. My little brother is six, and he counts the candles: one, two, three, four… My uncle calls from France. His phone number is very long! We sing 'Happy birthday' in Arabic and in English. Grandma is very happy. She says, 'Thank you, my children!'",
      gloss: pairs('big=كبير|cake=كعكة|candles=شموع|little=صغير|sing=نغنّي'),
      tf: [
        { s: 'Grandma is seventy-five.', ok: true },
        { s: 'The uncle calls from Spain.', ok: false },
        { s: 'They sing in Arabic and in English.', ok: true },
      ],
      qs: [
        { q: 'How old is the little brother?', a: 'He is six.' },
        { q: 'Who calls from France?', a: 'The uncle.' },
      ],
    } },

  /* ── 3 · Countries, jobs & marital status ────────────────────────── */
  { n: 3, icon: '🌍',
    vocab: v(
      '🌍 | country | دولة | Morocco is a beautiful country. | المغرب دولة جميلة.',
      '🏙️ | city | مدينة | Casablanca is a big city. | الدار البيضاء مدينة كبيرة.',
      '🏡 | live in | يسكن في | I live in Agadir. | أسكن في أكادير.',
      '🗣️ | language | لغة | I speak two languages: Arabic and French. | أتكلم لغتين: العربية والفرنسية.',
      "💼 | job | مهنة | What's your job? | ما مهنتك؟",
      '🏢 | work in | يعمل في | She works in a bank. | تعمل في بنك.',
      '🧑‍💼 | boss | المدير | My boss is very nice. | مديري لطيف جدًا.',
      '🎓 | retired | متقاعد | My father is retired. | أبي متقاعد.',
      '🔎 | unemployed | عاطل عن العمل | He is unemployed. He is looking for a job. | هو عاطل عن العمل. يبحث عن عمل.',
      '💍 | husband / wife | زوج / زوجة | Her husband is a pilot. | زوجها طيار.',
    ),
    groups: [
      g('🗺️', 'More countries', 'دول أخرى', 'Algeria=الجزائر|Mauritania=موريتانيا|Senegal=السنغال|Portugal=البرتغال|Belgium=بلجيكا|the Netherlands=هولندا|Canada=كندا|Japan=اليابان|Brazil=البرازيل|Qatar=قطر'),
      g('🧑‍🔧', 'More jobs', 'مهن أخرى', 'driver=سائق|nurse=ممرّض|waiter=نادل|shopkeeper=صاحب محل|builder=بنّاء|lawyer=محامٍ|dentist=طبيب أسنان|accountant=محاسب|baker=خبّاز|pharmacist=صيدلي'),
      g('🗣️', 'Languages', 'اللغات', 'Arabic=العربية|Amazigh=الأمازيغية|Darija=الدارجة|French=الفرنسية|English=الإنجليزية|Spanish=الإسبانية|German=الألمانية|Italian=الإيطالية|Chinese=الصينية|Portuguese=البرتغالية'),
    ],
    talks: [
      d('Friendly | ودّي', 'At a wedding | في عرس', 'Omar | Julie', [
        ['Hi! Are you a friend of the bride?', 'مرحبًا! هل أنتِ صديقة العروس؟'],
        ["Yes, I am. I'm Julie. I'm from Belgium.", 'نعم. أنا جولي. أنا من بلجيكا.'],
        ['Welcome to Morocco! Do you speak Arabic?', 'مرحبًا بك في المغرب! هل تتكلمين العربية؟'],
        ['A little. I speak French and English.', 'قليلًا. أتكلم الفرنسية والإنجليزية.'],
        ['What do you do in Belgium?', 'ماذا تعملين في بلجيكا؟'],
        ["I'm a dentist. And you?", 'أنا طبيبة أسنان. وأنت؟'],
      ]),
      d('Questions | أسئلة', 'A form | استمارة', 'Clerk | Youssef', [
        ["What's your nationality?", 'ما جنسيتك؟'],
        ["I'm Moroccan.", 'أنا مغربي.'],
        ['What do you do?', 'ما عملك؟'],
        ["I'm a baker. I work in Tangier.", 'أنا خبّاز. أعمل في طنجة.'],
        ['Are you married?', 'هل أنت متزوج؟'],
        ['Yes, I am. My wife is a nurse.', 'نعم. زوجتي ممرّضة.'],
      ]),
    ],
    ask: tr([
      ['Where do you live?', 'أين تسكن؟'],
      ['What languages do you speak?', 'ما اللغات التي تتكلمها؟'],
      ['Where do you work?', 'أين تعمل؟'],
      ['Is your sister married?', 'هل أختك متزوجة؟'],
    ]),
    answer: tr([
      ['I live in Salé.', 'أسكن في سلا.'],
      ['Arabic, French and a little English.', 'العربية والفرنسية وقليلًا من الإنجليزية.'],
      ['I work in a hotel.', 'أعمل في فندق.'],
      ["No, she's single.", 'لا، إنها عزباء.'],
    ]),
    reading: {
      icon: '🌍', title: 'A family of many countries', titleAr: 'عائلة من دول كثيرة',
      text: "Hello, my name is Samir. I'm Moroccan and I live in Marrakech. I'm a waiter in a big hotel. My wife, Anna, is from Portugal. She is a teacher. She speaks Portuguese, French and a little Arabic. My brother Karim lives in Canada. He is a lawyer and he is married to a Canadian woman. My sister Nora is single. She is a nurse in Rabat. In our family, we speak four languages!",
      gloss: pairs('waiter=نادل|hotel=فندق|married to=متزوج من|single=عزباء|four=أربع'),
      tf: [
        { s: 'Samir is a waiter.', ok: true },
        { s: 'Anna is from Spain.', ok: false },
        { s: 'Nora is married.', ok: false },
      ],
      qs: [
        { q: 'Where does Karim live?', a: 'In Canada.' },
        { q: 'What does Anna do?', a: 'She is a teacher.' },
      ],
    } },

  /* ── 4 · First day at the course ─────────────────────────────────── */
  { n: 4, icon: '🏫',
    vocab: v(
      '🏫 | language school | مدرسة لغات | I study at a language school. | أدرس في مدرسة لغات.',
      '📋 | register | يسجّل | I want to register for the English course. | أريد أن أسجّل في دورة الإنجليزية.',
      '🗓️ | timetable | جدول الحصص | Here is your timetable. | هذا جدول حصصك.',
      '🧑‍🤝‍🧑 | classmate | زميل في القسم | My classmate is from Oujda. | زميلي في القسم من وجدة.',
      '🎒 | bring | يُحضر | Bring a notebook tomorrow. | أحضر دفترًا غدًا.',
      '❓ | ask a question | يطرح سؤالًا | Can I ask a question? | هل يمكنني أن أطرح سؤالًا؟',
      '✅ | answer | يجيب | Answer the question, please. | أجب عن السؤال من فضلك.',
      '👂 | understand | يفهم | I understand now. | فهمت الآن.',
      '🤝 | partner | شريك في التمرين | Work with your partner. | اشتغل مع شريكك.',
      '📍 | here / there | هنا / هناك | Sit here, please. | اجلس هنا من فضلك.',
    ),
    groups: [
      g('📝', 'Personal information', 'المعلومات الشخصية', 'name=الاسم|address=العنوان|age=العمر|date of birth=تاريخ الازدياد|place of birth=مكان الازدياد|nationality=الجنسية|job=المهنة|phone number=رقم الهاتف|email=البريد الإلكتروني|signature=التوقيع'),
      g('🏫', 'At the course', 'في الدورة', 'level=مستوى|test=اختبار|lesson=درس|break=استراحة|fee=رسوم|certificate=شهادة|morning class=حصة صباحية|evening class=حصة مسائية|beginner=مبتدئ|group=مجموعة'),
      g('💬', 'Small talk', 'كلام التعارف', 'Really?=حقًا؟|Me too.=أنا أيضًا.|Great!=رائع!|Cool!=جميل!|Of course.=طبعًا.|No problem.=لا مشكلة.|Good luck!=بالتوفيق!|See you!=أراك!|Congratulations!=مبروك!|Same here.=وأنا كذلك.'),
    ],
    talks: [
      d('Polite | مهذّب', 'At the reception | في الاستقبال', 'Secretary | Amine', [
        ['Good afternoon. Can I help you?', 'مساء الخير. هل يمكنني مساعدتك؟'],
        ['Yes, please. I want to register for the English course.', 'نعم من فضلك. أريد التسجيل في دورة الإنجليزية.'],
        ["Of course. What's your name?", 'طبعًا. ما اسمك؟'],
        ["Amine Saidi. I'm a beginner.", 'أمين السعيدي. أنا مبتدئ.'],
        ['OK. The beginner class is on Monday evening.', 'حسنًا. قسم المبتدئين يوم الإثنين مساءً.'],
        ['Great. Thank you very much!', 'رائع. شكرًا جزيلًا!'],
      ]),
      d('Friendly | ودّي', 'The break | الاستراحة', 'Rania | Mehdi', [
        ['Hi! Are you in my group?', 'مرحبًا! هل أنت في مجموعتي؟'],
        ["Yes! I'm Mehdi. Is this your first day?", 'نعم! أنا مهدي. هل هذا يومك الأول؟'],
        ["Yes, it is. I'm a little nervous.", 'نعم. أنا متوترة قليلًا.'],
        ['Me too! Where are you from?', 'وأنا كذلك! من أين أنت؟'],
        ["I'm from Meknes. And you?", 'أنا من مكناس. وأنت؟'],
        ['Really? Me too! Good luck!', 'حقًا؟ وأنا أيضًا! بالتوفيق!'],
      ]),
    ],
    ask: tr([
      ['Is this the beginner class?', 'هل هذا قسم المبتدئين؟'],
      ['What time is the break?', 'في أي ساعة الاستراحة؟'],
      ['Can I sit here?', 'هل يمكنني الجلوس هنا؟'],
      ['Do you understand?', 'هل فهمت؟'],
    ]),
    answer: tr([
      ['Yes, it is. Come in!', 'نعم. تفضّل بالدخول!'],
      ['At half past seven.', 'في السابعة والنصف.'],
      ['Of course. Sit down.', 'طبعًا. اجلس.'],
      ["Yes, I do. / No, sorry.", 'نعم. / لا، آسف.'],
    ]),
    reading: {
      icon: '🏫', title: 'My first day', titleAr: 'يومي الأول',
      text: "My name is Fatima and I'm forty years old. I'm a housewife and I live in Tetouan. This week, I register for an English course. My children speak English, and I want to speak with them! On my first day, I am nervous. My classmates are friendly. Our teacher, Mr Khalid, is young and funny. We say our names, our ages and our jobs. After the lesson, I go home and say 'Hello!' to my children. They are very happy.",
      gloss: pairs('housewife=ربّة بيت|this week=هذا الأسبوع|want=أريد|friendly=ودودون|funny=مضحك'),
      tf: [
        { s: 'Fatima lives in Tetouan.', ok: true },
        { s: 'Her teacher is old.', ok: false },
        { s: 'Her children speak English.', ok: true },
      ],
      qs: [
        { q: 'How old is Fatima?', a: 'She is forty.' },
        { q: 'Why does Fatima learn English?', a: 'To speak with her children.' },
      ],
    } },

  /* ── 5 · Family & describing people ──────────────────────────────── */
  { n: 5, icon: '👨‍👩‍👧',
    vocab: v(
      '👨‍👩‍👧 | family | عائلة | I have a big family. | لديّ عائلة كبيرة.',
      '👶 | baby | رضيع | My sister has a new baby. | لأختي رضيع جديد.',
      '👯 | twins | توأمان | My cousins are twins. | أبناء عمي توأمان.',
      '🧔 | beard | لحية | My uncle has a long beard. | لعمي لحية طويلة.',
      '👓 | glasses | نظارات | My grandmother wears glasses. | جدتي تلبس نظارات.',
      '👀 | eyes | عينان | She has brown eyes. | عيناها بنّيتان.',
      '😊 | kind | طيّب | My aunt is very kind. | خالتي طيبة جدًا.',
      '🤫 | quiet | هادئ | My brother is quiet. | أخي هادئ.',
      '🗣️ | talkative | كثير الكلام | My cousin is talkative. | ابنة عمي كثيرة الكلام.',
      '🪞 | look like | يشبه | I look like my father. | أشبه أبي.',
    ),
    groups: [
      g('👀', 'Face and hair', 'الوجه والشعر', 'nose=أنف|mouth=فم|ears=أذنان|face=وجه|hair=شعر|blond=أشقر|dark=داكن|brown=بنّي|bald=أصلع|moustache=شارب'),
      g('🎨', 'Colours', 'الألوان', 'black=أسود|white=أبيض|red=أحمر|blue=أزرق|green=أخضر|yellow=أصفر|grey=رمادي|pink=وردي|orange=برتقالي|purple=بنفسجي'),
      g('🌟', 'More personality', 'صفات أخرى', 'polite=مؤدّب|clever=ذكي|helpful=خدوم|patient=صبور|brave=شجاع|honest=صادق|cheerful=مرِح|careful=حذِر|lovely=لطيف|sporty=رياضي'),
    ],
    talks: [
      d('Friendly | ودّي', 'A family photo | صورة عائلية', 'Lina | Hamza', [
        ['Who is this in the photo?', 'من هذا في الصورة؟'],
        ["That's my uncle Driss. He has a long beard.", 'هذا عمي إدريس. له لحية طويلة.'],
        ['And who is this girl with glasses?', 'ومن هذه البنت ذات النظارات؟'],
        ["That's my cousin Aya. She's very clever.", 'هذه ابنة عمي آية. إنها ذكية جدًا.'],
        ['She looks like you!', 'إنها تشبهك!'],
        ['Yes! Everyone says that.', 'نعم! الجميع يقول ذلك.'],
      ]),
      d('Questions | أسئلة', 'My brother | أخي', 'Teacher | Salma', [
        ['Do you have brothers or sisters?', 'هل لديك إخوة أو أخوات؟'],
        ['I have one brother.', 'لديّ أخ واحد.'],
        ['What does he look like?', 'كيف يبدو؟'],
        ['He is tall and he has short black hair.', 'إنه طويل وشعره قصير وأسود.'],
        ['What is he like?', 'كيف هي شخصيته؟'],
        ['He is funny and helpful.', 'إنه مضحك وخدوم.'],
      ]),
    ],
    ask: tr([
      ['Who is she?', 'من هي؟'],
      ['What does your sister look like?', 'كيف تبدو أختك؟'],
      ['What is your father like?', 'كيف هي شخصية أبيك؟'],
      ['Who do you look like?', 'من تشبه؟'],
    ]),
    answer: tr([
      ["She's my aunt.", 'إنها عمتي.'],
      ['She has long brown hair.', 'شعرها طويل وبنّي.'],
      ["He's calm and very kind.", 'إنه هادئ وطيب جدًا.'],
      ['I look like my mother.', 'أشبه أمي.'],
    ]),
    reading: {
      icon: '👨‍👩‍👧', title: 'My big family', titleAr: 'عائلتي الكبيرة',
      text: "My name is Ilyas and I'm from Taza. I have a big family. My father is tall and he has a moustache. My mother is short and she has long black hair. She is very kind. I have two sisters. They are twins! They are ten years old and they look the same. My grandfather lives with us. He is old but he is very cheerful. On Fridays, my aunts and cousins visit us and we eat couscous together.",
      gloss: pairs('big=كبيرة|the same=متشابهتان|lives with us=يعيش معنا|visit=يزورون|together=معًا'),
      tf: [
        { s: 'Ilyas has two brothers.', ok: false },
        { s: 'The twins are ten.', ok: true },
        { s: 'His grandfather is sad.', ok: false },
      ],
      qs: [
        { q: "What does Ilyas's father look like?", a: 'He is tall and he has a moustache.' },
        { q: 'What do they eat on Fridays?', a: 'Couscous.' },
      ],
    } },
]
