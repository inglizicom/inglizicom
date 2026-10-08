import type { Block, FamilyPeople, Lesson, Pair } from './level1-book.ts'

/**
 * «الإنجليزية من الصفر (الدارجة)» — Level 1, SECOND edition.
 *
 * The same nineteen-lesson path as the first edition (data/level1-book.ts):
 * greetings → numbers → countries and jobs → review → family → introducing
 * and Wh-questions → reading → classroom → verbs and pronouns → the house →
 * the day and the time → the week → food → drinks → transport → the town →
 * there is / there are → can / can't → hobbies. Every word list, example,
 * reading and conversation is new, and the first edition's slips are fixed:
 *   · no insulting adjectives (ugly, stupid, fat) in "describing people"
 *   · "I am 25 years old", never "I have 25 years" (a tip says so)
 *   · a / an, -s with he / she / it, "by bus" but "on foot", "like + -ing"
 *   · one theme per page (the old "Facilities" page mixed unrelated words)
 *   · Arabic in correct standard spelling, with the darija word in brackets
 *     where it helps (the book is «… الدارجة»)
 * Rendered by app/admin/level1-book/_blocks.tsx, like the first edition.
 */

const lines = (s: string) => s.trim().split('\n').map(l => l.trim()).filter(Boolean)

const FAMILY_VOCAB: Pair[] = [
  ['Grandfather', 'الجد'], ['Grandmother', 'الجدة'], ['Grandparents', 'الجدّان'], ['Father', 'الأب'], ['Mother', 'الأم'],
  ['Parents', 'الوالدان'], ['Brother', 'الأخ'], ['Sister', 'الأخت'], ['Husband', 'الزوج'], ['Wife', 'الزوجة'],
  ['Son', 'الابن'], ['Daughter', 'البنت'], ['Children', 'الأبناء'], ['Grandson', 'الحفيد'], ['Granddaughter', 'الحفيدة'],
  ['Uncle', 'العم / الخال'], ['Aunt', 'العمة / الخالة'], ['Cousin', 'ابن(ة) العم أو الخال'], ['Nephew / Niece', 'ابن / بنت الأخ أو الأخت'],
]

const FAMILY: FamilyPeople = {
  grandpa: ['👴', 'Grandfather', 'Driss'], grandma: ['👵', 'Grandmother', 'Fatima'],
  aunt1: ['👩', 'Aunt', 'Laila'], uncle1: ['👨', 'Uncle', 'Karim'],
  father: ['👨‍🦱', 'Father', 'Mustapha'], mother: ['👩‍🦱', 'Mother', 'Naima'],
  uncle2: ['🧔', 'Uncle', 'Hassan'], aunt2: ['👩‍🦰', 'Aunt', 'Souad'],
  cousins1: [['👧', 'Cousin', 'Ghita'], ['👦', 'Cousin', 'Reda']], cousins2: [['👧', 'Cousin', 'Malak'], ['👦', 'Cousin', 'Taha']],
  left: [['👨', 'Brother', 'Anas'], ['👩', 'Sister-in-law', 'Houda']],
  me: [['🧑', 'Me', 'Yassine'], ['👩', 'My wife', 'Sara']],
  right: [['👩‍🦱', 'Sister', 'Kawtar'], ['🧔', 'Brother-in-law', 'Jamal']],
  kidsLeft: [['👦', 'Nephew', 'Adam'], ['👧', 'Niece', 'Lina']], kidsMe: [['👦', 'Son', 'Ilyas'], ['👧', 'Daughter', 'Rim']], kidsRight: [['👦', 'Nephew', 'Zakaria'], ['👧', 'Niece', 'Aya']],
  notes: [
    'Grandfather + Grandmother = Grandparents',
    'Father + Mother = Parents · Son + Daughter = Children',
    'كلمة Cousin واحدة للذكر والأنثى',
    'Uncle = العم والخال، و Aunt = العمة والخالة',
    'أهل الزوج(ة): mother-in-law و father-in-law',
  ],
}

export const LEVEL1_V2_LESSONS: Lesson[] = [
  /* ── 01 · Greetings and the alphabet ─────────────────────────────── */
  { n: 1, titleAr: 'التحية والتعارف + الحروف', blocks: [
    { t: 'note', text: 'Teacher : Hamza El Qasraoui' },
    { t: 'bullets', box: true, cols: 3, heading: 'CLASSROOM LANGUAGE', items: [
      'Listen.', 'Look.', 'Repeat, please.', 'Sit down, please.',
      'Well done!', 'Try again.', 'Any questions?', "Let's start.",
      "Sorry, I don't understand.", 'Can you say that again?', 'How do you say … in English?', 'Slowly, please.',
    ] },
    { t: 'bar', title: 'Hello & Goodbye - التحية والتوديع' },
    { t: 'cards', items: [
      ['👋', 'Hello / Hi', 'مرحبًا (السلام)'], ['🌅', 'Good morning', 'صباح الخير'], ['☀️', 'Good afternoon', 'مساء الخير (بعد الظهر)'], ['🌇', 'Good evening', 'مساء الخير'],
      ['🙂', 'How are you?', 'كيف حالك؟ (لاباس؟)'], ['👍', "I'm fine, thanks.", 'بخير، شكرًا'], ['🙋', "What's your name?", 'ما اسمك؟ (شنو سميتك؟)'], ['🤝', 'Nice to meet you.', 'تشرّفت بمعرفتك'],
      ['👋', 'Goodbye / Bye', 'مع السلامة'], ['⏳', 'See you later.', 'أراك لاحقًا'], ['📅', 'See you tomorrow.', 'أراك غدًا'], ['🌙', 'Good night.', 'تصبح على خير'],
    ] },
    { t: 'callout', text: 'نقول Good night فقط عند التوديع أو قبل النوم، ولا نحيّي بها في المساء (للتحية نقول Good evening).' },
    { t: 'alphabet' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'bullets', items: ['How do you spell your name?', "It's S-A-M-I-R."] }],
      [{ t: 'bullets', items: ['Vowels - الحروف المتحركة: A E I O U', 'Double letters: Y-A-S-S-I-N-E = double S'] }],
    ] },
    { t: 'talk', title: 'At a café', cols: 2, lines: lines(`
      Samir: Hi! Good morning.
      Hind: Good morning! How are you?
      Samir: I'm fine, thanks. And you?
      Hind: I'm great. I'm Hind. What's your name?
      Samir: My name is Samir. Nice to meet you.
      Hind: Nice to meet you too.
      Samir: See you later, Hind!
      Hind: Bye, Samir!`) },
    { t: 'talk', title: 'At reception', cols: 2, lines: lines(`
      Receptionist: Good afternoon. What's your name, please?
      Walid: My name is Walid Tazi.
      Receptionist: How do you spell your first name?
      Walid: W-A-L-I-D.
      Receptionist: And your family name?
      Walid: T-A-Z-I.
      Receptionist: Thank you, Mr Tazi. Have a good day.
      Walid: Thank you. Goodbye!`) },
  ] },

  /* ── 02 · Numbers, age and phone numbers ─────────────────────────── */
  { n: 2, titleAr: 'الأرقام والعمر ورقم الهاتف', blocks: [
    { t: 'bar', title: 'Numbers from 1 to 900' },
    { t: 'numbers' },
    { t: 'bar', title: 'Age - العمر' },
    { t: 'qa', rows: [
      ['How old are you?', "I'm 25 (years old).", 'كم عمرك؟', 'عمري 25 سنة.'],
      ['How old is your sister?', "She's 12.", 'كم عمر أختك؟', 'عمرها 12 سنة.'],
      ['How old is he?', "He's 40.", 'كم عمره؟', 'عمره 40 سنة.'],
      ['How old are they?', "They're 8 and 10.", 'كم عمرهم؟', 'عمرهما 8 و10 سنوات.'],
    ] },
    { t: 'callout', text: 'انتبه: نقول I am 25 years old أو I am 25 فقط. لا نقول I have 25 years ✗' },
    { t: 'bar', title: 'Phone numbers - أرقام الهاتف' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'bullets', items: ["What's your phone number?", "It's 0661 47 22 90.", "What's his number?", "It's 0700 36 88 14."] }],
      [{ t: 'bullets', box: true, heading: 'Tips', items: ['0 = "zero" or "oh"', '22 = "two two" or "double two"', 'Say the number in small groups: 0661 - 47 - 22 - 90'] }],
    ] },
    { t: 'talk', title: 'At the gym', art: '☎️', lines: lines(`
      Coach: Welcome to the gym! What's your name?
      Imane: Imane Berrada.
      Coach: How old are you, Imane?
      Imane: I'm 19.
      Coach: And what's your phone number?
      Imane: It's 0655 18 40 73.
      Coach: Sorry, 0655 18 …?
      Imane: 40 73.
      Coach: Thank you! Classes start on Monday.
      Imane: Great. See you on Monday!`) },
  ] },

  /* ── 03 · Countries, nationalities, jobs, marital status ─────────── */
  { n: 3, titleAr: 'الدول والجنسيات والمهن والحالة الاجتماعية', blocks: [
    { t: 'bar', title: 'Countries & Nationalities - الدول والجنسيات' },
    { t: 'flags', items: [
      { flag: 'ma', country: 'Morocco', nationality: 'Moroccan' },
      { flag: 'gb', country: 'the UK', nationality: 'British' },
      { flag: 'us', country: 'the USA', nationality: 'American' },
      { flag: 'fr', country: 'France', nationality: 'French' },
      { flag: 'es', country: 'Spain', nationality: 'Spanish' },
      { flag: 'de', country: 'Germany', nationality: 'German' },
      { flag: 'tr', country: 'Turkey', nationality: 'Turkish' },
      { flag: 'eg', country: 'Egypt', nationality: 'Egyptian' },
      { flag: 'cn', country: 'China', nationality: 'Chinese' },
      { flag: 'sa', country: 'Saudi Arabia', nationality: 'Saudi' },
      { flag: 'it', country: 'Italy', nationality: 'Italian' },
      { flag: 'tn', country: 'Tunisia', nationality: 'Tunisian' },
    ] },
    { t: 'callout', text: 'أسماء الدول والجنسيات تبدأ دائمًا بحرف كبير: Morocco – Moroccan' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'formula', over: ['من أين؟', '', '', ''], cols: [['Where'], ['are', 'is'], ['you', 'he / she'], ['from?']], note: 'Where are you from? — I\'m from Morocco.' }],
      [{ t: 'formula', over: ['ما', '', 'الجنسية'], cols: [['What is'], ['your', 'his / her'], ['nationality?']], note: 'What\'s her nationality? — She\'s Turkish.' }],
    ] },
    { t: 'bar', title: 'Jobs - المهن' },
    { t: 'cards', items: [
      ['🧑‍⚕️', 'a doctor', 'طبيب(ة)'], ['🧑‍🏫', 'a teacher', 'أستاذ(ة)'], ['🧑‍🍳', 'a chef', 'طبّاخ(ة)'], ['👮', 'a police officer', 'شرطي(ة)'],
      ['🧑‍🔧', 'a mechanic', 'ميكانيكي'], ['💇', 'a hairdresser', 'حلّاق / مصفّفة شعر'], ['🧑‍💻', 'a programmer', 'مبرمج(ة)'], ['🧑‍🌾', 'a farmer', 'فلّاح(ة)'],
    ] },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'qa', rows: [["What do you do?", "I'm a chef."], ["What's her job?", "She's an engineer."]] }],
      [{ t: 'callout', text: 'نستعمل a قبل الحرف الساكن و an قبل الحرف المتحرك: a nurse – an engineer' }],
    ] },
    { t: 'bar', title: 'Marital status - الحالة الاجتماعية' },
    { t: 'grid', rows: [
      { dark: true, cells: ['single', 'engaged', 'married', 'divorced', 'widowed'] },
      { cells: ['أعزب / عزباء', 'مخطوب(ة)', 'متزوّج(ة)', 'مطلّق(ة)', 'أرمل(ة)'] },
    ] },
    { t: 'talk', title: 'At a language café', cols: 2, size: 11.5, lines: lines(`
      Ali: Hi, I'm Ali. Where are you from?
      Daniel: Hi Ali! I'm from the UK. I'm British.
      Ali: Welcome! I'm Moroccan. What do you do, Daniel?
      Daniel: I'm a programmer. And you?
      Ali: I'm a mechanic. I have a small garage.
      Daniel: Cool! Are you married?
      Ali: Yes, I am. My wife is a teacher. And you?
      Daniel: I'm not married. I'm engaged.
      Ali: Congratulations! Is your fiancée British too?
      Daniel: No, she's Spanish. She's a doctor.
      Ali: Nice to meet you, Daniel.
      Daniel: Nice to meet you too!`) },
  ] },

  /* ── 04 · Review conversation (lessons 1–3) ──────────────────────── */
  { n: 4, titleAr: 'محادثة شاملة (الدروس 1–3)', blocks: [
    { t: 'talk', full: 'Full Conversation - First day at the English course', art: '🏫', size: 13, lines: lines(`
      Karima: Hi! Is this the English class?
      Bilal: Yes, it is. Good morning! I'm Bilal.
      Karima: Good morning, Bilal. I'm Karima. Nice to meet you.
      Bilal: Nice to meet you too. How are you today?
      Karima: I'm fine, thanks. A little nervous!
      Bilal: Me too! How do you spell your name?
      Karima: K-A-R-I-M-A. And yours?
      Bilal: B-I-L-A-L.
      Karima: Where are you from, Bilal?
      Bilal: I'm from Meknes, but I live in Rabat. And you?
      Karima: I'm from Oujda.
      Bilal: How old are you?
      Karima: I'm 23. And you?
      Bilal: I'm 27.
      Karima: What do you do?
      Bilal: I'm a hairdresser. And you?
      Karima: I'm a student. I study medicine.
      Bilal: Great! Are you married?
      Karima: No, I'm single. And you?
      Bilal: I'm married. My wife is a nurse.
      Karima: What's your phone number? For the homework.
      Bilal: Sure. It's 0612 90 33 47.
      Karima: Thanks. My number is 0700 41 25 86.
      Bilal: Oh, look, the teacher is here!
      Karima: Let's sit down. See you after class!`) },
    { t: 'bullets', box: true, cols: 2, heading: 'Your turn! - دورك: أجب عن نفسك', items: [
      "What's your name? How do you spell it?", 'Where are you from?', 'How old are you?',
      'What do you do?', 'Are you married?', "What's your phone number?",
    ] },
  ] },

  /* ── 05 · Family and describing people ───────────────────────────── */
  { n: 5, titleAr: 'العائلة ووصف الأشخاص', blocks: [
    { t: 'family', vocab: FAMILY_VOCAB, people: FAMILY },
    { t: 'bar', title: 'Who is he to you? - من يكون بالنسبة لك؟' },
    { t: 'row', widths: '1.2fr 1fr', blocks: [
      [
        { t: 'formula', over: ['من', 'يكون', '', 'بالنسبة لـ', ''], cols: [['Who'], ['is'], ['Ilyas'], ['to'], ['Sara?']], note: 'السؤال' },
        { t: 'formula', over: ['', '', 'ابن سارة'], cols: [['Ilyas'], ['is'], ["Sara's son."]], note: 'الجواب: الاسم + s\' + العلاقة' },
      ],
      [{ t: 'bullets', heading: 'examples', items: ['Who is Driss to Yassine?', "Driss is Yassine's grandfather.", 'Who is Lina to Kawtar?', "Lina is Kawtar's niece.", 'Who is Reda to Ghita?', "Reda is Ghita's brother."] }],
    ] },
    { t: 'bar', title: 'Describing people - وصف الأشخاص' },
    { t: 'row', widths: '1fr 1fr 1.15fr', blocks: [
      [{ t: 'callout', text: 'Appearance - المظهر' }, { t: 'pairs', cols: 1, side: true, size: 11, items: [['tall – short', 'طويل – قصير'], ['young – old', 'شاب – كبير في السن'], ['slim – big', 'نحيف – ضخم'], ['long hair – short hair', 'شعر طويل – قصير'], ['curly – straight', 'مجعّد – أملس'], ['strong – weak', 'قوي – ضعيف']] }],
      [{ t: 'callout', text: 'Personality - الشخصية' }, { t: 'pairs', cols: 1, side: true, size: 11, items: [['friendly – unfriendly', 'لطيف – غير ودود'], ['funny – serious', 'مضحك – جادّ'], ['hard-working – lazy', 'مجتهد – كسول'], ['shy – outgoing', 'خجول – اجتماعي'], ['generous – mean', 'كريم – بخيل'], ['calm – nervous', 'هادئ – عصبي']] }],
      [
        { t: 'bullets', heading: 'examples', size: 12, items: ['My grandmother is old but very strong.', 'My sister has long curly hair.', 'My uncle is tall and funny.', 'My cousins are friendly and outgoing.'] },
        { t: 'callout', text: 'تجنّب الكلمات الجارحة مثل ugly / stupid / fat' },
      ],
    ] },
  ] },

  /* ── 06 · Introductions and Wh-questions ─────────────────────────── */
  { n: 6, titleAr: 'التقديم وأسئلة Wh', blocks: [
    { t: 'banner', title: 'Introductions & Wh-Questions', icons: ['🙋', '❓'] },
    { t: 'text', label: 'Introduce yourself - قدّم نفسك', body: "Hi! My name is Nadia. I'm 31 years old. I'm from Safi, but I live in Marrakech. I'm a pharmacist. I work in a small pharmacy near my house. I'm married and I have one daughter. Her name is Lina. I love cooking and walking by the sea." },
    { t: 'text', label: 'Introduce someone - قدّم شخصًا آخر', body: "This is my brother, Hamid. He is 26 years old. He lives in Casablanca. He is a mechanic. He works in a big garage. He isn't married; he's single. He likes football and video games. He is funny and very kind." },
    { t: 'bar', title: 'Wh- words - كلمات الاستفهام' },
    { t: 'chips', items: [['WHAT', 'ماذا؟ (أشنو؟)'], ['WHERE', 'أين؟ (فين؟)'], ['WHEN', 'متى؟ (إمتى؟)'], ['WHO', 'من؟ (شكون؟)'], ['WHY', 'لماذا؟ (علاش؟)'], ['HOW', 'كيف؟ (كيفاش؟)'], ['HOW OLD', 'كم عمر…؟']] },
    { t: 'boxes', cols: 3, items: [
      { title: 'WHAT', lines: ["What's your favourite colour?", 'What do you do?', 'What time is it?'] },
      { title: 'WHERE', lines: ['Where do you work?', 'Where is the station?', 'Where are my keys?'] },
      { title: 'WHEN', lines: ['When is your birthday?', 'When do you go to the gym?', 'When does the film start?'] },
      { title: 'WHO', lines: ['Who is that man?', 'Who is your teacher?', 'Who do you live with?'] },
      { title: 'WHY', lines: ['Why are you tired?', 'Why do you study English?', 'Why is he late?'] },
      { title: 'HOW', lines: ['How are you?', 'How do you go to work?', 'How old is your son?'] },
    ] },
    { t: 'callout', text: 'ترتيب السؤال: كلمة الاستفهام + do / does + الفاعل + الفعل ← Where do you live?' },
    { t: 'talk', title: 'A new neighbour', cols: 2, size: 11.5, lines: lines(`
      Rachid: Hello! Are you the new neighbour?
      Sofia: Yes, I am. I'm Sofia. Nice to meet you.
      Rachid: I'm Rachid. Welcome! Where are you from?
      Sofia: I'm from Larache.
      Rachid: Why are you in Fez?
      Sofia: For work. I'm a nurse at the hospital.
      Rachid: Great! When do you start?
      Sofia: Next Monday.
      Rachid: Who do you live with?
      Sofia: With my sister. She's a student.
      Rachid: How do you go to the hospital?
      Sofia: By taxi. It's not far.
      Rachid: What do you do on the weekend?
      Sofia: I read and I go to the gym.
      Rachid: How old is your sister?
      Sofia: She's 20.
      Rachid: Welcome again! My door is always open.
      Sofia: Thank you, Rachid!`) },
  ] },

  /* ── 07 · Reading ────────────────────────────────────────────────── */
  { n: 7, titleAr: 'تعلّم القراءة: I – He – She', blocks: [
    { t: 'bar', title: 'Reading - القراءة' },
    { t: 'text', label: 'Subject I - أنا', size: 13.5, body: "My name is Anas. I am 35 years old and I live in Kenitra. I am a bus driver. I get up at 5:30 every morning. I wash my face, have a quick breakfast and drink a glass of milk. I start work at 6:30. I drive the number 12 bus from the city centre to the university. I have lunch at 1:00 with my colleagues. I finish work at 3:00 and I go home. In the afternoon, I play with my children and help them with their homework. In the evening, I watch the news with my wife. I go to bed at 10:00." },
    { t: 'text', label: 'Subject He - هو', size: 13.5, body: "His name is Anas. He is 35 years old and he lives in Kenitra. He is a bus driver. He gets up at 5:30 every morning. He washes his face, has a quick breakfast and drinks a glass of milk. He starts work at 6:30. He drives the number 12 bus from the city centre to the university. He has lunch at 1:00 with his colleagues. He finishes work at 3:00 and he goes home. In the afternoon, he plays with his children and helps them with their homework. In the evening, he watches the news with his wife. He goes to bed at 10:00." },
    { t: 'text', label: 'Subject She - هي', size: 13.5, body: "Her name is Salma. She is 24 years old and she lives in Agadir. She is a receptionist at a big hotel. She gets up at 7:00. She takes a shower, gets dressed and has breakfast with her mother. She goes to work by tram. She starts work at 9:00. She answers the phone, speaks to the guests and gives them their keys. She has lunch at the hotel. She finishes work at 5:30. After work, she goes to the beach with her friends or reads a book at home. She goes to bed at 11:00." },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'bullets', box: true, heading: 'Notice - لاحظ', size: 12, items: ['I get up → he gets up', 'I watch → she watches', 'I have → he has', 'I go → she goes', 'مع he / she / it نضيف s أو es للفعل'] }],
      [{ t: 'bullets', box: true, heading: 'Questions - أسئلة', size: 12, items: ['What time does Anas get up?', 'What does Anas drive?', 'What does Salma do?', 'How does Salma go to work?', 'What does Salma do after work?'] }],
    ] },
  ] },

  /* ── 08 · The classroom ──────────────────────────────────────────── */
  { n: 8, titleAr: 'مفردات القسم + عبارات مهمة', blocks: [
    { t: 'banner', title: 'In the Classroom - في القسم', icons: ['🎒', '📚'] },
    { t: 'cards', items: [
      ['🧑‍🏫', 'teacher', 'أستاذ(ة)'], ['🧑‍🎓', 'student', 'تلميذ / طالب'], ['🎒', 'school bag', 'محفظة'], ['📓', 'notebook', 'دفتر'],
      ['📕', 'book', 'كتاب'], ['🖊️', 'pen', 'قلم'], ['✏️', 'pencil', 'قلم رصاص'], ['🧽', 'eraser', 'ممحاة (گومة)'],
      ['📏', 'ruler', 'مسطرة'], ['🖍️', 'pencil case', 'مقلمة (تروس)'], ['🧮', 'calculator', 'آلة حاسبة'], ['🟩', 'board', 'سبورة'],
      ['🪑', 'chair', 'كرسي'], ['📝', 'homework', 'واجب منزلي'], ['📖', 'dictionary', 'قاموس'], ['💯', 'exam', 'امتحان'],
    ] },
    { t: 'bar', title: 'Useful phrases - عبارات مفيدة' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [
        { t: 'callout', text: 'التلميذ يقول' },
        { t: 'bullets', box: true, size: 11.5, items: [
          'Can you repeat that, please? - هل يمكنك أن تعيد؟',
          'How do you spell "ruler"? - كيف تتهجّى ruler؟',
          'What does "calculator" mean? - ماذا تعني calculator؟',
          'Can I borrow your pen? - هل أستعير قلمك؟',
          "Sorry, I'm late. - آسف على التأخّر.",
          "I don't understand. - لم أفهم (ما فهمتش).",
        ] },
      ],
      [
        { t: 'callout', text: 'الأستاذ يقول' },
        { t: 'bullets', box: true, size: 11.5, items: [
          'Open / Close your books. - افتحوا / أغلقوا كتبكم.',
          'Look at the board. - انظروا إلى السبورة.',
          'Write the date. - اكتبوا التاريخ.',
          'Work in pairs. - اشتغلوا ثنائيًا.',
          'Listen and repeat. - استمعوا وكرّروا.',
          'Be quiet, please. - اهدؤوا من فضلكم.',
        ] },
      ],
    ] },
    { t: 'talk', title: 'A Tuesday lesson', cols: 2, size: 11.5, lines: lines(`
      Teacher: Good morning, everyone. Please sit down.
      Students: Good morning, teacher.
      Teacher: Today is Tuesday. Write the date, please.
      Nour: Teacher, how do you spell "Tuesday"?
      Teacher: T-U-E-S-D-A-Y.
      Nour: Thank you.
      Teacher: Now, look at the board. What's this?
      Ziad: It's a ruler.
      Teacher: Very good! And this?
      Ziad: Sorry, I don't know.
      Teacher: It's a calculator.
      Ziad: Can you repeat that, please?
      Teacher: Calculator. Listen and repeat.
      Students: Calculator.
      Nour: Can I borrow your eraser, Ziad?
      Ziad: Sure, here you are.
      Teacher: OK. Now work in pairs, please.
      Students: Yes, teacher!`) },
  ] },

  /* ── 09 · Verbs and pronouns = simple sentences ──────────────────── */
  { n: 9, titleAr: 'الضمائر والأفعال = جمل بسيطة', blocks: [
    { t: 'banner', title: 'Pronouns + Verbs = Simple Sentences' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [
        { t: 'grid', boxed: true, title: 'Subject pronouns - الضمائر', rows: [
          { dark: true, cells: ['I', 'you', 'he', 'she', 'it', 'we', 'you', 'they'] },
          { cells: ['أنا', 'أنتَ/أنتِ', 'هو', 'هي', 'لغير العاقل', 'نحن', 'أنتم', 'هم'], size: 10 },
        ] },
        ...(['be', 'have', 'go', 'do'] as const).map((v): Block => ({ t: 'grid', boxed: true, title: `to ${v}`, rows: [
          { dark: true, cells: ['I', 'you', 'he', 'she', 'it', 'we', 'you', 'they'] },
          { cells: v === 'be' ? ['am', 'are', 'is', 'is', 'is', 'are', 'are', 'are'] : v === 'have' ? ['have', 'have', 'has', 'has', 'has', 'have', 'have', 'have'] : [v, v, `${v}es`, `${v}es`, `${v}es`, v, v, v], size: 11 },
        ] })),
        { t: 'callout', text: 'مع he / she / it نضيف s للفعل: I live → she lives' },
      ],
      [
        { t: 'grid', boxed: true, title: 'Small words - كلمات صغيرة ومهمة', rows: [
          { dark: true, cells: ['and', 'but', 'or', 'because'] }, { cells: ['و', 'لكن', 'أو', 'لأن'], size: 11 },
          { dark: true, cells: ['in', 'to', 'with', 'without'] }, { cells: ['في', 'إلى', 'مع', 'بدون'], size: 11 },
          { dark: true, cells: ['before', 'after', 'between', 'if'] }, { cells: ['قبل', 'بعد', 'بين', 'إذا'], size: 11 },
        ] },
        { t: 'bullets', box: true, heading: 'Examples', size: 11.5, items: [
          'I live in Rabat with my family. - أعيش في الرباط مع عائلتي.',
          'She has a cat and a dog. - لديها قطة وكلب.',
          'We go to the beach on Sunday. - نذهب إلى الشاطئ يوم الأحد.',
          'He is tired because he works a lot. - هو متعب لأنه يعمل كثيرًا.',
          'They do their homework before dinner. - يُنجزون واجباتهم قبل العشاء.',
          'I drink tea without sugar. - أشرب الشاي بدون سكر.',
          'Do you want tea or coffee? - هل تريد شايًا أم قهوة؟',
          "I'm happy, but I'm tired. - أنا سعيد، لكنني متعب.",
        ] },
      ],
    ] },
    { t: 'talk', title: 'A video call', cols: 2, size: 11, lines: lines(`
      Yasmine: Hi Mum! How are you?
      Mum: I'm fine, my love. And you?
      Yasmine: I'm good. I have a new friend. Her name is Julie.
      Mum: That's nice! Where is she from?
      Yasmine: She's French. She lives next to me.
      Mum: Does she study with you?
      Yasmine: Yes, we go to university together every day.
      Mum: Good. Do you have food at home?
      Yasmine: Yes, I do. I cook every evening.
      Mum: What do you cook?
      Yasmine: Pasta, rice and sometimes tagine!
      Mum: Ha ha! Your father and your brother say hello.
      Yasmine: Hello to them! What does Adam do now?
      Mum: He goes to school in the morning and plays football in the afternoon.
      Yasmine: Great. I miss you, Mum!
      Mum: We miss you too. Bye, my love!`) },
  ] },

  /* ── 10 · The house and prepositions ─────────────────────────────── */
  { n: 10, titleAr: 'البيت والأثاث + حروف الجر', blocks: [
    { t: 'banner', title: 'My House - بيتي', icons: ['🏠', '🛋️'] },
    { t: 'grid', rows: [
      { dark: true, cells: ['living room', 'bedroom', 'kitchen', 'bathroom', 'garden', 'balcony'] },
      { cells: ['الصالون', 'غرفة النوم', 'المطبخ', 'الحمّام', 'الحديقة', 'الشرفة'] },
    ] },
    { t: 'cards', items: [
      ['🛋️', 'sofa', 'أريكة (فوطوي)'], ['🛏️', 'bed', 'سرير'], ['🪑', 'chair', 'كرسي'], ['🍽️', 'table', 'طاولة'],
      ['🚪', 'door', 'باب'], ['🪟', 'window', 'نافذة (شرجم)'], ['💡', 'lamp', 'مصباح'], ['🪞', 'mirror', 'مرآة'],
      ['🗄️', 'wardrobe', 'خزانة ملابس'], ['🧊', 'fridge', 'ثلاجة'], ['🔥', 'cooker', 'موقد (كوزينيير)'], ['📺', 'TV', 'تلفاز'],
      ['🧺', 'washing machine', 'آلة الغسيل'], ['🛁', 'bath', 'حوض الاستحمام'], ['🖼️', 'picture', 'لوحة / صورة'], ['🪴', 'plant', 'نبتة'],
    ] },
    { t: 'bar', title: 'Prepositions - حروف الجر' },
    { t: 'preps', items: [['on', 'on', 'على'], ['under', 'under', 'تحت'], ['next', 'next to', 'بجانب'], ['front', 'in front of', 'أمام'], ['behind', 'behind', 'خلف (وراء)'], ['between', 'between', 'بين']] },
    { t: 'qa', rows: [
      ['Where is the cat?', "It's under the table."],
      ['Where are my keys?', "They're on the sofa."],
      ['Where is the lamp?', "It's next to the bed."],
      ['Where is the TV?', "It's in front of the sofa."],
      ['Where is the plant?', "It's between the window and the door."],
    ] },
    { t: 'talk', title: 'Where are my keys?', art: '🔑', size: 12, lines: lines(`
      Rayan: Mum, where are my keys?
      Mum: Are they on the table?
      Rayan: No, they aren't.
      Mum: Look under the sofa.
      Rayan: No… Oh! Here they are, next to the TV!
      Mum: And your phone?
      Rayan: It's in my bag. Thanks, Mum!`) },
  ] },

  /* ── 11 · My day and the time ────────────────────────────────────── */
  { n: 11, titleAr: 'يومي + كيف نقول الساعة', blocks: [
    { t: 'banner', title: 'My Day - يومي', icons: ['⏰', '🌙'] },
    { t: 'cards', items: [
      ['⏰', 'wake up', 'أستيقظ'], ['🛏️', 'get up', 'أنهض'], ['🚿', 'take a shower', 'أستحمّ (ندوّش)'], ['🪥', 'brush my teeth', 'أنظّف أسناني'],
      ['👕', 'get dressed', 'أرتدي ملابسي'], ['🍳', 'have breakfast', 'أتناول الفطور'], ['💼', 'go to work', 'أذهب إلى العمل'], ['🏁', 'start work', 'أبدأ العمل'],
      ['🥗', 'have lunch', 'أتناول الغداء'], ['✅', 'finish work', 'أُنهي العمل'], ['🏠', 'go home', 'أعود إلى البيت'], ['🍲', 'cook dinner', 'أطبخ العشاء'],
      ['📝', 'do homework', 'أُنجز الواجبات'], ['📺', 'watch TV', 'أشاهد التلفاز'], ['📖', 'read a book', 'أقرأ كتابًا'], ['😴', 'go to bed', 'أذهب إلى السرير'],
    ] },
    { t: 'bar', title: "What time is it? - كم الساعة؟" },
    { t: 'clocks', times: ['7:00', '7:15', '7:30', '7:45', '12:00', '3:20', '6:40', '10:05'] },
    { t: 'grid', rows: [
      { dark: true, cells: ["It's seven o'clock.", "It's quarter past seven.", "It's half past seven.", "It's quarter to eight."], size: 11 },
      { cells: ['السابعة تمامًا', 'السابعة والربع', 'السابعة والنصف', 'الثامنة إلا ربعًا'], size: 11 },
    ] },
    { t: 'talk', title: 'A nurse’s day', cols: 2, size: 11.5, lines: lines(`
      Host: Hello, Khadija. What time do you get up?
      Khadija: I get up at five o'clock.
      Host: Five o'clock? That's early!
      Khadija: Yes. I'm a nurse, and I start work at seven.
      Host: What do you do before work?
      Khadija: I take a shower, have breakfast and get dressed.
      Host: How do you go to the hospital?
      Khadija: I go by bus. It takes 30 minutes.
      Host: When do you have lunch?
      Khadija: At half past twelve, with my colleagues.
      Host: What time do you finish work?
      Khadija: At three o'clock.
      Host: And after work?
      Khadija: I go home, cook dinner and help my children.
      Host: What time do you go to bed?
      Khadija: At half past ten. I'm always tired!
      Host: Thank you, Khadija!
      Khadija: You're welcome.`) },
  ] },

  /* ── 12 · The week and how often ─────────────────────────────────── */
  { n: 12, titleAr: 'أيام الأسبوع + كم مرة؟', blocks: [
    { t: 'banner', title: 'The days of the week - أيام الأسبوع' },
    { t: 'grid', boxed: true, rows: [
      { dark: true, cells: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      { cells: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'] },
      { plain: true, span: [5, 2], cells: ['◀── weekdays - أيام العمل ──▶', '◀─ the weekend - نهاية الأسبوع ─▶'], size: 10.5 },
    ] },
    { t: 'bar', title: 'Adverbs of frequency - ظروف التكرار' },
    { t: 'grid', rows: [
      { dark: true, cells: ['always', 'usually', 'often', 'sometimes', 'rarely', 'never'] },
      { cells: ['100%', '90%', '70%', '50%', '10%', '0%'] },
      { cells: ['دائمًا', 'عادةً', 'غالبًا', 'أحيانًا', 'نادرًا', 'أبدًا'] },
    ] },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [
        { t: 'callout', text: 'الظرف يأتي قبل الفعل… ولكن بعد to be' },
        { t: 'grid', rows: [{ cells: ['I', 'always', 'drink tea.'], size: 11.5 }, { cells: ['She', 'never', 'works on Sunday.'], size: 11.5 }, { dark: true, cells: ['He is', 'often', 'late.'], size: 11.5 }] },
      ],
      [
        { t: 'callout', text: 'How often…? - كم مرة؟' },
        { t: 'bullets', box: true, size: 11.5, items: ['once a week - مرة في الأسبوع', 'twice a week - مرتين في الأسبوع', 'every day - كل يوم', 'on Mondays - أيام الإثنين', 'أيام الأسبوع تبدأ دائمًا بحرف كبير: Monday'] },
      ],
    ] },
    { t: 'talk', title: 'Making plans', size: 12, aside: [{ t: 'art', icon: '📅', size: 90 }, { t: 'sticky', text: 'نتائج سريعة = ممارسة يومية' }], lines: lines(`
      Salim: What do you do on Friday afternoon?
      Asmae: I usually go to the hammam with my sister.
      Salim: Do you work on Saturday?
      Asmae: Yes, but only in the morning.
      Salim: How often do you go to the cinema?
      Asmae: Rarely. Maybe once a month.
      Salim: I often go on Sunday evening. Do you want to come?
      Asmae: Sorry, on Sunday I always visit my grandmother.
      Salim: OK. What about Thursday?
      Asmae: Thursday is good! I'm never busy on Thursday.
      Salim: Great. See you on Thursday at seven.
      Asmae: Perfect. Thanks, Salim!`) },
  ] },

  /* ── 13 · Food ───────────────────────────────────────────────────── */
  { n: 13, titleAr: 'الطعام: ماذا تحب؟', blocks: [
    { t: 'banner', title: 'Food - الطعام', icons: ['🍽️', '😋'] },
    { t: 'cards', items: [
      ['🍞', 'bread', 'خبز'], ['🧀', 'cheese', 'جبن (فرماج)'], ['🥚', 'eggs', 'بيض'], ['🍗', 'chicken', 'دجاج'],
      ['🐟', 'fish', 'سمك (حوت)'], ['🥩', 'meat', 'لحم'], ['🍚', 'rice', 'أرز (روز)'], ['🍝', 'pasta', 'معكرونة'],
      ['🥗', 'salad', 'سلطة'], ['🍲', 'soup', 'حساء (حريرة)'], ['🍕', 'pizza', 'بيتزا'], ['🍔', 'burger', 'برغر'],
      ['🍎', 'apple', 'تفاحة'], ['🍌', 'banana', 'موزة (بنان)'], ['🍰', 'cake', 'كعكة (حلوى)'], ['🍫', 'chocolate', 'شوكولاتة'],
    ] },
    { t: 'bar', title: "What do you like? - ماذا تحب؟" },
    { t: 'qa', rows: [
      ['What food do you like?', 'I like fish and rice.'],
      ["What's your favourite food?", 'My favourite food is couscous.'],
      ['Do you like pizza? 🙂', 'Yes, I do. I love it!'],
      ['Do you like spicy food? 🙁', "No, I don't."],
      ['Does he like cake?', 'Yes, he does.'],
    ] },
    { t: 'callout', text: 'Do you like…? ← Yes, I do. / No, I don\'t.  —  Does he like…? ← Yes, he does. / No, he doesn\'t.' },
    { t: 'talk', title: 'What’s for dinner?', art: '🍕', size: 12, lines: lines(`
      Dad: What do you want for dinner, kids?
      Sami: Pizza! I love pizza.
      Dad: Again? What about fish and rice?
      Rim: I don't like fish, Dad.
      Dad: OK. Do you like chicken?
      Rim: Yes, I do. Roast chicken is my favourite!
      Sami: Me too. With chips, please!
      Dad: Chips are OK, but we have salad too.
      Sami: Salad? Hmm… OK.
      Rim: And for dessert?
      Dad: There is chocolate cake in the fridge.
      Sami: Yummy!
      Dad: Great. Let's cook together.`) },
  ] },

  /* ── 14 · Drinks ─────────────────────────────────────────────────── */
  { n: 14, titleAr: 'المشروبات + كوب، كأس، قنينة', blocks: [
    { t: 'banner', title: 'Drinks - المشروبات', icons: ['🥤', '☕'] },
    { t: 'cards', items: [
      ['💧', 'water', 'ماء'], ['🍵', 'mint tea', 'شاي بالنعناع (أتاي)'], ['☕', 'coffee', 'قهوة'], ['🥛', 'milk', 'حليب'],
      ['🍊', 'orange juice', 'عصير برتقال'], ['🍎', 'apple juice', 'عصير تفاح'], ['🍋', 'lemonade', 'ليموناضة'], ['🍫', 'hot chocolate', 'شوكولاتة ساخنة'],
      ['🍓', 'smoothie', 'عصير فواكه مخفوق'], ['🥤', 'milkshake', 'حليب مخفوق'], ['🥫', 'fizzy drink', 'مشروب غازي (مونادا)'], ['🫧', 'sparkling water', 'ماء غازي'],
      ['🧊', 'iced coffee', 'قهوة مثلّجة'], ['🌿', 'green tea', 'شاي أخضر'], ['🥑', 'avocado juice', 'عصير أفوكا'], ['🌼', 'herbal tea', 'شاي أعشاب'],
    ] },
    { t: 'grid', rows: [
      { dark: true, cells: ['a cup of coffee', 'a glass of water', 'a bottle of juice', 'a can of soda'], size: 11.5 },
      { cells: ['فنجان قهوة', 'كأس ماء', 'قنينة عصير', 'علبة مشروب غازي'], size: 11.5 },
    ] },
    { t: 'bar', title: 'Asking and answering' },
    { t: 'qa', rows: [
      ['Would you like a drink?', 'Yes, please. A glass of water.', 'هل تريد مشروبًا؟', 'نعم من فضلك، كأس ماء.'],
      ["What's your favourite drink?", "It's mint tea.", 'ما مشروبك المفضل؟', 'الشاي بالنعناع.'],
      ['How do you like your coffee?', 'With milk and no sugar.', 'كيف تحب قهوتك؟', 'بالحليب وبدون سكر.'],
      ['Hot or cold?', 'Cold, please. It\'s hot today!', 'ساخن أم بارد؟', 'بارد، الجو حار اليوم!'],
    ] },
    { t: 'talk', title: 'At the juice bar', cols: 2, art: '🍹', size: 11.5, lines: lines(`
      Waiter: Hello! What would you like to drink?
      Lamia: A fresh orange juice, please.
      Waiter: Large or small?
      Lamia: Large, please.
      Imad: Can I have an avocado juice?
      Waiter: Sorry, we don't have avocados today.
      Imad: OK. A banana milkshake, then.
      Waiter: With sugar?
      Imad: No sugar, thank you.
      Waiter: Anything else? A bottle of water?
      Lamia: Yes, a small bottle of water, please.
      Waiter: That's 45 dirhams.
      Imad: Here you are.
      Waiter: Thank you. Enjoy your drinks!`) },
  ] },

  /* ── 15 · Transport + this / that / these / those ────────────────── */
  { n: 15, titleAr: 'وسائل النقل + this / that', blocks: [
    { t: 'banner', title: 'Transport - وسائل النقل', icons: ['🚌', '✈️'] },
    { t: 'cards', items: [
      ['🚲', 'bicycle', 'دراجة هوائية (بشكليط)'], ['🏍️', 'motorbike', 'دراجة نارية (موطور)'], ['🚗', 'car', 'سيارة (طوموبيل)'], ['🚌', 'bus', 'حافلة (طوبيس)'],
      ['🚕', 'taxi', 'سيارة أجرة (طاكسي)'], ['🚐', 'van', 'شاحنة صغيرة'], ['🚚', 'lorry / truck', 'شاحنة (كاميو)'], ['🚆', 'train', 'قطار (تران)'],
      ['🚊', 'tram', 'ترامواي'], ['✈️', 'plane', 'طائرة'], ['🚁', 'helicopter', 'مروحية'], ['🚤', 'boat', 'قارب (فلوكة)'],
      ['🚢', 'ship', 'سفينة (باطو)'], ['🛴', 'scooter', 'سكوتر'], ['🚇', 'metro', 'مترو'], ['🚶', 'on foot', 'مشيًا (على رجلي)'],
    ] },
    { t: 'callout', text: 'نقول by bus / by car / by train … ولكن on foot (مشيًا) — How do you go to work? I go by tram.' },
    { t: 'bar', title: 'This - That - These - Those' },
    { t: 'pointing', items: [
      { far: false, many: false, caption: '"This" لشيء واحد قريب', en: 'This is a car', ar: 'هذه سيارة' },
      { far: true, many: false, caption: '"That" لشيء واحد بعيد', en: 'That is a car', ar: 'تلك سيارة' },
      { far: false, many: true, caption: '"These" لعدة أشياء قريبة', en: 'These are cars', ar: 'هذه سيارات' },
      { far: true, many: true, caption: '"Those" لعدة أشياء بعيدة', en: 'Those are cars', ar: 'تلك سيارات' },
    ] },
    { t: 'qa', rows: [["What's this?", "It's my phone.", 'ما هذا؟', 'إنه هاتفي.'], ["What's that?", "That's a lorry.", 'ما ذلك؟', 'تلك شاحنة.'], ['What are these?', 'These are my keys.', 'ما هذه؟', 'هذه مفاتيحي.'], ['What are those?', 'Those are boats.', 'ما تلك؟', 'تلك قوارب.']] },
    { t: 'talk', title: 'In the old medina', cols: 2, art: '🏺', size: 11, lines: lines(`
      Emily: Excuse me, what's this?
      Seller: This is a tagine. It's for cooking.
      Emily: And what's that, on the wall?
      Seller: That's a lamp. It's very old.
      Emily: How much are these plates?
      Seller: These plates are 80 dirhams each.
      Emily: And those bags?
      Seller: Those are 150 dirhams. They're leather.
      Emily: I'd like this lamp and these two plates.
      Seller: Great choice! How do you go back to your hotel?
      Emily: By taxi. Is there a taxi near here?
      Seller: Yes, there are taxis at the square.
      Emily: Thank you very much!
      Seller: You're welcome. Have a nice day!`) },
  ] },

  /* ── 16 · The town and directions ────────────────────────────────── */
  { n: 16, titleAr: 'أماكن المدينة + الاتجاهات', blocks: [
    { t: 'banner', title: 'In Town - في المدينة', icons: ['🏙️', '🧭'] },
    { t: 'cards', items: [
      ['🏦', 'bank', 'بنك (بانكا)'], ['🕌', 'mosque', 'مسجد (جامع)'], ['🏥', 'hospital', 'مستشفى (سبيطار)'], ['🥖', 'bakery', 'مخبزة'],
      ['🛒', 'supermarket', 'سوبرماركت'], ['🏫', 'school', 'مدرسة'], ['🌳', 'park', 'حديقة (جردة)'], ['💊', 'pharmacy', 'صيدلية (فرمسيان)'],
      ['⛽', 'petrol station', 'محطة وقود'], ['🏤', 'post office', 'مكتب البريد (البوسطة)'], ['🚓', 'police station', 'مركز الشرطة'], ['🚏', 'bus station', 'محطة الحافلات'],
      ['📚', 'library', 'مكتبة'], ['🏨', 'hotel', 'فندق (أوطيل)'], ['🎬', 'cinema', 'سينما'], ['☕', 'café', 'مقهى (قهوة)'],
    ] },
    { t: 'bar', title: 'Giving directions - إعطاء الاتجاهات' },
    { t: 'row', widths: '1.1fr 1fr', blocks: [
      [{ t: 'cards', cols: 2, items: [['⬆️', 'Go straight on', 'امشِ إلى الأمام (نيشان)'], ['⬅️', 'Turn left', 'انعطف يسارًا (ليسر)'], ['➡️', 'Turn right', 'انعطف يمينًا (ليمن)'], ['1️⃣', 'Take the first left', 'خذ أول شارع على اليسار'], ['🔄', 'At the roundabout', 'عند الدوّار (رومبوان)'], ['🚦', 'At the traffic lights', 'عند إشارات المرور (الضو)'], ['↔️', 'Opposite', 'مقابل (قبالة)'], ['📐', 'On the corner', 'في الزاوية (القنت)']] }],
      [
        { t: 'callout', text: 'Important questions - أسئلة مهمة' },
        { t: 'grid', boxed: true, rows: [
          { dark: true, cells: ['Excuse me, how do I get to the station?'], size: 11 },
          { cells: ['Go straight on and take the second right.'], size: 11 },
          { dark: true, cells: ['Is the hospital near here?'], size: 11 },
          { cells: ["No, it's far. Take a taxi."], size: 11 },
          { dark: true, cells: ['Where is the nearest pharmacy?'], size: 11 },
          { cells: ["It's on the corner, opposite the bank."], size: 11 },
        ] },
      ],
    ] },
    { t: 'talk', title: 'Is there a post office near here?', art: '🗺️', size: 12, lines: lines(`
      Leila: Excuse me, is there a post office near here?
      Man: Yes, there is. Go straight on.
      Leila: Straight on…
      Man: Then take the first right. The post office is on the left, opposite the park.
      Leila: Opposite the park. Is it far?
      Man: No, it's about five minutes on foot.
      Leila: And where is the nearest bank?
      Man: It's next to the post office.
      Leila: Perfect! Thank you very much.
      Man: You're welcome. Have a nice day!`) },
  ] },

  /* ── 17 · There is / there are ───────────────────────────────────── */
  { n: 17, titleAr: 'There is / There are في حيّي', blocks: [
    { t: 'banner', title: 'My Neighbourhood - حيّي', icons: ['🏘️', '🌳'] },
    { t: 'cards', items: [
      ['🏪', 'shop', 'محل (حانوت)'], ['🧺', 'market', 'سوق'], ['🏧', 'cash machine', 'شبّاك أوتوماتيكي'], ['🪑', 'bench', 'مقعد (بانكة)'],
      ['🚏', 'bus stop', 'موقف الحافلات'], ['🅿️', 'car park', 'موقف السيارات'], ['🏟️', 'stadium', 'ملعب'], ['🏊', 'swimming pool', 'مسبح (بيسين)'],
      ['🏋️', 'gym', 'قاعة رياضة'], ['🛝', 'playground', 'ساحة ألعاب'], ['🌳', 'tree', 'شجرة'], ['🗑️', 'bin', 'سلة المهملات (الزبل)'],
      ['🏛️', 'museum', 'متحف'], ['🏖️', 'beach', 'شاطئ (البحر)'], ['🏢', 'building', 'عمارة'], ['🛣️', 'street', 'شارع (زنقة)'],
    ] },
    { t: 'bar', title: 'There is / There are - يوجد' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'grid', boxed: true, rows: [
        { dark: true, cells: ['There is + a / an + one thing'], size: 11 }, { cells: ['There is a bank on my street. - يوجد بنك في شارعي.'], size: 11 },
        { dark: true, cells: ['There are + two, three, many…'], size: 11 }, { cells: ['There are two cafés near the school. - يوجد مقهيان قرب المدرسة.'], size: 11 },
        { dark: true, cells: ["There isn't / There aren't any"], size: 11 }, { cells: ["There aren't any buses at night. - لا توجد حافلات ليلًا."], size: 11 },
      ] }],
      [{ t: 'qa', rows: [
        ['Is there a gym near here?', 'Yes, there is.'],
        ['Is there a cinema in your village?', "No, there isn't."],
        ['Are there any shops?', 'Yes, there are.'],
        ['Are there any hotels?', "No, there aren't."],
        ['How many parks are there?', 'There are three.'],
      ] }],
    ] },
    { t: 'talk', title: 'The new flat', art: '🏘️', size: 12, lines: lines(`
      Kamal: Do you like your new neighbourhood?
      Nawal: Yes, I love it! There is a big park near my flat.
      Kamal: Nice. Are there any shops?
      Nawal: Yes, there are three shops and a small market.
      Kamal: Is there a gym?
      Nawal: No, there isn't. But there is a swimming pool!
      Kamal: Great. Is there a bus stop near your flat?
      Nawal: Yes, there is one in front of my building.
      Kamal: And how many cafés are there?
      Nawal: There are two. Let's have coffee there on Saturday!
      Kamal: Good idea!`) },
  ] },

  /* ── 18 · Verbs, jobs and can / can't ────────────────────────────── */
  { n: 18, titleAr: 'أفعال ومهن + أستطيع / لا أستطيع', blocks: [
    { t: 'banner', title: 'Action Verbs - أفعال الحركة', icons: ['💪', '⚽'] },
    { t: 'cards', items: [
      ['🏊', 'swim', 'يسبح (يعوم)'], ['🏃', 'run', 'يجري'], ['🚗', 'drive', 'يسوق'], ['🚴', 'ride a bike', 'يركب الدراجة'],
      ['🎤', 'sing', 'يغني'], ['💃', 'dance', 'يرقص'], ['🎸', 'play the guitar', 'يعزف على القيثارة'], ['🍳', 'cook', 'يطبخ'],
      ['🗣️', 'speak', 'يتكلم (يهضر)'], ['✍️', 'write', 'يكتب'], ['📖', 'read', 'يقرأ'], ['🎨', 'draw', 'يرسم'],
      ['🧗', 'climb', 'يتسلّق'], ['🦘', 'jump', 'يقفز (ينقز)'], ['🔧', 'fix', 'يصلح'], ['✈️', 'fly', 'يطير / يقود طائرة'],
    ] },
    { t: 'bar', title: 'Jobs - مهن جديدة' },
    { t: 'cards', items: [
      ['🧑‍⚕️', 'a nurse', 'ممرّض(ة)'], ['🧑‍✈️', 'a pilot', 'طيّار'], ['🧑‍🚒', 'a firefighter', 'رجل إطفاء (بومبيي)'], ['🧑‍🔬', 'a scientist', 'عالِم'],
      ['🧑‍🎨', 'an artist', 'فنّان(ة)'], ['🧑‍🏭', 'a factory worker', 'عامل في مصنع'], ['🧑‍💼', 'a businessman', 'رجل أعمال'], ['🧑‍⚖️', 'a judge', 'قاضٍ'],
    ] },
    { t: 'bar', title: "Can / Can't - أستطيع / لا أستطيع" },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'qa', rows: [['Can you swim?', 'Yes, I can.'], ['Can she drive?', "No, she can't."], ['Can they speak English?', 'Yes, they can.']] }],
      [{ t: 'bullets', box: true, tick: true, size: 11.5, items: ['بعد can نضع الفعل مباشرة: I can swim ✓ — I can to swim ✗', 'لا نضيف s مع he / she: He can drive ✓ — He cans ✗', "can't = cannot = لا يستطيع"] }],
    ] },
    { t: 'talk', title: 'What can you do?', cols: 2, art: '🎸', size: 11.5, lines: lines(`
      Rayan: Can you play the guitar?
      Ines: No, I can't. But I can sing!
      Rayan: Really? Can you sing in English?
      Ines: Yes, I can. And my brother can play the piano.
      Rayan: Cool! I can't sing, but I can dance.
      Ines: Ha ha! Can you cook?
      Rayan: Yes, I can cook pasta and omelettes.
      Ines: Can your sister drive?
      Rayan: Yes, she can. She's a taxi driver!
      Ines: Can she drive a bus too?
      Rayan: No, she can't.
      Ines: Can you swim?
      Rayan: Yes, I can swim very well.
      Ines: Let's go to the pool on Sunday!`) },
  ] },

  /* ── 19 · Hobbies and like + -ing ────────────────────────────────── */
  { n: 19, titleAr: 'الهوايات + تصريف الفعل like', blocks: [
    { t: 'banner', title: 'Hobbies - الهوايات', icons: ['🎨', '🚴'] },
    { t: 'cards', items: [
      ['📚', 'reading', 'القراءة'], ['🏊', 'swimming', 'السباحة'], ['🍳', 'cooking', 'الطبخ'], ['🎨', 'drawing', 'الرسم'],
      ['🎤', 'singing', 'الغناء'], ['💃', 'dancing', 'الرقص'], ['🏃', 'running', 'الجري'], ['🚴', 'cycling', 'ركوب الدراجة'],
      ['🥾', 'hiking', 'المشي في الجبال'], ['⛺', 'camping', 'التخييم'], ['🎣', 'fishing', 'الصيد (الحوت)'], ['🌱', 'gardening', 'البستنة'],
      ['📷', 'taking photos', 'التصوير'], ['♟️', 'playing chess', 'لعب الشطرنج'], ['🎮', 'playing video games', 'ألعاب الفيديو'], ['🌍', 'travelling', 'السفر'],
    ] },
    { t: 'bar', title: 'like - أحب' },
    { t: 'row', widths: '1fr 1fr 1fr', blocks: [
      [{ t: 'callout', text: '+ Positive - الإثبات' }, { t: 'pairs', cols: 1, side: true, size: 11, items: [['I like', 'أنا أحب'], ['You like', 'أنت تحب'], ['He likes', 'هو يحب'], ['She likes', 'هي تحب'], ['We like', 'نحن نحب'], ['They like', 'هم يحبون']] }],
      [{ t: 'callout', text: '− Negative - النفي' }, { t: 'pairs', cols: 1, side: true, size: 11, items: [["I don't like", 'لا أحب'], ["You don't like", 'لا تحب'], ["He doesn't like", 'لا يحب'], ["She doesn't like", 'لا تحب'], ["We don't like", 'لا نحب'], ["They don't like", 'لا يحبون']] }],
      [{ t: 'callout', text: '? Question - السؤال' }, { t: 'pairs', cols: 1, side: true, size: 11, items: [['Do I like…?', 'هل أحب…؟'], ['Do you like…?', 'هل تحب…؟'], ['Does he like…?', 'هل يحب…؟'], ['Does she like…?', 'هل تحب…؟'], ['Do we like…?', 'هل نحب…؟'], ['Do they like…?', 'هل يحبون…؟']] }],
    ] },
    { t: 'callout', text: 'بعد like نضيف ing للفعل: I like swimming. — She doesn\'t like cooking.' },
    { t: 'talk', title: 'Free time', art: '🎣', size: 12, lines: lines(`
      Malak: What do you like doing in your free time, Ayman?
      Ayman: I like cycling and taking photos.
      Malak: Does your brother like cycling too?
      Ayman: No, he doesn't. He likes video games.
      Malak: I don't like video games. What else do you like?
      Ayman: I like swimming. And you?
      Malak: I like reading and drawing.
      Ayman: Do your parents like sports?
      Malak: My dad likes fishing. My mum likes gardening.
      Ayman: Fishing? Where does he go?
      Malak: He goes to the river near our village.
      Ayman: I like fishing too! Can I go with him?
      Malak: Of course! He loves company.`) },
  ] },
]
