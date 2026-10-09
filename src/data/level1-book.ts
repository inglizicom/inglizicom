/**
 * «الإنجليزية من الصفر (الدارجة)» — Level 1 (A0 → A1), the one-page-per-
 * lesson book first made in Canva, printed from /admin/level1-book.
 *
 * Every lesson is a list of blocks drawn top to bottom on one A4 page (see
 * app/admin/level1-book/_blocks.tsx). Edit a lesson here and the page, its
 * number and the contents follow; conversations are numbered across the
 * whole book automatically. Pictures are emoji: in colour, or grey in the
 * black-and-white print.
 *
 * The practice conversations are new for this colour edition; the Canva
 * book's own conversations are left for the workbook that will go with it.
 */

export type Pair = [en: string, ar: string]
export type FlagId = 'ma' | 'eg' | 'fr' | 'es' | 'sa' | 'dz' | 'it' | 'us' | 'tn' | 'gb' | 'de' | 'tr' | 'cn'

/** Who sits where in the family tree (lesson 5). Each is [face, role, name]. */
export interface FamilyPeople {
  grandpa: [string, string, string]; grandma: [string, string, string]
  aunt1: [string, string, string]; uncle1: [string, string, string]
  father: [string, string, string]; mother: [string, string, string]
  uncle2: [string, string, string]; aunt2: [string, string, string]
  cousins1: [[string, string, string], [string, string, string]]; cousins2: [[string, string, string], [string, string, string]]
  left: [[string, string, string], [string, string, string]]; me: [[string, string, string], [string, string, string]]; right: [[string, string, string], [string, string, string]]
  kidsLeft: [[string, string, string], [string, string, string]]; kidsMe: [[string, string, string], [string, string, string]]; kidsRight: [[string, string, string], [string, string, string]]
  notes: [string, string, string, string, string]
}

export type Block =
  /** A small bullet line on the right ("Teacher : …"). */
  | { t: 'note'; text: string }
  /** Black bar across the page: "• Greetings". */
  | { t: 'bar'; title: string; icon?: string }
  /** Centered black title box (the lesson's topic). */
  | { t: 'banner'; title: string; icons?: [string, string] }
  /** Bullets in columns, optionally inside a bordered box with a heading. */
  | { t: 'bullets'; items: string[]; cols?: number; box?: boolean; heading?: string; size?: number; tick?: boolean
      /** Starts a new section (and so takes the next colour). */
      section?: boolean }
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
  | { t: 'row'; widths: string; blocks: Block[][]
      /** Columns as tall as the tallest (boxes side by side end level); `section` starts a new section. */
      stretch?: boolean; section?: boolean }
  /** Picture word cards: emoji, English (black), Arabic (boxed). */
  | { t: 'cards'; items: [icon: string, en: string, ar: string][]; cols?: number; /** icon above the words, for narrow columns */ stack?: boolean }
  /** Word pairs as black/white labels (English on top unless `arTop`). */
  | { t: 'pairs'; items: Pair[]; cols: number; arTop?: boolean; side?: boolean; size?: number }
  /** Question → answer rows (white / black), with optional Arabic. */
  | { t: 'qa'; rows: [q: string, a: string, qAr?: string, aAr?: string][] }
  /** Small titled boxes of bullets (WHEN / WHERE …). */
  | { t: 'boxes'; items: { title: string; lines: string[] }[]; cols: number }
  /** A labelled paragraph ("Introduce yourself", "Subject He"). */
  | { t: 'text'; label: string; body: string; size?: number
      /** Several paragraphs ("\n") without margin numbers, as the Level 1 book's readings. */
      plain?: boolean }
  /** A grid of equal cells; dark rows are black with white text. */
  | { t: 'grid'; title?: string; rows: { cells: string[]; dark?: boolean; plain?: boolean; span?: number[]; size?: number }[]; boxed?: boolean }
  /** Chips with a caption above (WH words). */
  | { t: 'chips'; items: [label: string, above: string][] }
  /** A big grey picture. */
  | { t: 'art'; icon: string; size?: number }
  /** A yellow-paper sticky note. */
  | { t: 'sticky'; text: string }
  /** A tip / rule note (pale yellow, with a 💡). */
  | { t: 'callout'; text: string }
  /** A small coloured heading inside a section ("Appearance", "التلميذ يقول"). */
  | { t: 'sub'; text: string }
  /** A numbered exercise (numbered across the book; answers go to the keys).
   *  "___" in a question draws a blank; `options` are choices (a, b, c);
   *  `lines` adds a writing line under each item. */
  | { t: 'exercise'; title: string; instr?: string; items: ExerciseItem[]; cols?: 1 | 2; lines?: boolean; size?: number }
  /** Large picture tiles: a vocabulary page's words, each with its picture and meaning. */
  | { t: 'tiles'; items: [icon: string, en: string, ar: string][]; cols?: number
      /** A photograph per word (URL), in place of its picture; `start` numbers a continued list. */
      photos?: (string | null)[]; start?: number }
  /** Questions and their answers as a two-column phrasebook table (Arabic under each). */
  | { t: 'phrases'; rows: [q: string, a: string, qAr?: string, aAr?: string][]; heads?: [string, string]; start?: number }
  /** Question → answer exchanges as chat bubbles (Arabic under each). */
  | { t: 'chat'; rows: [q: string, a: string, qAr?: string, aAr?: string][]; cols?: 1 | 2 }
  /** A conversation as a script: "NAME: line", each speaker in their own colour. */
  | { t: 'script'; lines: string[]; size?: number
      /** Two columns, read down the first then the second (a medium-length conversation on one page). */
      cols?: 1 | 2 }
  /** Ruled lines to write on. */
  | { t: 'lines'; n: number
      /** On a `spread` page, more lines take the room left over (instead of a gap). */
      grow?: boolean }
  /** Questions for the student to answer about themselves, each with its own line. */
  | { t: 'answers'; items: string[] }
  /** Answer keys: one line per exercise ("Ex. 12 · p. 14"), its answers numbered inline. */
  | { t: 'key'; items: { label: string; answers: string[] }[] }
  /** Space. */
  | { t: 'gap'; h: number }
  /* ── one-off pictures ── */
  | { t: 'family'; vocab?: Pair[]; people?: FamilyPeople }
  | { t: 'preps'; items: [kind: 'behind' | 'on' | 'between' | 'under' | 'front' | 'next', en: string, ar: string][] }
  | { t: 'clocks'; times: string[] }
  | { t: 'pointing'; items: { far: boolean; many: boolean; caption: string; en: string; ar: string }[] }

export interface ExerciseItem { q: string; a: string; options?: string[] }

/** One page. `tag` replaces "Lesson NN" in the header ("Grammar 03"); `titleEn` names it in a contents list. */
export interface Lesson { n: number; titleAr: string; blocks: Block[]; tag?: string; titleEn?: string }

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
      Yassine: Good morning!
      Nora: Good morning! How are you?
      Yassine: I'm fine, thank you. And you?
      Nora: I'm very well. What's your name?
      Yassine: My name is Yassine. What's your name?
      Nora: My name is Nora.
      Yassine: Nice to meet you, Nora.
      Nora: Nice to meet you too.
      Yassine: Have a good day!
      Nora: You too. Bye!`) },
    { t: 'alphabet' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'bullets', items: ['How do you spell your name?'] }],
      [{ t: 'bullets', items: ["It's spelled (I spell it) H-A-M-Z-A"] }],
    ] },
    { t: 'talk', cols: 2, lines: lines(`
      Teacher: Good afternoon! What's your name?
      Student: My name is Rim.
      Teacher: How do you spell it?
      Student: R-I-M.
      Teacher: Thank you, Rim. And your family name?
      Student: Alaoui. I spell it A-L-A-O-U-I.
      Teacher: Great! How are you today?
      Student: I'm OK, thank you.
      Teacher: See you tomorrow, Rim.
      Student: See you tomorrow!`) },
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
      Salma: Hi Karim! How old are you?
      Karim: I'm 24 years old. And you?
      Salma: I'm 21. How old is your brother?
      Karim: He is 30 years old.
      Salma: What's your phone number?
      Karim: It's 0661 23 45 78.
      Salma: Can you say it again, please?
      Karim: Sure. 0661 23 45 78.
      Salma: Thank you!
      Karim: You're welcome. Bye!`) },
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
      Omar: Hello! I'm Omar. What's your name?
      Lucia: Hi Omar, I'm Lucia.
      Omar: Where are you from, Lucia?
      Lucia: I'm from Italy. I'm Italian. And you?
      Omar: I'm from Morocco. I'm Moroccan.
      Lucia: What do you do?
      Omar: I'm a taxi driver. What's your job?
      Lucia: I'm a graphic designer.
      Omar: Are you married?
      Lucia: No, I'm not. I'm engaged!
      Omar: Congratulations!
      Lucia: Thank you!`) },
  ] },

  /* ── 04 ─────────────────────────────────────────────────────────── */
  { n: 4, titleAr: 'محادثة شاملة (الدروس 1–3)', blocks: [
    { t: 'gap', h: 6 },
    { t: 'talk', full: 'Full Conversation - Lessons 01, 02 & 03', art: '🗣️', size: 13.5, lines: lines(`
      Youssef: Hi! My name is Youssef. What's your name?
      Emma: Hello Youssef. I'm Emma. Nice to meet you.
      Youssef: Nice to meet you too. How are you today?
      Emma: I'm very well, thank you. And you?
      Youssef: I'm fine. Where are you from, Emma?
      Emma: I'm from France. And you?
      Youssef: I'm from Morocco. I live in Fez.
      Emma: So you are Moroccan. I'm French.
      Youssef: How do you spell your name?
      Emma: E-M-M-A. And you?
      Youssef: Y-O-U-S-S-E-F.
      Emma: What do you do, Youssef?
      Youssef: I'm an engineer. What about you?
      Emma: I'm a teacher.
      Youssef: How old are you?
      Emma: I'm 29 years old. And you?
      Youssef: I'm 34.
      Emma: Are you married?
      Youssef: Yes, I am. I have a son and a daughter. And you?
      Emma: No, I'm single.
      Youssef: What's your phone number?
      Emma: It's 0612 44 87 20. And yours?
      Youssef: My number is 0700 15 63 91.
      Emma: Great. See you tomorrow!
      Youssef: See you! Have a good evening.
      Emma: You too. Goodbye!`) },
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
      [{ t: 'sub', text: 'APPEARANCE - المظهر' }, { t: 'pairs', cols: 1, size: 12, items: [['Tall - Short', ''], ['Thin - Fat', ''], ['Strong - Weak', ''], ['Handsome - Ugly', ''], ['Beautiful - Ugly', ''], ['Old - Young', '']] }],
      [{ t: 'sub', text: 'PERSONALITY - الشخصية' }, { t: 'pairs', cols: 1, size: 12, items: [['Friendly # Rude', ''], ['Funny # Serious', ''], ['Smart # Stupid', ''], ['Generous - Mean', ''], ['Shy - Outgoing', ''], ['Honest - Dishonest', '']] }],
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
      Ilyas: Hi! Are you new here?
      Hajar: Yes, I am. My name is Hajar.
      Ilyas: Welcome, Hajar! I'm Ilyas. Where are you from?
      Hajar: I'm from Tangier.
      Ilyas: Where do you live now?
      Hajar: I live in Rabat, near the train station.
      Ilyas: How old are you?
      Hajar: I'm 25.
      Ilyas: What do you do here?
      Hajar: I'm an accountant. And you?
      Ilyas: I'm a manager. Who is your boss?
      Hajar: Mr Bennani.
      Ilyas: He is very nice. When do you start work?
      Hajar: At 8:30 every day.
      Ilyas: Why do you like this job?
      Hajar: Because I love numbers!
      Ilyas: How do you come to work?
      Hajar: By tram. It's fast.
      Ilyas: Great. See you at lunch!`) },
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
        { t: 'sub', text: 'جمل خاصة فقط بالتلميذ' },
        { t: 'bullets', box: true, size: 12, items: [
          'Can you repeat, please? - هل يمكنك أن تعيد، من فضلك؟', "I don't understand. - لم أفهم - مفهمتش", 'Can I go to the bathroom? - هل يمكنني الذهاب إلى الحمام؟',
          'I finished. - أنهيت', 'What page, please? - أي صفحة، من فضلك؟', 'I forgot my book. - نسيت كتابي.', 'Excuse me, I have a question. - عذرًا، لدي سؤال.',
        ] },
        { t: 'sub', text: 'جمل خاصة فقط بالمدرس' },
        { t: 'bullets', box: true, size: 12, items: [
          'Listen / Read / Stop / Again. - استمع / اقرأ / توقف / مرة أخرى.', 'Repeat after me. - كرروا ورائي.', 'Open your book. - افتحوا كتابكم.',
          'Focus, everyone. - ركّزوا جميعًا.', "Time's up. - انتهى الوقت.", 'Raise your hand. - ارفعوا أيديكم.',
        ] },
      ],
    ] },
    { t: 'talk', cols: 2, size: 11.5, lines: lines(`
      Teacher: Good morning, class!
      Students: Good morning, teacher!
      Teacher: Sit down, please. Take out your notebooks.
      Amine: Teacher, I forgot my pencil.
      Teacher: No problem. Here's a pencil.
      Amine: Thank you.
      Teacher: Open your books to page 12.
      Rania: Excuse me, I have a question.
      Teacher: Yes, Rania?
      Rania: What does "eraser" mean?
      Teacher: Look, this is an eraser. It's ممحاة.
      Rania: Oh, I understand now.
      Teacher: Amine, read the first sentence, please.
      Amine: "This is my school bag."
      Teacher: Very good! Everyone, repeat after me.
      Students: "This is my school bag."
      Teacher: Excellent. Your homework is page 13.
      Rania: Can you repeat, please?
      Teacher: Page 13. Time's up! See you tomorrow.
      Students: Goodbye, teacher!`) },
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
      Hiba: Hi Mehdi! How are you?
      Mehdi: I'm good, thanks. And you?
      Hiba: I'm fine. Do you have brothers or sisters?
      Mehdi: Yes, I have one brother and two sisters.
      Hiba: What does your brother do?
      Mehdi: He is a nurse. He goes to the hospital every day.
      Hiba: And your sisters?
      Mehdi: They are students. They go to school by bus.
      Hiba: Do you have a car?
      Mehdi: No, I don't. I go to work on foot. And you?
      Hiba: I have a small car, but I go to work by tram.
      Mehdi: Why?
      Hiba: Because the tram is fast and cheap.
      Mehdi: Good idea. What do you do after work?
      Hiba: I go to the gym with my friend. She is very sporty.
      Mehdi: I go home and I do my homework. I have an English class!
      Hiba: Really? Where is your class?
      Mehdi: It's in the city centre, next to the bank.
      Hiba: Is your teacher good?
      Mehdi: Yes, he is great. We have fun in class.
      Hiba: Good luck, Mehdi!
      Mehdi: Thanks, Hiba. See you!`) },
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
      Amal: Good morning, Said! What time is it?
      Said: It's 7:15.
      Amal: Oh no! I'm late!
      Said: Late? What time do you go to work?
      Amal: At 7:30. I always take the bus.
      Said: Do you have breakfast?
      Amal: No, I don't have time. I just drink a coffee.
      Said: What time do you wake up?
      Amal: At 6:45. Then I take a shower and get dressed.
      Said: I wake up at 6:00. I make my bed and have breakfast.
      Amal: What time do you leave work?
      Said: At 4:30. Then I go back home and watch TV.
      Amal: I leave work at 5:00. I do the shopping and cook dinner.
      Said: What time do you go to sleep?
      Amal: At 11:00. And you?
      Said: At 10:00. Sleep is important!
      Amal: You're right. Bye, Said!
      Said: Bye, Amal! Have a good day.`) },
  ] },

  /* ── 12 ─────────────────────────────────────────────────────────── */
  { n: 12, titleAr: 'أيام الأسبوع + تكوين جمل', blocks: [
    { t: 'banner', title: 'The days of the week - أيام الأسبوع' },
    { t: 'grid', boxed: true, rows: [
      { dark: true, cells: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      { cells: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'] },
      { plain: true, span: [5, 2], cells: ['The Week Days - من الإثنين إلى الجمعة تسمى أيام العمل', 'The Weekend - نهاية الأسبوع'], size: 10.5 },
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
        Zineb: What do you usually do on Saturday?
        Adil: I usually go to the market with my mother.
        Zineb: Do you work on Saturday?
        Adil: No, I never work on the weekend.
        Zineb: When do you go to the gym?
        Adil: I go to the gym on Monday and Wednesday.
        Zineb: Do you often watch films?
        Adil: Yes, I often watch films on Friday evening.
        Zineb: What about Sunday?
        Adil: On Sunday, I always visit my grandparents.
        Zineb: That's nice. I sometimes visit my aunt on Sunday.
        Adil: Let's meet next Tuesday!`) },
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
      Nadia: Hamid, let's have a picnic on Sunday!
      Hamid: Great idea! What food do you like?
      Nadia: I like sandwiches and salad. And you?
      Hamid: I like roast chicken and bread.
      Nadia: Do you like cheese?
      Hamid: Yes, I do. I love cheese sandwiches.
      Nadia: Do you like fish?
      Hamid: No, I don't. I don't like fish.
      Nadia: OK, no fish! What about dessert?
      Hamid: I like cake. My mother makes a good chocolate cake.
      Nadia: Yummy! And I like ice cream.
      Hamid: Ice cream at a picnic? It's hot!
      Nadia: Haha, you're right. Popcorn then!
      Hamid: Perfect. See you on Sunday!`) },
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
      Leila: Let's sit here. What drink do you like, Reda?
      Reda: I like mint tea. It's my favourite drink.
      Leila: Me too! But today I want an orange juice.
      Reda: When do you drink coffee?
      Leila: I drink coffee in the morning, before work.
      Reda: I don't like coffee. It's too strong for me.
      Leila: Do you like milkshakes?
      Reda: Yes, I do! I love chocolate milkshakes.
      Leila: What drink don't you like?
      Reda: I don't like soda. It has a lot of sugar.
      Leila: That's true. I drink water every day.
      Reda: Me too. Two litres every day!
      Leila: Very good! Do you like ginger tea?
      Reda: No, I don't. Do you?
      Leila: Yes, I do. It's good when I'm sick.
      Reda: OK! Waiter, one mint tea and one orange juice, please.
      Waiter: Sure. Anything else?
      Reda: No, thank you.`) },
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
      Anas: Dad, what is that?
      Dad: That is a train. It goes to Marrakech.
      Anas: And what is this?
      Dad: This is our ticket.
      Anas: What are those?
      Dad: Those are taxis. They wait for people.
      Anas: Are these our bags?
      Dad: Yes, these are our bags. Carry this small bag, please.
      Anas: OK! Dad, is that a plane?
      Dad: Yes, it is. It's very high!
      Anas: How do you go to work, Dad?
      Dad: I go by car. And Mum goes by tram.
      Anas: I go to school by bus.
      Dad: That's right. Look! This is our train.
      Anas: Yay! I like trains.
      Dad: Me too. Let's go!`) },
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
        { t: 'sub', text: 'Important questions - أسئلة مهمة' },
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
      Mark: Excuse me, where is the bank?
      Fatima: Go straight and turn left at the traffic lights.
      Mark: Left at the traffic lights?
      Fatima: Yes. The bank is next to the post office.
      Mark: Is it far?
      Fatima: No, it's five minutes on foot.
      Mark: Thank you. Is there a pharmacy near here?
      Fatima: Yes. Turn right at the roundabout. It's in front of the park.
      Mark: In front of the park. Got it!
      Fatima: And there is a nice bakery next to it.
      Mark: Great! Thank you very much.
      Fatima: You're welcome. Have a nice day!`) },
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
        { t: 'sub', text: 'Important questions - أسئلة مهمة' },
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
      Sara: Hello! Is there a hotel near here?
      Man: Yes, there is. There is a hotel next to the library.
      Sara: Are there any restaurants near the hotel?
      Man: Yes, there are many restaurants.
      Sara: Is there a pharmacy on this street?
      Man: No, there isn't. But there is a pharmacy behind the school.
      Sara: How many buses are there to the city centre?
      Man: There are three buses every hour.
      Sara: Thank you for your help!
      Man: You're welcome.`) },
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
    { t: 'talk', title: 'What Can You Do?', cols: 2, art: '🚌', size: 11, lines: lines(`
      Mr Idrissi: Good morning. Please sit down.
      Khalid: Thank you.
      Mr Idrissi: So, you want to be a driver. Can you drive a bus?
      Khalid: Yes, I can. I can drive a bus and a truck.
      Mr Idrissi: Can you speak English?
      Khalid: Yes, I can speak a little English.
      Mr Idrissi: Can you speak French?
      Khalid: Yes, I can. I speak Arabic and French very well.
      Mr Idrissi: Can you work at night?
      Khalid: Yes, I can. But I can't work on Fridays.
      Mr Idrissi: No problem. Can you start on Monday?
      Khalid: Yes, I can!
      Mr Idrissi: Great. Welcome to the team, Khalid.
      Khalid: Thank you very much!
      Mr Idrissi: See you on Monday.`) },
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
      [{ t: 'sub', text: 'Affirmative - إيجابي' }, { t: 'pairs', cols: 1, side: true, size: 11, items: [['I like', 'أنا أحب'], ['You like', 'أنت تحب'], ['He likes', 'هو يحب'], ['She likes', 'هي تحب'], ['It likes', 'هو يحب'], ['We like', 'نحن نحب'], ['You like', 'أنتم تحبون'], ['They like', 'هم يحبون']] }],
      [{ t: 'sub', text: 'Negative - النفي' }, { t: 'pairs', cols: 1, side: true, size: 11, items: [["I don't like", 'أنا لا أحب'], ["You don't like", 'أنت لا تحب'], ["He doesn't like", 'هو لا يحب'], ["She doesn't like", 'هي لا تحب'], ["It doesn't like", 'هو لا يحب'], ["We don't like", 'نحن لا نحب'], ["You don't like", 'أنتم لا تحبون'], ["They don't like", 'هم لا يحبون']] }],
      [{ t: 'sub', text: 'Question - سؤال' }, { t: 'pairs', cols: 1, side: true, size: 11, items: [['Do I like?', 'هل يعجبني؟'], ['Do you like?', 'هل يعجبك؟'], ['Does he like?', 'هل يعجبه؟'], ['Does she like?', 'هل يعجبها؟'], ['Does it like?', 'هل يعجبه؟'], ['Do we like?', 'هل يعجبنا؟'], ['Do you like?', 'هل يعجبكم؟'], ['Do they like?', 'هل يعجبهم؟']] }],
    ] },
    { t: 'callout', text: 'في هذا الجدول يمكن تغيير الفعل "Like" بأي فعل تريد أن تعبر به أو تسأل به.' },
    { t: 'talk', title: 'What Do You Like to Do?', art: '🧑‍🤝‍🧑', size: 11, lines: lines(`
      Ayoub: Hi Salma! What do you like to do on the weekend?
      Salma: I like drawing and reading books. And you?
      Ayoub: I like playing football and swimming.
      Salma: Does your sister like sports?
      Ayoub: No, she doesn't. She likes cooking and baking.
      Salma: Nice! Do you like video games?
      Ayoub: Yes, I do. I play on Saturday evening.
      Salma: I don't like video games. I like hiking.
      Ayoub: Hiking? Where do you go?
      Salma: I go to the Atlas mountains with my friends.
      Ayoub: Wow! Do you like camping too?
      Salma: Yes, I love camping!
      Ayoub: Can I come with you next time?
      Salma: Of course! Do you like travelling?
      Ayoub: Yes, I love travelling.
      Salma: Great. See you next weekend!`) },
  ] },
]
