/**
 * «الإنجليزية من الصفر (الدارجة)» — Level 1 (A0 → A1), the one-page-per-
 * lesson book first made in Canva, printed from /admin/level1-book.
 *
 * Every lesson is a list of blocks drawn top to bottom on one A4 page (see
 * app/admin/level1-book/_blocks.tsx). Edit a lesson here and the page, its
 * number and the contents follow; conversations are numbered across the
 * whole book automatically. Pictures are emoji drawn in grey, like the
 * book's black-and-white clip-art.
 */

export type Pair = [en: string, ar: string]
export type FlagId = 'ma' | 'eg' | 'fr' | 'es' | 'sa' | 'dz' | 'it' | 'us' | 'tn'

export type Block =
  /** A small bullet line on the right ("Teacher : …"). */
  | { t: 'note'; text: string }
  /** Black bar across the page: "• Greetings". */
  | { t: 'bar'; title: string; icon?: string }
  /** Centered black title box (the lesson's topic). */
  | { t: 'banner'; title: string; icons?: [string, string] }
  /** Bullets in columns, optionally inside a bordered box with a heading. */
  | { t: 'bullets'; items: string[]; cols?: number; box?: boolean; heading?: string; size?: number; tick?: boolean }
  /** A practice conversation: numbered bar + lines (+ a picture). */
  | { t: 'talk'; title?: string; full?: string; lines: string[]; cols?: 1 | 2; art?: string; aside?: Block[]; size?: number }
  /** The alphabet strip. */
  | { t: 'alphabet' }
  /** Lesson 2's numbers: circles 1–10 and four columns to 914. */
  | { t: 'numbers' }
  /** Flag + country + nationality, three per row. */
  | { t: 'flags'; items: { flag: FlagId; country: string; nationality: string }[] }
  /** Sentence-building diagram: columns of black boxes (stacked = choices). */
  | { t: 'formula'; cols: string[][]; over?: string[]; note?: string }
  /** Several blocks side by side; `widths` is a CSS grid template. */
  | { t: 'row'; widths: string; blocks: Block[][] }
  /** Picture word cards: emoji, English (black), Arabic (boxed). */
  | { t: 'cards'; items: [icon: string, en: string, ar: string][]; cols?: number }
  /** Word pairs as black/white labels (English on top unless `arTop`). */
  | { t: 'pairs'; items: Pair[]; cols: number; arTop?: boolean; side?: boolean; size?: number }
  /** Question → answer rows (white / black), with optional Arabic. */
  | { t: 'qa'; rows: [q: string, a: string, qAr?: string, aAr?: string][] }
  /** Small titled boxes of bullets (WHEN / WHERE …). */
  | { t: 'boxes'; items: { title: string; lines: string[] }[]; cols: number }
  /** A labelled paragraph ("Introduce yourself", "Subject He"). */
  | { t: 'text'; label: string; body: string; size?: number }
  /** A grid of equal cells; dark rows are black with white text. */
  | { t: 'grid'; title?: string; rows: { cells: string[]; dark?: boolean; plain?: boolean; span?: number[]; size?: number }[]; boxed?: boolean }
  /** Chips with a caption above (WH words). */
  | { t: 'chips'; items: [label: string, above: string][] }
  /** A big grey picture. */
  | { t: 'art'; icon: string; size?: number }
  /** A yellow-paper sticky note. */
  | { t: 'sticky'; text: string }
  /** A full-width black line of text. */
  | { t: 'callout'; text: string }
  /** Space. */
  | { t: 'gap'; h: number }
  /* ── one-off pictures ── */
  | { t: 'family' }
  | { t: 'preps'; items: [kind: 'behind' | 'on' | 'between' | 'under' | 'front' | 'next', en: string, ar: string][] }
  | { t: 'clocks'; times: string[] }
  | { t: 'pointing'; items: { far: boolean; many: boolean; caption: string; en: string; ar: string }[] }

export interface Lesson { n: number; titleAr: string; blocks: Block[] }

const lines = (s: string) => s.trim().split('\n').map(l => l.trim()).filter(Boolean)

export const LEVEL1_LESSONS: Lesson[] = [
  /* ── 01 ─────────────────────────────────────────────────────────── */
  { n: 1, titleAr: 'التحيات + محادثة', blocks: [
    { t: 'note', text: 'Teacher : Hamza El Qasraoui' },
    { t: 'bullets', box: true, cols: 3, heading: 'RULES TO FOLLOW', items: [
      'Sit down', 'Stand up', 'Repeat after me', 'Try again.',
      'Good job / Well done', 'Any questions?', 'Can you read it?', "Let's go / Let's start.",
      "No, I don't understand.", 'Can you say it again?', "I don't know.", 'One more time, please.',
    ] },
    { t: 'bar', title: 'Greetings' },
    { t: 'bullets', cols: 2, items: ['Hello / Hi / Hey', 'Good (morning, afternoon, evening)', "How are you?   I am fine. / (I'm fine)", "What's your name?   My name is _____"] },
    { t: 'bar', title: 'Leaving phrases.' },
    { t: 'bullets', cols: 2, items: ['Goodbye / Bye-bye', 'See you (tomorrow, later, soon)', 'Have a good (day, night).', 'Good night.'] },
    { t: 'talk', cols: 2, lines: lines(`
      Hello
      Hi, how are you?
      I am fine, and you?
      I'm good. What's your name?
      My name is Hamza. And you? What's your name?
      My name is Adil.
      It's nice to meet you.
      It's nice to meet you too.
      See you tomorrow.
      Goodbye.`) },
    { t: 'alphabet' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'bullets', items: ['How do you spell your name?'] }],
      [{ t: 'bullets', items: ["It's spelled (I spell it) H-A-M-Z-A"] }],
    ] },
    { t: 'talk', cols: 2, lines: lines(`
      Person A: Good afternoon, how are you today?
      Person B: I'm OK. And you? How are you?
      Person A: I'm great. What's your name?
      Person B: My name is Said.
      Person A: How do you spell your name?
      Person B: It's spelled S-A-I-D. And you?
      Person A: My name is Khadija.
      Person B: How do you spell your name?
      Person A: I spell it K-H-A-D-I-J-A. Nice to meet you.
      Person B: Nice to meet you too.`) },
  ] },

  /* ── 02 ─────────────────────────────────────────────────────────── */
  { n: 2, titleAr: 'الأرقام والعمر ورقم الهاتف', blocks: [
    { t: 'gap', h: 6 },
    { t: 'bar', title: 'Numbers from 1 to 900' },
    { t: 'numbers' },
    { t: 'bar', title: 'Age & Phone number:' },
    { t: 'row', widths: '1fr', blocks: [[
      { t: 'bullets', box: true, heading: '1. Age:', cols: 2, items: [
        'How old are you?', 'How old is he?', 'How old is she?', 'How old are they?',
        'I am 27. / I am 27 years old.', 'He is 33 years old. / Hamza is 33 years old.', 'Khadija is 47 years old. / She is 47 years old.', 'They are 18 years old.',
      ] },
    ]] },
    { t: 'gap', h: 8 },
    { t: 'bullets', box: true, heading: '2. Phone number:', cols: 2, items: [
      'What is your phone number?', 'What is his phone number?', 'What is her phone number?',
      'My phone number is 06100000667', 'His phone number is 00880088000', 'Her phone number is 890-99-0001',
    ] },
    { t: 'talk', art: '☎️', lines: lines(`
      Hamza: Hello Ali, how old are you?
      Ali: I am 27 years old. And you?
      Hamza: I am 19 years old.
      Ali: What's your phone number?
      Hamza: My phone number is 0600000121. And you?
      Ali: My phone number is 07654321324.
      Hamza: Thank you. See you later.
      Ali: Goodbye.`) },
  ] },

  /* ── 03 ─────────────────────────────────────────────────────────── */
  { n: 3, titleAr: 'الدول والجنسيات والمهن', blocks: [
    { t: 'bar', title: 'Countries & Nationalities - Jobs - Marital Status' },
    { t: 'flags', items: [
      { flag: 'ma', country: 'Morocco', nationality: 'Moroccan' },
      { flag: 'eg', country: 'Egypt', nationality: 'Egyptian' },
      { flag: 'fr', country: 'France', nationality: 'French' },
      { flag: 'es', country: 'Spain', nationality: 'Spanish' },
      { flag: 'sa', country: 'Saudi Arabia', nationality: 'Saudi' },
      { flag: 'dz', country: 'Algeria', nationality: 'Algerian' },
      { flag: 'it', country: 'Italy', nationality: 'Italian' },
      { flag: 'us', country: 'USA', nationality: 'American' },
      { flag: 'tn', country: 'Tunisia', nationality: 'Tunisian' },
    ] },
    { t: 'bar', title: 'Where are you from? What nationality are you?' },
    { t: 'row', widths: '1.15fr 1fr', blocks: [
      [{ t: 'formula', over: ['أين', '', '', 'من'], cols: [['Where'], ['am', 'are', 'is'], ['I', 'You - We - They', 'He - She - It'], ['from?']], note: 'للسؤال من أين بلاد أنت؟' }],
      [{ t: 'formula', over: ['ماذا تكون', '', 'الجنسية'], cols: [['What is'], ['My', 'Your', 'His - Her'], ['nationality?']], note: 'للسؤال على الجنسية ديالك' }],
    ] },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'bullets', heading: 'Examples:', items: ['Where are you from?', "I'm from (Morocco, Tunisia...)"] }],
      [{ t: 'bullets', heading: ' ', items: ['What is your nationality?', 'I am Moroccan. / My nationality is Moroccan.'] }],
    ] },
    { t: 'bar', title: "What do you do? What's your job?" },
    { t: 'bullets', box: true, cols: 6, size: 11.5, items: ['a teacher', 'a doctor', 'a student', 'a salesman', 'a pilot', 'a nurse', 'a barber', 'a farmer', 'a taxi driver', 'an engineer', 'unemployed', 'a graphic designer'] },
    { t: 'row', widths: '1.3fr 70px 1fr', blocks: [
      [{ t: 'formula', cols: [['What is'], ['My', 'Your', 'His - Her'], ['job?']], note: 'للسؤال على المهنة ديالك' }],
      [{ t: 'art', icon: '👷', size: 62 }],
      [{ t: 'bullets', items: ['What is your job?', 'I am a dentist.', 'What do you do?', 'I am an engineer.'] }],
    ] },
    { t: 'bar', title: 'What is your marital status?' },
    { t: 'bullets', cols: 6, size: 11.5, items: ['Single', 'Engaged', 'Married', 'Divorced', 'Widowed', 'Separated'] },
    { t: 'bullets', box: true, cols: 3, size: 11.5, items: ['Are you single? → Yes, I am. / No, I am not.', 'Is he married? → Yes, he is. / No, he is not.', 'Is she divorced? → Yes, she is. / No, she is not.'] },
    { t: 'talk', cols: 2, size: 11.5, lines: lines(`
      Hamza: Hello, my name is Hamza. And you?
      Sara: My name is Sara. Where are you from?
      Hamza: I am from Morocco. And you? Where are you from? What is your nationality?
      Sara: I am from Spain. My nationality is Spanish.
      Hamza: What is your job?
      Sara: I am a nurse. And you?
      Hamza: I am a barber.
      Sara: Are you married?
      Hamza: No, I'm not. I'm single. And you?
      Sara: I'm married and I have two kids.
      Hamza: Nice to meet you.
      Sara: Nice to meet you too.`) },
  ] },

  /* ── 04 ─────────────────────────────────────────────────────────── */
  { n: 4, titleAr: 'محادثة شاملة (الدروس 1–3)', blocks: [
    { t: 'gap', h: 6 },
    { t: 'talk', full: 'Full Conversation - Lessons 01, 02 & 03', art: '🗣️', size: 13.5, lines: lines(`
      Hamza: Hello! My name is Hamza. What's your name?
      Sara: Hi Hamza. My name is Sara. Nice to meet you.
      Hamza: Nice to meet you too. How are you?
      Sara: I'm fine, thank you. And you?
      Hamza: I'm good. Where are you from?
      Sara: I'm from Spain. And you? Where are you from?
      Hamza: I'm from Morocco.
      Sara: What is your nationality?
      Hamza: I'm Moroccan. And you?
      Sara: I'm Spanish.
      Hamza: What's your job?
      Sara: I'm a nurse. And you?
      Hamza: I'm a barber.
      Sara: How do you spell your name?
      Hamza: I spell it H-A-M-Z-A. And you?
      Sara: I spell it S-A-R-A.
      Hamza: How old are you?
      Sara: I am 27 years old. And you?
      Hamza: I'm 31 years old.
      Sara: Are you married?
      Hamza: Yes, I am married and I have two kids. What about you?
      Sara: No, I'm not. I'm single.
      Hamza: What's your phone number?
      Sara: My phone number is 0610000067. And yours?
      Hamza: It's 07654321324.
      Sara: Thank you. See you later.
      Hamza: Goodbye! Have a good day!`) },
  ] },

  /* ── 05 ─────────────────────────────────────────────────────────── */
  { n: 5, titleAr: 'شجرة العائلة ووصف الأشخاص', blocks: [
    { t: 'family' },
    { t: 'bar', title: '"Who Is He/She to You?" – Asking About Family Relationships.' },
    { t: 'row', widths: '1.25fr 1fr', blocks: [
      [
        { t: 'formula', over: ['من / شكون', 'يكون', 'الشخص الأول', 'بالنسبة', 'الشخص الثاني؟'], cols: [['Who'], ['is'], ['Person 1'], ['to'], ['Person 2?']] },
        { t: 'formula', cols: [['Who'], ['is'], ['Ahmed'], ['to'], ['Safiya?']], note: 'السؤال' },
        { t: 'formula', over: ['الشخص الأول', 'يكون', 'الشخص الثاني', 'اسم العلاقة بينهما'], cols: [['Person 1'], ['is'], ["Person 2's"], ['relative']] },
        { t: 'formula', cols: [['Ahmed'], ['is'], ["Safiya's"], ['son']], note: 'الجواب' },
      ],
      [{ t: 'bullets', heading: 'examples', items: ['Who is Adil to Maysoun?', "Adil is Maysoun's husband.", 'Who is Issrae to Adil?', "Issrae is Adil's daughter.", 'Who is Abdurrahman to Ahmed?', "Abdurrahman is Ahmed's father."] }],
    ] },
    { t: 'bar', title: 'Vocabulary for Describing People – المفردات لوصف الأشخاص' },
    { t: 'row', widths: '1fr 1fr 1.2fr', blocks: [
      [{ t: 'callout', text: 'APPEARANCE - المظهر' }, { t: 'pairs', cols: 1, size: 12, items: [['Tall - Short', ''], ['Thin - Fat', ''], ['Strong - Weak', ''], ['Handsome - Ugly', ''], ['Beautiful - Ugly', ''], ['Old - Young', '']] }],
      [{ t: 'callout', text: 'PERSONALITY - الشخصية' }, { t: 'pairs', cols: 1, size: 12, items: [['Friendly # Rude', ''], ['Funny # Serious', ''], ['Smart # Stupid', ''], ['Generous - Mean', ''], ['Shy - Outgoing', ''], ['Honest - Dishonest', '']] }],
      [{ t: 'bullets', heading: 'examples', items: ['My brother is tall and smart.', 'My daughter is serious and strong.', 'My parents are generous.', 'My nephew is friendly.', 'My cousin is rude and fat.', 'My brother Zaid is outgoing.'] }],
    ] },
  ] },

  /* ── 06 ─────────────────────────────────────────────────────────── */
  { n: 6, titleAr: 'عرّف بنفسك وأسئلة Wh', blocks: [
    { t: 'banner', title: 'Introductions & Wh-Questions', icons: ['', '🏡'] },
    { t: 'text', label: 'Introduce yourself - قدم نفسك', body: 'Hello, my name is Hamza. I am 28 years old. I am from Morocco. I live in Oued Zem city. I am an English teacher. I teach students online and at a language school. I am not single. I live with my parents, my wife and my 3 kids.' },
    { t: 'text', label: 'Introducing someone - تقديم شخص آخر', body: 'This is my friend. His/Her name is (Ali / Salma). He/She is from Egypt. He/She lives in Cairo. He/She is 18 years old. He/She is not married; he/she is single. (Ali / Salma) is a (nurse / lawyer). He/She lives with his/her family. He/She likes to read a book before bed.' },
    { t: 'bar', title: '"How to Ask WH- Questions Easily" - كيف تطرح أسئلة بسهولة' },
    { t: 'chips', items: [['WHEN', 'متى؟ إيمتا؟'], ['WHAT', 'ماذا؟ اشنو؟'], ['WHY', 'لماذا؟ علاش؟'], ['WHERE', 'أين؟ فين؟'], ['HOW', 'كيف؟ كفاش؟'], ['WHO', 'من؟ شكون؟'], ['HOW OLD', 'كم عمر؟']] },
    { t: 'boxes', cols: 3, items: [
      { title: 'WHEN', lines: ['When is your birthday?', 'When do you go to school?', 'When does she wake up?'] },
      { title: 'WHERE', lines: ['Where is your school?', 'Where do you live?', 'Where does she live?'] },
      { title: 'WHY', lines: ['Why are you here?', 'Why do you live here?', 'Why do you like English?'] },
      { title: 'HOW', lines: ['How are you?', 'How do you cook pizza?', 'How does she learn English?'] },
      { title: 'WHO', lines: ['Who is your friend?', 'Who do you play with?', 'Who does she love?'] },
      { title: 'WHAT', lines: ["What's your name?", 'What do you like to eat?', 'What does he love?'] },
    ] },
    { t: 'talk', cols: 2, art: '🎯', size: 11.5, lines: lines(`
      Omar: What's your name?
      Fatima: My name is Fatima.
      Omar: Where are you from?
      Fatima: I'm from Rabat.
      Omar: How old are you?
      Fatima: I'm 22 years old.
      Omar: What do you do?
      Fatima: I'm a teacher. What about you?
      Omar: I'm a driver. Where do you work?
      Fatima: I work at a school in Rabat.
      Omar: What does your brother do?
      Fatima: He is a mechanic. He works in Casablanca.
      Omar: Is he married?
      Fatima: No, he isn't. He's single.
      Omar: What time do you wake up?
      Fatima: I wake up at 6 o'clock.
      Omar: How is your family?
      Fatima: They're good, thank you! I have to go now, see you later.
      Omar: Goodbye.`) },
  ] },

  /* ── 07 ─────────────────────────────────────────────────────────── */
  { n: 7, titleAr: 'تعليم القراءة', blocks: [
    { t: 'gap', h: 6 },
    { t: 'bar', title: 'Reading passage' },
    { t: 'text', label: 'Subject I', size: 15, body: 'My name is Zaid. I am 39 years old. I am from Morocco. I live in Oued Zem city. I am a teacher. I always wake up at 7:00 AM. I wash my face, brush my teeth, and get dressed. I drink a cup of tea. After that, I go to work. I work at a primary school (USA). I teach Maths. After work, I go home. At home, I am with my family. I am married, and I have two kids. In the evening, we eat dinner together. We talk and watch TV. I like to read a book before bed. I go to sleep at 10 PM and get ready for the next day.' },
    { t: 'text', label: 'Subject He', size: 15, body: 'His name is Zaid. He is 39 years old. He is from Morocco. He lives in Oued Zem city. He is a teacher. He always wakes up at 7:00 AM. He washes his face, brushes his teeth, and gets dressed. He drinks a cup of tea. After that, he goes to work. He works at a primary school (USA). He teaches Maths. After work, he goes home. At home, he is with his family. He is married, and he has two kids. In the evening, they eat dinner together. They talk and watch TV. He likes to read a book before bed. He goes to sleep at 10 PM and gets ready for the next day.' },
    { t: 'text', label: 'Subject She', size: 15, body: 'Her name is Diae. She is 27 years old. She is from Morocco. She lives in Rabat city. She is a teacher. She always wakes up at 7:00 AM. She washes her face, brushes her teeth, and gets dressed. She drinks a cup of coffee. After that, she goes to work. She works at an elementary school (UK). She teaches English. After work, she goes home. At home, she is with her family. She is single. She lives with her parents and two brothers. In the evening, they eat dinner together. They talk and watch TV. She likes to read a novel before bed. She goes to sleep at 10 PM and gets ready for the next day.' },
  ] },

  /* ── 08 ─────────────────────────────────────────────────────────── */
  { n: 8, titleAr: 'مصطلحات القسم + عبارات مهمة', blocks: [
    { t: 'banner', title: 'Classroom Vocabulary & Commands', icons: ['🎯', '📚'] },
    { t: 'pairs', cols: 7, arTop: true, size: 12, items: [
      ['Teacher', 'أستاذ'], ['Students', 'طلاب - تلاميذ'], ['School', 'مدرسة'], ['School bag', 'حقيبة مدرسية'], ['Table', 'طاولة'], ['Notebook', 'دفتر ملاحظات'], ['Classroom', 'القسم'],
      ['Ruler', 'مسطرة'], ['Eraser', 'ممحاة'], ['Locker', 'خزانة'], ['Board', 'سبورة'], ['Pencil case', 'مقلمة (تروس)'], ['Pencil', 'قلم رصاص'], ['Pen', 'قلم'],
      ['Desk', 'مكتب'], ['Test', 'اختبار'], ['Exam', 'امتحان'], ['Highlighter', 'قلم تمييز'], ['Chairs', 'كراسي'], ['Homework', 'واجب منزلي'], ['Lesson', 'درس'],
    ] },
    { t: 'bar', title: 'Common phrases - عبارات شائعة' },
    { t: 'row', widths: '150px 1fr', blocks: [
      [{ t: 'art', icon: '🧑‍🏫', size: 120 }],
      [
        { t: 'callout', text: 'جمل خاصة فقط بالتلميذ' },
        { t: 'bullets', box: true, size: 12, items: [
          'Can you repeat, please? - هل يمكنك أن تعيد، من فضلك؟', "I don't understand. - لم أفهم - مفهمتش", 'Can I go to the bathroom? - هل يمكنني الذهاب إلى الحمام؟',
          'I finished. - أنهيت', 'What page, please? - أي صفحة، من فضلك؟', 'I forgot my book. - نسيت كتابي.', 'Excuse me, I have a question. - عذرًا، لدي سؤال.',
        ] },
        { t: 'callout', text: 'جمل خاصة فقط بالمدرس' },
        { t: 'bullets', box: true, size: 12, items: [
          'Listen / Read / Stop / Again. - استمع / اقرأ / توقف / مرة أخرى.', 'Repeat after me. - كرروا ورائي.', 'Open your book. - افتحوا كتابكم.',
          'Focus, everyone. - ركّزوا جميعًا.', "Time's up. - انتهى الوقت.", 'Raise your hand. - ارفعوا أيديكم.',
        ] },
      ],
    ] },
    { t: 'talk', cols: 2, size: 11.5, lines: lines(`
      Teacher: Good morning, everyone!
      Students: Good morning, teacher!
      Teacher: Open your books, please.
      Student 1 (Ali): What page, teacher?
      Teacher: Page 5.
      Teacher: Now, listen and repeat after me.
      Teacher: "Hello, my name is Anna."
      Students: Hello, my name is Anna.
      Student 2 (Sara): Teacher, I don't understand.
      Teacher: No problem, Sara. I will repeat.
      Teacher: "Hello, my name is Anna."
      Sara: Hello, my name is Anna.
      Teacher: Good job!
      Student 1 (Ali): Can I go to the toilet?
      Teacher: Yes, you can. Be quick.
      Teacher: Now, read this sentence, please.
      Student 3 (Omar): "I am from Morocco."
      Teacher: Very good, Omar!
      Student 2 (Sara): I finished.
      Teacher: Excellent!`) },
  ] },

  /* ── 09 ─────────────────────────────────────────────────────────── */
  { n: 9, titleAr: 'الأفعال والضمائر = جمل بسيطة', blocks: [
    { t: 'banner', title: 'Verbs and Pronouns = Simple Sentences' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [
        { t: 'grid', boxed: true, title: 'Subject pronouns - الضمائر الشخصية', rows: [
          { dark: true, cells: ['I', 'You', 'He', 'She', 'It', 'We', 'You', 'They'] },
          { cells: ['أنا', 'أنتَ', 'هو', 'هي', 'للجماد', 'نحن', 'أنتم', 'هم'], size: 11 },
        ] },
        ...(['go', 'do', 'have', 'be'] as const).map((v): Block => ({ t: 'grid', boxed: true, title: `★★★★★  "The verb to ${v}"  ★★★★★`, rows: [
          { dark: true, cells: ['I', 'You', 'He', 'She', 'It', 'We', 'You', 'They'] },
          { cells: v === 'be' ? ['am', 'are', 'is', 'is', 'is', 'are', 'are', 'are'] : v === 'have' ? ['have', 'have', 'has', 'has', 'has', 'have', 'have', 'have'] : [v, v, `${v}es`, `${v}es`, `${v}es`, v, v, v], size: 11 },
        ] })),
      ],
      [
        { t: 'grid', boxed: true, title: 'كلمات صغار ومهمين بزاف باش الجملة تكون مفهومة.', rows: [
          { dark: true, cells: ['to', 'in', 'because', 'without'] }, { cells: ['إلى - أن - لكي', 'في', 'لأن - حيتاش', 'بدون'], size: 11 },
          { dark: true, cells: ['after', 'before', 'but', 'or'] }, { cells: ['بعد', 'قبل', 'لكن', 'أو'], size: 11 },
          { dark: true, cells: ['and', 'between', 'if', 'with'] }, { cells: ['و', 'بين', 'لو - إذا', 'مع - بـ'], size: 11 },
        ] },
        { t: 'bullets', box: true, heading: 'Examples 🔎', size: 11.5, items: [
          'I am in class - أنا فالقسم', 'She goes to work - هي كتمشي للخدمة', 'We have two kids - عندنا جوج ديال لولاد', 'He is a nurse - هو ممرض',
          'They go before lunch - كيمشيو قبل الغداء', 'You have a book - عندك كتاب', 'She does the job - هي كتدير الخدمة', 'I go without food - كنمشي بلا ماكلة',
          'He is between jobs - هو بين جوج خدمات (عاطل مؤقتًا)', 'If you do well - إلى درتي مزيان',
        ] },
      ],
    ] },
    { t: 'talk', cols: 2, size: 11, lines: lines(`
      Sara: Hello! What's your name?
      Youssef: Hi! My name is Youssef. And you?
      Sara: I'm Sara. Nice to meet you.
      Youssef: Nice to meet you too. Where are you from?
      Sara: I'm from Fez. What about you?
      Youssef: I'm from Agadir, but I live in Casablanca now.
      Sara: Oh, do you live with your family?
      Youssef: Yes, I do. I live with my parents and my sister.
      Sara: Me too! I live with my parents. Do you study or work?
      Youssef: I study. I go to school every day. And you?
      Sara: I study too. I have English class on Monday and Wednesday.
      Youssef: That's great. I have English class on Saturday. Do you like it?
      Sara: Yes, I do. It's fun. Do you have homework today?
      Youssef: No, I don't. I finished it yesterday. What do you do after school?
      Sara: I go home, eat lunch, and then study. Sometimes I watch TV.
      Youssef: I play football with my friends after school.
      Sara: Do you play every day?
      Youssef: Not every day. I play on Tuesday and Thursday.
      Sara: That's cool. Do you want to study together tomorrow?
      Youssef: Sure! Let's meet at the café at 5.
      Sara: Perfect. See you then!
      Youssef: See you, Sara!`) },
  ] },

  /* ── 10 ─────────────────────────────────────────────────────────── */
  { n: 10, titleAr: 'أثاث المنزل وحروف الجر', blocks: [
    { t: 'banner', title: 'House Furniture - أثاث المنزل 🛋️' },
    { t: 'cards', items: [
      ['🛏️', 'Bed', 'سرير'], ['🗄️', 'Dresser', 'كومود'], ['🛌', 'Pillow', 'وسادة'], ['🧣', 'Blanket', 'بطانية'],
      ['🚪', 'Wardrobe', 'خزانة ملابس'], ['🪞', 'Mirror', 'مرآة'], ['💡', 'Lamp', 'مصباح'], ['🪑', 'Chair', 'كرسي'],
      ['🛋️', 'Sofa - couch', 'أريكة'], ['🍽️', 'Table', 'طاولة'], ['🧶', 'Carpet', 'سجادة'], ['🔥', 'Stove', 'موقد'],
      ['🫧', 'Dishwasher', 'غسالة الصحون'], ['🧊', 'Fridge', 'ثلاجة'], ['📺', 'Television', 'تلفاز'], ['🧺', 'Washing machine', 'غسالة'],
    ] },
    { t: 'bar', title: 'Prepositions' },
    { t: 'preps', items: [['behind', 'Behind', 'خلف - وراء'], ['on', 'On', 'على'], ['between', 'Between', 'بين'], ['under', 'Under', 'تحت'], ['front', 'In front of', 'أمام'], ['next', 'Next to', 'بجانب']] },
    { t: 'bar', title: 'Examples' },
    { t: 'row', widths: '1fr 300px', blocks: [
      [{ t: 'bullets', size: 12.5, items: [
        'Where is the pillow?', 'The pillow is on the bed.', 'Where is the bed?', 'The bed is in the bedroom.', 'Where is the lamp?', 'The lamp is between the plant and the bed.', 'Where is the carpet?',
        'The carpet is under the bed.', 'Where is the window?', 'The window is behind the dresser.', 'Where is the dresser?', 'The dresser is in front of the window.', 'Where is the lamp?', 'The lamp is next to the bed.',
      ] }],
      [{ t: 'art', icon: '🛏️', size: 190 }],
    ] },
  ] },

  /* ── 11 ─────────────────────────────────────────────────────────── */
  { n: 11, titleAr: 'الأنشطة اليومية + الساعة', blocks: [
    { t: 'banner', title: 'Daily activities - الأنشطة اليومية ⏰' },
    { t: 'cards', items: [
      ['🙆', 'Wake up', 'أستيقظ'], ['🧼', 'Wash my face', 'أغسل وجهي'], ['🪥', 'Brush my teeth', 'أفرّش أسناني'], ['🍳', 'Have my breakfast', 'أتناول فطوري'],
      ['🛏️', 'Make my bed', 'أرتّب سريري'], ['👔', 'Get dressed', 'أرتدي ملابسي'], ['💄', 'Put on my makeup', 'أضع مكياجي'], ['🚿', 'Take a shower', 'آخذ حمّامًا'],
      ['💼', 'Go to work', 'أذهب إلى العمل'], ['🎒', 'Go to school', 'أذهب إلى المدرسة'], ['🚶', 'Leave work', 'أغادر العمل'], ['🏠', 'Go back home', 'أرجع إلى المنزل'],
      ['🍽️', 'Have lunch / dinner', 'أتناول الغداء / العشاء'], ['📺', 'Watch TV', 'أشاهد التلفاز'], ['📖', 'Do my homework', 'أقوم بواجباتي المنزلية'], ['😴', 'Go to sleep', 'أذهب إلى النوم'],
    ] },
    { t: 'bar', title: 'Telling the time - Asking about time.' },
    { t: 'clocks', times: ['1:30', '6:25', '2:00', '9:00', '6:05', '6:00', '3:00', '8:30'] },
    { t: 'row', widths: '1.1fr 90px 1.4fr', blocks: [
      [{ t: 'grid', rows: [{ cells: ["What time is it? - What's the time?"], size: 11.5 }] }],
      [{ t: 'grid', rows: [{ dark: true, cells: ["It's 7:30"], size: 11.5 }] }],
      [{ t: 'grid', rows: [{ dark: true, cells: ['تقرأ بنفس الطريقة باللغة العربية: 7 و 30 ثلاثون دقيقة'], size: 11 }] }],
    ] },
    { t: 'talk', cols: 2, art: '🧑‍💼', size: 11.5, lines: lines(`
      Sara: Hi Nabil. What time do you wake up?
      Nabil: I wake up at 6:00.
      Sara: Do you make your bed?
      Nabil: Yes, I do. I make my bed, then I brush my teeth.
      Sara: What do you do next?
      Nabil: I wash my face and get dressed.
      Sara: Nice! What time do you go to work?
      Nabil: I go to work at 8:30.
      Sara: Where is your work bag?
      Nabil: It's on the chair, next to the sofa.
      Sara: And what time do you go back home?
      Nabil: At 5:00. I take a shower, have dinner, then watch TV.
      Sara: Where is your TV?
      Nabil: It's in the living room, in front of the sofa.
      Sara: What time do you go to sleep?
      Nabil: At 10:00. And you?
      Sara: Me too! See you later, Nabil.
      Nabil: Goodbye, Sara.`) },
  ] },

  /* ── 12 ─────────────────────────────────────────────────────────── */
  { n: 12, titleAr: 'أيام الأسبوع + تكوين جمل', blocks: [
    { t: 'banner', title: 'The days of the week - أيام الأسبوع' },
    { t: 'grid', boxed: true, rows: [
      { dark: true, cells: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      { cells: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'] },
      { plain: true, span: [5, 2], cells: ['◀─── The Week Days - من الإثنين إلى الجمعة تسمى أيام العمل ───▶', '◀─ WeekEnd - نهاية الأسبوع ─▶'], size: 10.5 },
    ] },
    { t: 'bar', title: 'Adverbs of Frequency' },
    { t: 'grid', rows: [
      { dark: true, cells: ['always', 'usually', 'often', 'sometimes', 'rarely', 'never'] },
      { cells: ['100%', '80-90%', '70%', '50%', '10-20%', '0%'] },
      { dark: true, cells: ['دائمًا', 'عادةً', 'غالبًا', 'أحيانًا', 'نادرًا', 'أبدًا'] },
    ] },
    { t: 'bar', title: 'Sentence structure - كيفية صياغة الجملة' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [
        { t: 'grid', rows: [{ cells: ['subject', 'Adverb', 'verb'], size: 11 }] },
        { t: 'grid', rows: [{ dark: true, cells: ['I always play football with my friends on Monday.'], size: 11 }, { dark: true, cells: ['I often visit my grandmother on Thursday.'], size: 11 }] },
        { t: 'grid', rows: [{ cells: ['subject', 'Verb to "Be"', 'Adverb'], size: 11 }] },
        { t: 'grid', rows: [{ dark: true, cells: ['I am always happy when I meet my friend on Sunday.'], size: 11 }] },
      ],
      [
        { t: 'callout', text: 'يأتي الـ Adverb ثانيًا بعد الضمير مع جميع الأفعال، إلا الفعل To Be' },
        { t: 'bullets', box: true, tick: true, size: 11.5, items: ['أيام الأسبوع في اللغة الإنجليزية تبدأ دائمًا بحرف كبير (Capital Letter).', 'عندما نتكلم عن شيء يحدث في يوم معيّن، نستخدم حرف الجر "on" قبل اليوم.'] },
        { t: 'callout', text: 'مع الفعل To Be يأتي الـ Adverb بعد الفعل' },
        { t: 'bullets', box: true, tick: true, size: 11.5, items: ['عند استعمال الفعل "To Be" يأتي "Adverb" بعد الفعل.'] },
      ],
    ] },
    { t: 'talk', title: 'Talking About the Week', size: 12, aside: [{ t: 'art', icon: '🧑‍🤝‍🧑', size: 100 }, { t: 'sticky', text: 'نتائج سريعة = ممارسة وتدريب يومي' }], lines: lines(`
        Hana: What do you do on Monday?
        Yassine: I always go to school on Monday.
        Hana: Do you study on Friday?
        Yassine: No, I never study on Friday.
        Hana: When do you visit your grandmother?
        Yassine: I usually visit her on Saturday.
        Hana: What do you do on Sunday?
        Yassine: Sometimes I play football with my friends.
        Hana: Do you have English class on Tuesday?
        Yassine: Yes, I do. It's at 10:00.
        Hana: Nice! I have English on Thursday.
        Yassine: Great! See you next week!`) },
  ] },

  /* ── 13 ─────────────────────────────────────────────────────────── */
  { n: 13, titleAr: 'الطعام الذي أحبه', blocks: [
    { t: 'banner', title: 'The Food I like - الطعام الذي أحبه' },
    { t: 'cards', items: [
      ['🧀', 'Cheese', 'جبن'], ['🍜', 'Noodles', 'معكرونة'], ['🍕', 'Pizza', 'بيتزا'], ['🍗', 'Roast chicken', 'دجاج مشوي'],
      ['🥩', 'Steak', 'شريحة لحم'], ['🐟', 'Fish', 'سمك'], ['🍳', 'Omelette', 'أومليت'], ['🍖', 'Barbecue', 'شواء / مشوي'],
      ['🎂', 'Cake', 'كعكة / طورطة'], ['🍿', 'Popcorn', 'فشار'], ['🥔', 'Potato chips', 'رقائق البطاطس'], ['🍞', 'Bread', 'خبز'],
      ['🍦', 'Ice cream', 'مثلجات / آيس كريم'], ['🥪', 'Sandwich', 'ساندويتش'], ['🌮', 'Tacos', 'تاكوس'], ['🥗', 'Salad', 'سلطة'],
    ] },
    { t: 'bar', title: "What do you like? & What you don't like?" },
    { t: 'qa', rows: [['What food do you like?', 'I like roast chicken and salad.'], ['What do you like to eat?', 'I like to eat tacos.'], ['Do you like chicken pizza? 🙂', 'Yes, I do.'], ['Do you like chicken sandwiches? 🙁', "No, I don't."]] },
    { t: 'talk', title: 'What Food Do You Like?', art: '🍽️', size: 12.5, lines: lines(`
      Lina: Hello Adam, how are you today?
      Adam: I'm fine, thank you. And you?
      Lina: I'm good. What food do you like?
      Adam: I like couscous and grilled fish. And you?
      Lina: I like roast chicken and rice.
      Adam: Do you like salad?
      Lina: Yes, I do. I eat it every day. Do you like soup?
      Adam: No, I don't.
      Lina: What do you like to eat for lunch?
      Adam: I like to eat tacos or pasta.
      Lina: Where do you eat lunch?
      Adam: At home, with my family.
      Lina: Great! See you later.
      Adam: See you, Lina.`) },
  ] },

  /* ── 14 ─────────────────────────────────────────────────────────── */
  { n: 14, titleAr: 'المشروب الذي أحبه', blocks: [
    { t: 'banner', title: 'The drink I like - المشروب الذي أحبه' },
    { t: 'cards', items: [
      ['💧', 'Water', 'الماء'], ['🥛', 'Milk', 'الحليب'], ['🍊', 'Orange juice', 'عصير البرتقال'], ['🍵', 'Tea', 'الشاي'],
      ['☕', 'Coffee', 'القهوة'], ['🍋', 'Lemon juice', 'عصير الليمون'], ['🥤', 'Soda', 'المشروبات الغازية'], ['🍫', 'Hot chocolate', 'شوكولاتة ساخنة'],
      ['⚡', 'Energy drink', 'مشروب طاقة'], ['🍹', 'Lemonade', 'ليموناضة'], ['🧋', 'Chocolate milk', 'حليب بالشوكولاتة'], ['🫧', 'Sparkling water', 'ماء غازي'],
      ['🍶', 'Mineral water', 'ماء معدني'], ['🥤', 'Milkshake', 'الحليب المخفوق'], ['🌿', 'Herbal tea', 'شاي الأعشاب'], ['🫚', 'Ginger tea', 'شاي بالزنجبيل'],
    ] },
    { t: 'bar', title: "What do you like? & What you don't like?" },
    { t: 'qa', rows: [['What drink do you like?', 'I like mint tea and orange juice.'], ['What is your favourite (favorite) drink?', 'My favourite drink is chocolate milk.'], ['When do you drink tea?', 'I drink tea every day in the (morning, afternoon, evening).'], ["What drink don't you like?", "I don't like ginger tea."]] },
    { t: 'talk', title: 'What Do You Like to Drink?', art: '🥤', size: 11.5, lines: lines(`
      Adam: Hi, Rania!
      Rania: Hello, Adam! How are you today?
      Adam: I'm great, thanks. What about you?
      Rania: I'm good. What do you like to eat for lunch?
      Adam: I like roast chicken and rice. And you?
      Rania: I like pasta and salad. Do you like pizza?
      Adam: Yes, I do! I love chicken pizza. What drink do you like?
      Rania: I like orange juice and cold water. What about you?
      Adam: I usually drink tea in the morning and juice in the afternoon.
      Rania: Nice! Do you like coffee?
      Adam: No, I don't like coffee. It's too bitter for me.
      Rania: I understand. I drink coffee sometimes, but I prefer milk or milkshake.
      Adam: What food don't you like?
      Rania: I don't like fish. And you?
      Adam: I don't like spicy food. I eat without hot sauce.
      Rania: Good to know! Let's eat together one day.
      Adam: Sure! See you later.
      Rania: Bye!`) },
  ] },

  /* ── 15 ─────────────────────────────────────────────────────────── */
  { n: 15, titleAr: 'وسائل النقل + الإشارة', blocks: [
    { t: 'banner', title: 'Means of Transport' },
    { t: 'cards', items: [
      ['🚲', 'Bicycle', 'دراجة هوائية'], ['🏍️', 'Motorcycle', 'دراجة نارية'], ['🚗', 'Car', 'سيارة'], ['🚌', 'Bus', 'حافلة'],
      ['🚕', 'Taxi', 'طاكسي'], ['🚚', 'Truck / Lorry', 'شاحنة'], ['🚆', 'Train', 'قطار'], ['🚇', 'Subway / Metro', 'مترو الأنفاق'],
      ['✈️', 'Airplane', 'طائرة'], ['🚢', 'Ship', 'سفينة'], ['🚤', 'Boat', 'قارب'], ['⛴️', 'Ferry', 'عبّارة'],
      ['🚡', 'Cable car', 'عربة معلّقة'], ['🚐', 'Van', 'شاحنة صغيرة - فان'], ['🛹', 'Skateboard', 'لوح تزلج'], ['🚊', 'Tram', 'الترام'],
    ] },
    { t: 'bar', title: 'This - That & These - Those' },
    { t: 'pointing', items: [
      { far: false, many: false, caption: 'تستخدم "This" للإشارة لشيء مفرد وقريب', en: 'This is a car', ar: 'هذه سيارة' },
      { far: true, many: false, caption: 'تستخدم "That" للإشارة لشيء مفرد وبعيد', en: 'That is a car', ar: 'تلك سيارة' },
      { far: true, many: true, caption: 'تستخدم "Those" للإشارة لجمع بعيد', en: 'Those are cars', ar: 'تلك سيارات' },
      { far: false, many: true, caption: 'تستخدم "These" للإشارة لجمع قريب', en: 'These are cars', ar: 'هذه سيارات' },
    ] },
    { t: 'qa', rows: [['What is this?', 'This is a house.', 'ما هذا؟', 'هذا منزل.'], ['What is that?', 'That is a ball.', 'ماذا تكون تلك؟', 'تلك كرة.'], ['What are these?', 'These are books.', 'ماذا تكون هاته؟', 'هاته كتب.'], ['What are those?', 'Those are chairs.', 'ما تلك؟', 'تلك كراسي.']] },
    { t: 'talk', title: 'What is that / this?', cols: 2, art: '🚕', size: 11.5, lines: lines(`
      Salma: Hello Adam, how are you today?
      Adam: I'm fine, thank you! And you?
      Salma: I'm good. What is this?
      Adam: This is my bike.
      Salma: Is that your taxi?
      Adam: No, that is my father's taxi.
      Salma: Are these your keys?
      Adam: Yes, these are mine.
      Salma: And what are those?
      Adam: Those are buses. They go to the city.
      Salma: How do you go to school?
      Adam: I go by tram. What about you?
      Salma: I go by bus or I walk.
      Adam: Do you like trains?
      Salma: Yes, I do. But I don't like taxis.
      Adam: Me too. Look! This is my friend's scooter.
      Salma: Nice! I like scooters.`) },
  ] },

  /* ── 16 ─────────────────────────────────────────────────────────── */
  { n: 16, titleAr: 'الأماكن في المدينة + الاتجاهات', blocks: [
    { t: 'banner', title: 'Places Around Town' },
    { t: 'cards', items: [
      ['🏦', 'Bank', 'بنك'], ['🕌', 'Mosque', 'مسجد'], ['🏥', 'Hospital', 'مستشفى'], ['🥖', 'Bakery', 'مخبزة'],
      ['🛒', 'Supermarket', 'سوبرماركت'], ['🏫', 'School', 'مدرسة'], ['🌳', 'Park', 'حديقة'], ['💊', 'Pharmacy', 'صيدلية'],
      ['⛽', 'Gas station', 'محطة وقود'], ['🏤', 'Post office', 'مكتب بريد'], ['🚓', 'Police station', 'مركز شرطة'], ['🚏', 'Bus station', 'محطة حافلات'],
      ['📚', 'Library', 'مكتبة'], ['🏨', 'Hotel', 'فندق'], ['🎬', 'Cinema', 'سينما'], ['🧺', 'Laundry', 'مصبنة'],
    ] },
    { t: 'bar', title: 'Useful Phrases:', icon: '🗣️' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'cards', cols: 2, items: [['⬆️', 'Go straight', 'اذهب مباشرة'], ['🔄', 'At the roundabout', 'عند الدوار'], ['↪️', 'Turn right', 'انعطف لليمين'], ['🚦', 'At the traffic lights', 'عند إشارات المرور'], ['↩️', 'Turn left', 'انعطف لليسار'], ['🚸', 'Zebra crossing', 'ممر الراجلين']] }],
      [
        { t: 'callout', text: 'Important questions - أسئلة مهمة' },
        { t: 'grid', boxed: true, rows: [
          { dark: true, cells: ['Excuse me, can you tell me where the pharmacy is?'], size: 11 },
          { cells: ['Go straight at the traffic lights, then turn left.'], size: 11 },
          { dark: true, cells: ['عذرًا، هل يمكنك أن تخبرني أين الصيدلية؟'], size: 11 },
          { cells: ['اذهب مباشرة عند إشارة المرور، ثم انعطف يسارًا.'], size: 11 },
        ] },
        { t: 'grid', boxed: true, rows: [
          { dark: true, cells: ['Where is the nearest post office?'], size: 11 },
          { cells: ['Go straight, pass the park, turn right. The post office is next to the school.'], size: 10.5 },
          { dark: true, cells: ['أين أقرب مكتب بريد؟'], size: 11 },
          { cells: ['اذهب مباشرة، تجاوز الحديقة، ثم انعطف يمينًا. مكتب البريد بجوار المدرسة.'], size: 10.5 },
        ] },
      ],
    ] },
    { t: 'talk', title: 'Giving directions', art: '🧭', size: 12.5, lines: lines(`
      Ahmed: Excuse me!
      Mona: Yes?
      Ahmed: Can you help me, please?
      Mona: Sure!
      Ahmed: Where is the pharmacy?
      Mona: Go straight.
      Ahmed: Okay.
      Mona: Then turn right at the roundabout.
      Ahmed: Right at the roundabout. Got it.
      Mona: You'll see the bakery. The pharmacy is next to the bakery.
      Ahmed: Thank you!
      Mona: You're welcome.`) },
  ] },

  /* ── 17 ─────────────────────────────────────────────────────────── */
  { n: 17, titleAr: 'مرافق ومصطلحات + There is / are', blocks: [
    { t: 'banner', title: 'Facilities and Vocabulary' },
    { t: 'cards', items: [
      ['💊', 'Medicine', 'دواء'], ['📖', 'Quran', 'قرآن كريم'], ['💳', 'Credit card', 'بطاقة ائتمان'], ['🔥', 'Oven', 'فرن'],
      ['🧺', 'Shopping basket', 'سلة تسوق'], ['🧑‍🎓', 'Students', 'طلاب'], ['🪑', 'Bench', 'مقعد'], ['🏥', 'Pharmacy', 'صيدلية'],
      ['⛽', 'Fuel pump', 'مضخة وقود'], ['🛎️', 'Counter', 'شبّاك'], ['👮', 'Officer', 'ضابط'], ['🚌', 'Bus', 'حافلة'],
      ['📚', 'Books', 'كتب'], ['🛏️', 'Room', 'غرفة'], ['🎟️', 'Ticket', 'تذكرة'], ['👕', 'Clothes', 'ملابس'],
    ] },
    { t: 'bar', title: 'Useful Phrases: There is a / There are', icon: '🗣️' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [
        { t: 'pairs', cols: 2, size: 11.5, items: [['There is a / an', 'هناك'], ['There are many', 'هناك عدد كبير من (معدود)']] },
        { t: 'row', widths: '1fr 1fr', blocks: [[{ t: 'art', icon: '🚌', size: 54 }], [{ t: 'art', icon: '🛏️', size: 54 }]] },
        { t: 'pairs', cols: 2, size: 11, items: [['There are many buses here.', 'هناك العديد من الحافلات هنا.'], ['There is a room in the hotel.', 'هناك غرفة في الفندق.']] },
        { t: 'grid', rows: [{ dark: true, cells: ['many = العديد = جمع', 'There is = شيء واحد = مفرد'], size: 11 }] },
      ],
      [
        { t: 'callout', text: 'Important questions - أسئلة مهمة' },
        { t: 'grid', boxed: true, rows: [
          { dark: true, cells: ['How many buses are there at the bus station?'], size: 11 },
          { cells: ['There are five buses at the bus station.'], size: 11 },
          { dark: true, cells: ['كم عدد الحافلات في محطة الحافلات؟'], size: 11 },
          { cells: ['هناك خمس حافلات في محطة الحافلات.'], size: 11 },
        ] },
        { t: 'grid', boxed: true, rows: [
          { dark: true, cells: ['Is there a taxi station near here, next to the hotel?'], size: 11 },
          { cells: ['Yes, there is a taxi station next to the hotel, beside the library.'], size: 10.5 },
          { dark: true, cells: ['هل توجد محطة سيارات أجرة قريبة من هنا بجوار الفندق؟'], size: 11 },
          { cells: ['نعم، توجد محطة سيارات أجرة بجوار الفندق بجانب المكتبة.'], size: 10.5 },
        ] },
      ],
    ] },
    { t: 'talk', title: 'Asking About Places Around Town', art: '🚏', size: 12, lines: lines(`
      Omar: Hello. Can I ask you a question?
      Fatima: Sure.
      Omar: Is there a bus station near here?
      Fatima: Yes, there is. The bus station is next to the hotel.
      Omar: Great. How can I get there?
      Fatima: Go straight, then turn right. The hotel is on the left, and the bus station is next to it.
      Omar: Thank you! Are there many buses at the station?
      Fatima: Yes, there are many buses every day.
      Omar: That's perfect. Thanks for your help.
      Fatima: You're welcome!`) },
  ] },

  /* ── 18 ─────────────────────────────────────────────────────────── */
  { n: 18, titleAr: 'أفعال ومهن + أستطيع / لا أستطيع', blocks: [
    { t: 'banner', title: 'Jobs and Verbs' },
    { t: 'cards', items: [
      ['🍳', 'To cook', 'يطبخ'], ['🏊', 'To swim', 'يسبح'], ['📖', 'To read', 'يقرأ'], ['✍️', 'To write', 'يكتب'],
      ['🚗', 'To drive', 'يقود'], ['🚴', 'To ride', 'يركب'], ['⚽', 'To play', 'يلعب'], ['📦', 'To carry', 'يحمل'],
      ['🕊️', 'To fly', 'يطير'], ['🗣️', 'To speak', 'يتكلم / يتحدث'], ['🥤', 'To drink', 'يشرب'], ['🍽️', 'To eat', 'يأكل'],
      ['🥣', 'To mix', 'يخلط'], ['📚', 'To study', 'يدرس'], ['💼', 'To work', 'يعمل'], ['📺', 'To watch', 'يشاهد'],
    ] },
    { t: 'bar', title: 'Jobs', icon: '🗣️' },
    { t: 'cards', items: [
      ['🧑‍⚕️', 'a doctor', 'طبيب / طبيبة'], ['🚕', 'a driver', 'سائق'], ['🧑‍🍳', 'a cook', 'طباخ / طباخة'], ['🧑‍✈️', 'a pilot', 'طيّار'],
      ['🧹', 'a cleaner', 'عامل / عاملة نظافة'], ['🧑‍🏫', 'a teacher', 'معلم / معلمة'], ['🧑‍💼', 'a manager', 'مدير / مديرة'], ['⚖️', 'a lawyer / judge', 'محامٍ / قاضٍ'],
    ] },
    { t: 'bar', title: "Useful Phrases: I CAN / I CAN'T.", icon: '🗣️' },
    { t: 'pairs', cols: 4, size: 11, items: [
      ['A teacher can teach students.', 'المعلم يمكنه تعليم الطلاب.'], ["A cook can't help sick people.", 'الطباخ لا يمكنه مساعدة المرضى.'], ['Can you fly an airplane?', 'هل يمكنك قيادة طائرة؟'], ['Can he speak English?', 'هل يمكنه التحدث بالإنجليزية؟'],
      ['A driver can drive a bus or a taxi.', 'السائق يمكنه قيادة حافلة أو طاكسي.'], ["A cook can't work in a court.", 'الطباخ لا يمكنه العمل في المحكمة.'], ["No, I can't fly an airplane.", 'لا، لا يمكنني قيادة طائرة.'], ["No, he can't. He can speak Spanish.", 'لا، لا يمكنه. يمكنه التحدث بالإسبانية.'],
    ] },
    { t: 'talk', title: 'What Can You Do?', cols: 2, art: '💬', size: 11, lines: lines(`
      Lina: Hi Youssef! What do you do?
      Youssef: I'm a driver. I can drive a taxi and a bus.
      Lina: Nice! Can you ride a bike?
      Youssef: Yes, I can. I ride my bike every weekend. Can you ride a bike?
      Lina: No, I can't. But I can swim!
      Youssef: Great! I can't swim. I'm afraid of water.
      Lina: That's okay. My brother is a pilot. He can fly an airplane.
      Youssef: Wow! That's amazing. My sister is a teacher. She can speak three languages.
      Lina: Can she speak English?
      Youssef: Yes, she can. She teaches English and French.
      Lina: What about your mom?
      Youssef: She's a cook. She can cook delicious food. Can you cook?
      Lina: Yes, I can cook simple food. But I can't cook big meals like my mom.
      Youssef: Same here. I can make tea, but that's it!
      Lina: Haha, no problem. Everyone can do something!`) },
  ] },

  /* ── 19 ─────────────────────────────────────────────────────────── */
  { n: 19, titleAr: 'الهوايات + تصريف الفعل Like', blocks: [
    { t: 'banner', title: 'Hobbies and Free Time' },
    { t: 'cards', items: [
      ['🍳', 'Cooking', 'الطبخ'], ['⚽', 'Playing football', 'لعب كرة القدم'], ['📚', 'Reading books', 'قراءة الكتب'], ['🏊', 'Swimming', 'السباحة'],
      ['🔤', 'Learning English', 'تعلم الإنجليزية'], ['🏇', 'Riding horses', 'ركوب الخيل'], ['🧗', 'Climbing', 'التسلق'], ['🥾', 'Hiking', 'المشي لمسافات طويلة'],
      ['⛺', 'Camping', 'التخييم'], ['🎨', 'Drawing', 'الرسم'], ['🌍', 'Travelling', 'السفر'], ['🤝', 'Helping others', 'مساعدة الآخرين'],
      ['🏋️', 'Exercising', 'ممارسة الرياضة'], ['♟️', 'Playing chess', 'لعب الشطرنج'], ['🎮', 'Video games', 'ألعاب الفيديو'], ['🧁', 'Baking', 'خَبز الحلويات'],
    ] },
    { t: 'bar', title: 'Verbs Conjugation', icon: '🗣️' },
    { t: 'row', widths: '1fr 1fr 1fr', blocks: [
      [{ t: 'callout', text: 'Affirmative - إيجابي' }, { t: 'pairs', cols: 1, side: true, size: 11, items: [['I like', 'أنا أحب'], ['You like', 'أنت تحب'], ['He likes', 'هو يحب'], ['She likes', 'هي تحب'], ['It likes', 'هو يحب'], ['We like', 'نحن نحب'], ['You like', 'أنتم تحبون'], ['They like', 'هم يحبون']] }],
      [{ t: 'callout', text: 'Negative - النفي' }, { t: 'pairs', cols: 1, side: true, size: 11, items: [["I don't like", 'أنا لا أحب'], ["You don't like", 'أنت لا تحب'], ["He doesn't like", 'هو لا يحب'], ["She doesn't like", 'هي لا تحب'], ["It doesn't like", 'هو لا يحب'], ["We don't like", 'نحن لا نحب'], ["You don't like", 'أنتم لا تحبون'], ["They don't like", 'هم لا يحبون']] }],
      [{ t: 'callout', text: 'Question - سؤال' }, { t: 'pairs', cols: 1, side: true, size: 11, items: [['Do I like?', 'هل يعجبني؟'], ['Do you like?', 'هل يعجبك؟'], ['Does he like?', 'هل يعجبه؟'], ['Does she like?', 'هل يعجبها؟'], ['Does it like?', 'هل يعجبه؟'], ['Do we like?', 'هل يعجبنا؟'], ['Do you like?', 'هل يعجبكم؟'], ['Do they like?', 'هل يعجبهم؟']] }],
    ] },
    { t: 'callout', text: 'في هذا الجدول يمكن تغيير الفعل "Like" بأي فعل تريد أن تعبر به أو تسأل به.' },
    { t: 'talk', title: 'What Do You Like to Do?', art: '🧑‍🤝‍🧑', size: 11, lines: lines(`
      Lina: Hi Youssef! What do you do?
      Youssef: I'm a driver. I drive a taxi and a bus. What about you?
      Lina: I'm a student.
      Youssef: Do you like studying?
      Lina: Yes, I do. I like studying and helping my mom.
      Youssef: What do you like to do in your free time?
      Lina: I like hiking and drawing. Do you like hiking?
      Youssef: No, I don't. But I like reading and playing football.
      Lina: Does your brother like football?
      Youssef: Yes, he does. He plays every weekend.
      Lina: Can you cook?
      Youssef: A little. My sister cooks very well.
      Lina: Nice! I like baking with my mom.
      Youssef: That's great. Let's practise English together.
      Lina: Sure! See you later.
      Youssef: See you!`) },
  ] },
]
