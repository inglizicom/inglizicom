/**
 * writing-course.ts — content for the /admin/present/writing teaching deck.
 * Audience: ADULTS who finished the A0–A1 course and now learn to WRITE.
 *
 * Every lesson follows the same template so the learner always knows the stage:
 *   Objectives → Rule → Explanation → Examples → Exercises →
 *   Reading passage → Comprehension (the passage USED as an exercise) →
 *   Homework → Find-the-Mistakes (an error passage the learner corrects).
 *
 * Formatting: wrap any part of an ENGLISH string in *asterisks* to spotlight it
 * (a capital, a comma, a conjunction, a correction). Arabic never uses it.
 */

export type Ex = { en: string; ar: string }
export type QA = { q: string; a: string }
export type Reading = {
  title: string; titleAr: string
  passage: string[]          // real connected prose (rendered as one flowing paragraph)
  questions?: QA[]           // deprecated — comprehension phase removed; kept optional for old data
  tip?: string; tipAr?: string
}
export type Editing = {
  wrong: string[]            // a short passage that CONTAINS mistakes (plain)
  correct: string[]         // the corrected version, with *the fixes* highlighted
}
// How a tense/structure is built — three columns of pattern lines (*highlight* the key part).
export type Form = { affirmative: string[]; negative: string[]; question: string[]; note?: string; noteAr?: string }
// A spelling rule (e.g. add -es / consonant+y → -ies) with worked examples.
export type SpellRule = { rule: string; ar: string; examples: string }
// Writing-studio content for the practice-oriented paragraph lessons (a different, hands-on format).
export type StudioPart = { role: 'topic' | 'support' | 'conclusion'; en: string }
export type Studio = {
  prompt?: { en: string; ar: string }                              // the writing task
  model?: { title: string; titleAr: string; parts: StudioPart[] }  // an annotated model paragraph
  plan?: { label: string; ar: string }[]                           // a fillable outline frame
  toolkit?: { group: string; ar: string; phrases: string[] }[]     // sentence starters / linking phrases
  steps?: Ex[]                                                      // guided "your turn" writing steps
  checklist?: Ex[]                                                  // self-check before finishing
}
export type Lesson = {
  no: number
  cefr?: 'A1' | 'A2' | 'B1' | 'B2'        // CEFR level; falls back to the unit level when omitted
  tag: string; tagAr: string
  title: string; titleAr: string
  objectives: Ex[]
  rule: { en: string; ar: string }
  explain?: { intro: string; introAr: string; points: Ex[] }
  form?: Form                              // "How to build it" — affirmative / negative / question
  spelling?: SpellRule[]                   // spelling rules (-s/-es/-ies, -ed, -ing …)
  signals?: Ex[]                           // signal / time-marker words for the tense
  irregulars?: 'past' | 'pp'               // show the irregular-verb table (highlight past OR past-participle)
  studio?: Studio                          // writing-studio (paragraph lessons) — replaces the grammar drills
  examples?: Ex[]
  exercises?: QA[]
  reading?: Reading
  homework: Ex[]
  editing?: Editing
}

/* The most common irregular verbs — base / past simple / past participle (V3).
 * Shown in Past Simple (past highlighted) and Present Perfect (participle highlighted). */
export type Irregular = { base: string; past: string; pp: string }
export const IRREGULAR_VERBS: Irregular[] = [
  { base: 'be', past: 'was / were', pp: 'been' }, { base: 'become', past: 'became', pp: 'become' },
  { base: 'begin', past: 'began', pp: 'begun' }, { base: 'break', past: 'broke', pp: 'broken' },
  { base: 'bring', past: 'brought', pp: 'brought' }, { base: 'build', past: 'built', pp: 'built' },
  { base: 'buy', past: 'bought', pp: 'bought' }, { base: 'catch', past: 'caught', pp: 'caught' },
  { base: 'choose', past: 'chose', pp: 'chosen' }, { base: 'come', past: 'came', pp: 'come' },
  { base: 'cost', past: 'cost', pp: 'cost' }, { base: 'cut', past: 'cut', pp: 'cut' },
  { base: 'do', past: 'did', pp: 'done' }, { base: 'draw', past: 'drew', pp: 'drawn' },
  { base: 'drink', past: 'drank', pp: 'drunk' }, { base: 'drive', past: 'drove', pp: 'driven' },
  { base: 'eat', past: 'ate', pp: 'eaten' }, { base: 'fall', past: 'fell', pp: 'fallen' },
  { base: 'feel', past: 'felt', pp: 'felt' }, { base: 'find', past: 'found', pp: 'found' },
  { base: 'fly', past: 'flew', pp: 'flown' }, { base: 'forget', past: 'forgot', pp: 'forgotten' },
  { base: 'get', past: 'got', pp: 'gotten' }, { base: 'give', past: 'gave', pp: 'given' },
  { base: 'go', past: 'went', pp: 'gone' }, { base: 'grow', past: 'grew', pp: 'grown' },
  { base: 'have', past: 'had', pp: 'had' }, { base: 'hear', past: 'heard', pp: 'heard' },
  { base: 'keep', past: 'kept', pp: 'kept' }, { base: 'know', past: 'knew', pp: 'known' },
  { base: 'leave', past: 'left', pp: 'left' }, { base: 'lose', past: 'lost', pp: 'lost' },
  { base: 'make', past: 'made', pp: 'made' }, { base: 'meet', past: 'met', pp: 'met' },
  { base: 'pay', past: 'paid', pp: 'paid' }, { base: 'put', past: 'put', pp: 'put' },
  { base: 'read', past: 'read', pp: 'read' }, { base: 'ride', past: 'rode', pp: 'ridden' },
  { base: 'run', past: 'ran', pp: 'run' }, { base: 'say', past: 'said', pp: 'said' },
  { base: 'see', past: 'saw', pp: 'seen' }, { base: 'sell', past: 'sold', pp: 'sold' },
  { base: 'send', past: 'sent', pp: 'sent' }, { base: 'sit', past: 'sat', pp: 'sat' },
  { base: 'sleep', past: 'slept', pp: 'slept' }, { base: 'speak', past: 'spoke', pp: 'spoken' },
  { base: 'spend', past: 'spent', pp: 'spent' }, { base: 'swim', past: 'swam', pp: 'swum' },
  { base: 'take', past: 'took', pp: 'taken' }, { base: 'teach', past: 'taught', pp: 'taught' },
  { base: 'tell', past: 'told', pp: 'told' }, { base: 'think', past: 'thought', pp: 'thought' },
  { base: 'understand', past: 'understood', pp: 'understood' }, { base: 'wake', past: 'woke', pp: 'woken' },
  { base: 'wear', past: 'wore', pp: 'worn' }, { base: 'win', past: 'won', pp: 'won' },
  { base: 'write', past: 'wrote', pp: 'written' },
]

/* A–Z reference: each letter, its small form, and a beginner word. */
const ALPHA: Ex[] = [
  ['Apple', 'تفّاحة'], ['Ball', 'كرة'], ['Cat', 'قطة'], ['Dog', 'كلب'], ['Egg', 'بيضة'],
  ['Fish', 'سمكة'], ['Girl', 'فتاة'], ['House', 'بيت'], ['Ice', 'ثلج'], ['Juice', 'عصير'],
  ['Key', 'مفتاح'], ['Lion', 'أسد'], ['Moon', 'قمر'], ['Nose', 'أنف'], ['Orange', 'برتقالة'],
  ['Pen', 'قلم'], ['Queen', 'ملكة'], ['Rain', 'مطر'], ['Sun', 'شمس'], ['Tree', 'شجرة'],
  ['Umbrella', 'مظلّة'], ['Van', 'شاحنة'], ['Water', 'ماء'], ['Box', 'صندوق'], ['Yellow', 'أصفر'], ['Zebra', 'حمار وحشي'],
].map(([word, ar], i) => {
  const C = String.fromCharCode(65 + i)
  return { en: `*${C}* ${C.toLowerCase()}  —  ${word}`, ar }
})

export const LESSONS: Lesson[] = [
  /* ─────────────────────────── 1 · CAPITALIZATION ─────────────────────────── */
  {
    no: 1, tag: 'Capitalization', tagAr: 'الحروف الكبيرة',
    title: 'Capital & Small Letters — when to capitalize',
    titleAr: 'الحروف الكبيرة والصغيرة — متى نستخدم الكبيرة',
    objectives: [
      { en: 'Tell CAPITAL letters from small letters', ar: 'التمييز بين الحرف الكبير والصغير' },
      { en: 'Capitalize the first word of every sentence', ar: 'كتابة أول كلمة في الجملة بحرف كبير' },
      { en: 'Capitalize proper nouns (names, places)', ar: 'كتابة أسماء العَلَم بحرف كبير' },
      { en: 'Always capitalize “I”, days and months', ar: 'كتابة I وأيام الأسبوع والأشهر بحرف كبير' },
    ],
    rule: {
      en: 'Start every sentence with a *CAPITAL* letter. Capitalize *names*, *cities*, *countries*, *languages*, *days*, *months*, and the word *I* — everywhere they appear.',
      ar: 'ابدأ كل جملة بحرف كبير. واكتب أسماء الأشخاص والمدن والدول واللغات وأيام الأسبوع والأشهر وكلمة I بحرف كبير أينما وردت.',
    },
    explain: {
      intro: 'In speaking, capitals are invisible. In writing, they are a rule — and a missing capital is a clear mistake a reader notices immediately.',
      introAr: 'في الكلام لا تظهر الحروف الكبيرة، لكن في الكتابة هي قاعدة، وغيابها خطأ يلاحظه القارئ فورًا.',
      points: [
        { en: 'First word of a sentence: *T*oday is Monday.', ar: 'أول كلمة في الجملة' },
        { en: 'People & places (proper nouns): *S*ara, *R*abat, *M*orocco', ar: 'أسماء الأشخاص والأماكن' },
        { en: 'Languages & nationalities: *A*rabic, *E*nglish, *F*rench', ar: 'اللغات والجنسيات' },
        { en: 'Days & months: *M*onday, *J*uly (but not seasons)', ar: 'الأيام والأشهر' },
        { en: 'The pronoun *I* is ALWAYS capital', ar: 'الضمير I دائمًا كبير' },
      ],
    },
    examples: [
      ...ALPHA,
      { en: '*M*y name is *S*ara.', ar: 'اسمي سارة.' },
      { en: '*I* live in *R*abat, *M*orocco.', ar: 'أعيش في الرباط، المغرب.' },
      { en: '*T*oday is *M*onday.', ar: 'اليوم هو الاثنين.' },
      { en: '*W*e speak *A*rabic and *E*nglish.', ar: 'نتحدّث العربية والإنجليزية.' },
      { en: '*A*li and *O*mar are friends.', ar: 'علي وعمر صديقان.' },
      { en: '*I* was born in *J*uly.', ar: 'وُلدت في يوليوز.' },
      { en: '*S*he studies at *H*arvard.', ar: 'تدرس في هارفارد.' },
    ],
    exercises: [
      { q: 'Correct: “my name is sara and i live in rabat.”', a: '*M*y name is *S*ara, and *I* live in *R*abat.' },
      { q: 'Correct: “on monday we study english and french.”', a: 'On *M*onday we study *E*nglish and *F*rench.' },
      { q: 'Correct: “ali and omar visited spain in august.”', a: '*A*li and *O*mar visited *S*pain in *A*ugust.' },
      { q: 'Correct: “my teacher mr. karim is from london.”', a: '*M*y teacher, *M*r. *K*arim, is from *L*ondon.' },
      { q: 'Which words must be capital: i · monday · book · morocco?', a: '*I*, *M*onday, *M*orocco (not “book”).' },
    ],
    reading: {
      title: 'A Short Introduction', titleAr: 'تعريف قصير',
      passage: [
        'My name is *O*mar, and I come from *F*es, a beautiful city in *M*orocco.',
        'Every *M*onday, I study *E*nglish at the *A*merican *L*anguage *C*enter.',
        'My teacher, *M*r. *K*arim, is from *L*ondon, and he is very patient.',
        'He always says that practice is the key to success.',
        'In *J*uly, I will travel to *S*pain to visit my brother *Y*usuf.',
      ],
      questions: [
        { q: 'Where does Omar come from?', a: 'From *F*es, in *M*orocco.' },
        { q: 'When does he study English?', a: 'Every *M*onday.' },
        { q: 'Why is “American Language Center” capitalized?', a: 'It is the *name* of a place (a proper noun).' },
        { q: 'Find two more words that must be capital and say why.', a: 'e.g. *J*uly (month), *S*pain (country), *Y*usuf (name).' },
      ],
      tip: 'Notice: sentence starts, names, places, languages, days and months are all capital.',
      tipAr: 'لاحظ: بدايات الجمل والأسماء والأماكن واللغات والأيام والأشهر كلها كبيرة.',
    },
    homework: [
      { en: 'Write 5 sentences about your city; capitalize every proper noun', ar: 'اكتب ٥ جمل عن مدينتك مع كتابة أسماء العَلَم بحرف كبير' },
      { en: 'List 6 proper nouns you use often (names, cities, countries)', ar: 'اكتب ٦ أسماء عَلَم تستعملها كثيرًا' },
      { en: 'Write 3 sentences using “I”, a day, and a month', ar: 'اكتب ٣ جمل تستعمل I ويومًا وشهرًا' },
    ],
    editing: {
      wrong: [
        'my brother lives in madrid.',
        'he speaks spanish and english.',
        'every friday, i call him.',
        'in june, we will meet in paris.',
      ],
      correct: [
        '*M*y brother lives in *M*adrid.',
        '*H*e speaks *S*panish and *E*nglish.',
        '*E*very *F*riday, *I* call him.',
        '*I*n *J*une, we will meet in *P*aris.',
      ],
    },
  },

  /* ─────────────────────────── 2 · VOWELS ─────────────────────────── */
  {
    no: 2, tag: 'Vowels', tagAr: 'أحرف العلّة',
    title: 'Vowels & Consonants — the sound of a word',
    titleAr: 'أحرف العلّة والأحرف الساكنة — صوت الكلمة',
    objectives: [
      { en: 'Name the 5 vowels', ar: 'تسمية أحرف العلّة الخمسة' },
      { en: 'Hear the vowel sound inside a word', ar: 'سماع صوت العلّة داخل الكلمة' },
      { en: 'Know why vowels decide “a” vs “an”', ar: 'معرفة لماذا تحدّد العلّة a أو an' },
      { en: 'Spell short words without dropping a vowel', ar: 'كتابة الكلمات دون إسقاط حرف العلّة' },
    ],
    rule: {
      en: 'The 5 vowels are *a* *e* *i* *o* *u*. The other 21 letters are consonants. A vowel gives a word its sound, and every English word has at least one.',
      ar: 'أحرف العلّة الخمسة: a e i o u، والباقي ٢١ حرفًا ساكنًا. حرف العلّة يمنح الكلمة صوتها، وكل كلمة إنجليزية فيها واحد على الأقل.',
    },
    explain: {
      intro: 'Vowels are not a school game — they control spelling and the choice of “a/an”. A word written without its vowel is a spelling mistake.',
      introAr: 'أحرف العلّة ليست لعبة مدرسية — فهي تتحكّم في الإملاء وفي اختيار a/an. والكلمة المكتوبة بلا حرف علّة خطأ إملائي.',
      points: [
        { en: 'The 5 vowels: *a e i o u*', ar: 'أحرف العلّة الخمسة' },
        { en: 'Sometimes *y* acts as a vowel: cit*y*, happ*y*', ar: 'أحيانًا y تعمل كعلّة' },
        { en: 'A vowel SOUND at the start → use “an”', ar: 'صوت علّة في البداية ← an' },
        { en: 'Consonants are all the rest: b c d f g …', ar: 'الساكنة هي الباقي' },
      ],
    },
    examples: [
      { en: 'c*a*t', ar: 'قطة' }, { en: 'd*o*g', ar: 'كلب' }, { en: 's*u*n', ar: 'شمس' },
      { en: 'p*e*n', ar: 'قلم' }, { en: 'b*oo*k', ar: 'كتاب' }, { en: 'tr*ee*', ar: 'شجرة' },
      { en: 'r*ai*n', ar: 'مطر' }, { en: 'h*ou*s*e*', ar: 'بيت' }, { en: '*a*ppl*e*', ar: 'تفاحة' },
      { en: '*o*r*a*ng*e*', ar: 'برتقالة' }, { en: 'w*a*t*e*r', ar: 'ماء' }, { en: 't*a*bl*e*', ar: 'طاولة' },
      { en: 'ch*ai*r', ar: 'كرسي' }, { en: 'sch*oo*l', ar: 'مدرسة' }, { en: 't*ea*ch*e*r', ar: 'معلّم' },
      { en: 'st*u*d*e*nt', ar: 'طالب' }, { en: 'f*a*m*i*ly', ar: 'عائلة' }, { en: 'fr*ie*nd', ar: 'صديق' },
      { en: 'c*i*t*y*', ar: 'مدينة' }, { en: 'h*a*ppy', ar: 'سعيد' }, { en: 'm*o*rn*i*ng', ar: 'صباح' },
      { en: '*e*v*e*n*i*ng', ar: 'مساء' }, { en: '*u*mbr*e*ll*a*', ar: 'مظلّة' }, { en: '*a*n*i*m*a*l', ar: 'حيوان' },
    ],
    exercises: [
      { q: 'Name the 5 vowels.', a: '*a, e, i, o, u*' },
      { q: 'Find the vowels in “teacher”.', a: 't*ea*ch*e*r → *e, a, e*' },
      { q: 'a or an? “___ orange, ___ book, ___ hour”', a: '*an* orange, *a* book, *an* hour' },
      { q: 'Fix the spelling: “schl, wtr, bok”', a: 'sch*oo*l, w*a*t*e*r, b*oo*k' },
      { q: 'Which letter can act as a vowel? city, happy', a: '*y*' },
    ],
    reading: {
      title: 'Sounds First', titleAr: 'الصوت أولًا',
      passage: [
        'When I read a new word, I look for the vowels first.',
        'The vowels *a*, *e*, *i*, *o*, and *u* carry the sound.',
        'For example, the word “school” hides two vowels together: *oo*.',
        'If a word begins with a vowel sound, like “apple”, I write “an” before it.',
        'So I say “an apple”, but “a banana”.',
      ],
      questions: [
        { q: 'What does the writer look for first in a new word?', a: 'The *vowels*.' },
        { q: 'Which vowels are hidden in “school”?', a: '*oo* (o, o).' },
        { q: 'Why do we say “an apple” but “a banana”?', a: '“apple” starts with a *vowel* sound; “banana” starts with a consonant.' },
      ],
      tip: 'The colored letters are the vowels — they decide the sound and “a/an”.',
      tipAr: 'الحروف الملوّنة هي أحرف العلّة — تحدّد الصوت واختيار a/an.',
    },
    homework: [
      { en: 'Write 8 words and underline every vowel', ar: 'اكتب ٨ كلمات وضع خطًا تحت كل حرف علّة' },
      { en: 'Write 5 words that begin with a vowel sound (use “an”)', ar: 'اكتب ٥ كلمات تبدأ بصوت علّة (استعمل an)' },
      { en: 'Find 3 words with two vowels together (oo, ee, ai…)', ar: 'اعثر على ٣ كلمات فيها حرفا علّة متتاليان' },
    ],
    editing: {
      wrong: [
        'I went to schl in the mrning.',
        'My techer gave us a bok.',
        'We read abut a big animl.',
      ],
      correct: [
        'I went to sch*oo*l in the m*o*rning.',
        'My t*ea*cher gave us a b*oo*k.',
        'We read ab*ou*t a big anim*a*l.',
      ],
    },
  },

  /* ─────────────────────────── 3 · ARTICLES ─────────────────────────── */
  {
    no: 4, tag: 'Articles', tagAr: 'الأدوات',
    title: 'Articles — a, an, the',
    titleAr: 'الأدوات — a / an / the',
    objectives: [
      { en: 'Use “a/an” for one non-specific thing', ar: 'استخدام a/an لشيء غير محدّد' },
      { en: 'Choose “a” or “an” by the SOUND', ar: 'اختيار a أو an حسب الصوت' },
      { en: 'Use “the” for a specific, known thing', ar: 'استخدام the للشيء المحدّد' },
      { en: 'Leave out the article with general plurals', ar: 'حذف الأداة مع الجمع العام' },
    ],
    rule: {
      en: 'Use *a* before a consonant sound (a book), *an* before a vowel sound (an apple), and *the* when the reader already knows which one (the sun).',
      ar: 'استخدم a قبل الصوت الساكن، و an قبل صوت العلّة، و the حين يعرف القارئ أيّ شيء تقصد.',
    },
    explain: {
      intro: 'Arabic has no “a/an”, so this is a common writing error. Fix it by asking: one general thing (a/an) or a specific known one (the)?',
      introAr: 'العربية لا تحوي a/an، لذا هذا خطأ شائع في الكتابة. اسأل: شيء عام واحد (a/an) أم محدّد معروف (the)؟',
      points: [
        { en: '*a* + consonant sound: a car, a university', ar: 'a قبل صوت ساكن' },
        { en: '*an* + vowel sound: an egg, an hour', ar: 'an قبل صوت علّة' },
        { en: 'It is the SOUND, not the letter', ar: 'العبرة بالصوت لا بالحرف' },
        { en: '*the* = specific/known · plural general = no article', ar: 'the للمحدّد · الجمع العام بلا أداة' },
      ],
    },
    examples: [
      { en: '*a* book', ar: 'كتاب' }, { en: '*a* car', ar: 'سيارة' }, { en: '*a* house', ar: 'بيت' },
      { en: '*a* university', ar: 'جامعة' }, { en: '*a* teacher', ar: 'معلّم' },
      { en: '*an* apple', ar: 'تفاحة' }, { en: '*an* egg', ar: 'بيضة' }, { en: '*an* orange', ar: 'برتقالة' },
      { en: '*an* hour', ar: 'ساعة' }, { en: '*an* idea', ar: 'فكرة' }, { en: '*an* umbrella', ar: 'مظلّة' },
      { en: '*the* sun', ar: 'الشمس' }, { en: '*the* moon', ar: 'القمر' }, { en: '*the* door', ar: 'الباب' },
      { en: '*the* teacher (you know who)', ar: 'المعلّم المعروف' },
      { en: 'I like apples. (general, no article)', ar: 'أحب التفاح (عام).' },
      { en: 'Open *the* window, please.', ar: 'افتح النافذة من فضلك.' },
      { en: 'She is *a* doctor.', ar: 'هي طبيبة.' },
    ],
    exercises: [
      { q: 'a / an / the? “I saw ___ cat. ___ cat was black.”', a: '*a* cat. *The* cat was black.' },
      { q: 'a or an? “___ hour, ___ university, ___ egg”', a: '*an* hour, *a* university, *an* egg' },
      { q: 'Fix: “I am engineer.”', a: 'I am *an* engineer.' },
      { q: 'the or nothing? “I love ___ music.”', a: 'I love music. (no article — general)' },
      { q: 'Fix: “Please close a door.” (the one here)', a: 'Please close *the* door.' },
    ],
    reading: {
      title: 'A New Job', titleAr: 'وظيفة جديدة',
      passage: [
        'Last week I started *a* new job in *an* office downtown.',
        'The building is old, but *the* people are friendly.',
        'I have *a* small desk near *the* window.',
        'Every morning I drink *a* coffee and read *the* news for *an* hour.',
        'I think it will be *a* good year.',
      ],
      questions: [
        { q: 'Where is the office?', a: 'Downtown.' },
        { q: 'Why “an office” and not “a office”?', a: '“office” begins with a *vowel* sound → *an*.' },
        { q: 'Why “the window” and not “a window”?', a: 'It is a *specific*, known window (the one at the desk).' },
      ],
      tip: 'a/an = one, any · the = the specific one we both know.',
      tipAr: 'a/an واحد أيّ · the المحدّد المعروف.',
    },
    homework: [
      { en: 'Write 6 sentences, each using a, an, or the', ar: 'اكتب ٦ جمل، كل واحدة تستعمل a أو an أو the' },
      { en: 'Describe your room with a/an/the (5 things)', ar: 'صِف غرفتك بـ a/an/the (٥ أشياء)' },
      { en: 'Write 3 “an” words (vowel sound)', ar: 'اكتب ٣ كلمات بـ an' },
    ],
    editing: {
      wrong: [
        'I am student at a university.',
        'I have a apple and a egg for breakfast.',
        'Please open a window; it is the one behind you.',
      ],
      correct: [
        'I am *a* student at a university.',
        'I have *an* apple and *an* egg for breakfast.',
        'Please open *the* window; it is the one behind you.',
      ],
    },
  },

  /* ─────────────────────────── 4 · POSSESSIVES ─────────────────────────── */
  {
    no: 8, tag: 'Possessives', tagAr: 'الملكية',
    title: 'Possessive Adjectives — my, your, his, her, its, our, their',
    titleAr: 'صفات الملكية — my / your / his / her / its / our / their',
    objectives: [
      { en: 'Match each possessive to its pronoun', ar: 'مطابقة كل صفة بضميرها' },
      { en: 'Place them before the noun they own', ar: 'وضعها قبل الاسم المملوك' },
      { en: 'Choose his / her / its without error', ar: 'اختيار his / her / its بلا خطأ' },
      { en: 'Not confuse its (owns) with it’s (it is)', ar: 'عدم الخلط بين its و it’s' },
    ],
    rule: {
      en: 'Possessive adjectives show ownership and come *before a noun*: *my, your, his, her, its, our, their*. Choose *his* (male), *her* (female), *its* (thing/animal).',
      ar: 'صفات الملكية تدل على المِلكية وتأتي قبل الاسم: my, your, his, her, its, our, their. اختر his للمذكّر، her للمؤنّث، its لغير العاقل.',
    },
    explain: {
      intro: 'The most common error is choosing his/her by the OWNER’s gender, not the object. Also: “its” never has an apostrophe when it shows ownership.',
      introAr: 'أشهر خطأ هو اختيار his/her حسب جنس المالك. وتذكّر: its لا تحمل فاصلة عليا حين تدل على المِلكية.',
      points: [
        { en: 'I → *my* · you → *your* · we → *our* · they → *their*', ar: 'أنا/أنت/نحن/هم' },
        { en: 'he → *his* (his car) — a male owner', ar: 'هو ← his' },
        { en: 'she → *her* (her car) — a female owner', ar: 'هي ← her' },
        { en: 'it → *its* (its tail) — a thing or animal', ar: 'لغير العاقل ← its' },
        { en: '*its* = owns · *it’s* = it is (different!)', ar: 'its ملكية · it’s = it is' },
      ],
    },
    examples: [
      { en: '*my* book', ar: 'كتابي' }, { en: '*my* friend', ar: 'صديقي' },
      { en: '*your* bag', ar: 'حقيبتك' }, { en: '*your* idea', ar: 'فكرتك' },
      { en: '*his* car', ar: 'سيارته' }, { en: '*his* job', ar: 'عمله' },
      { en: '*her* dress', ar: 'فستانها' }, { en: '*her* office', ar: 'مكتبها' },
      { en: '*its* color', ar: 'لونه' }, { en: '*its* name', ar: 'اسمه' },
      { en: '*our* house', ar: 'بيتنا' }, { en: '*our* teacher', ar: 'معلّمنا' },
      { en: '*their* school', ar: 'مدرستهم' }, { en: '*their* country', ar: 'بلدهم' },
      { en: 'Sara loves *her* job.', ar: 'سارة تحب عملها.' },
      { en: 'Omar parked *his* car.', ar: 'ركن عمر سيارته.' },
      { en: 'The dog wags *its* tail.', ar: 'يهز الكلب ذيله.' },
      { en: 'We finished *our* project.', ar: 'أنهينا مشروعنا.' },
    ],
    exercises: [
      { q: 'Fix: “Sara loves his job.” (Sara = female)', a: 'Sara loves *her* job.' },
      { q: 'Fix: “Omar and I cleaned my car.” (we)', a: 'Omar and I cleaned *our* car.' },
      { q: 'his / her / its? “The cat licked ___ paw.”', a: 'The cat licked *its* paw.' },
      { q: 'its or it’s? “___ raining, and the dog lost ___ ball.”', a: '*It’s* raining, and the dog lost *its* ball.' },
      { q: 'Fill: “They sold ___ house.”', a: 'They sold *their* house.' },
    ],
    reading: {
      title: 'The Nadi Family', titleAr: 'عائلة الناضي',
      passage: [
        'The Nadi family is small, but *their* house is full of life.',
        'The father drives *his* old car to work every day.',
        'The mother, Leila, runs *her* own bakery near the market.',
        'Their son does *his* homework while the cat sleeps in *its* basket.',
        'On Sunday, they clean *their* garden together.',
      ],
      questions: [
        { q: 'What does Leila do?', a: 'She runs *her* own bakery.' },
        { q: 'Why “her bakery” and not “his bakery”?', a: 'Leila is *female* → *her*.' },
        { q: 'Where does the cat sleep?', a: 'In *its* basket.' },
        { q: 'What do they do together on Sunday?', a: 'They clean *their* garden.' },
      ],
      tip: 'his/her follow the OWNER’s gender; its is for things and animals.',
      tipAr: 'his/her حسب جنس المالك؛ its لغير العاقل.',
    },
    homework: [
      { en: 'Write 5 sentences about your family using my/his/her/their', ar: 'اكتب ٥ جمل عن عائلتك بـ my/his/her/their' },
      { en: 'Describe 3 things you own with “my”', ar: 'صِف ٣ أشياء تملكها بـ my' },
      { en: 'Write 2 sentences that use both “its” and “it’s” correctly', ar: 'اكتب جملتين تستعملان its و it’s بشكل صحيح' },
    ],
    editing: {
      wrong: [
        'Sara forgot his umbrella at home.',
        'The dog broke it’s leg last week.',
        'Me and my brother sold my bikes.',
      ],
      correct: [
        'Sara forgot *her* umbrella at home.',
        'The dog broke *its* leg last week.',
        'My brother and I sold *our* bikes.',
      ],
    },
  },

  /* ─────────────────────────── 5 · TO BE ─────────────────────────── */
  {
    no: 7, tag: 'To be', tagAr: 'فعل الكينونة',
    title: 'The verb “to be” — am, is, are',
    titleAr: 'فعل الكينونة — am / is / are',
    objectives: [
      { en: 'Match am / is / are to each subject', ar: 'مطابقة am/is/are لكل فاعل' },
      { en: 'Write correct “to be” sentences', ar: 'كتابة جمل صحيحة بفعل الكينونة' },
      { en: 'Make negatives and questions', ar: 'تكوين النفي والسؤال' },
      { en: 'Use short forms in informal writing', ar: 'استخدام الصيغ المختصرة' },
    ],
    rule: {
      en: 'Use *am* with I, *is* with he/she/it (and singular nouns), and *are* with you/we/they (and plural nouns).',
      ar: 'استخدم am مع I، و is مع he/she/it والمفرد، و are مع you/we/they والجمع.',
    },
    explain: {
      intro: 'A written sentence needs a verb. “To be” is the verb that links a subject to a description or a place.',
      introAr: 'الجملة المكتوبة تحتاج فعلًا. وفعل الكينونة يربط الفاعل بوصف أو مكان.',
      points: [
        { en: 'I *am* · he/she/it *is* · you/we/they *are*', ar: 'الأزمنة حسب الفاعل' },
        { en: 'Singular noun → *is*: The book *is* new', ar: 'المفرد ← is' },
        { en: 'Plural noun → *are*: The books *are* new', ar: 'الجمع ← are' },
        { en: 'Negative: add *not* · Question: put be first', ar: 'النفي بـ not · السؤال بالفعل أولًا' },
      ],
    },
    examples: [
      { en: 'I *am* a teacher.', ar: 'أنا معلّم.' }, { en: 'I*’m* ready.', ar: 'أنا مستعد.' },
      { en: 'You *are* right.', ar: 'أنت محق.' }, { en: 'He *is* at home.', ar: 'هو في البيت.' },
      { en: 'She *is* a doctor.', ar: 'هي طبيبة.' }, { en: 'It *is* cold today.', ar: 'الجو بارد اليوم.' },
      { en: 'We *are* students.', ar: 'نحن طلاب.' }, { en: 'They *are* here.', ar: 'هم هنا.' },
      { en: 'The book *is* on the table.', ar: 'الكتاب على الطاولة.' },
      { en: 'The books *are* on the table.', ar: 'الكتب على الطاولة.' },
      { en: 'My parents *are* teachers.', ar: 'والداي معلّمان.' },
      { en: 'I *am not* tired.', ar: 'لست متعبًا.' },
      { en: '*Are* you okay?', ar: 'هل أنت بخير؟' },
      { en: '*Is* she your sister?', ar: 'هل هي أختك؟' },
    ],
    exercises: [
      { q: 'am/is/are: “The children ___ at school.”', a: 'The children *are* at school.' },
      { q: 'am/is/are: “My sister ___ a nurse.”', a: 'My sister *is* a nurse.' },
      { q: 'Fix: “I is happy.”', a: 'I *am* happy.' },
      { q: 'Fix: “They is my friends.”', a: 'They *are* my friends.' },
      { q: 'Make it a question: “She is a doctor.”', a: '*Is* she a doctor?' },
    ],
    reading: {
      title: 'At the Office', titleAr: 'في المكتب',
      passage: [
        'My name *is* Karim, and I *am* an accountant.',
        'The office *is* on the third floor, and it *is* always busy.',
        'My colleagues *are* kind, and they *are* good at their jobs.',
        'Right now I *am* a little tired, but I *am* happy.',
        '“*Are* you free for lunch?” my friend asks.',
      ],
      questions: [
        { q: 'What is Karim’s job?', a: 'He *is* an accountant.' },
        { q: 'Where is the office?', a: 'On the third floor.' },
        { q: 'Why “they are” and not “they is”?', a: '“they” is plural → *are*.' },
      ],
      tip: 'I am · he/she/it is · you/we/they are · plural nouns are.',
      tipAr: 'I am · he/she/it is · you/we/they are · الجمع are.',
    },
    homework: [
      { en: 'Write 6 sentences, one for each subject with am/is/are', ar: 'اكتب ٦ جمل لكل فاعل مع am/is/are' },
      { en: 'Write 3 questions and 3 negatives', ar: 'اكتب ٣ أسئلة و٣ جمل منفية' },
      { en: 'Introduce yourself in 4 sentences (job, city, age…)', ar: 'عرّف بنفسك في ٤ جمل' },
    ],
    editing: {
      wrong: [
        'My brother are a good driver.',
        'We is students at the same school.',
        'The books is on my desk.',
      ],
      correct: [
        'My brother *is* a good driver.',
        'We *are* students at the same school.',
        'The books *are* on my desk.',
      ],
    },
  },

  /* ─────────────────────────── 10 · PRESENT SIMPLE (A1) ─────────────────────────── */
  {
    no: 10, cefr: 'A1', tag: 'Present Simple', tagAr: 'المضارع البسيط',
    title: 'Present Simple — habits & facts',
    titleAr: 'المضارع البسيط — العادات والحقائق',
    objectives: [
      { en: 'Form the present simple for every person', ar: 'تكوين المضارع البسيط لكل الضمائر' },
      { en: 'Add -s / -es / -ies for he, she, it', ar: 'إضافة -s / -es / -ies مع he/she/it' },
      { en: 'Make negatives with don’t / doesn’t', ar: 'تكوين النفي بـ don’t / doesn’t' },
      { en: 'Ask questions with do / does', ar: 'طرح الأسئلة بـ do / does' },
    ],
    rule: {
      en: 'Use the present simple for *habits*, *routines*, and *facts*. Add *-s* (or -es / -ies) to the verb only with *he / she / it*.',
      ar: 'نستخدم المضارع البسيط للعادات والروتين والحقائق. ونضيف -s (أو -es/-ies) للفعل مع he/she/it فقط.',
    },
    explain: {
      intro: 'This is the tense you use most. The tricky parts are the -s on he/she/it, and using do/does for questions and negatives.',
      introAr: 'هذا أكثر الأزمنة استعمالًا. والصعوبة في -s مع he/she/it، واستخدام do/does للسؤال والنفي.',
      points: [
        { en: 'A *habit*: I drink coffee every morning.', ar: 'عادة' },
        { en: 'A *fact*: Water *boils* at 100°C.', ar: 'حقيقة' },
        { en: 'A *routine / schedule*: The train *leaves* at 8.', ar: 'روتين / جدول' },
        { en: 'Only *he / she / it* adds -s to the verb', ar: 'المفرد الغائب فقط يأخذ -s' },
      ],
    },
    form: {
      affirmative: [
        'I / You / We / They *work*.',
        'He / She / It *works*.',
      ],
      negative: [
        'I / You / We / They *do not (don’t)* work.',
        'He / She / It *does not (doesn’t)* work.',
      ],
      question: [
        '*Do* I / you / we / they work?',
        '*Does* he / she / it work?',
        'Short: Yes, I *do*. / No, he *doesn’t*.',
      ],
      note: 'After *does / doesn’t* the verb loses its -s: “He *doesn’t work*” (NOT works).',
      noteAr: 'بعد does/doesn’t يفقد الفعل حرف -s: نقول He doesn’t work لا works.',
    },
    spelling: [
      { rule: 'Most verbs → add *-s*', ar: 'معظم الأفعال ← -s', examples: 'work → works · play → plays · read → reads' },
      { rule: 'After s, sh, ch, x, o → add *-es*', ar: 'بعد s, sh, ch, x, o ← -es', examples: 'watch → watches · go → goes · wash → washes · fix → fixes' },
      { rule: 'Consonant + y → *-ies*', ar: 'ساكن + y ← -ies', examples: 'study → studies · cry → cries · carry → carries' },
      { rule: 'Vowel + y → just *-s*', ar: 'علّة + y ← -s فقط', examples: 'play → plays · buy → buys · say → says' },
      { rule: 'Irregular: have → *has*', ar: 'شاذّ: have ← has', examples: 'She has a car.' },
    ],
    signals: [
      { en: 'every day / week', ar: 'كل يوم/أسبوع' }, { en: 'usually', ar: 'عادةً' }, { en: 'always', ar: 'دائمًا' },
      { en: 'often', ar: 'غالبًا' }, { en: 'sometimes', ar: 'أحيانًا' }, { en: 'never', ar: 'أبدًا' },
      { en: 'on Mondays', ar: 'أيام الاثنين' }, { en: 'twice a week', ar: 'مرتين أسبوعيًا' },
    ],
    examples: [
      { en: 'I *work* in an office.', ar: 'أعمل في مكتب.' }, { en: 'You *speak* English well.', ar: 'تتحدّث الإنجليزية جيدًا.' },
      { en: 'We *live* in Rabat.', ar: 'نعيش في الرباط.' }, { en: 'They *play* football on Sunday.', ar: 'يلعبون الكرة الأحد.' },
      { en: 'He *works* at a hospital.', ar: 'يعمل في مستشفى.' }, { en: 'She *studies* medicine.', ar: 'تدرس الطب.' },
      { en: 'It *rains* a lot in winter.', ar: 'تمطر كثيرًا في الشتاء.' }, { en: 'My father *watches* the news.', ar: 'يشاهد أبي الأخبار.' },
      { en: 'The shop *opens* at nine.', ar: 'يفتح المتجر التاسعة.' }, { en: 'I *don’t* drink coffee.', ar: 'لا أشرب القهوة.' },
      { en: 'She *doesn’t* eat meat.', ar: 'لا تأكل اللحم.' }, { en: '*Do* you speak Arabic?', ar: 'هل تتحدّث العربية؟' },
      { en: '*Does* he live here?', ar: 'هل يعيش هنا؟' }, { en: 'Water *boils* at 100 degrees.', ar: 'يغلي الماء عند ١٠٠ درجة.' },
      { en: 'Usually I *wake* up at six.', ar: 'عادةً أستيقظ السادسة.' },
    ],
    exercises: [
      { q: 'Add the verb: “She ___ (study) every night.”', a: 'She *studies* every night.' },
      { q: 'Add the verb: “He ___ (go) to work by bus.”', a: 'He *goes* to work by bus.' },
      { q: 'Make negative: “They play tennis.”', a: 'They *don’t* play tennis.' },
      { q: 'Make negative: “She works on Sunday.”', a: 'She *doesn’t* work on Sunday.' },
      { q: 'Make a question: “You like tea.”', a: '*Do* you like tea?' },
      { q: 'Make a question: “He speaks French.”', a: '*Does* he speak French?' },
      { q: 'Fix: “He watch TV every night.”', a: 'He *watches* TV every night.' },
    ],
    reading: {
      title: 'Karim’s Routine', titleAr: 'روتين كريم',
      passage: [
        'Karim is an accountant, and he *works* in a small bank in the city.',
        'On weekdays he *wakes* up at six, *drinks* a black coffee, and *walks* to the office.',
        'He rarely *takes* the bus, because he *likes* the quiet morning streets.',
        'In the evening he usually *studies* English, but he never *works* on Fridays.',
        '“A good routine,” he always *says*, “keeps my mind calm.”',
      ],
      tip: 'A daily routine is the natural home of the present simple — notice the -s on he wakes / drinks / walks.',
      tipAr: 'الروتين اليومي هو الموضع الطبيعي للمضارع البسيط — لاحظ -s في wakes / drinks / walks.',
    },
    homework: [
      { en: 'Write 5 sentences about your daily routine', ar: 'اكتب ٥ جمل عن روتينك اليومي' },
      { en: 'Write 3 negatives (don’t / doesn’t)', ar: 'اكتب ٣ جمل منفية' },
      { en: 'Write 3 questions (Do / Does …?)', ar: 'اكتب ٣ أسئلة' },
    ],
    editing: {
      wrong: [
        'She go to school and study hard.',
        'He don’t likes coffee.',
        'Do she speaks English?',
      ],
      correct: [
        'She *goes* to school and *studies* hard.',
        'He *doesn’t* like coffee.',
        '*Does* she *speak* English?',
      ],
    },
  },

  /* ─────────────────────────── 11 · PRESENT CONTINUOUS (A1) ─────────────────────────── */
  {
    no: 10.2, cefr: 'A1', tag: 'Present Continuous', tagAr: 'المضارع المستمر',
    title: 'Present Continuous — happening now',
    titleAr: 'المضارع المستمر — يحدث الآن',
    objectives: [
      { en: 'Form: am / is / are + verb-ing', ar: 'التكوين: am/is/are + الفعل-ing' },
      { en: 'Spell the -ing form correctly', ar: 'إملاء صيغة -ing بشكل صحيح' },
      { en: 'Make negatives and questions', ar: 'تكوين النفي والسؤال' },
      { en: 'Use it for actions happening now', ar: 'استخدامه للأفعال الآن' },
    ],
    rule: {
      en: 'Use the present continuous for actions *happening now* or *around now*. Form it with *am / is / are* + verb *-ing*.',
      ar: 'نستخدم المضارع المستمر للأفعال التي تحدث الآن أو في هذه الفترة. ويتكوّن من am/is/are + الفعل + ing.',
    },
    explain: {
      intro: 'This tense always has two parts: the correct form of “be” + the -ing verb. Never drop the “be”.',
      introAr: 'لهذا الزمن جزآن دائمًا: صيغة be الصحيحة + الفعل بـ ing. لا تُسقط be أبدًا.',
      points: [
        { en: 'Happening *now*: I *am writing* this sentence.', ar: 'يحدث الآن' },
        { en: '*Temporary*: She *is staying* with us this week.', ar: 'مؤقّت' },
        { en: 'Always two parts: *be* + verb*-ing*', ar: 'جزآن دائمًا' },
        { en: 'Common with *Look!* and *Listen!*', ar: 'يكثر مع Look/Listen' },
      ],
    },
    form: {
      affirmative: [
        'I *am* working.',
        'He / She / It *is* working.',
        'You / We / They *are* working.',
      ],
      negative: [
        'I *am not* working.',
        'He *is not (isn’t)* working.',
        'They *are not (aren’t)* working.',
      ],
      question: [
        '*Am* I working?  ·  *Is* he working?',
        '*Are* you working?',
        'Short: Yes, I *am*. / No, I’m *not*.',
      ],
      note: 'Do NOT use the continuous with state verbs like *know, want, like, need* — say “I want”, not “I am wanting”.',
      noteAr: 'لا نستخدم المستمر مع أفعال الحالة مثل know/want/like/need (نقول I want لا I am wanting).',
    },
    spelling: [
      { rule: 'Most verbs → add *-ing*', ar: 'الأغلب ← -ing', examples: 'play → playing · read → reading' },
      { rule: 'Ends in *-e* → drop the e, add -ing', ar: 'ينتهي بـ e ← احذفها', examples: 'make → making · write → writing · come → coming' },
      { rule: 'Short consonant-vowel-consonant → *double* the last letter', ar: 'مقطع قصير ← ضاعف الأخير', examples: 'run → running · sit → sitting · stop → stopping' },
      { rule: 'Ends in *-ie* → change to y', ar: 'ينتهي بـ ie ← y', examples: 'lie → lying · die → dying' },
    ],
    signals: [
      { en: 'now', ar: 'الآن' }, { en: 'right now', ar: 'حالًا' }, { en: 'at the moment', ar: 'في هذه اللحظة' },
      { en: 'today', ar: 'اليوم' }, { en: 'Look!', ar: 'انظر!' }, { en: 'Listen!', ar: 'استمع!' }, { en: 'this week', ar: 'هذا الأسبوع' },
    ],
    examples: [
      { en: 'I *am reading* a book now.', ar: 'أقرأ كتابًا الآن.' }, { en: 'She *is cooking* dinner.', ar: 'تطبخ العشاء.' },
      { en: 'They *are playing* outside.', ar: 'يلعبون بالخارج.' }, { en: 'We *are studying* for the test.', ar: 'نذاكر للاختبار.' },
      { en: 'He *is running* to the bus.', ar: 'يركض نحو الحافلة.' }, { en: 'The baby *is sleeping*.', ar: 'ينام الرضيع.' },
      { en: 'Look! It *is raining*.', ar: 'انظر! إنها تمطر.' }, { en: 'I *am not watching* TV.', ar: 'لا أشاهد التلفاز.' },
      { en: 'She *isn’t working* today.', ar: 'لا تعمل اليوم.' }, { en: '*Are* you listening?', ar: 'هل تستمع؟' },
      { en: '*Is* he coming?', ar: 'هل هو قادم؟' }, { en: 'We *are making* a cake.', ar: 'نُعِدّ كعكة.' },
    ],
    exercises: [
      { q: 'Form: “I ___ (write) now.”', a: 'I *am writing* now.' },
      { q: 'Spell the -ing: “run” →', a: '*running*' },
      { q: 'Spell the -ing: “make” →', a: '*making*' },
      { q: 'Make negative: “She is sleeping.”', a: 'She *isn’t* sleeping.' },
      { q: 'Make a question: “They are working.”', a: '*Are* they working?' },
      { q: 'Fix: “He is run to school.”', a: 'He is *running* to school.' },
    ],
    reading: {
      title: 'A Busy Kitchen', titleAr: 'مطبخ مزدحم',
      passage: [
        'It is six o’clock, and the whole family *is getting* ready for dinner.',
        'My mother *is frying* fish, while my sister *is washing* the salad.',
        'I *am setting* the table, but my little brother *isn’t helping* — he *is watching* cartoons.',
        'Something smells wonderful, though I think the rice *is burning* a little!',
        '“*Are* you coming?” my mother calls. “Everything is almost ready.”',
      ],
      tip: 'Use the present continuous for a scene happening right now — be + verb-ing.',
      tipAr: 'المضارع المستمر لمشهدٍ يحدث الآن — be + الفعل-ing.',
    },
    homework: [
      { en: 'Write 4 sentences about what people are doing now', ar: 'اكتب ٤ جمل عمّا يحدث الآن' },
      { en: 'Spell the -ing form of 6 verbs', ar: 'اكتب صيغة -ing لستة أفعال' },
      { en: 'Write 2 negatives and 2 questions', ar: 'اكتب جملتين منفيتين وسؤالين' },
    ],
    editing: {
      wrong: [
        'She cooking dinner right now.',
        'They is playing in the garden.',
        'I am write a letter now.',
      ],
      correct: [
        'She *is cooking* dinner right now.',
        'They *are* playing in the garden.',
        'I am *writing* a letter now.',
      ],
    },
  },

  /* ─────────────────────────── 12 · PAST SIMPLE (A2) ─────────────────────────── */
  {
    no: 10.4, cefr: 'A2', irregulars: 'past', tag: 'Past Simple', tagAr: 'الماضي البسيط',
    title: 'Past Simple — finished actions',
    titleAr: 'الماضي البسيط — أفعال منتهية',
    objectives: [
      { en: 'Add -ed to regular verbs', ar: 'إضافة -ed للأفعال المنتظمة' },
      { en: 'Learn common irregular verbs', ar: 'تعلّم الأفعال الشاذة الشائعة' },
      { en: 'Make negatives with didn’t', ar: 'تكوين النفي بـ didn’t' },
      { en: 'Ask questions with did', ar: 'طرح الأسئلة بـ did' },
    ],
    rule: {
      en: 'Use the past simple for *finished* actions at a *known past time*. Regular verbs add *-ed*; many common verbs are *irregular* (go → went).',
      ar: 'نستخدم الماضي البسيط للأفعال المنتهية في وقت ماضٍ معروف. المنتظمة تأخذ -ed، وكثير من الشائعة شاذّة (go → went).',
    },
    explain: {
      intro: 'The verb is the same for every person (I / he / they worked). The tricky parts are the -ed spelling, the irregular verbs, and using the base verb after did/didn’t.',
      introAr: 'الفعل واحد لكل الضمائر. والصعوبة في إملاء -ed، والأفعال الشاذة، واستخدام الفعل المجرّد بعد did/didn’t.',
      points: [
        { en: 'Regular: add *-ed* → work → worked', ar: 'منتظم: -ed' },
        { en: 'Irregular: the word changes → go → *went*', ar: 'شاذّ: تتغيّر الكلمة' },
        { en: 'Same for *every* person: I / he / we *worked*', ar: 'واحد لكل الضمائر' },
        { en: 'After *did / didn’t* use the *base* verb', ar: 'بعد did/didn’t الفعل المجرّد' },
      ],
    },
    form: {
      affirmative: [
        'I / You / He / She / We / They *worked*. (regular)',
        'I / He / They *went*, *ate*, *saw*. (irregular)',
      ],
      negative: [
        'I / He / They *did not (didn’t)* *work*.',
        '→ base verb: didn’t *go*, didn’t *eat*',
      ],
      question: [
        '*Did* I / you / he / they work?',
        'Short: Yes, I *did*. / No, I *didn’t*.',
      ],
      note: 'After *did / didn’t*, always use the *base* verb: “He *didn’t go*” (NOT didn’t went).',
      noteAr: 'بعد did/didn’t نستخدم الفعل المجرّد دائمًا: He didn’t go لا went.',
    },
    spelling: [
      { rule: 'Most verbs → add *-ed*', ar: 'الأغلب ← -ed', examples: 'work → worked · play → played' },
      { rule: 'Ends in *-e* → add *-d*', ar: 'ينتهي بـ e ← -d', examples: 'live → lived · like → liked' },
      { rule: 'Consonant + y → *-ied*', ar: 'ساكن + y ← -ied', examples: 'study → studied · cry → cried' },
      { rule: 'Short consonant-vowel-consonant → *double* it', ar: 'مقطع قصير ← ضاعف', examples: 'stop → stopped · plan → planned' },
    ],
    signals: [
      { en: 'yesterday', ar: 'أمس' }, { en: 'last week / year', ar: 'الأسبوع/العام الماضي' }, { en: '… ago', ar: 'منذ' },
      { en: 'in 2010', ar: 'في ٢٠١٠' }, { en: 'when I was young', ar: 'حين كنت صغيرًا' }, { en: 'this morning', ar: 'هذا الصباح' },
    ],
    examples: [
      { en: 'I *worked* late yesterday.', ar: 'عملت متأخرًا أمس.' }, { en: 'She *watched* a film last night.', ar: 'شاهدت فيلمًا ليلة أمس.' },
      { en: 'We *studied* for the exam.', ar: 'ذاكرنا للامتحان.' }, { en: 'They *stopped* at the café.', ar: 'توقّفوا في المقهى.' },
      { en: 'He *went* to Rabat last week.', ar: 'ذهب إلى الرباط.' }, { en: 'I *ate* fish for lunch.', ar: 'أكلت السمك غداءً.' },
      { en: 'She *saw* an old friend.', ar: 'رأت صديقة قديمة.' }, { en: 'We *bought* a new car.', ar: 'اشترينا سيارة جديدة.' },
      { en: 'Irregular: go→*went* · eat→*ate* · see→*saw* · buy→*bought* · have→*had*', ar: 'أفعال شاذة' },
      { en: 'I *didn’t* sleep well.', ar: 'لم أنم جيدًا.' }, { en: 'He *didn’t* come to class.', ar: 'لم يحضر الدرس.' },
      { en: '*Did* you enjoy the trip?', ar: 'هل استمتعت بالرحلة؟' }, { en: '*Did* she call you?', ar: 'هل اتصلت بك؟' },
    ],
    exercises: [
      { q: 'Past: “She ___ (study) all night.”', a: 'She *studied* all night.' },
      { q: 'Past: “We ___ (go) to the beach.”', a: 'We *went* to the beach.' },
      { q: 'Make negative: “He came early.”', a: 'He *didn’t* come early.' },
      { q: 'Make a question: “They visited Fes.”', a: '*Did* they visit Fes?' },
      { q: 'Fix: “I didn’t went home.”', a: 'I didn’t *go* home.' },
      { q: 'Spell the past: “stop” →', a: '*stopped*' },
    ],
    reading: {
      title: 'A Trip to the Sea', titleAr: 'رحلة إلى البحر',
      passage: [
        'Last summer my family *went* to a small town on the coast.',
        'We *stayed* in an old hotel, *swam* every morning, and *ate* fresh fish for lunch.',
        'One afternoon I *lost* my phone on the beach, but a kind man *found* it and *gave* it back.',
        'We *didn’t* want the holiday to end, yet the last day *came* too soon.',
        'It *was* the best week of the whole year.',
      ],
      tip: 'A story is naturally past simple — mix regular (stayed) with irregular (went, swam, ate, lost, found).',
      tipAr: 'القصة تُروى بالماضي البسيط — امزج المنتظم (stayed) والشاذّ (went, swam, ate, lost).',
    },
    homework: [
      { en: 'Write 5 sentences about last weekend (past)', ar: 'اكتب ٥ جمل عن الأسبوع الماضي' },
      { en: 'Write 3 negatives with didn’t', ar: 'اكتب ٣ جمل بـ didn’t' },
      { en: 'List the past of 8 irregular verbs', ar: 'اكتب ماضي ٨ أفعال شاذة' },
    ],
    editing: {
      wrong: [
        'Yesterday she go to the market and buy bread.',
        'We didn’t went to school last Monday.',
        'Did you saw the film?',
      ],
      correct: [
        'Yesterday she *went* to the market and *bought* bread.',
        'We didn’t *go* to school last Monday.',
        'Did you *see* the film?',
      ],
    },
  },

  /* ─────────────────────────── 13 · FUTURE (A2) ─────────────────────────── */
  {
    no: 10.6, cefr: 'A2', tag: 'Future', tagAr: 'المستقبل',
    title: 'The Future — will & going to',
    titleAr: 'المستقبل — will و going to',
    objectives: [
      { en: 'Form the future with will + base verb', ar: 'التكوين بـ will + الفعل المجرّد' },
      { en: 'Form the future with be going to', ar: 'التكوين بـ be going to' },
      { en: 'Make negatives and questions', ar: 'تكوين النفي والسؤال' },
      { en: 'Choose will vs going to', ar: 'الاختيار بين will و going to' },
    ],
    rule: {
      en: 'Two common ways to talk about the future: *will* + base verb (a decision, prediction, or promise) and *be going to* + base verb (a plan or intention).',
      ar: 'طريقتان شائعتان للمستقبل: will + الفعل المجرّد (قرار/توقّع/وعد)، و be going to + الفعل المجرّد (خطة/نية).',
    },
    explain: {
      intro: 'Use “will” for something you decide now or predict; use “going to” for a plan you already have.',
      introAr: 'استخدم will لما تقرّره الآن أو تتوقّعه، و going to لخطة لديك بالفعل.',
      points: [
        { en: '*will* = instant decision / prediction / promise', ar: 'قرار فوري / توقّع / وعد' },
        { en: '*going to* = a plan or intention', ar: 'خطة أو نية' },
        { en: 'Both take the *base* verb after them', ar: 'يتبعهما الفعل المجرّد' },
        { en: '*won’t* = will not', ar: 'won’t = will not' },
      ],
    },
    form: {
      affirmative: [
        'I / You / He / We / They *will* work. (’ll)',
        'I *am going to* work. / He *is going to* work. / They *are going to* work.',
      ],
      negative: [
        'I *will not (won’t)* work.',
        'I *am not going to* work.',
      ],
      question: [
        '*Will* you work? — Yes, I *will*. / No, I *won’t*.',
        '*Are* you *going to* work?',
      ],
      note: 'After *will* and *going to*, use the *base* verb (will *go*, going to *go* — never “will goes / will went”).',
      noteAr: 'بعد will و going to نستخدم الفعل المجرّد (will go لا will goes/went).',
    },
    signals: [
      { en: 'tomorrow', ar: 'غدًا' }, { en: 'next week / year', ar: 'الأسبوع/العام القادم' }, { en: 'soon', ar: 'قريبًا' },
      { en: 'tonight', ar: 'الليلة' }, { en: 'later', ar: 'لاحقًا' }, { en: 'in the future', ar: 'في المستقبل' },
    ],
    examples: [
      { en: 'I *will call* you tomorrow.', ar: 'سأتصل بك غدًا.' }, { en: 'She *will help* you.', ar: 'ستساعدك.' },
      { en: 'It *will rain* tonight.', ar: 'ستمطر الليلة.' }, { en: 'I think they *will win*.', ar: 'أظن أنهم سيفوزون.' },
      { en: 'I *’ll* have the soup, please.', ar: 'سآخذ الشوربة من فضلك.' }, { en: 'We *are going to* travel this summer.', ar: 'سنسافر هذا الصيف.' },
      { en: 'He *is going to* study medicine.', ar: 'سيدرس الطب.' }, { en: 'They *are going to* buy a house.', ar: 'سيشترون بيتًا.' },
      { en: 'I *won’t* forget your birthday.', ar: 'لن أنسى عيد ميلادك.' }, { en: 'She *won’t* be late.', ar: 'لن تتأخّر.' },
      { en: '*Will* you come to the party?', ar: 'هل ستأتي إلى الحفل؟' }, { en: '*Are* you *going to* call him?', ar: 'هل ستتصل به؟' },
    ],
    exercises: [
      { q: 'will: “I ___ (help) you tomorrow.”', a: 'I *will help* you tomorrow.' },
      { q: 'going to: “We ___ (visit) Fes next week.”', a: 'We *are going to visit* Fes next week.' },
      { q: 'Make negative (won’t): “He will come.”', a: 'He *won’t* come.' },
      { q: 'Make a question: “They will travel.”', a: '*Will* they travel?' },
      { q: 'Fix: “I will to call you.”', a: 'I *will call* you.' },
      { q: 'Fix: “She is going to studies.”', a: 'She is going to *study*.' },
    ],
    reading: {
      title: 'My Plans for Summer', titleAr: 'خططي للصيف',
      passage: [
        'The exams finish next week, and I already have a plan for the holiday.',
        'First, I *am going to* visit my cousins in Marrakech, and we *are going to* explore the old city together.',
        'I *will* probably take hundreds of photos — I always do!',
        'My brother *won’t* join us, because he *is going to* start his first job.',
        '“Don’t worry,” he says, “I *will* visit you next time.”',
      ],
      tip: 'going to = a plan you already have · will = a decision or a promise made now.',
      tipAr: 'going to خطة لديك بالفعل · will قرار أو وعد الآن.',
    },
    homework: [
      { en: 'Write 3 plans with “going to”', ar: 'اكتب ٣ خطط بـ going to' },
      { en: 'Write 3 predictions with “will”', ar: 'اكتب ٣ توقّعات بـ will' },
      { en: 'Write 2 negatives (won’t) and 2 questions', ar: 'اكتب نفيين وسؤالين' },
    ],
    editing: {
      wrong: [
        'I will to visit my aunt next week.',
        'She is going to studies English.',
        'Will they comes tomorrow?',
      ],
      correct: [
        'I *will visit* my aunt next week.',
        'She is going to *study* English.',
        'Will they *come* tomorrow?',
      ],
    },
  },

  /* ─────────────────────────── 14 · PRESENT PERFECT (B1) ─────────────────────────── */
  {
    no: 10.8, cefr: 'B1', irregulars: 'pp', tag: 'Present Perfect', tagAr: 'المضارع التام',
    title: 'Present Perfect — past linked to now',
    titleAr: 'المضارع التام — ماضٍ متّصل بالحاضر',
    objectives: [
      { en: 'Form: have / has + past participle', ar: 'التكوين: have/has + التصريف الثالث' },
      { en: 'Learn past participles (V3)', ar: 'تعلّم التصريف الثالث' },
      { en: 'Make negatives and questions', ar: 'تكوين النفي والسؤال' },
      { en: 'Use for experience & unfinished time', ar: 'للتجربة والزمن غير المنتهي' },
    ],
    rule: {
      en: 'Use the present perfect for a past action *connected to now* (a result, an experience, an unfinished time). Form: *have / has* + the *past participle* (V3).',
      ar: 'نستخدم المضارع التام لفعل ماضٍ متّصل بالحاضر (نتيجة، تجربة، زمن غير منتهٍ). التكوين: have/has + التصريف الثالث.',
    },
    explain: {
      intro: 'The present perfect links the past to now — you do not give the exact time. Use “has” with he/she/it and “have” with the rest.',
      introAr: 'المضارع التام يربط الماضي بالآن دون ذكر الوقت المحدّد. نستخدم has مع he/she/it و have مع الباقي.',
      points: [
        { en: '*Experience*: I *have visited* Spain. (in my life)', ar: 'تجربة' },
        { en: '*Result now*: She *has lost* her keys. (still lost)', ar: 'نتيجة حاضرة' },
        { en: '*Unfinished time*: I *have worked* hard *this week*.', ar: 'زمن غير منتهٍ' },
        { en: 'With *just, already, yet, ever, never, since, for*', ar: 'كلمات دالة' },
      ],
    },
    form: {
      affirmative: [
        'I / You / We / They *have* worked. (’ve)',
        'He / She / It *has* worked. (’s)',
      ],
      negative: [
        'I *have not (haven’t)* worked.',
        'He *has not (hasn’t)* worked.',
      ],
      question: [
        '*Have* you worked? — Yes, I *have*. / No, I *haven’t*.',
        '*Has* he finished? — Yes, he *has*. / No, he *hasn’t*.',
      ],
      note: 'Use the *past participle* (V3): worked, *gone*, *eaten*, *seen*, *done*, *written*. Do NOT use the past simple after have/has.',
      noteAr: 'نستخدم التصريف الثالث (V3): gone, eaten, seen… ولا نستخدم الماضي البسيط بعد have/has.',
    },
    spelling: [
      { rule: 'Regular past participle = *-ed* (like the past)', ar: 'التصريف الثالث المنتظم = -ed', examples: 'work → worked · play → played' },
      { rule: 'Irregular past participles must be learned', ar: 'الشاذة تُحفظ', examples: 'go → gone · eat → eaten · see → seen · do → done · write → written · be → been' },
    ],
    signals: [
      { en: 'ever', ar: 'من قبل (في السؤال)' }, { en: 'never', ar: 'أبدًا' }, { en: 'already', ar: 'بالفعل' }, { en: 'yet', ar: 'بعد' },
      { en: 'just', ar: 'للتوّ' }, { en: 'since', ar: 'منذ (نقطة)' }, { en: 'for', ar: 'لمدّة' }, { en: 'recently', ar: 'مؤخّرًا' },
    ],
    examples: [
      { en: 'I *have visited* Spain twice.', ar: 'زرت إسبانيا مرتين.' }, { en: 'She *has finished* her homework.', ar: 'أنهت واجبها.' },
      { en: 'We *have lived* here since 2015.', ar: 'نعيش هنا منذ ٢٠١٥.' }, { en: 'They *have known* each other for years.', ar: 'يعرفان بعضهما منذ سنوات.' },
      { en: 'He *has just* arrived.', ar: 'وصل للتوّ.' }, { en: 'I *have already* eaten.', ar: 'أكلت بالفعل.' },
      { en: 'Have you finished *yet*?', ar: 'هل أنهيت بعد؟' }, { en: '*Have* you *ever* been to Paris?', ar: 'هل زرت باريس من قبل؟' },
      { en: 'I *have never* seen snow.', ar: 'لم أرَ الثلج قط.' }, { en: 'She *hasn’t* called me.', ar: 'لم تتصل بي.' },
      { en: '*Has* he *gone* home?', ar: 'هل ذهب إلى البيت؟' }, { en: 'We *have eaten* already.', ar: 'أكلنا بالفعل.' },
    ],
    exercises: [
      { q: 'Form: “I ___ (finish) my work.”', a: 'I *have finished* my work.' },
      { q: 'have/has: “She ___ gone home.”', a: 'She *has* gone home.' },
      { q: 'Participle: “He has ___ (eat) lunch.”', a: 'He has *eaten* lunch.' },
      { q: 'Make negative: “They have arrived.”', a: 'They *haven’t* arrived.' },
      { q: 'Make a question: “You have seen it.”', a: '*Have* you seen it?' },
      { q: 'Fix: “I have went to the market.”', a: 'I have *gone* to the market.' },
    ],
    reading: {
      title: 'A New City', titleAr: 'مدينة جديدة',
      passage: [
        'I *moved* to this city three years ago, and I love it more every day.',
        'Since then, I *have made* good friends and *have learned* a lot about its history.',
        'I *have never* felt lonely here, because the people are so friendly.',
        'My sister arrived last month, but she *hasn’t* found a job *yet*.',
        'Life is not always easy — still, it *has been* a wonderful chapter, and I *have* grown as a person.',
      ],
      tip: 'Present perfect links the past to now (have made, have learned); use the past simple for a finished time (moved, arrived).',
      tipAr: 'المضارع التام يربط الماضي بالآن (have made)؛ والماضي البسيط لزمنٍ منتهٍ محدّد (moved, arrived).',
    },
    homework: [
      { en: 'Write 3 experiences with have/has + ever/never', ar: 'اكتب ٣ تجارب بـ ever/never' },
      { en: 'Write 2 sentences with since and for', ar: 'اكتب جملتين بـ since و for' },
      { en: 'List the past participle (V3) of 8 verbs', ar: 'اكتب التصريف الثالث لـ ٨ أفعال' },
    ],
    editing: {
      wrong: [
        'I have saw that film before.',
        'She have finished her work.',
        'Have you ate lunch yet?',
      ],
      correct: [
        'I have *seen* that film before.',
        'She *has* finished her work.',
        'Have you *eaten* lunch yet?',
      ],
    },
  },

  /* ─────────────────────────── 7 · FANBOYS ─────────────────────────── */
  {
    no: 14, tag: 'FANBOYS', tagAr: 'أدوات العطف',
    title: 'Coordinating Conjunctions — FANBOYS',
    titleAr: 'أدوات العطف — FANBOYS',
    objectives: [
      { en: 'Name the 7 FANBOYS conjunctions', ar: 'تسمية أدوات العطف السبع' },
      { en: 'Join two equal ideas into one sentence', ar: 'ربط فكرتين متساويتين' },
      { en: 'Put a comma before the conjunction', ar: 'وضع فاصلة قبل الأداة' },
      { en: 'Pick the conjunction that fits the meaning', ar: 'اختيار الأداة المناسبة' },
    ],
    rule: {
      en: 'FANBOYS join two equal ideas: *For, And, Nor, But, Or, Yet, So*. When both sides are complete sentences, put a *comma* before the conjunction.',
      ar: 'أدوات FANBOYS تربط فكرتين متساويتين. وحين يكون الطرفان جملتين كاملتين نضع فاصلة قبل الأداة.',
    },
    explain: {
      intro: 'Each conjunction carries a meaning. Choose it on purpose; do not use “and” for everything.',
      introAr: 'لكل أداة معنى. اخترها بوعي، ولا تستعمل and لكل شيء.',
      points: [
        { en: '*and* = add · *but*/*yet* = contrast', ar: 'إضافة · تضاد' },
        { en: '*or* = choice · *nor* = second negative', ar: 'اختيار · نفي ثانٍ' },
        { en: '*for* = reason · *so* = result', ar: 'سبب · نتيجة' },
        { en: 'Comma before FANBOYS only when both sides are full sentences', ar: 'فاصلة إذا كان الطرفان جملتين' },
      ],
    },
    examples: [
      { en: 'I like tea *and* coffee.', ar: 'أحب الشاي والقهوة.' },
      { en: 'I studied hard*,* *and* I passed.', ar: 'ذاكرت بجد، ونجحت.' },
      { en: 'It is sunny *but* cold.', ar: 'الجو مشمس لكنه بارد.' },
      { en: 'I was tired*,* *but* I finished.', ar: 'كنت متعبًا، لكنني أنهيت.' },
      { en: 'Hurry*,* *or* we will be late.', ar: 'أسرع، وإلّا سنتأخّر.' },
      { en: 'It rained*,* *so* we stayed home.', ar: 'أمطرت، لذلك بقينا في البيت.' },
      { en: 'I stayed home*,* *for* I was sick.', ar: 'بقيت في البيت، لأنني كنت مريضًا.' },
      { en: 'She is small*,* *yet* strong.', ar: 'هي صغيرة، ومع ذلك قوية.' },
      { en: 'He neither called*,* *nor* did he write.', ar: 'لم يتّصل ولم يكتب.' },
      { en: 'We can walk*,* *or* we can drive.', ar: 'نمشي أو نقود.' },
    ],
    exercises: [
      { q: 'Choose + comma: “I was hungry ___ I ate.” (result)', a: 'I was hungry*,* *so* I ate.' },
      { q: 'Choose: “She tried ___ she failed.” (contrast)', a: 'She tried*,* *but* she failed.' },
      { q: 'Add the comma: “It was late so we left.”', a: 'It was late*,* so we left.' },
      { q: 'Which fits: “Study hard ___ you will pass.”', a: 'Study hard*,* *or* you will pass. (choice/warning)' },
      { q: 'No comma needed? “I like cats and dogs.”', a: 'Correct — no comma (not two full sentences).' },
    ],
    reading: {
      title: 'A Change of Plans', titleAr: 'تغيير في الخطط',
      passage: [
        'We wanted to visit the beach*,* *but* the weather was bad.',
        'It was cold and windy*,* *so* we changed our plans.',
        'We could stay home*,* *or* we could go to the museum.',
        'I love art*,* *so* the choice was easy for me.',
        'The museum was quiet*,* *yet* every room was full of color.',
      ],
      questions: [
        { q: 'Why did they change their plans?', a: 'The weather was bad (cold and windy).' },
        { q: 'What were the two choices?', a: 'Stay home *or* go to the museum.' },
        { q: 'Find one “so” and explain it.', a: 'It shows a *result* (e.g., “I love art, so the choice was easy”).' },
      ],
      tip: 'The comma sits BEFORE and / but / so when two full ideas meet.',
      tipAr: 'الفاصلة قبل and/but/so حين تلتقي فكرتان كاملتان.',
    },
    homework: [
      { en: 'Join 5 pairs of sentences with different FANBOYS', ar: 'اربط ٥ أزواج بأدوات مختلفة' },
      { en: 'Write 2 sentences with “but” and 2 with “so”', ar: 'اكتب جملتين بـ but وجملتين بـ so' },
      { en: 'Write a 3-sentence story using and, but, so', ar: 'اكتب قصة من ٣ جمل بـ and/but/so' },
    ],
    editing: {
      wrong: [
        'I wanted to sleep but I had work to do.',
        'It was raining so we took the bus.',
        'You can call me or you can send a message.',
      ],
      correct: [
        'I wanted to sleep*,* but I had work to do.',
        'It was raining*,* so we took the bus.',
        'You can call me*,* or you can send a message.',
      ],
    },
  },

  /* ─────────────────────────── 8 · SENTENCE TYPES ─────────────────────────── */
  {
    no: 13, tag: 'Sentence types', tagAr: 'أنواع الجمل',
    title: 'The Four Sentence Types',
    titleAr: 'أنواع الجمل الأربعة',
    objectives: [
      { en: 'Recognize the 4 sentence types', ar: 'التعرّف على الأنواع الأربعة' },
      { en: 'Define simple, compound, complex', ar: 'تعريف البسيطة والمركّبة والمعقّدة' },
      { en: 'Identify the type of a given sentence', ar: 'تحديد نوع الجملة المعطاة' },
      { en: 'Mix types for interesting writing', ar: 'مزج الأنواع لكتابة ممتعة' },
    ],
    rule: {
      en: '*Simple* = one idea. *Compound* = two equal ideas + comma + FANBOYS. *Complex* = one main + one dependent idea. *Compound-Complex* = a mix of both.',
      ar: 'بسيطة: فكرة واحدة. مركّبة: فكرتان متساويتان + فاصلة + أداة. معقّدة: رئيسية + تابعة. مركّبة معقّدة: مزيج.',
    },
    explain: {
      intro: 'Good writing is not all simple sentences and not all long ones. Knowing the types lets you control your rhythm.',
      introAr: 'الكتابة الجيدة ليست كلها جملًا بسيطة ولا كلها طويلة. ومعرفة الأنواع تمنحك التحكّم في الإيقاع.',
      points: [
        { en: '*Simple*: I study English.', ar: 'بسيطة' },
        { en: '*Compound*: I study, and I practice.', ar: 'مركّبة' },
        { en: '*Complex*: Because I study, I improve.', ar: 'معقّدة' },
        { en: '*Compound-Complex*: When I study, I learn, and I grow.', ar: 'مركّبة معقّدة' },
      ],
    },
    examples: [
      { en: 'I study English.', ar: 'أدرس الإنجليزية. (بسيطة)' },
      { en: 'The sun is bright.', ar: 'الشمس ساطعة. (بسيطة)' },
      { en: 'I study*,* *and* I practice.', ar: 'أدرس وأتمرّن. (مركّبة)' },
      { en: 'He was tired*,* *but* he finished.', ar: 'كان متعبًا لكنه أنهى. (مركّبة)' },
      { en: '*Because* I study, I improve.', ar: 'لأنني أدرس أتحسّن. (معقّدة)' },
      { en: '*When* it rains, I stay home.', ar: 'عندما تمطر أبقى في البيت. (معقّدة)' },
      { en: '*Although* it was hard, I tried.', ar: 'مع أنه كان صعبًا حاولت. (معقّدة)' },
      { en: '*When* I study, I learn*,* *and* I grow.', ar: 'عندما أدرس أتعلّم وأنمو. (مركّبة معقّدة)' },
      { en: 'We can walk*,* *or* we can drive.', ar: 'نمشي أو نقود. (مركّبة)' },
      { en: 'She reads books.', ar: 'تقرأ الكتب. (بسيطة)' },
    ],
    exercises: [
      { q: 'Type? “I read books.”', a: '*Simple*.' },
      { q: 'Type? “I read, and I write.”', a: '*Compound*.' },
      { q: 'Type? “Because I read, I learn.”', a: '*Complex*.' },
      { q: 'Make it compound: “I was late. I ran.”', a: 'I was late*,* *so* I ran.' },
      { q: 'Make it complex: “It rained. We stayed home.”', a: '*Because* it rained, we stayed home.' },
    ],
    reading: {
      title: 'How I Learn', titleAr: 'كيف أتعلّم',
      passage: [
        'I study English every day.',
        'I read new words*,* *and* I write them in a notebook.',
        '*When* I make a mistake, I stop and fix it.',
        'Progress is slow*,* *but* it is real.',
        '*Because* I never give up, I keep getting better.',
      ],
      questions: [
        { q: 'Find a simple sentence in the passage.', a: '“I study English every day.”' },
        { q: 'Find a compound sentence.', a: '“I read new words, and I write them…”' },
        { q: 'Find a complex sentence.', a: '“When I make a mistake, I stop and fix it.”' },
      ],
      tip: 'One paragraph, all three types — that is what keeps a reader interested.',
      tipAr: 'فقرة واحدة بالأنواع الثلاثة — هذا ما يبقي القارئ مهتمًّا.',
    },
    homework: [
      { en: 'Write 2 simple, 2 compound, and 2 complex sentences', ar: 'اكتب جملتين من كل نوع' },
      { en: 'Label the type of 4 sentences from any text', ar: 'حدّد نوع ٤ جمل من أي نص' },
      { en: 'Turn 3 short simple sentences into compound/complex', ar: 'حوّل ٣ جمل بسيطة إلى مركّبة/معقّدة' },
    ],
    editing: {
      wrong: [
        'I like coffee I do not like tea.',
        'Because I woke up late I missed the bus.',
        'She was tired but she kept working.',
      ],
      correct: [
        'I like coffee*,* *but* I do not like tea.',
        '*Because* I woke up late*,* I missed the bus.',
        'She was tired*,* but she kept working.',
      ],
    },
  },

  /* ─────────────────────────── 9 · COMPOUND ─────────────────────────── */
  {
    no: 15, tag: 'Compound', tagAr: 'المركّبة',
    title: 'Compound Sentences & Run-ons',
    titleAr: 'الجملة المركّبة والجملة الملتصقة',
    objectives: [
      { en: 'Join two full sentences with comma + FANBOYS', ar: 'ربط جملتين بفاصلة + أداة' },
      { en: 'Recognize a run-on sentence', ar: 'التعرّف على الجملة الملتصقة' },
      { en: 'Fix a run-on in two ways', ar: 'إصلاح الملتصقة بطريقتين' },
      { en: 'Avoid the comma splice', ar: 'تجنّب فصل الجملتين بفاصلة فقط' },
    ],
    rule: {
      en: 'Join two complete sentences with *comma + FANBOYS*. A *run-on* has no join; a *comma splice* uses only a comma. Both are errors.',
      ar: 'اربط جملتين كاملتين بفاصلة + أداة عطف. الجملة الملتصقة بلا رابط، وفصلها بفاصلة فقط خطأ.',
    },
    explain: {
      intro: 'Two complete sentences cannot simply sit together, and a comma alone is not strong enough to hold them.',
      introAr: 'لا يمكن وضع جملتين كاملتين معًا بلا رابط، والفاصلة وحدها لا تكفي لربطهما.',
      points: [
        { en: 'Right: I was late*,* *so* I ran.', ar: 'الصحيح: فاصلة + أداة' },
        { en: 'Run-on ✗: I was late I ran.', ar: 'ملتصقة: بلا رابط' },
        { en: 'Comma splice ✗: I was late, I ran.', ar: 'فاصلة فقط: خطأ' },
        { en: 'Fix 2: two sentences — I was late. I ran.', ar: 'حل آخر: جملتان منفصلتان' },
      ],
    },
    examples: [
      { en: 'I woke up early*,* *and* I made breakfast.', ar: 'استيقظت مبكرًا وأعددت الفطور.' },
      { en: 'She called me*,* *but* I was busy.', ar: 'اتصلت بي لكنني كنت مشغولًا.' },
      { en: 'We can stay*,* *or* we can go.', ar: 'نبقى أو نذهب.' },
      { en: 'It was raining*,* *so* we took an umbrella.', ar: 'كانت تمطر، فأخذنا مظلّة.' },
      { en: 'The test was hard*,* *yet* she smiled.', ar: 'كان الاختبار صعبًا ومع ذلك ابتسمت.' },
      { en: 'I studied all night*,* *so* I was tired.', ar: 'ذاكرت طوال الليل، فكنت متعبًا.' },
      { en: 'He knocked*,* *but* no one answered.', ar: 'طرق الباب لكن لم يجب أحد.' },
      { en: 'You can walk*,* *or* you can take the bus.', ar: 'تمشي أو تأخذ الحافلة.' },
      { en: 'The sun set*,* *and* the streets grew quiet.', ar: 'غربت الشمس وهدأت الشوارع.' },
    ],
    exercises: [
      { q: 'Fix the run-on: “I was tired I slept.”', a: 'I was tired*,* *so* I slept.' },
      { q: 'Fix the comma splice: “She ran, she missed the bus.”', a: 'She ran*,* *but* she missed the bus.' },
      { q: 'Join: “The film ended. We went home.” (so)', a: 'The film ended*,* *so* we went home.' },
      { q: 'Add the comma: “It was hot so we swam.”', a: 'It was hot*,* so we swam.' },
      { q: 'Two ways to fix: “I called he did not answer.”', a: 'I called*,* *but* he did not answer. / I called. He did not answer.' },
    ],
    reading: {
      title: 'A Busy Morning', titleAr: 'صباح مزدحم',
      passage: [
        'I woke up late*,* *so* I skipped breakfast.',
        'I wanted coffee*,* *but* there was no time.',
        'The bus was full*,* *yet* I found a seat.',
        'I opened my book*,* *and* I read a few pages.',
        'I reached the office early*,* *so* I felt proud.',
      ],
      questions: [
        { q: 'Why did the writer skip breakfast?', a: 'Because they woke up late.' },
        { q: 'How many compound sentences are here?', a: 'All five (each is comma + FANBOYS).' },
        { q: 'Rewrite line 2 as two separate sentences.', a: 'I wanted coffee. There was no time.' },
      ],
      tip: 'Every join is comma + FANBOYS between two FULL ideas — never a comma alone.',
      tipAr: 'كل ربط فاصلة + أداة بين فكرتين كاملتين — لا فاصلة وحدها.',
    },
    homework: [
      { en: 'Write 5 compound sentences about your day', ar: 'اكتب ٥ جمل مركّبة عن يومك' },
      { en: 'Fix 3 run-on sentences (comma + FANBOYS)', ar: 'أصلح ٣ جمل ملتصقة' },
      { en: 'Fix 2 comma splices two different ways', ar: 'أصلح جملتين بطريقتين' },
    ],
    editing: {
      wrong: [
        'I finished my work I went home.',
        'The coffee was cold, I drank it anyway.',
        'She studied hard she passed the exam.',
      ],
      correct: [
        'I finished my work*,* *so* I went home.',
        'The coffee was cold*,* *but* I drank it anyway.',
        'She studied hard*,* *so* she passed the exam.',
      ],
    },
  },

  /* ─────────────────────────── 10 · COMPLEX ─────────────────────────── */
  {
    no: 16, tag: 'Complex', tagAr: 'المعقّدة',
    title: 'Complex Sentences — adverb clauses',
    titleAr: 'الجملة المعقّدة — الجُمل الظرفية',
    objectives: [
      { en: 'Recognize a dependent (adverb) clause', ar: 'التعرّف على الجملة التابعة' },
      { en: 'Use because, when, if, although…', ar: 'استخدام because/when/if/although' },
      { en: 'Add a comma when the clause comes first', ar: 'فاصلة إذا جاءت التابعة أولًا' },
      { en: 'Drop the comma when it comes second', ar: 'حذفها إذا جاءت ثانيًا' },
    ],
    rule: {
      en: 'A complex sentence has a main idea and a dependent clause. Clause *first* → add a *comma*: “*When* it rains*,* I stay home.” Clause *second* → no comma.',
      ar: 'الجملة المعقّدة فيها فكرة رئيسية وأخرى تابعة. التابعة أولًا ← فاصلة، وثانيًا ← بلا فاصلة.',
    },
    explain: {
      intro: 'A dependent clause begins with a linking word and cannot stand alone. It needs a main clause to complete the idea.',
      introAr: 'الجملة التابعة تبدأ بأداة ربط ولا تقف وحدها؛ تحتاج جملة رئيسية لإتمام المعنى.',
      points: [
        { en: 'Linking words: *because, when, if, although, after, before, while, since*', ar: 'أدوات الربط' },
        { en: 'Clause first → *comma*: When I study, I improve.', ar: 'أولًا ← فاصلة' },
        { en: 'Clause second → *no comma*: I improve when I study.', ar: 'ثانيًا ← بلا فاصلة' },
        { en: '“When it rains” alone is a fragment, not a sentence', ar: '«عندما تمطر» وحدها ناقصة' },
      ],
    },
    examples: [
      { en: '*When* it rains*,* I stay home.', ar: 'عندما تمطر أبقى في البيت.' },
      { en: 'I stay home *when* it rains.', ar: 'أبقى في البيت عندما تمطر.' },
      { en: '*Because* I was tired*,* I slept.', ar: 'لأنني كنت متعبًا نمت.' },
      { en: 'I slept *because* I was tired.', ar: 'نمت لأنني كنت متعبًا.' },
      { en: '*If* you study*,* you will pass.', ar: 'إذا ذاكرت ستنجح.' },
      { en: 'You will pass *if* you study.', ar: 'ستنجح إذا ذاكرت.' },
      { en: '*Although* it was hard*,* I finished.', ar: 'مع أنه كان صعبًا أنهيت.' },
      { en: '*After* I ate*,* I washed the dishes.', ar: 'بعد أن أكلت غسلت الأطباق.' },
      { en: '*Before* you sleep*,* brush your teeth.', ar: 'قبل أن تنام اغسل أسنانك.' },
      { en: '*While* she cooked*,* I set the table.', ar: 'بينما كانت تطبخ رتّبت الطاولة.' },
    ],
    exercises: [
      { q: 'Comma? “When I woke up I ate.”', a: 'When I woke up*,* I ate.' },
      { q: 'Comma? “I ate when I woke up.”', a: 'I ate when I woke up. (no comma)' },
      { q: 'Join (because): “I stayed home. I was sick.”', a: 'I stayed home *because* I was sick.' },
      { q: 'Move to front: “I read before I sleep.”', a: '*Before* I sleep*,* I read.' },
      { q: 'Fix: “Although I was tired. I kept going.”', a: '*Although* I was tired*,* I kept going.' },
    ],
    reading: {
      title: 'My Evening Routine', titleAr: 'روتين مسائي',
      passage: [
        '*When* I get home*,* I take a short rest.',
        'I study English *because* I want a better job.',
        '*If* I have energy*,* I read one page of a story.',
        '*Although* I feel tired at night*,* I never skip my review.',
        'I sleep early *so that* I can wake up fresh.',
      ],
      questions: [
        { q: 'Why does the writer study English?', a: '*Because* they want a better job.' },
        { q: 'Which sentences have a comma, and why?', a: 'The ones with the clause *first* (When…, If…, Although…).' },
        { q: 'Rewrite line 2 with the clause first.', a: '*Because* I want a better job*,* I study English.' },
      ],
      tip: 'Front clause = comma. Second clause = no comma.',
      tipAr: 'التابعة أولًا فاصلة، وثانيًا بلا فاصلة.',
    },
    homework: [
      { en: 'Write 4 complex sentences with the clause FIRST (commas)', ar: 'اكتب ٤ جمل بالتابعة أولًا' },
      { en: 'Rewrite 2 of them with the clause SECOND (no comma)', ar: 'أعد كتابتها بالتابعة ثانيًا' },
      { en: 'Use because, when, if, although once each', ar: 'استعمل كل أداة مرة' },
    ],
    editing: {
      wrong: [
        'When the bell rang the students left.',
        'I will help you if you ask, me.',
        'Because it was cold, so we stayed inside.',
      ],
      correct: [
        'When the bell rang*,* the students left.',
        'I will help you if you ask me. *(remove the comma)*',
        'Because it was cold*,* we stayed inside. *(drop “so”)*',
      ],
    },
  },

  /* ─────────────────────────── 11 · COMMAS ─────────────────────────── */
  {
    no: 17, tag: 'Commas', tagAr: 'الفاصلة',
    title: 'Commas — the five main uses',
    titleAr: 'الفاصلة — الاستعمالات الخمسة',
    objectives: [
      { en: 'Use commas in a series', ar: 'الفاصلة في السلسلة' },
      { en: 'Use commas in compound & complex sentences', ar: 'في الجمل المركّبة والمعقّدة' },
      { en: 'Set off extra information with commas', ar: 'عزل المعلومة الإضافية بفاصلتين' },
      { en: 'Avoid unnecessary commas', ar: 'تجنّب الفواصل الزائدة' },
    ],
    rule: {
      en: 'Use a comma: (1) in a series, (2) before FANBOYS in a compound sentence, (3) after a front adverb clause, (4) around extra information, (5) after an intro word.',
      ar: 'استخدم الفاصلة: في السلسلة، وقبل أداة العطف، وبعد الظرفية في البداية، وحول المعلومة الإضافية، وبعد الكلمة الافتتاحية.',
    },
    explain: {
      intro: 'A comma tells the reader to pause. Too few commas confuse; too many break the flow. These five rules cover almost every case.',
      introAr: 'الفاصلة تُخبر القارئ أن يتوقّف قليلًا. قلّتها تُربك وكثرتها تقطع التدفّق، وهذه القواعد الخمس تكفي غالبًا.',
      points: [
        { en: 'Series: apples*,* bread*,* and milk', ar: 'السلسلة' },
        { en: 'Compound: It was late*,* so we left', ar: 'المركّبة' },
        { en: 'Front clause: When we arrived*,* dinner was ready', ar: 'الظرفية أولًا' },
        { en: 'Extra info: My teacher*,* Mr. Ali*,* is kind', ar: 'المعلومة الإضافية' },
        { en: 'Intro word: First*,* open your book', ar: 'الكلمة الافتتاحية' },
      ],
    },
    examples: [
      { en: 'I bought apples*,* bread*,* and milk.', ar: 'اشتريت تفاحًا وخبزًا وحليبًا.' },
      { en: 'She speaks Arabic*,* French*,* and English.', ar: 'تتحدّث ثلاث لغات.' },
      { en: 'We ran*,* jumped*,* and laughed.', ar: 'ركضنا وقفزنا وضحكنا.' },
      { en: 'It was late*,* so we left.', ar: 'كان الوقت متأخّرًا فغادرنا.' },
      { en: 'I called him*,* but he did not answer.', ar: 'اتصلت به لكنه لم يجب.' },
      { en: 'When we arrived*,* dinner was ready.', ar: 'عندما وصلنا كان العشاء جاهزًا.' },
      { en: 'If you are ready*,* we can start.', ar: 'إذا كنت مستعدًا يمكننا البدء.' },
      { en: 'My teacher*,* Mr. Ali*,* is kind.', ar: 'معلّمي، السيد علي، لطيف.' },
      { en: 'Rabat*,* the capital*,* is beautiful.', ar: 'الرباط، العاصمة، جميلة.' },
      { en: 'First*,* open your book.', ar: 'أولًا، افتح كتابك.' },
      { en: 'Finally*,* we finished the project.', ar: 'أخيرًا، أنهينا المشروع.' },
    ],
    exercises: [
      { q: 'Add commas: “I like tea coffee and juice.”', a: 'I like tea*,* coffee*,* and juice.' },
      { q: 'Add a comma: “It was cold so I wore a coat.”', a: 'It was cold*,* so I wore a coat.' },
      { q: 'Add a comma: “When I woke up I ate.”', a: 'When I woke up*,* I ate.' },
      { q: 'Add commas (extra info): “My friend Omar is here.”', a: 'My friend*,* Omar*,* is here.' },
      { q: 'Remove the wrong comma: “I bought, apples and bread.”', a: 'I bought apples and bread.' },
    ],
    reading: {
      title: 'Shopping Day', titleAr: 'يوم التسوّق',
      passage: [
        'First*,* I made a list of what I needed.',
        'At the market I bought tomatoes*,* onions*,* and bread.',
        'The shop was crowded*,* but the seller*,* an old friend*,* helped me quickly.',
        'When I got home*,* I cooked a warm lunch.',
        'Finally*,* I sat down and enjoyed my meal.',
      ],
      questions: [
        { q: 'What three things did the writer buy?', a: 'Tomatoes, onions, and bread.' },
        { q: 'Who is “an old friend” in line 3?', a: 'The seller (extra information).' },
        { q: 'Why is there a comma after “When I got home”?', a: 'It is a *front adverb clause*.' },
      ],
      tip: 'Series · compound · front clause · extra info · intro word — all appear here.',
      tipAr: 'السلسلة والمركّبة والظرفية والمعلومة الإضافية والكلمة الافتتاحية — كلها هنا.',
    },
    homework: [
      { en: 'Write one sentence for each of the 5 comma rules', ar: 'اكتب جملة لكل قاعدة من القواعد الخمس' },
      { en: 'Add commas to a short paragraph you choose', ar: 'أضف الفواصل إلى فقرة قصيرة تختارها' },
      { en: 'Write a sentence with extra info between two commas', ar: 'اكتب جملة بمعلومة إضافية بين فاصلتين' },
    ],
    editing: {
      wrong: [
        'We visited Fes Rabat and Ifrane last summer.',
        'When the rain stopped we went outside.',
        'My uncle a doctor lives in Canada.',
      ],
      correct: [
        'We visited Fes*,* Rabat*,* and Ifrane last summer.',
        'When the rain stopped*,* we went outside.',
        'My uncle*,* a doctor*,* lives in Canada.',
      ],
    },
  },

  /* ─────────────────────────── 12 · PARALLEL ─────────────────────────── */
  {
    no: 18, tag: 'Parallel', tagAr: 'التوازي',
    title: 'Parallel Structure — the same form in a list',
    titleAr: 'التوازي — نفس الصيغة في القائمة',
    objectives: [
      { en: 'Understand parallel structure', ar: 'فهم التوازي' },
      { en: 'Keep every list item in the same form', ar: 'إبقاء عناصر القائمة بنفس الصيغة' },
      { en: 'Spot and fix a faulty (non-parallel) list', ar: 'اكتشاف القائمة غير المتوازية وإصلاحها' },
      { en: 'Write balanced, professional sentences', ar: 'كتابة جمل متوازنة واحترافية' },
    ],
    rule: {
      en: 'In a list, every item must have the *same grammatical form*. Right: “I like *reading*, *writing*, and *swimming*.” (all -ing).',
      ar: 'في القائمة يجب أن تكون كل العناصر بنفس الصيغة النحوية. الصحيح: reading, writing, swimming (كلها -ing).',
    },
    explain: {
      intro: 'Parallelism makes writing sound smooth and controlled. A mismatch feels broken, even to a reader who cannot explain why.',
      introAr: 'التوازي يجعل الكتابة سلسة ومتقنة، وعدم التطابق يبدو مكسورًا حتى لمن لا يعرف السبب.',
      points: [
        { en: 'All -ing: reading, writing, swimming ✓', ar: 'كلها -ing' },
        { en: 'All base verbs: read, write, swim ✓', ar: 'كلها فعل مجرّد' },
        { en: 'All adjectives: smart, kind, funny ✓', ar: 'كلها صفات' },
        { en: 'Do NOT mix: reading, to write, I swim ✗', ar: 'لا تخلط الصيغ' },
      ],
    },
    examples: [
      { en: 'I like *reading*, *writing*, and *swimming*.', ar: 'أحب القراءة والكتابة والسباحة.' },
      { en: 'She is *smart*, *kind*, and *funny*.', ar: 'هي ذكية ولطيفة ومرحة.' },
      { en: 'We *cooked*, *ate*, and *cleaned*.', ar: 'طبخنا وأكلنا ونظّفنا.' },
      { en: 'He wants *to read*, *to write*, and *to travel*.', ar: 'يريد أن يقرأ ويكتب ويسافر.' },
      { en: 'The plan is simple*,* clear*,* and *useful*.', ar: 'الخطة بسيطة وواضحة ومفيدة.' },
      { en: 'Study *slowly*, *carefully*, and *daily*.', ar: 'ادرس ببطء وعناية ويوميًا.' },
      { en: 'I bought *apples*, *bread*, and *milk*.', ar: 'اشتريت تفاحًا وخبزًا وحليبًا.' },
    ],
    exercises: [
      { q: 'Fix: “I like reading, to write, and I swim.”', a: 'I like *reading*, *writing*, and *swimming*.' },
      { q: 'Fix: “She is kind, smart, and a funny person.”', a: 'She is *kind*, *smart*, and *funny*.' },
      { q: 'Fix: “We ran, jumping, and we swam.”', a: 'We *ran*, *jumped*, and *swam*.' },
      { q: 'Complete: “He likes to cook and ___.”', a: '…and *to eat*.' },
      { q: 'Make parallel: “red, big, and it is round”', a: '*red*, *big*, and *round*.' },
    ],
    reading: {
      title: 'A Good Employee', titleAr: 'موظّف جيّد',
      passage: [
        'A good employee is *honest*, *hard-working*, and *reliable*.',
        'Every day she *plans* her tasks, *answers* her emails, and *helps* her team.',
        'She likes *learning* new skills, *solving* problems, and *sharing* ideas.',
        'Her goals are clear*:* to grow*,* to lead*,* and to inspire.',
      ],
      questions: [
        { q: 'List the three adjectives that describe her.', a: '*honest*, *hard-working*, *reliable* (all adjectives).' },
        { q: 'What form do “planning” verbs take in line 2?', a: 'Present with -s: *plans*, *answers*, *helps*.' },
        { q: 'Are her goals parallel? Give the form.', a: 'Yes — *to grow, to lead, to inspire* (all “to + verb”).' },
      ],
      tip: 'Each list keeps ONE form from start to finish.',
      tipAr: 'كل قائمة تحافظ على صيغة واحدة من البداية للنهاية.',
    },
    homework: [
      { en: 'Write 3 parallel lists (all -ing)', ar: 'اكتب ٣ قوائم متوازية بـ -ing' },
      { en: 'Describe yourself with 3 matching adjectives', ar: 'صِف نفسك بثلاث صفات متطابقة' },
      { en: 'Write a “goals” sentence using “to + verb” three times', ar: 'اكتب جملة أهداف بـ to + verb ثلاث مرات' },
    ],
    editing: {
      wrong: [
        'My job is to write, planning, and I answer emails.',
        'She is talented, kind, and works hard.',
        'We like to swim, running, and to read.',
      ],
      correct: [
        'My job is *to write*, *to plan*, and *to answer* emails.',
        'She is talented, kind, and *hard-working*.',
        'We like *swimming*, *running*, and *reading*.',
      ],
    },
  },

  /* ─────────────────────────── 13 · VARIETY ─────────────────────────── */
  {
    no: 20, tag: 'Variety', tagAr: 'التنويع',
    title: 'Sentence Variety — rhythm in writing',
    titleAr: 'تنويع الجمل — الإيقاع في الكتابة',
    objectives: [
      { en: 'Understand why variety matters', ar: 'فهم أهمية التنويع' },
      { en: 'Mix short and long sentences', ar: 'المزج بين القصير والطويل' },
      { en: 'Mix simple, compound, and complex', ar: 'المزج بين الأنواع' },
      { en: 'Start sentences in different ways', ar: 'بدء الجمل بطرق مختلفة' },
    ],
    rule: {
      en: 'Do not repeat the same short sentence pattern. *Mix* length (short + long) and *mix* type (simple + compound + complex). Variety keeps a reader awake.',
      ar: 'لا تكرّر النمط القصير نفسه. امزج بين الطول (قصير + طويل) والنوع (بسيطة + مركّبة + معقّدة)؛ التنويع يبقي القارئ متيقّظًا.',
    },
    explain: {
      intro: 'Four short sentences in a row sound like a robot. Combine some, vary the openings, and keep one short sentence for impact.',
      introAr: 'أربع جمل قصيرة متتالية تبدو آلية. ادمج بعضها، ونوّع البدايات، واحتفظ بجملة قصيرة للتأثير.',
      points: [
        { en: 'Combine short ideas with FANBOYS or clauses', ar: 'ادمج الأفكار القصيرة' },
        { en: 'Open with *When…*, *After…*, *First…*', ar: 'ابدأ بأدوات مختلفة' },
        { en: 'Keep one short sentence for power', ar: 'جملة قصيرة للتأثير' },
        { en: 'Vary length: short → long → medium', ar: 'نوّع الطول' },
      ],
    },
    examples: [
      { en: 'Choppy: I woke up. I ate. I left. I worked.', ar: 'مقطّع: جمل قصيرة متكرّرة.' },
      { en: 'Better: *After* I woke up, I ate*,* *and* then I left for work.', ar: 'أفضل: مدموجة ومنوّعة.' },
      { en: 'I love mornings. *When* the sun rises, the city wakes up.', ar: 'أحب الصباح. عندما تشرق الشمس تستيقظ المدينة.' },
      { en: 'It was a long day*,* *but* I was happy.', ar: 'كان يومًا طويلًا لكنني سعيد.' },
      { en: '*First*, we studied. *Then*, we practiced. *Finally*, we relaxed.', ar: 'أولًا درسنا، ثم تمرّنا، وأخيرًا استرحنا.' },
      { en: 'Rain fell all night. *In the morning*, the streets were clean.', ar: 'أمطرت طوال الليل. وفي الصباح كانت الشوارع نظيفة.' },
    ],
    exercises: [
      { q: 'Combine: “I was tired. I kept working.”', a: '*Although* I was tired*,* I kept working.' },
      { q: 'Combine: “She smiled. She said hello.”', a: 'She smiled *and* said hello.' },
      { q: 'Start differently: “We left after the rain stopped.”', a: '*After* the rain stopped*,* we left.' },
      { q: 'Vary these: “I read. I write. I learn.”', a: 'I read *and* write*,* *so* I learn.' },
    ],
    reading: {
      title: 'A Good Morning', titleAr: 'صباح جميل',
      passage: [
        '*When* the sun rose, I opened my window.',
        'The air was cool*,* *and* the birds were singing.',
        'I made tea. I read one page. I smiled.',
        '*Because* I started calmly, my whole day felt bright.',
        'Small habits change everything.',
      ],
      questions: [
        { q: 'Find the shortest sentence and say why it works.', a: '“Small habits change everything.” — short = impact.' },
        { q: 'Which sentence is complex?', a: '“When the sun rose, I opened my window.” / “Because I started calmly…”.' },
        { q: 'How does line 3 create rhythm?', a: 'Three short parallel sentences in a row.' },
      ],
      tip: 'Notice the mix: long, short, complex, compound — never the same twice.',
      tipAr: 'انظر المزيج: طويل، قصير، معقّد، مركّب — بلا تكرار.',
    },
    homework: [
      { en: 'Rewrite 4 choppy sentences into a smooth paragraph', ar: 'أعد كتابة ٤ جمل مقطّعة في فقرة سلسة' },
      { en: 'Start 3 sentences with When / After / First', ar: 'ابدأ ٣ جمل بـ When/After/First' },
      { en: 'Write one very short sentence for effect', ar: 'اكتب جملة قصيرة جدًا للتأثير' },
    ],
    editing: {
      wrong: [
        'I like tea. I like coffee. I like juice. I drink them daily.',
        'The movie was long. It was boring. I left early.',
      ],
      correct: [
        'I like tea*,* coffee*,* and juice*,* *and* I drink them daily.',
        '*Because* the movie was long and boring*,* I left early.',
      ],
    },
  },

  /* ─────────────────────────── 14 · PUTTING IT TOGETHER ─────────────────────────── */
  {
    no: 25, cefr: 'B1', tag: 'Final Project', tagAr: 'المشروع الأخير',
    title: 'Final Project — Write Your Paragraph',
    titleAr: 'المشروع الأخير — اكتب فقرتك الكاملة',
    objectives: [
      { en: 'Use every rule from the course in one paragraph', ar: 'استخدام كل القواعد في فقرة واحدة' },
      { en: 'Capitalize, use articles, and choose tenses', ar: 'الحروف الكبيرة والأدوات والأزمنة' },
      { en: 'Join ideas and punctuate with commas', ar: 'ربط الأفكار ووضع الفواصل' },
      { en: 'Edit your own writing for mistakes', ar: 'تدقيق كتابتك بنفسك' },
    ],
    rule: {
      en: 'A good paragraph = a *topic sentence* + *supporting details* + a *concluding sentence*, written with correct capitals, tenses, and punctuation.',
      ar: 'الفقرة الجيدة = جملة موضوعية + تفاصيل داعمة + جملة خاتمة، بحروفٍ كبيرة وأزمنةٍ وترقيمٍ صحيح.',
    },
    studio: {
      prompt: { en: 'Write a full paragraph (5–7 sentences) about “A person I admire.” (or choose your own topic)', ar: 'اكتب فقرةً كاملة (٥–٧ جمل) عن «شخص أُعجب به». (أو اختر موضوعك)' },
      model: {
        title: 'The Person I Admire', titleAr: 'الشخص الذي أُعجب به',
        parts: [
          { role: 'topic', en: 'The person I admire most is my grandmother.' },
          { role: 'support', en: 'She grew up in a small village and worked very hard all her life.' },
          { role: 'support', en: 'Although she never went to school, she taught herself to read.' },
          { role: 'support', en: 'She always tells me that knowledge is the greatest treasure.' },
          { role: 'conclusion', en: 'For all these reasons, my grandmother is my real hero.' },
        ],
      },
      plan: [
        { label: 'Topic sentence — who / your main idea', ar: 'الجملة الموضوعية — مَن / فكرتك' },
        { label: 'Support 1 — a fact about them', ar: 'دعم ١ — حقيقة عنه' },
        { label: 'Support 2 — a reason you admire them', ar: 'دعم ٢ — سبب إعجابك' },
        { label: 'Support 3 — an example or a detail', ar: 'دعم ٣ — مثال أو تفصيل' },
        { label: 'Concluding sentence', ar: 'جملة الخاتمة' },
      ],
      toolkit: [
        { group: 'Start', ar: 'البداية', phrases: ['The … I admire most is …', '… is a very special person.', 'I really admire …'] },
        { group: 'Add & connect', ar: 'الربط', phrases: ['First, …', 'Also, …', 'Although …', 'For example, …', 'because …'] },
        { group: 'Conclude', ar: 'الخاتمة', phrases: ['For all these reasons, …', 'In conclusion, …', 'That is why …'] },
      ],
      steps: [
        { en: 'PLAN: fill the outline — topic sentence, 3 supports, conclusion.', ar: 'خطّط: املأ المخطّط — موضوعية، ٣ دعم، خاتمة.' },
        { en: 'WRITE your topic sentence (one clear main idea).', ar: 'اكتب جملتك الموضوعية (فكرة واحدة واضحة).' },
        { en: 'ADD your 3 supporting sentences.', ar: 'أضف جملك الداعمة الثلاث.' },
        { en: 'ADD a concluding sentence that restates the idea.', ar: 'أضف جملة خاتمة تُعيد الفكرة.' },
        { en: 'EDIT: read aloud and fix capitals, commas, and verbs.', ar: 'دقّق: اقرأ بصوتٍ وصحّح الحروف والفواصل والأفعال.' },
      ],
      checklist: [
        { en: 'The paragraph is indented and 5–7 sentences long', ar: 'الفقرة مُزاحة و٥–٧ جمل' },
        { en: 'The topic sentence states ONE main idea', ar: 'الجملة الموضوعية فكرة واحدة' },
        { en: 'At least 3 supporting sentences', ar: '٣ جمل داعمة على الأقل' },
        { en: 'A concluding sentence', ar: 'جملة خاتمة' },
        { en: 'Every sentence: capital start + end mark', ar: 'كل جملة: حرف كبير وعلامة نهاية' },
        { en: 'Correct tenses, and no run-ons', ar: 'أزمنة صحيحة وبلا جمل ملتصقة' },
      ],
    },
    explain: {
      intro: 'Writing well is just applying each small rule at the same time. Watch how one short paragraph uses them all.',
      introAr: 'الكتابة الجيدة هي تطبيق كل قاعدة صغيرة معًا. انظر كيف تستعمل فقرة قصيرة كل القواعد.',
      points: [
        { en: 'Capitals to start · articles a/an/the', ar: 'حروف كبيرة · أدوات' },
        { en: 'Correct tenses for the time', ar: 'أزمنة صحيحة' },
        { en: 'FANBOYS + comma to join ideas', ar: 'أدوات عطف + فاصلة' },
        { en: 'Parallel lists · then re-read and edit', ar: 'قوائم متوازية · ثم دقّق' },
      ],
    },
    examples: [
      { en: '*M*y name is *O*mar*,* *and* I love *E*nglish.', ar: 'اسمي عمر، وأحب الإنجليزية.' },
      { en: '*E*very morning*,* I *read*, *write*, and *speak* a little.', ar: 'كل صباح أقرأ وأكتب وأتحدّث قليلًا.' },
      { en: '*W*hen I make a mistake*,* I fix it *and* try again.', ar: 'عندما أخطئ أصلحه وأحاول مجددًا.' },
      { en: '*L*earning takes time*,* *but* I improve every day.', ar: 'التعلّم يأخذ وقتًا لكنني أتحسّن كل يوم.' },
    ],
    exercises: [
      { q: 'Fix all: “my name is sara and i study english”', a: '*M*y name is *S*ara*,* *and* I study *E*nglish.' },
      { q: 'Articles: “I have ___ dog and ___ apple.”', a: 'I have *a* dog and *an* apple.' },
      { q: 'Join: “I was tired. I slept.”', a: 'I was tired*,* *so* I slept.' },
      { q: 'Parallel: “I like to read, writing, and I draw.”', a: 'I like *reading*, *writing*, and *drawing*.' },
    ],
    reading: {
      title: 'My English Journey', titleAr: 'رحلتي مع الإنجليزية',
      passage: [
        '*M*y name is *N*our*,* *and* I am a student from *C*asablanca.',
        '*W*hen I started this course*,* I knew only a few words.',
        '*N*ow I can capitalize names*,* choose *a* or *an*, and use commas.',
        'I *read*, *write*, and *practice* a little every single day.',
        'Learning is slow*,* *but* I am proud*,* *and* I will never stop.',
      ],
      questions: [
        { q: 'Where is Nour from?', a: '*C*asablanca.' },
        { q: 'Name three skills Nour learned.', a: 'Capitalizing names, choosing a/an, using commas.' },
        { q: 'Find the parallel list and the compound sentence.', a: 'List: read, write, practice · Compound: “Learning is slow, but I am proud…”.' },
      ],
      tip: 'Capitals, articles, tenses, FANBOYS, commas, parallel lists — one paragraph, every rule.',
      tipAr: 'حروف كبيرة، أدوات، أزمنة، عطف، فواصل، قوائم متوازية — فقرة واحدة بكل القواعد.',
    },
    homework: [
      { en: 'Write a 5-sentence paragraph about yourself', ar: 'اكتب فقرة من ٥ جمل عن نفسك' },
      { en: 'Include one compound and one complex sentence', ar: 'ضمّنها جملة مركّبة وأخرى معقّدة' },
      { en: 'Use a/an/the and one parallel list, then edit it', ar: 'استعمل a/an/the وقائمة متوازية ثم دقّقها' },
    ],
    editing: {
      wrong: [
        'my friend and i study english every day.',
        'we read write and we speak in class.',
        'when the lesson ends we go home and we rest.',
      ],
      correct: [
        '*M*y friend and *I* study *E*nglish every day.',
        'We *read*, *write*, and *speak* in class.',
        '*W*hen the lesson ends*,* we go home *and* rest.',
      ],
    },
  },

  /* ─────────────────────────── 3 · END PUNCTUATION ─────────────────────────── */
  {
    no: 3, tag: 'End Punctuation', tagAr: 'علامات النهاية',
    title: 'End Punctuation — . ? !',
    titleAr: 'علامات نهاية الجملة — . ؟ !',
    objectives: [
      { en: 'End a statement with a period (.)', ar: 'إنهاء الخبر بنقطة' },
      { en: 'End a question with a question mark (?)', ar: 'إنهاء السؤال بعلامة استفهام' },
      { en: 'Show strong feeling with (!)', ar: 'التعبير عن انفعال قوي بعلامة تعجّب' },
      { en: 'Start the next sentence with a capital', ar: 'بدء الجملة التالية بحرف كبير' },
    ],
    rule: {
      en: 'Every sentence ends with one mark: a *period* (.) for a statement, a *question mark* (?) for a question, an *exclamation mark* (!) for strong feeling.',
      ar: 'كل جملة تنتهي بعلامة واحدة: نقطة للخبر، وعلامة استفهام للسؤال، وعلامة تعجّب للانفعال القوي.',
    },
    explain: {
      intro: 'The end mark tells the reader that the sentence is finished and what kind it is. Without it, sentences run into each other.',
      introAr: 'علامة النهاية تُخبر القارئ أن الجملة انتهت وما نوعها. وبدونها تتداخل الجمل.',
      points: [
        { en: 'Statement → *.* : I live in Rabat*.*', ar: 'الخبر ← نقطة' },
        { en: 'Question → *?* : Where do you live*?*', ar: 'السؤال ← علامة استفهام' },
        { en: 'Strong feeling → *!* : Be careful*!*', ar: 'الانفعال ← علامة تعجّب' },
        { en: 'Then a space and a *Capital* for the next sentence', ar: 'ثم مسافة وحرف كبير' },
      ],
    },
    examples: [
      { en: 'I am a teacher*.*', ar: 'أنا معلّم.' }, { en: 'She works in a bank*.*', ar: 'تعمل في بنك.' },
      { en: 'Do you speak English*?*', ar: 'هل تتحدّث الإنجليزية؟' }, { en: 'Where is the station*?*', ar: 'أين المحطة؟' },
      { en: 'What time is it*?*', ar: 'كم الساعة؟' }, { en: 'Be careful*!*', ar: 'انتبه!' },
      { en: 'What a beautiful day*!*', ar: 'يا له من يوم جميل!' }, { en: 'I passed the exam*!*', ar: 'نجحت في الامتحان!' },
      { en: 'He is my brother*.*', ar: 'هو أخي.' }, { en: 'Are you ready*?*', ar: 'هل أنت مستعد؟' },
      { en: 'Please sit down*.*', ar: 'اجلس من فضلك.' }, { en: 'Help*!*', ar: 'النجدة!' },
      { en: 'Can you help me*?*', ar: 'هل يمكنك مساعدتي؟' }, { en: 'We won the match*!*', ar: 'فزنا بالمباراة!' },
    ],
    exercises: [
      { q: 'Add the mark: “Where do you work”', a: 'Where do you work*?*' },
      { q: 'Add the mark: “I love this city”', a: 'I love this city*.*' },
      { q: 'Add the mark (danger): “Watch out”', a: 'Watch out*!*' },
      { q: '. or ? : “Is she your sister”', a: 'Is she your sister*?*' },
      { q: 'Fix: “i am tired where is my bed”', a: '*I* am tired*.* *W*here is my bed*?*' },
    ],
    reading: {
      title: 'Moving Day', titleAr: 'يوم الانتقال',
      passage: [
        'Today is a big day*!*',
        'We are moving to a new house*.*',
        '“Where are the boxes*?*” my mother asks.',
        'I carry them to the car one by one*.*',
        'What a busy morning it is*!*',
      ],
      questions: [
        { q: 'How does the writer feel about the day?', a: 'Excited (“a big day!”, “What a busy morning!”).' },
        { q: 'Find the question in the passage.', a: '“Where are the boxes?”' },
        { q: 'Why does line 1 end with “!”?', a: 'It shows *strong feeling*.' },
      ],
      tip: 'statement . · question ? · strong feeling !',
      tipAr: 'الخبر نقطة · السؤال استفهام · الانفعال تعجّب.',
    },
    homework: [
      { en: 'Write 3 statements, 3 questions, and 3 exclamations', ar: 'اكتب ٣ من كل نوع' },
      { en: 'Punctuate a short dialogue you write', ar: 'ضع العلامات في حوار قصير' },
      { en: 'Copy a paragraph and mark every end punctuation', ar: 'انسخ فقرة وحدّد علامات النهاية' },
    ],
    editing: {
      wrong: [
        'where do you live',
        'i live in fes it is a beautiful city',
        'what a great place',
      ],
      correct: [
        '*W*here do you live*?*',
        '*I* live in Fes*.* *I*t is a beautiful city*.*',
        '*W*hat a great place*!*',
      ],
    },
  },

  /* ─────────────────────────── 5 · APOSTROPHES ─────────────────────────── */
  {
    no: 5, tag: 'Apostrophes', tagAr: 'الفاصلة العليا',
    title: 'Apostrophes — contractions & possession',
    titleAr: 'الفاصلة العليا — الاختصار والمِلكية',
    objectives: [
      { en: 'Use an apostrophe to shorten (I’m)', ar: 'استخدامها للاختصار' },
      { en: 'Show possession with ’s (Sara’s book)', ar: 'إظهار المِلكية بـ ’s' },
      { en: 'Place ’s or s’ for one vs many owners', ar: 'المفرد والجمع في المِلكية' },
      { en: 'Never confuse its / it’s', ar: 'عدم الخلط بين its و it’s' },
    ],
    rule: {
      en: 'An apostrophe (’) does two jobs: it *shortens* (do not → don’t) and it shows *possession* (Sara → Sara’s book).',
      ar: 'الفاصلة العليا لها وظيفتان: الاختصار (do not → don’t)، وبيان المِلكية (Sara’s book).',
    },
    explain: {
      intro: 'Two words become one with an apostrophe, and it also shows who owns something. Keep “its” and “it’s” separate.',
      introAr: 'تدمج الفاصلة العليا كلمتين في واحدة، وتبيّن أيضًا المالك. وافصل بين its و it’s.',
      points: [
        { en: 'Contraction: I am → *I’m* · do not → *don’t*', ar: 'الاختصار' },
        { en: 'One owner: the boy*’s* ball', ar: 'مالك مفرد' },
        { en: 'Many owners (ending in s): the boys*’* ball', ar: 'مالكون جمع' },
        { en: '*its* = belongs to it · *it’s* = it is', ar: 'its ملكية · it’s = it is' },
      ],
    },
    examples: [
      { en: 'I*’m* happy. (I am)', ar: 'أنا سعيد.' }, { en: 'don*’t* (do not)', ar: 'لا (نفي)' },
      { en: 'can*’t* (cannot)', ar: 'لا يستطيع' }, { en: 'She*’s* a doctor. (She is)', ar: 'هي طبيبة.' },
      { en: 'Sara*’s* book', ar: 'كتاب سارة' }, { en: 'the teacher*’s* desk', ar: 'مكتب المعلّم' },
      { en: 'my brother*’s* car', ar: 'سيارة أخي' }, { en: 'the students*’* classroom', ar: 'قاعة الطلاب (جمع)' },
      { en: 'the boys*’* team', ar: 'فريق الأولاد (جمع)' }, { en: 'It*’s* raining. (It is)', ar: 'إنها تمطر.' },
      { en: 'The dog wags *its* tail.', ar: 'يهز الكلب ذيله.' }, { en: 'You*’re* right. (You are)', ar: 'أنت محق.' },
      { en: 'We*’re* ready. (We are)', ar: 'نحن مستعدون.' }, { en: 'Omar*’s* phone', ar: 'هاتف عمر' },
    ],
    exercises: [
      { q: 'Contract: “I am not tired.”', a: '*I’m* not tired.' },
      { q: 'Possession: “the bag of Sara”', a: 'Sara*’s* bag' },
      { q: 'its or it’s: “___ cold, and the cat lost ___ toy.”', a: '*It’s* cold, and the cat lost *its* toy.' },
      { q: 'your or you’re: “___ late! Is this ___ pen?”', a: '*You’re* late! Is this *your* pen?' },
      { q: 'Many owners: “the room of the girls”', a: 'the girls*’* room' },
    ],
    reading: {
      title: 'At Sara’s House', titleAr: 'في بيت سارة',
      passage: [
        'It*’s* Friday, and I*’m* at Sara*’s* house.',
        'Sara*’s* mother is a teacher, and she*’s* very kind.',
        '“Don*’t* forget your notebook,” she says.',
        'We*’re* studying for tomorrow*’s* test.',
        'The students*’* project is due on Monday.',
      ],
      questions: [
        { q: 'Whose house is it?', a: 'Sara*’s*.' },
        { q: 'What does Sara’s mother do?', a: 'She*’s* a teacher.' },
        { q: 'Why is there an apostrophe after the s in “students’”?', a: 'There are *many* owners (plural).' },
      ],
      tip: '’ shortens (I’m) and shows owning (Sara’s).',
      tipAr: 'الفاصلة العليا تختصر وتبيّن المِلكية.',
    },
    homework: [
      { en: 'Write 5 contractions with their full forms', ar: 'اكتب ٥ اختصارات مع أصولها' },
      { en: 'Write 4 possessive phrases (one owner & many owners)', ar: 'اكتب ٤ عبارات مِلكية' },
      { en: 'Write 2 sentences using its and it’s correctly', ar: 'اكتب جملتين بـ its و it’s' },
    ],
    editing: {
      wrong: [
        'Its a cold day, and the dog wants it’s bone.',
        'Your late! Is this you’re pen?',
        'The dog’s were playing in the girls garden.',
      ],
      correct: [
        '*It’s* a cold day, and the dog wants *its* bone.',
        '*You’re* late! Is this *your* pen?',
        'The *dogs* were playing in the girls*’* garden.',
      ],
    },
  },

  /* ─────────────────────────── 6 · PLURALS ─────────────────────────── */
  {
    no: 6, tag: 'Plurals', tagAr: 'الجمع',
    title: 'Nouns — Singular & Plural',
    titleAr: 'الأسماء — المفرد والجمع',
    objectives: [
      { en: 'Add -s to make most nouns plural', ar: 'إضافة -s لمعظم الأسماء' },
      { en: 'Add -es after s, x, ch, sh', ar: 'إضافة -es بعد s,x,ch,sh' },
      { en: 'Change consonant + y → -ies', ar: 'تحويل y إلى ies' },
      { en: 'Learn common irregular plurals', ar: 'تعلّم الجموع الشاذة' },
    ],
    rule: {
      en: 'Most nouns add *-s* (book → book*s*). Add *-es* after s, x, ch, sh (box → box*es*). A consonant + y becomes *-ies* (city → cit*ies*).',
      ar: 'معظم الأسماء تأخذ -s. ونضيف -es بعد s,x,ch,sh. وحرف ساكن + y يصبح -ies.',
    },
    explain: {
      intro: 'Plurals are a frequent writing mistake in Arabic speakers’ English. Learn the four patterns and the common exceptions.',
      introAr: 'الجمع خطأ شائع في كتابة الناطقين بالعربية. تعلّم الأنماط الأربعة والاستثناءات.',
      points: [
        { en: 'Most: cat → cat*s*', ar: 'الأغلب: -s' },
        { en: 'After s/x/ch/sh: box → box*es*', ar: 'بعد s,x,ch,sh: -es' },
        { en: 'consonant + y: city → cit*ies*', ar: 'ساكن + y: -ies' },
        { en: 'Irregular: man → *men*, child → *children*', ar: 'شاذة' },
      ],
    },
    examples: [
      { en: 'book → book*s*', ar: 'كتب' }, { en: 'car → car*s*', ar: 'سيارات' }, { en: 'apple → apple*s*', ar: 'تفاحات' },
      { en: 'box → box*es*', ar: 'صناديق' }, { en: 'bus → bus*es*', ar: 'حافلات' }, { en: 'watch → watch*es*', ar: 'ساعات' },
      { en: 'dish → dish*es*', ar: 'أطباق' }, { en: 'city → cit*ies*', ar: 'مدن' }, { en: 'baby → bab*ies*', ar: 'أطفال رضّع' },
      { en: 'country → countr*ies*', ar: 'دول' }, { en: 'man → *men*', ar: 'رجال' }, { en: 'woman → *women*', ar: 'نساء' },
      { en: 'child → *children*', ar: 'أطفال' }, { en: 'foot → *feet*', ar: 'أقدام' }, { en: 'tooth → *teeth*', ar: 'أسنان' },
      { en: 'person → *people*', ar: 'أشخاص' },
    ],
    exercises: [
      { q: 'Plural: “three (box)”', a: 'three box*es*' },
      { q: 'Plural: “two (city)”', a: 'two cit*ies*' },
      { q: 'Plural: “five (child)”', a: 'five *children*' },
      { q: 'Plural: “many (bus)”', a: 'many bus*es*' },
      { q: 'Fix: “I have two foots.”', a: 'I have two *feet*.' },
    ],
    reading: {
      title: 'At the Market', titleAr: 'في السوق',
      passage: [
        'On Saturdays, the market is full of people.',
        'I buy tomatoes, potatoes, and two boxes of dates.',
        'Three women sell fresh dishes of food.',
        'Children run happily between the shops.',
        'I carry my heavy bags home on my tired feet.',
      ],
      questions: [
        { q: 'When is the market full?', a: 'On Saturdays.' },
        { q: 'Find two irregular plurals in the passage.', a: 'people, women, children, feet.' },
        { q: 'What is the plural of “box” here?', a: 'boxes.' },
      ],
      tip: '-s · -es (s,x,ch,sh) · y→ies · irregular: men, children, feet.',
      tipAr: '-s · -es · y→ies · شاذة: men, children, feet.',
    },
    homework: [
      { en: 'Write the plural of 10 nouns', ar: 'اكتب جمع ١٠ أسماء' },
      { en: 'Write 3 sentences using irregular plurals', ar: 'اكتب ٣ جمل بالجموع الشاذة' },
      { en: 'Find 5 plural nouns in a text you read', ar: 'اعثر على ٥ أسماء جمع في نص' },
    ],
    editing: {
      wrong: [
        'I saw three childs and two mans.',
        'She bought two boxs of tomatos.',
        'The citys have many buss.',
      ],
      correct: [
        'I saw three *children* and two *men*.',
        'She bought two *boxes* of *tomatoes*.',
        'The *cities* have many *buses*.',
      ],
    },
  },

  /* ─────────────────────────── 9 · SUBJECT–VERB AGREEMENT ─────────────────────────── */
  {
    no: 10.9, cefr: 'A2', tag: 'Agreement', tagAr: 'التطابق',
    title: 'Subject–Verb Agreement',
    titleAr: 'تطابق الفاعل والفعل',
    objectives: [
      { en: 'Add -s to the verb with he/she/it', ar: 'إضافة -s مع المفرد الغائب' },
      { en: 'Use the base verb with I/you/we/they', ar: 'الفعل المجرّد مع الباقي' },
      { en: 'Match “to be” and “to have” to the subject', ar: 'مطابقة be و have' },
      { en: 'Keep agreement with names and nouns', ar: 'التطابق مع الأسماء' },
    ],
    rule: {
      en: 'In the present, a *singular* subject (he/she/it) takes a verb with *-s*: “She work*s*.” A *plural* subject takes the base verb: “They work.”',
      ar: 'في المضارع، الفاعل المفرد الغائب يأخذ فعلًا بـ -s، والفاعل الجمع يأخذ الفعل المجرّد.',
    },
    explain: {
      intro: 'The verb must match its subject. The classic error is dropping the -s with he/she/it, or adding it to plural subjects.',
      introAr: 'يجب أن يطابق الفعل فاعله. والخطأ الكلاسيكي إسقاط -s مع المفرد أو إضافتها للجمع.',
      points: [
        { en: 'he/she/it + verb*-s*: He read*s*, She go*es*', ar: 'المفرد الغائب ← -s' },
        { en: 'I/you/we/they + base verb: They read', ar: 'الباقي ← فعل مجرّد' },
        { en: 'to be: he *is* · they *are* · to have: she *has*', ar: 'be و have' },
        { en: 'A name = one person = singular: Sara like*s*…', ar: 'الاسم مفرد' },
      ],
    },
    examples: [
      { en: 'I work / You work / We work / They work.', ar: 'الفعل مجرّد.' },
      { en: 'He work*s* / She work*s* / It work*s*.', ar: 'الفعل بـ -s.' },
      { en: 'She go*es* to school.', ar: 'تذهب إلى المدرسة.' }, { en: 'He watch*es* TV.', ar: 'يشاهد التلفاز.' },
      { en: 'My brother like*s* football.', ar: 'يحب أخي كرة القدم.' }, { en: 'The baby cr*ies* at night.', ar: 'يبكي الرضيع ليلًا.' },
      { en: 'They play every day.', ar: 'يلعبون كل يوم.' }, { en: 'Sara *has* a car.', ar: 'لدى سارة سيارة.' },
      { en: 'We *have* a plan.', ar: 'لدينا خطة.' }, { en: 'The sun rise*s* early.', ar: 'تشرق الشمس مبكرًا.' },
      { en: 'Birds fly south in winter.', ar: 'تطير الطيور جنوبًا.' }, { en: 'He does*n’t* work on Sunday.', ar: 'لا يعمل الأحد.' },
      { en: 'They do*n’t* work at night.', ar: 'لا يعملون ليلًا.' },
    ],
    exercises: [
      { q: 'Add -s?: “She (go) to work.”', a: 'She *goes* to work.' },
      { q: '“They (play) football.”', a: 'They *play* football.' },
      { q: 'Fix: “He go to school.”', a: 'He *goes* to school.' },
      { q: 'Fix: “My sister have a cat.”', a: 'My sister *has* a cat.' },
      { q: 'is/are: “The books ___ on the desk.”', a: 'The books *are* on the desk.' },
    ],
    reading: {
      title: 'A Family Morning', titleAr: 'صباح عائلي',
      passage: [
        'My family wakes up early every day.',
        'My father makes coffee, and my mother reads the news.',
        'My little sister brushes her teeth and packs her bag.',
        'We eat breakfast together, and then everyone leaves.',
        'The house becomes quiet, but the cat stays and sleeps.',
      ],
      questions: [
        { q: 'Who makes the coffee?', a: 'The father.' },
        { q: 'Why “brushes” with -s?', a: '“sister” = she (singular) → verb + s.' },
        { q: 'Find a plural subject and its verb.', a: '“We eat” (base verb).' },
      ],
      tip: 'he/she/it → verb + s · I/you/we/they → base verb.',
      tipAr: 'المفرد الغائب ← -s · الباقي ← مجرّد.',
    },
    homework: [
      { en: 'Write 3 singular (+s) and 3 plural sentences', ar: 'اكتب ٣ مفردة و٣ جمع' },
      { en: 'Correct 4 agreement mistakes you make', ar: 'صحّح ٤ أخطاء تطابق' },
      { en: 'Write about a friend using he/she + verb-s', ar: 'اكتب عن صديق بـ he/she + -s' },
    ],
    editing: {
      wrong: [
        'My brother go to the gym every day.',
        'She have two children.',
        'The students plays in the yard.',
      ],
      correct: [
        'My brother *goes* to the gym every day.',
        'She *has* two children.',
        'The students *play* in the yard.',
      ],
    },
  },

  /* ─────────────────────────── 11 · PREPOSITIONS ─────────────────────────── */
  {
    no: 11, tag: 'Prepositions', tagAr: 'حروف الجر',
    title: 'Prepositions of Time & Place — in, on, at',
    titleAr: 'حروف الجر للزمان والمكان — in / on / at',
    objectives: [
      { en: 'Use in/on/at for time', ar: 'استخدام in/on/at للزمان' },
      { en: 'Use in/on/at for place', ar: 'استخدام in/on/at للمكان' },
      { en: 'Choose by size and exactness', ar: 'الاختيار حسب الحجم والتحديد' },
      { en: 'Avoid common preposition errors', ar: 'تجنّب الأخطاء الشائعة' },
    ],
    rule: {
      en: 'Time: *in* months/years (in July), *on* days/dates (on Monday), *at* clock times (at 7). Place: *in* a city/country, *on* a street, *at* an exact point.',
      ar: 'للزمان: in مع الأشهر والسنوات، on مع الأيام، at مع الساعة. وللمكان: in مع المدينة/الدولة، on مع الشارع، at مع النقطة المحدّدة.',
    },
    explain: {
      intro: 'Think of size: big/general → in; a surface or a day → on; an exact point or time → at.',
      introAr: 'فكّر بالحجم: العام الكبير ← in، والسطح أو اليوم ← on، والنقطة أو الساعة المحدّدة ← at.',
      points: [
        { en: 'Time: *in* the morning · *on* Friday · *at* night / *at* 8', ar: 'الزمان' },
        { en: 'Place: *in* Rabat · *on* Hassan Street · *at* the door', ar: 'المكان' },
        { en: 'Big/general → *in* · surface/day → *on* · point → *at*', ar: 'القاعدة العامة' },
        { en: 'Careful: *at* night, but *in* the morning', ar: 'استثناء: at night' },
      ],
    },
    examples: [
      { en: '*in* July', ar: 'في يوليوز' }, { en: '*in* 2026', ar: 'في ٢٠٢٦' }, { en: '*in* the morning', ar: 'في الصباح' },
      { en: '*on* Monday', ar: 'يوم الاثنين' }, { en: '*on* 5 May', ar: 'في ٥ ماي' }, { en: '*at* 7 o’clock', ar: 'في السابعة' },
      { en: '*at* night', ar: 'في الليل' }, { en: '*in* Morocco', ar: 'في المغرب' }, { en: '*in* Casablanca', ar: 'في الدار البيضاء' },
      { en: '*on* Hassan Street', ar: 'في شارع الحسن' }, { en: '*at* the bus stop', ar: 'عند موقف الحافلة' }, { en: '*at* home', ar: 'في البيت' },
      { en: '*at* school', ar: 'في المدرسة' }, { en: '*on* the table', ar: 'على الطاولة' }, { en: '*in* the box', ar: 'في الصندوق' },
    ],
    exercises: [
      { q: 'in/on/at: “___ Monday”', a: '*on* Monday' },
      { q: 'in/on/at: “___ 9 o’clock”', a: '*at* 9 o’clock' },
      { q: 'in/on/at: “___ July”', a: '*in* July' },
      { q: 'Fill: “I live ___ Fes.”', a: 'I live *in* Fes.' },
      { q: 'Fill: “The keys are ___ the table.”', a: 'The keys are *on* the table.' },
    ],
    reading: {
      title: 'My Weekly Plan', titleAr: 'خطتي الأسبوعية',
      passage: [
        'I wake up *at* 6 o’clock *in* the morning.',
        '*On* Monday, I have an English class *in* the city center.',
        'The school is *on* Liberty Street, near the park.',
        '*In* the evening, I study quietly *at* home.',
        '*On* weekends, I relax *at* my grandmother’s house.',
      ],
      questions: [
        { q: 'What time does the writer wake up?', a: '*At* 6 (in the morning).' },
        { q: 'Where is the school?', a: '*On* Liberty Street.' },
        { q: 'Why “in the morning” but “at 6”?', a: 'part of the day → *in*; a clock time → *at*.' },
      ],
      tip: 'in (month/city) · on (day/street) · at (exact time/point).',
      tipAr: 'in للشهر/المدينة · on لليوم/الشارع · at للوقت/النقطة.',
    },
    homework: [
      { en: 'Write your daily schedule using in/on/at', ar: 'اكتب جدولك اليومي بـ in/on/at' },
      { en: 'Write 5 sentences about places using in/on/at', ar: 'اكتب ٥ جمل عن أماكن' },
      { en: 'Find 5 prepositions in a text you read', ar: 'اعثر على ٥ حروف جر في نص' },
    ],
    editing: {
      wrong: [
        'I have a meeting in Monday at the morning.',
        'She lives at Rabat on Palm Street.',
        'We will meet on 8 o’clock.',
      ],
      correct: [
        'I have a meeting *on* Monday *in* the morning.',
        'She lives *in* Rabat *on* Palm Street.',
        'We will meet *at* 8 o’clock.',
      ],
    },
  },

  /* ─────────────────────────── 12 · FRAGMENTS ─────────────────────────── */
  {
    no: 12, tag: 'Fragments', tagAr: 'الجملة الناقصة',
    title: 'The Simple Sentence & Fragments',
    titleAr: 'الجملة البسيطة والجملة الناقصة',
    objectives: [
      { en: 'Build a complete sentence: subject + verb', ar: 'بناء جملة كاملة: فاعل + فعل' },
      { en: 'Spot a fragment (incomplete sentence)', ar: 'اكتشاف الجملة الناقصة' },
      { en: 'Turn a fragment into a full sentence', ar: 'تحويل الناقصة إلى كاملة' },
      { en: 'Express one complete idea', ar: 'التعبير عن فكرة كاملة' },
    ],
    rule: {
      en: 'A sentence needs a *subject* + a *verb* and one *complete idea*: “Birds fly.” A *fragment* is missing a subject or a verb, so it is not a sentence.',
      ar: 'الجملة تحتاج فاعلًا + فعلًا وفكرة كاملة. والجملة الناقصة ينقصها الفاعل أو الفعل فليست جملة.',
    },
    explain: {
      intro: 'Before joining sentences, you must be able to write ONE complete sentence. A fragment leaves the reader waiting.',
      introAr: 'قبل ربط الجمل، يجب أن تكتب جملةً واحدة كاملة. والجملة الناقصة تترك القارئ منتظرًا.',
      points: [
        { en: 'Subject = who/what · Verb = the action/state', ar: 'فاعل + فعل' },
        { en: 'Complete: The dog *barks*. ✓', ar: 'كاملة' },
        { en: 'Fragment ✗: The dog. (no verb) / Barks. (no subject)', ar: 'ناقصة' },
        { en: 'Fragment ✗: Because I was late. (dependent clause alone)', ar: 'تابعة وحدها ناقصة' },
      ],
    },
    examples: [
      { en: 'Birds fly.', ar: 'تطير الطيور.' }, { en: 'Sara reads.', ar: 'تقرأ سارة.' },
      { en: 'The sun shines.', ar: 'تشرق الشمس.' }, { en: 'I am tired.', ar: 'أنا متعب.' },
      { en: 'The children play.', ar: 'يلعب الأطفال.' }, { en: 'Water boils.', ar: 'يغلي الماء.' },
      { en: 'My phone rang.', ar: 'رنّ هاتفي.' }, { en: 'We won.', ar: 'فزنا.' },
      { en: 'Fragment ✗: In the morning.', ar: 'ناقصة (لا فاعل ولا فعل).' },
      { en: 'Fixed: I run in the morning.', ar: 'أركض في الصباح.' },
      { en: 'Fragment ✗: Because it rained.', ar: 'ناقصة (تابعة وحدها).' },
      { en: 'Fixed: We stayed home because it rained.', ar: 'بقينا لأنها أمطرت.' },
      { en: 'Fragment ✗: The tall man near the door.', ar: 'ناقصة (لا فعل).' },
      { en: 'Fixed: The tall man near the door smiled.', ar: 'ابتسم الرجل الطويل.' },
    ],
    exercises: [
      { q: 'Sentence or fragment? “The little cat.”', a: 'Fragment (no verb).' },
      { q: 'Sentence or fragment? “She sings.”', a: 'Sentence (subject + verb).' },
      { q: 'Fix: “Running to the bus.”', a: 'I was *running to the bus*.' },
      { q: 'Fix: “Because I was hungry.”', a: 'I ate *because I was hungry*.' },
      { q: 'Add a subject: “___ opened the door.”', a: '*She* opened the door.' },
    ],
    reading: {
      title: 'A Quiet Evening', titleAr: 'مساء هادئ',
      passage: [
        'The evening is calm and cool.',
        'My father reads a book, and my mother waters the plants.',
        'The cat sleeps on the warm sofa.',
        'I finish my homework and close my notebook.',
        'Everyone feels relaxed and ready for sleep.',
      ],
      questions: [
        { q: 'What does the father do?', a: 'He reads a book.' },
        { q: 'Name the subject and verb in line 3.', a: 'subject: the cat · verb: sleeps.' },
        { q: 'Is “On the warm sofa” a sentence? Why not?', a: 'No — no subject or verb (a fragment).' },
      ],
      tip: 'subject + verb + one complete idea = a real sentence.',
      tipAr: 'فاعل + فعل + فكرة كاملة = جملة.',
    },
    homework: [
      { en: 'Write 5 complete sentences (underline subject & verb)', ar: 'اكتب ٥ جمل كاملة' },
      { en: 'Turn 3 fragments into full sentences', ar: 'حوّل ٣ جمل ناقصة إلى كاملة' },
      { en: 'Find 2 fragments in your own writing and fix them', ar: 'اعثر على جملتين ناقصتين وأصلحهما' },
    ],
    editing: {
      wrong: [
        'My best friend Omar. Lives in Tangier.',
        'Because the weather was nice.',
        'Running fast to catch the train.',
      ],
      correct: [
        'My best friend Omar *lives* in Tangier.',
        'We went out *because the weather was nice.*',
        '*I was* running fast to catch the train.',
      ],
    },
  },

  /* ─────────────────────────── 19 · TRANSITIONS ─────────────────────────── */
  {
    no: 19, tag: 'Transitions', tagAr: 'أدوات الربط',
    title: 'Transitions & Linking Words',
    titleAr: 'أدوات الربط بين الجمل',
    objectives: [
      { en: 'Connect ideas between sentences', ar: 'ربط الأفكار بين الجمل' },
      { en: 'Use however, therefore, for example', ar: 'استخدام however/therefore/for example' },
      { en: 'Add, contrast, and give reasons smoothly', ar: 'الإضافة والتضاد والتعليل بسلاسة' },
      { en: 'Punctuate a transition with a comma', ar: 'وضع فاصلة بعد أداة الربط' },
    ],
    rule: {
      en: 'Transitions link whole *sentences* and usually take a *comma*: “It was late*.* *However,* we kept working.”',
      ar: 'أدوات الربط تصل بين الجمل كاملةً وغالبًا تأخذ فاصلة بعدها.',
    },
    explain: {
      intro: 'Transitions guide the reader from one idea to the next. They make a paragraph flow instead of jumping.',
      introAr: 'أدوات الربط تقود القارئ من فكرة إلى أخرى، فتجعل الفقرة متدفّقة لا متقطّعة.',
      points: [
        { en: 'Add: *also, in addition, moreover*', ar: 'الإضافة' },
        { en: 'Contrast: *however, on the other hand*', ar: 'التضاد' },
        { en: 'Result: *therefore, as a result*', ar: 'النتيجة' },
        { en: 'Example: *for example, for instance*', ar: 'التمثيل' },
      ],
    },
    examples: [
      { en: 'I was tired*.* *However,* I finished.', ar: 'ومع ذلك أنهيت.' },
      { en: 'She studied hard*.* *Therefore,* she passed.', ar: 'لذلك نجحت.' },
      { en: 'I like fruit*.* *For example,* I eat apples daily.', ar: 'مثلًا.' },
      { en: 'The plan is good*.* *In addition,* it is cheap.', ar: 'بالإضافة.' },
      { en: 'It rained all day*.* *As a result,* the match stopped.', ar: 'نتيجةً لذلك.' },
      { en: 'He is kind*.* *Moreover,* he is honest.', ar: 'علاوةً على ذلك.' },
      { en: 'You can walk*.* *On the other hand,* the bus is faster.', ar: 'من ناحية أخرى.' },
      { en: 'I woke up late*.* *Therefore,* I missed breakfast.', ar: 'لذلك فوّتّ الفطور.' },
      { en: 'Reading helps you*.* *For instance,* it builds vocabulary.', ar: 'على سبيل المثال.' },
      { en: 'The room was cold*.* *However,* nobody complained.', ar: 'ومع ذلك لم يشتكِ أحد.' },
    ],
    exercises: [
      { q: 'Add (contrast): “I was sick. ___ I went to work.”', a: '…*However,* I went to work.' },
      { q: 'Add (result): “She trained daily. ___ she won.”', a: '…*Therefore,* she won.' },
      { q: 'Add (example): “I love sports. ___ I play tennis.”', a: '…*For example,* I play tennis.' },
      { q: 'Punctuate: “However I disagree.”', a: '*However,* I disagree.' },
      { q: 'Choose: “The bag is old. ___ it still works.”', a: '…*However,* it still works.' },
    ],
    reading: {
      title: 'Learning a Language', titleAr: 'تعلّم اللغة',
      passage: [
        'Learning a language takes time*.* *However,* it is worth the effort.',
        'You must practice every day*.* *For example,* read a short text each morning.',
        'Mistakes are normal*.* *In addition,* they help you learn.',
        'I practiced for a year*.* *As a result,* I can now write paragraphs.',
        'Never give up*.* *Therefore,* keep going step by step.',
      ],
      questions: [
        { q: 'Is learning a language worth it?', a: 'Yes — “it is worth the effort.”' },
        { q: 'What example of practice is given?', a: 'Read a short text each morning.' },
        { q: 'Which transition shows a result?', a: '*Therefore* / *As a result*.' },
      ],
      tip: 'however (contrast) · therefore (result) · for example (example) — comma after.',
      tipAr: 'however تضاد · therefore نتيجة · for example تمثيل — بعدها فاصلة.',
    },
    homework: [
      { en: 'Write 4 sentence pairs joined by transitions', ar: 'اكتب ٤ أزواج بأدوات الربط' },
      { en: 'Use however, therefore, for example once each', ar: 'استعمل كلًّا مرة' },
      { en: 'Add transitions to a short paragraph you wrote', ar: 'أضف أدوات الربط إلى فقرة' },
    ],
    editing: {
      wrong: [
        'I was late however I still finished.',
        'She is smart therefore she solves problems fast.',
        'I like tea for example I drink it daily.',
      ],
      correct: [
        'I was late*.* *However,* I still finished.',
        'She is smart*.* *Therefore,* she solves problems fast.',
        'I like tea*.* *For example,* I drink it daily.',
      ],
    },
  },

  /* ─────────────────────────── 21 · TOPIC SENTENCE ─────────────────────────── */
  {
    no: 21, tag: 'Paragraph', tagAr: 'الفقرة',
    title: 'The Paragraph & the Topic Sentence',
    titleAr: 'الفقرة والجملة الموضوعية',
    objectives: [
      { en: 'Know what a paragraph is', ar: 'معرفة ما الفقرة' },
      { en: 'Write a clear topic sentence', ar: 'كتابة جملة موضوعية واضحة' },
      { en: 'Keep one main idea per paragraph', ar: 'فكرة رئيسية واحدة لكل فقرة' },
      { en: 'Organize sentences around that idea', ar: 'تنظيم الجمل حول الفكرة' },
    ],
    rule: {
      en: 'A *paragraph* is a group of sentences about *one main idea*. The *topic sentence* (usually first) states that idea clearly.',
      ar: 'الفقرة مجموعة جمل حول فكرة رئيسية واحدة. والجملة الموضوعية (غالبًا الأولى) تُبيّن هذه الفكرة بوضوح.',
    },
    studio: {
      prompt: { en: 'Write ONE strong topic sentence for a paragraph about your city.', ar: 'اكتب جملةً موضوعيةً قوية لفقرةٍ عن مدينتك.' },
      model: {
        title: 'A Model Paragraph', titleAr: 'فقرة نموذجية',
        parts: [
          { role: 'topic', en: 'My city is a wonderful place to live.' },
          { role: 'support', en: 'It has green parks where families walk in the evening.' },
          { role: 'support', en: 'The people are friendly, and the markets are full of life.' },
          { role: 'conclusion', en: 'For all these reasons, I am proud of my city.' },
        ],
      },
      toolkit: [
        { group: 'Start a topic sentence', ar: 'بدايات الجملة الموضوعية', phrases: ['My favourite … is …', '… is a wonderful …', 'There are many reasons why …', '… has many benefits.'] },
      ],
      steps: [
        { en: 'Choose your topic (your city, your school, or a hobby).', ar: 'اختر موضوعك (مدينتك، مدرستك، أو هواية).' },
        { en: 'Write ONE sentence that clearly states your main idea.', ar: 'اكتب جملةً واحدة تُبيّن فكرتك الرئيسية بوضوح.' },
        { en: 'Check it is not too broad and not just a small fact.', ar: 'تأكّد أنها ليست فضفاضة ولا مجرّد تفصيل صغير.' },
      ],
      checklist: [
        { en: 'One clear main idea', ar: 'فكرة رئيسية واحدة واضحة' },
        { en: 'Not too general (“Cities.” ✗)', ar: 'ليست عامّة جدًا' },
        { en: 'A complete sentence: capital + period', ar: 'جملة كاملة: حرف كبير ونقطة' },
      ],
    },
    explain: {
      intro: 'Now you build paragraphs. A paragraph is not random sentences — it is one idea, developed.',
      introAr: 'الآن تبني الفقرات. والفقرة ليست جملًا عشوائية، بل فكرة واحدة مُطوَّرة.',
      points: [
        { en: 'One paragraph = *one* main idea', ar: 'فقرة = فكرة واحدة' },
        { en: 'Topic sentence = the idea in one clear sentence', ar: 'الجملة الموضوعية' },
        { en: 'Supporting sentences explain or give examples', ar: 'الجمل الداعمة' },
        { en: 'Not too broad, not just a small fact', ar: 'ليست فضفاضة ولا مجرّد تفصيل' },
      ],
    },
    examples: [
      { en: '*My city is a wonderful place to live.*', ar: 'مدينتي مكان رائع للعيش.' },
      { en: '*Learning English changed my life.*', ar: 'تعلّم الإنجليزية غيّر حياتي.' },
      { en: '*Mornings are the best part of my day.*', ar: 'الصباح أفضل جزء من يومي.' },
      { en: '*Reading has many benefits.*', ar: 'للقراءة فوائد كثيرة.' },
      { en: '*My grandmother is my favorite person.*', ar: 'جدتي شخصي المفضّل.' },
      { en: '*Football is popular for good reasons.*', ar: 'كرة القدم شعبية لأسباب وجيهة.' },
      { en: 'Too broad ✗: Cities. → Better: *Big cities offer many jobs.*', ar: 'فضفاضة ← أفضل' },
      { en: 'Just a fact ✗: I woke up at 7. → Better: *My routine keeps me calm.*', ar: 'مجرّد تفصيل ← أفضل' },
    ],
    exercises: [
      { q: 'Is it a topic sentence? “I ate an egg.”', a: 'No — a small detail, not a main idea.' },
      { q: 'Improve: “Dogs.”', a: '*Dogs make loyal and loving pets.*' },
      { q: 'Write a topic sentence about your school.', a: 'e.g. *My school feels like a second home.*' },
      { q: 'Which is the topic sentence? A) I love summer. B) The sea is warm.', a: '*A* (the main idea).' },
      { q: 'Give a main idea for a paragraph about food.', a: 'e.g. *Moroccan food is rich and healthy.*' },
    ],
    reading: {
      title: 'A Model Paragraph', titleAr: 'فقرة نموذجية',
      passage: [
        '*My city is a wonderful place to live.*',
        'It has green parks where families walk in the evening.',
        'The people are friendly, and the markets are full of life.',
        'There are good schools and a large public library.',
        'For all these reasons, I am proud of my city.',
      ],
      questions: [
        { q: 'What is the topic sentence?', a: '“My city is a wonderful place to live.”' },
        { q: 'Give two supporting details.', a: 'green parks; friendly people; good schools; a library.' },
        { q: 'Which sentence closes the paragraph?', a: '“For all these reasons, I am proud of my city.”' },
      ],
      tip: 'topic sentence = the ONE main idea; every other sentence supports it.',
      tipAr: 'الجملة الموضوعية هي الفكرة الواحدة، وبقية الجمل تدعمها.',
    },
    homework: [
      { en: 'Write 3 topic sentences for 3 different topics', ar: 'اكتب ٣ جمل موضوعية' },
      { en: 'Choose one and list 3 supporting details', ar: 'اختر واحدة واذكر ٣ تفاصيل داعمة' },
      { en: 'Underline the topic sentence in a paragraph you read', ar: 'ضع خطًا تحت الجملة الموضوعية في نص' },
    ],
    editing: {
      wrong: [
        'My best friend is amazing. She is funny and kind. I have a red bike. She always helps me.',
      ],
      correct: [
        'My best friend is amazing. She is funny and kind. *She listens to my problems.* She always helps me.',
      ],
    },
  },

  /* ─────────────────────────── 22 · SUPPORT & CONCLUSION ─────────────────────────── */
  {
    no: 22, tag: 'Support', tagAr: 'الدعم والخاتمة',
    title: 'Supporting Details & the Concluding Sentence',
    titleAr: 'التفاصيل الداعمة وجملة الخاتمة',
    objectives: [
      { en: 'Add details that support the topic sentence', ar: 'إضافة تفاصيل تدعم الفكرة' },
      { en: 'Use reasons, examples, and facts', ar: 'استخدام الأسباب والأمثلة والحقائق' },
      { en: 'Write a concluding sentence', ar: 'كتابة جملة خاتمة' },
      { en: 'Keep every sentence on topic (unity)', ar: 'إبقاء كل الجمل في الموضوع' },
    ],
    rule: {
      en: '*Supporting sentences* explain the topic with reasons, examples, and details. The *concluding sentence* restates the main idea and closes the paragraph.',
      ar: 'الجمل الداعمة تشرح الموضوع بالأسباب والأمثلة والتفاصيل. وجملة الخاتمة تُعيد الفكرة وتُغلق الفقرة.',
    },
    studio: {
      prompt: { en: 'Build the body: write 3 supporting sentences + a conclusion for the topic sentence “Reading is a great hobby.”', ar: 'اِبنِ الجسم: اكتب ٣ جمل داعمة + خاتمة للجملة الموضوعية «Reading is a great hobby».' },
      model: {
        title: 'Reading is a Great Hobby', titleAr: 'القراءة هواية رائعة',
        parts: [
          { role: 'topic', en: 'Reading is a great hobby.' },
          { role: 'support', en: 'First, it teaches you new words and ideas.' },
          { role: 'support', en: 'It also takes you to new worlds without leaving home.' },
          { role: 'support', en: 'For example, a good story can make you forget your worries.' },
          { role: 'conclusion', en: 'In short, everyone should read a little every day.' },
        ],
      },
      plan: [
        { label: 'Topic sentence', ar: 'الجملة الموضوعية' },
        { label: 'Support 1 — a reason', ar: 'دعم ١ — سبب' },
        { label: 'Support 2 — an example', ar: 'دعم ٢ — مثال' },
        { label: 'Support 3 — a detail', ar: 'دعم ٣ — تفصيل' },
        { label: 'Concluding sentence', ar: 'جملة الخاتمة' },
      ],
      toolkit: [
        { group: 'Add support', ar: 'الإضافة', phrases: ['First, …', 'Second, …', 'Also, …', 'In addition, …', 'For example, …', 'Because …'] },
        { group: 'Conclude', ar: 'الخاتمة', phrases: ['In short, …', 'For these reasons, …', 'All in all, …', 'That is why …'] },
      ],
      steps: [
        { en: 'Copy the topic sentence at the top.', ar: 'انسخ الجملة الموضوعية في الأعلى.' },
        { en: 'Add 3 supporting sentences: a reason, an example, a detail.', ar: 'أضف ٣ جمل داعمة: سبب، مثال، تفصيل.' },
        { en: 'Finish with a concluding sentence that restates the idea.', ar: 'اختم بجملةٍ تُعيد الفكرة الرئيسية.' },
        { en: 'Delete any sentence that leaves the topic.', ar: 'احذف أي جملة تخرج عن الموضوع.' },
      ],
      checklist: [
        { en: 'At least 3 supporting sentences', ar: '٣ جمل داعمة على الأقل' },
        { en: 'A concluding sentence that restates the idea', ar: 'خاتمة تُعيد الفكرة' },
        { en: 'Every sentence stays on the topic', ar: 'كل الجمل في الموضوع' },
        { en: 'Linking words used (First, Also, For example)', ar: 'استُعملت أدوات الربط' },
      ],
    },
    explain: {
      intro: 'A topic sentence makes a promise. The supporting sentences keep it, and the conclusion ties it up.',
      introAr: 'الجملة الموضوعية تَعِد، والجمل الداعمة تفي بالوعد، والخاتمة تربط كل شيء.',
      points: [
        { en: 'Support with *reasons* (because…), *examples* (for example…)', ar: 'أسباب وأمثلة' },
        { en: 'Every support sentence stays on the topic', ar: 'البقاء في الموضوع' },
        { en: 'Conclusion: “In short…”, “For these reasons…”', ar: 'عبارات الخاتمة' },
        { en: 'Do NOT add a new idea in the conclusion', ar: 'لا فكرة جديدة في الخاتمة' },
      ],
    },
    examples: [
      { en: 'Topic: I love the sea. Support: *It is calm and beautiful.*', ar: 'دعم بوصف.' },
      { en: 'Support (reason): *I feel free when I swim.*', ar: 'دعم بسبب.' },
      { en: 'Support (example): *For example, I collect shells.*', ar: 'دعم بمثال.' },
      { en: 'Conclusion: *For these reasons, the sea is my happy place.*', ar: 'خاتمة.' },
      { en: 'Topic: Exercise is important. Support: *It keeps the body strong.*', ar: 'دعم.' },
      { en: 'Support: *It also improves the mood.*', ar: 'دعم إضافي.' },
      { en: 'Conclusion: *In short, everyone should exercise.*', ar: 'خاتمة.' },
      { en: 'Off-topic ✗: *My phone is new.* (does not support the sea)', ar: 'خارج الموضوع.' },
    ],
    exercises: [
      { q: 'Add a reason: “I like winter because ___.”', a: '…I can drink hot tea and rest.' },
      { q: 'Add an example: “I eat healthy food. For example, ___.”', a: '…I eat fruit and vegetables.' },
      { q: 'Write a conclusion for “My school is great.”', a: '*For these reasons, I am happy at my school.*' },
      { q: 'On topic (about dogs)? “Cats are lazy.”', a: 'No — off topic.' },
      { q: 'Turn into support (topic: reading is useful):', a: '*It builds your vocabulary.*' },
    ],
    reading: {
      title: 'Why I Love Mornings', titleAr: 'لماذا أحب الصباح',
      passage: [
        '*Mornings are the best part of my day.*',
        'The air is fresh, and the streets are quiet.',
        'I drink tea and plan my tasks calmly.',
        'Because I start early, I finish more work.',
        '*For these reasons, I always wake up with a smile.*',
      ],
      questions: [
        { q: 'What is the topic sentence?', a: '“Mornings are the best part of my day.”' },
        { q: 'Give one supporting reason.', a: 'fresh air / quiet streets / start early → finish more.' },
        { q: 'What kind of sentence is the last one?', a: 'The concluding sentence.' },
      ],
      tip: 'support = reasons + examples + details · conclusion restates the idea.',
      tipAr: 'الدعم أسباب وأمثلة وتفاصيل · الخاتمة تُعيد الفكرة.',
    },
    homework: [
      { en: 'Write a topic sentence + 3 supports + 1 conclusion', ar: 'فقرة: موضوعية + ٣ دعم + خاتمة' },
      { en: 'Cross out an off-topic sentence in your paragraph', ar: 'احذف جملة خارج الموضوع' },
      { en: 'Add a reason and an example to a topic you choose', ar: 'أضف سببًا ومثالًا لموضوع' },
    ],
    editing: {
      wrong: [
        'I love reading. It teaches me new words. My shoes are blue. It relaxes my mind.',
      ],
      correct: [
        'I love reading. It teaches me new words*,* *and* it relaxes my mind. *In short, reading makes me happy.*',
      ],
    },
  },

  /* ─────────────────────────── 23 · PARAGRAPH TYPES ─────────────────────────── */
  {
    no: 23, tag: 'Paragraph types', tagAr: 'أنواع الفقرات',
    title: 'Paragraph Types — narrative, descriptive, opinion',
    titleAr: 'أنواع الفقرات — سردية، وصفية، رأي',
    objectives: [
      { en: 'Tell a story (narrative) in time order', ar: 'السرد بالترتيب الزمني' },
      { en: 'Describe with the senses (descriptive)', ar: 'الوصف بالحواس' },
      { en: 'Give an opinion with reasons', ar: 'إبداء الرأي بأسباب' },
      { en: 'Choose the right type for the task', ar: 'اختيار النوع المناسب' },
    ],
    rule: {
      en: 'A *narrative* paragraph tells a story in time order. A *descriptive* paragraph paints a picture with details. An *opinion* paragraph states a view and supports it with reasons.',
      ar: 'السردية تحكي قصة بالترتيب الزمني. والوصفية ترسم صورة بالتفاصيل. وفقرة الرأي تبدي وجهة نظر وتدعمها بالأسباب.',
    },
    studio: {
      prompt: { en: 'Choose ONE type — narrative, descriptive, or opinion — and write a short paragraph.', ar: 'اختر نوعًا واحدًا — سردية أو وصفية أو رأي — واكتب فقرة قصيرة.' },
      model: {
        title: 'An Opinion Paragraph', titleAr: 'فقرة رأي',
        parts: [
          { role: 'topic', en: 'In my opinion, mornings are the best time to study.' },
          { role: 'support', en: 'First, the mind is fresh and calm.' },
          { role: 'support', en: 'Also, the house is quiet, so I can focus.' },
          { role: 'support', en: 'For example, I remember new words better before noon.' },
          { role: 'conclusion', en: 'For these reasons, I always study early.' },
        ],
      },
      toolkit: [
        { group: 'Narrative (a story)', ar: 'سردية', phrases: ['First, …', 'Then, …', 'After that, …', 'Finally, …'] },
        { group: 'Descriptive (senses)', ar: 'وصفية', phrases: ['It looked …', 'I could hear …', 'The smell of …', 'It felt …'] },
        { group: 'Opinion (your view)', ar: 'رأي', phrases: ['In my opinion, …', 'I believe that …', '… because …', 'For these reasons, …'] },
      ],
      steps: [
        { en: 'Pick your type: narrative, descriptive, or opinion.', ar: 'اختر النوع: سردية أو وصفية أو رأي.' },
        { en: 'Write a topic sentence in that style.', ar: 'اكتب جملة موضوعية بذلك الأسلوب.' },
        { en: 'Add supporting sentences using the right signal words.', ar: 'أضف جملًا داعمة بأدوات النوع المناسبة.' },
        { en: 'End with a concluding sentence.', ar: 'اختم بجملة خاتمة.' },
      ],
      checklist: [
        { en: 'The type is clear from the first sentence', ar: 'النوع واضح من الجملة الأولى' },
        { en: 'You used that type’s signal words', ar: 'استعملتَ أدوات النوع' },
        { en: 'A topic sentence and a conclusion', ar: 'جملة موضوعية وخاتمة' },
      ],
    },
    explain: {
      intro: 'Different goals need different paragraphs. But every type still starts with a topic sentence.',
      introAr: 'لكل هدف نوعٌ من الفقرات، لكن كل نوع يبدأ بجملة موضوعية.',
      points: [
        { en: 'Narrative: *first, then, after that, finally*', ar: 'السردية: كلمات الترتيب' },
        { en: 'Descriptive: the *senses* + adjectives', ar: 'الوصفية: الحواس والصفات' },
        { en: 'Opinion: your view + *because* + reasons', ar: 'الرأي: وجهة نظر + أسباب' },
        { en: 'Every type needs a topic sentence', ar: 'كلها تحتاج جملة موضوعية' },
      ],
    },
    examples: [
      { en: 'Narrative: *First,* I woke up. *Then,* I ran to the bus.', ar: 'أولًا... ثم...' },
      { en: 'Narrative: *Finally,* I reached school on time.', ar: 'أخيرًا...' },
      { en: 'Descriptive: The garden was *green and quiet*.', ar: 'الحديقة خضراء وهادئة.' },
      { en: 'Descriptive: I could *smell* the fresh bread.', ar: 'كنت أشمّ الخبز الطازج.' },
      { en: 'Descriptive: The music was *soft and slow*.', ar: 'كانت الموسيقى هادئة.' },
      { en: 'Opinion: *In my opinion,* reading is the best hobby.', ar: 'في رأيي...' },
      { en: 'Opinion: *I believe* sport is essential *because* it keeps us healthy.', ar: 'أعتقد... لأن...' },
      { en: 'Opinion: *For these reasons,* students should sleep early.', ar: 'لهذه الأسباب...' },
    ],
    exercises: [
      { q: 'Type? “First I mixed the flour, then I baked the cake.”', a: '*Narrative* (time order).' },
      { q: 'Type? “The beach was golden, warm, and full of light.”', a: '*Descriptive* (senses).' },
      { q: 'Type? “I think homework is useful because it helps us practice.”', a: '*Opinion* (view + reason).' },
      { q: 'Add a sense: “The kitchen smelled of ___.”', a: '…*fresh coffee*.' },
      { q: 'Start an opinion: “___, cities are better than villages.”', a: '*In my opinion,* …' },
    ],
    reading: {
      title: 'My First Day (a narrative)', titleAr: 'أول يوم (سرد)',
      passage: [
        '*First,* I entered the new school with a fast heartbeat.',
        '*Then,* a friendly teacher welcomed me at the door.',
        '*After that,* I met my classmates and learned their names.',
        'We laughed together during the break.',
        '*Finally,* I went home happy and proud.',
      ],
      questions: [
        { q: 'What type of paragraph is this?', a: 'Narrative (a story in order).' },
        { q: 'Which words show the time order?', a: 'First, Then, After that, Finally.' },
        { q: 'How did the writer feel at the end?', a: 'Happy and proud.' },
      ],
      tip: 'narrative = time order · descriptive = senses · opinion = view + reasons.',
      tipAr: 'سرد = ترتيب · وصف = حواس · رأي = وجهة نظر + أسباب.',
    },
    homework: [
      { en: 'Write a short narrative paragraph (first/then/finally)', ar: 'اكتب فقرة سردية' },
      { en: 'Write a descriptive paragraph using 3 senses', ar: 'اكتب فقرة وصفية بثلاث حواس' },
      { en: 'Write an opinion paragraph with 2 reasons', ar: 'اكتب فقرة رأي بسببين' },
    ],
    editing: {
      wrong: [
        'I think tea is nice. It is a drink. People drink it. I have a cup.',
      ],
      correct: [
        '*In my opinion,* tea is the best drink *because* it is warm, healthy, and calming. *A cup of tea relaxes me after a long day.*',
      ],
    },
  },

  /* ─────────────────────────── 24 · EDITING ─────────────────────────── */
  {
    no: 24, tag: 'Editing', tagAr: 'المراجعة',
    title: 'Editing & Proofreading — polish your writing',
    titleAr: 'المراجعة والتدقيق — تحسين كتابتك',
    objectives: [
      { en: 'Re-read your writing to find mistakes', ar: 'إعادة القراءة لاكتشاف الأخطاء' },
      { en: 'Check capitals, articles, and punctuation', ar: 'التحقق من الأساسيات' },
      { en: 'Check agreement and spelling', ar: 'التحقق من التطابق والإملاء' },
      { en: 'Use a simple editing checklist', ar: 'استخدام قائمة تدقيق' },
    ],
    rule: {
      en: 'Good writers *always re-read* and fix their work. Check *capitals*, *end punctuation*, *articles*, *agreement*, *commas*, and *spelling* — one pass at a time.',
      ar: 'الكاتب الجيد يُعيد القراءة دائمًا ويصحّح: الحروف الكبيرة، وعلامات النهاية، والأدوات، والتطابق، والفواصل، والإملاء.',
    },
    explain: {
      intro: 'The first draft is never the final one. Editing is where good writing is made.',
      introAr: 'المسودّة الأولى ليست النهائية أبدًا. والتدقيق هو حيث تُصنع الكتابة الجيدة.',
      points: [
        { en: 'Read slowly, sentence by sentence', ar: 'اقرأ ببطء جملةً جملة' },
        { en: 'Capital at the start? A mark at the end?', ar: 'حرف كبير في البداية؟ علامة في النهاية؟' },
        { en: 'Do subject & verb agree? a/an/the correct?', ar: 'التطابق والأدوات؟' },
        { en: 'Read once more only for spelling', ar: 'قراءة أخيرة للإملاء' },
      ],
    },
    examples: [
      { en: '✓ Capital at the start of every sentence', ar: 'حرف كبير في البداية' },
      { en: '✓ *.* *?* *!* at the end', ar: 'علامة في النهاية' },
      { en: '✓ a / an / the used correctly', ar: 'الأدوات صحيحة' },
      { en: '✓ he/she/it + verb-s (agreement)', ar: 'التطابق' },
      { en: '✓ commas in series and compound sentences', ar: 'الفواصل' },
      { en: '✓ spelling checked (mind the vowels!)', ar: 'الإملاء' },
      { en: '✓ one main idea per paragraph', ar: 'فكرة واحدة للفقرة' },
      { en: '✓ no fragments or run-ons', ar: 'لا جمل ناقصة أو ملتصقة' },
    ],
    exercises: [
      { q: 'Find the error: “she live in london”', a: '*S*he live*s* in *L*ondon*.*' },
      { q: 'Find the error: “I have a apple”', a: 'I have *an* apple*.*' },
      { q: 'Find the error: “we was late”', a: 'we *were* late' },
      { q: 'Find the error: “the childs are here”', a: 'the *children* are here' },
      { q: 'Find 2 errors: “my freind go to school”', a: 'my *friend* *goes* to school' },
    ],
    reading: {
      title: 'Before and After', titleAr: 'قبل وبعد',
      passage: [
        'A good paragraph is never finished on the first try.',
        'After you write, read your work aloud, slowly.',
        'Fix the small mistakes: a missing capital, a wrong article, a forgotten comma.',
        'Then read once more, only for spelling.',
        'A clean paragraph shows respect for your reader.',
      ],
      questions: [
        { q: 'Should you stop after the first try?', a: 'No — re-read and fix.' },
        { q: 'What should the last pass check?', a: 'Spelling.' },
        { q: 'Name two small mistakes to look for.', a: 'missing capital, wrong article, forgotten comma.' },
      ],
      tip: 'write → re-read aloud → fix mechanics → check spelling → done.',
      tipAr: 'اكتب ← اقرأ بصوت ← صحّح الأساسيات ← دقّق الإملاء.',
    },
    homework: [
      { en: 'Edit a paragraph you wrote using the checklist', ar: 'دقّق فقرة كتبتها بالقائمة' },
      { en: 'Read your work aloud and fix 5 mistakes', ar: 'اقرأ بصوت وصحّح ٥ أخطاء' },
      { en: 'Swap with a friend and check each other’s work', ar: 'تبادل مع صديق وصحّحا معًا' },
    ],
    editing: {
      wrong: [
        'my name is karim and i live in agadir.',
        'i work as a teacher, i love my job.',
        'every day i teachs english to a childrens.',
      ],
      correct: [
        '*M*y name is *K*arim*,* *and* *I* live in *A*gadir.',
        '*I* work as a teacher*.* *I* love my job.',
        '*E*very day *I* *teach* *E*nglish to *children*.',
      ],
    },
  },
]
