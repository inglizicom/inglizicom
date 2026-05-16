export type ChipGroup = {
  label?: string
  labelAr?: string
  chips: Array<{ en: string; ar: string }>
}

export type SentenceLesson = {
  id: number
  slug: string
  emoji: string
  title: { en: string; ar: string }
  themeColor: string
  pattern: string
  examples: string[]
  subjects: ChipGroup
  middle: { title: string; titleAr: string; groups: ChipGroup[] } // verb / modal / aux
  context?: ChipGroup // time / place / manner
  action: { title: string; titleAr: string; groups: ChipGroup[] }
  linkers?: ChipGroup
  endings?: ChipGroup
  rules: string[]
}

const SUBJECTS_STANDARD: ChipGroup = {
  chips: [
    { en: 'I', ar: 'أنا' }, { en: 'You', ar: 'أنت' }, { en: 'He', ar: 'هو' },
    { en: 'She', ar: 'هي' }, { en: 'We', ar: 'نحن' }, { en: 'They', ar: 'هم' },
  ],
}

const LINKERS_STANDARD: ChipGroup = {
  chips: [
    { en: 'and', ar: 'و' }, { en: 'but', ar: 'لكن' },
    { en: 'because', ar: 'لأن' }, { en: 'so', ar: 'لذلك' },
  ],
}

export const sentenceLessons: SentenceLesson[] = [
  {
    id: 7, slug: 'lesson-7', emoji: '☀️',
    title: { en: 'Daily Routine', ar: 'روتيني اليومي' },
    themeColor: '#ea580c',
    pattern: 'I + verb + object + time',
    examples: ['I drink coffee every morning', 'I go to school at 8 am'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'Verb', titleAr: 'الفعل', groups: [
      { label: 'Morning', labelAr: 'صباحاً', chips: [
        { en: 'wake up', ar: 'أستيقظ' }, { en: 'wash my face', ar: 'أغسل وجهي' },
        { en: 'drink', ar: 'أشرب' }, { en: 'eat', ar: 'آكل' },
      ]},
      { label: 'Day', labelAr: 'نهاراً', chips: [
        { en: 'go to', ar: 'أذهب إلى' }, { en: 'work', ar: 'أعمل' },
        { en: 'study', ar: 'أدرس' }, { en: 'read', ar: 'أقرأ' },
      ]},
    ]},
    context: { label: 'Time', labelAr: 'الوقت', chips: [
      { en: 'every morning', ar: 'كل صباح' }, { en: 'in the afternoon', ar: 'بعد الظهر' },
      { en: 'at night', ar: 'في الليل' }, { en: 'on weekends', ar: 'في عطلة الأسبوع' },
    ]},
    action: { title: 'Object', titleAr: 'المفعول', groups: [
      { chips: [
        { en: 'coffee', ar: 'قهوة' }, { en: 'breakfast', ar: 'فطور' },
        { en: 'tea', ar: 'شاي' }, { en: 'a book', ar: 'كتاباً' },
        { en: 'English', ar: 'الإنجليزية' }, { en: 'the news', ar: 'الأخبار' },
      ]},
    ]},
    linkers: LINKERS_STANDARD,
    rules: ['verb stays base form with I/You/We/They', 'add "s" with He/She/It', 'time phrases go at the end'],
  },
  {
    id: 8, slug: 'index', emoji: '🎯',
    title: { en: 'Wants & Plans', ar: 'ما أريد وما أنوي فعله' },
    themeColor: '#2563eb',
    pattern: 'I + want / need + to verb + object',
    examples: ['I want to learn English fast', 'She needs to rest'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'Modal', titleAr: 'الإرادة / النية', groups: [
      { chips: [
        { en: 'want to', ar: 'أريد أن' }, { en: 'need to', ar: 'أحتاج أن' },
        { en: 'would like to', ar: 'أود أن' }, { en: 'plan to', ar: 'أخطط أن' },
        { en: 'have to', ar: 'يجب أن' }, { en: 'try to', ar: 'أحاول أن' },
      ]},
    ]},
    action: { title: 'Verb', titleAr: 'الفعل', groups: [
      { chips: [
        { en: 'learn English', ar: 'أتعلم الإنجليزية' }, { en: 'travel', ar: 'أسافر' },
        { en: 'speak fluently', ar: 'أتكلم بطلاقة' }, { en: 'work hard', ar: 'أعمل بجد' },
        { en: 'help my family', ar: 'أساعد عائلتي' }, { en: 'find a job', ar: 'أجد عملاً' },
      ]},
    ]},
    context: { label: 'When', labelAr: 'متى', chips: [
      { en: 'this year', ar: 'هذا العام' }, { en: 'soon', ar: 'قريباً' },
      { en: 'next month', ar: 'الشهر القادم' }, { en: 'in the future', ar: 'في المستقبل' },
    ]},
    linkers: LINKERS_STANDARD,
    rules: ['always follow with base-form verb (to + verb)', 'I/You/We/They → want · He/She → wants'],
  },
  {
    id: 9, slug: 'lesson-9', emoji: '❤️',
    title: { en: 'Likes & Dislikes', ar: 'أحب وأكره' },
    themeColor: '#e11d48',
    pattern: 'I + like / love / hate + noun / verb-ing',
    examples: ['I love playing football with friends', "I don't like coffee"],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'Feeling', titleAr: 'الشعور', groups: [
      { label: '+', labelAr: 'إيجابي', chips: [
        { en: 'love', ar: 'أحب جداً' }, { en: 'like', ar: 'أحب' },
        { en: 'enjoy', ar: 'أستمتع بـ' }, { en: 'prefer', ar: 'أفضّل' },
      ]},
      { label: '-', labelAr: 'سلبي', chips: [
        { en: 'hate', ar: 'أكره' }, { en: "don't like", ar: 'لا أحب' },
        { en: "can't stand", ar: 'لا أطيق' },
      ]},
    ]},
    action: { title: 'What', titleAr: 'ماذا', groups: [
      { label: 'Food', labelAr: 'طعام', chips: [
        { en: 'pizza', ar: 'البيتزا' }, { en: 'chocolate', ar: 'الشوكولاتة' },
        { en: 'fish', ar: 'السمك' },
      ]},
      { label: 'Activity', labelAr: 'نشاط', chips: [
        { en: 'playing football', ar: 'لعب كرة القدم' }, { en: 'reading', ar: 'القراءة' },
        { en: 'cooking', ar: 'الطبخ' }, { en: 'travelling', ar: 'السفر' },
      ]},
    ]},
    context: { label: 'With', labelAr: 'مع', chips: [
      { en: 'with friends', ar: 'مع الأصدقاء' }, { en: 'alone', ar: 'وحدي' },
      { en: 'on weekends', ar: 'في العطلة' },
    ]},
    linkers: LINKERS_STANDARD,
    rules: ['like / love + noun: I love football', 'like / love + verb-ing: I love playing'],
  },
  {
    id: 10, slug: 'lesson-10', emoji: '📖',
    title: { en: 'Past Stories', ar: 'قصص الأمس' },
    themeColor: '#b45309',
    pattern: 'I + verb-ed + object + yesterday',
    examples: ['I watched a movie last night', 'She visited her grandma yesterday'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'Past Verb', titleAr: 'فعل في الماضي', groups: [
      { label: 'Regular', labelAr: 'منتظم (+ed)', chips: [
        { en: 'watched', ar: 'شاهدت' }, { en: 'visited', ar: 'زرت' },
        { en: 'played', ar: 'لعبت' }, { en: 'talked', ar: 'تحدثت' },
      ]},
      { label: 'Irregular', labelAr: 'شاذ', chips: [
        { en: 'went', ar: 'ذهبت' }, { en: 'saw', ar: 'رأيت' },
        { en: 'ate', ar: 'أكلت' }, { en: 'had', ar: 'كان لدي' },
      ]},
    ]},
    context: { label: 'When', labelAr: 'متى', chips: [
      { en: 'yesterday', ar: 'أمس' }, { en: 'last night', ar: 'البارحة' },
      { en: 'last week', ar: 'الأسبوع الماضي' }, { en: 'two days ago', ar: 'قبل يومين' },
    ]},
    action: { title: 'Object', titleAr: 'المفعول', groups: [
      { chips: [
        { en: 'a movie', ar: 'فيلماً' }, { en: 'my friends', ar: 'أصدقائي' },
        { en: 'a great meal', ar: 'وجبة رائعة' }, { en: 'a long walk', ar: 'مشياً طويلاً' },
        { en: 'the park', ar: 'الحديقة' }, { en: 'the news', ar: 'الأخبار' },
      ]},
    ]},
    linkers: LINKERS_STANDARD,
    rules: ['regular verbs: add -ed', 'irregular verbs: memorize forms (go→went, see→saw)', 'time goes at the end'],
  },
  {
    id: 11, slug: 'lesson-11', emoji: '❓',
    title: { en: 'Asking Questions', ar: 'طرح الأسئلة' },
    themeColor: '#0d9488',
    pattern: 'Do + you + verb + object?',
    examples: ['Do you speak English?', 'Does she like coffee?'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'Auxiliary', titleAr: 'فعل السؤال', groups: [
      { chips: [
        { en: 'Do you', ar: 'هل أنت' }, { en: 'Does he', ar: 'هل هو' },
        { en: 'Does she', ar: 'هل هي' }, { en: 'Do we', ar: 'هل نحن' },
        { en: 'Do they', ar: 'هل هم' },
      ]},
    ]},
    action: { title: 'Verb + Object', titleAr: 'الفعل + المفعول', groups: [
      { chips: [
        { en: 'speak English', ar: 'تتحدث الإنجليزية' }, { en: 'like coffee', ar: 'تحب القهوة' },
        { en: 'play sports', ar: 'تمارس الرياضة' }, { en: 'read books', ar: 'تقرأ الكتب' },
        { en: 'have a job', ar: 'لديك عمل' }, { en: 'live here', ar: 'تسكن هنا' },
      ]},
    ]},
    context: { label: 'When', labelAr: 'متى', chips: [
      { en: 'every day', ar: 'كل يوم' }, { en: 'on weekends', ar: 'في العطلة' },
      { en: 'often', ar: 'غالباً' }, { en: 'sometimes', ar: 'أحياناً' },
    ]},
    linkers: LINKERS_STANDARD,
    rules: ['Yes/No question: Do/Does + subject + verb', 'verb stays in base form after do/does', 'answer: Yes, I do · No, I don\'t'],
  },
  {
    id: 12, slug: 'lesson-12', emoji: '🔮',
    title: { en: 'Future Plans', ar: 'خطط المستقبل' },
    themeColor: '#059669',
    pattern: 'I + will / going to + verb + object',
    examples: ['I will travel to London next year', "She's going to study tonight"],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'Future', titleAr: 'المستقبل', groups: [
      { chips: [
        { en: 'will', ar: 'سـ (مستقبل)' }, { en: 'won\'t', ar: 'لن' },
        { en: 'am going to', ar: 'سأذهب لـ (نية)' }, { en: 'is going to', ar: 'سيذهب لـ' },
        { en: 'are going to', ar: 'سيذهبون لـ' },
      ]},
    ]},
    context: { label: 'When', labelAr: 'متى', chips: [
      { en: 'tomorrow', ar: 'غداً' }, { en: 'next week', ar: 'الأسبوع القادم' },
      { en: 'next year', ar: 'العام القادم' }, { en: 'tonight', ar: 'الليلة' },
      { en: 'soon', ar: 'قريباً' },
    ]},
    action: { title: 'Action', titleAr: 'الفعل', groups: [
      { chips: [
        { en: 'travel', ar: 'أسافر' }, { en: 'study', ar: 'أدرس' },
        { en: 'visit my family', ar: 'أزور عائلتي' }, { en: 'start a job', ar: 'أبدأ عملاً' },
        { en: 'learn to drive', ar: 'أتعلم القيادة' }, { en: 'move to a new city', ar: 'أنتقل إلى مدينة جديدة' },
      ]},
    ]},
    linkers: LINKERS_STANDARD,
    rules: ['will + base verb: for predictions/promises', 'going to + base verb: for plans/intentions', 'both mean future'],
  },
  {
    id: 13, slug: 'lesson-13', emoji: '🔎',
    title: { en: 'WH Questions', ar: 'أسئلة بـ WH' },
    themeColor: '#4338ca',
    pattern: 'WH-word + do/did + subject + verb?',
    examples: ['Where did you go yesterday?', 'What do you want?'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'WH Word', titleAr: 'كلمة السؤال', groups: [
      { chips: [
        { en: 'What', ar: 'ماذا' }, { en: 'Where', ar: 'أين' },
        { en: 'When', ar: 'متى' }, { en: 'Why', ar: 'لماذا' },
        { en: 'How', ar: 'كيف' }, { en: 'Who', ar: 'من' },
      ]},
    ]},
    context: { label: 'Tense', labelAr: 'الزمن', chips: [
      { en: 'do you', ar: 'هل أنت (مضارع)' }, { en: 'does he', ar: 'هل هو' },
      { en: 'did you', ar: 'هل (ماضي)' }, { en: 'will you', ar: 'هل ستـ' },
    ]},
    action: { title: 'Verb + Rest', titleAr: 'الفعل', groups: [
      { chips: [
        { en: 'want', ar: 'تريد' }, { en: 'go', ar: 'تذهب' },
        { en: 'do', ar: 'تفعل' }, { en: 'like', ar: 'تحب' },
        { en: 'live', ar: 'تسكن' }, { en: 'eat for breakfast', ar: 'تأكل للفطور' },
      ]},
    ]},
    rules: ['WH-word + auxiliary + subject + verb', 'use do/does for present, did for past', 'verb stays base form'],
  },
  {
    id: 14, slug: 'lesson-14', emoji: '🚫',
    title: { en: 'Negative Sentences', ar: 'جمل النفي' },
    themeColor: '#334155',
    pattern: "I + don't / didn't / won't + verb",
    examples: ["I don't drink coffee in the morning", "She didn't come"],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'Negation', titleAr: 'النفي', groups: [
      { label: 'Present', labelAr: 'مضارع', chips: [
        { en: "don't", ar: 'لا (أنا/أنت/نحن/هم)' }, { en: "doesn't", ar: 'لا (هو/هي)' },
      ]},
      { label: 'Past', labelAr: 'ماضي', chips: [
        { en: "didn't", ar: 'لم (للجميع)' },
      ]},
      { label: 'Future', labelAr: 'مستقبل', chips: [
        { en: "won't", ar: 'لن' },
      ]},
      { label: 'To Be', labelAr: 'فعل الكون', chips: [
        { en: "I'm not", ar: 'لست' }, { en: "isn't", ar: 'ليس' }, { en: "aren't", ar: 'ليسوا' },
      ]},
    ]},
    action: { title: 'Verb (base)', titleAr: 'الفعل الأصلي', groups: [
      { chips: [
        { en: 'drink coffee', ar: 'أشرب القهوة' }, { en: 'speak French', ar: 'أتحدث الفرنسية' },
        { en: 'live in London', ar: 'أسكن في لندن' }, { en: 'eat meat', ar: 'آكل اللحم' },
        { en: 'work on Sunday', ar: 'أعمل الأحد' }, { en: 'understand', ar: 'أفهم' },
      ]},
    ]},
    rules: ["don't/doesn't/didn't + base verb", "after won't → base verb", 'NEVER add -s/-ed after these'],
  },
  {
    id: 15, slug: 'lesson-15', emoji: '🎨',
    title: { en: 'Describing & Comparing', ar: 'الوصف والمقارنة' },
    themeColor: '#65a30d',
    pattern: 'It is + adj / -er than + noun',
    examples: ['My phone is faster than yours', 'She is taller'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'is / are', titleAr: 'فعل الوصف', groups: [
      { chips: [
        { en: 'is', ar: 'مفرد' }, { en: 'are', ar: 'جمع' },
        { en: 'looks', ar: 'يبدو' }, { en: 'feels', ar: 'يشعر' },
      ]},
    ]},
    context: { label: 'Comparison', labelAr: 'مقارنة', chips: [
      { en: 'than', ar: 'من' }, { en: 'the most', ar: 'الأكثر' },
      { en: 'as ... as', ar: 'مثل' },
    ]},
    action: { title: 'Adjective', titleAr: 'الصفة', groups: [
      { label: 'Size', labelAr: 'حجم', chips: [
        { en: 'big', ar: 'كبير' }, { en: 'small', ar: 'صغير' },
        { en: 'bigger', ar: 'أكبر' }, { en: 'smaller', ar: 'أصغر' },
      ]},
      { label: 'Quality', labelAr: 'جودة', chips: [
        { en: 'good', ar: 'جيد' }, { en: 'bad', ar: 'سيئ' },
        { en: 'better', ar: 'أفضل' }, { en: 'the best', ar: 'الأفضل' },
      ]},
    ]},
    rules: ['short adj: add -er (faster)', 'long adj: more + adj (more beautiful)', 'irregular: good → better, bad → worse'],
  },
  {
    id: 16, slug: 'lesson-16', emoji: '📍',
    title: { en: 'Prepositions of Place', ar: 'حروف جر المكان' },
    themeColor: '#166534',
    pattern: 'noun + is / are + on / in / under + place',
    examples: ['My keys are on the table', 'The cat is under the bed'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'Preposition', titleAr: 'حرف الجر', groups: [
      { chips: [
        { en: 'in', ar: 'في (داخل)' }, { en: 'on', ar: 'على' },
        { en: 'under', ar: 'تحت' }, { en: 'next to', ar: 'بجانب' },
        { en: 'behind', ar: 'خلف' }, { en: 'in front of', ar: 'أمام' },
        { en: 'between', ar: 'بين' }, { en: 'near', ar: 'قريب من' },
      ]},
    ]},
    action: { title: 'Place', titleAr: 'المكان', groups: [
      { chips: [
        { en: 'the table', ar: 'الطاولة' }, { en: 'the room', ar: 'الغرفة' },
        { en: 'the bed', ar: 'السرير' }, { en: 'the window', ar: 'النافذة' },
        { en: 'the school', ar: 'المدرسة' }, { en: 'the park', ar: 'الحديقة' },
      ]},
    ]},
    rules: ['in: enclosed space (in the room)', 'on: touching a surface (on the table)', 'at: specific point (at the door)'],
  },
  {
    id: 17, slug: 'lesson-17', emoji: '⏰',
    title: { en: 'Prepositions of Time', ar: 'حروف جر الزمن' },
    themeColor: '#b45309',
    pattern: 'subject + verb + at / on / in + time',
    examples: ['The meeting starts at 5pm', 'School opens in September'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'Preposition', titleAr: 'حرف الجر', groups: [
      { chips: [
        { en: 'at', ar: 'في (ساعة)' }, { en: 'on', ar: 'في (يوم)' },
        { en: 'in', ar: 'في (شهر/سنة)' }, { en: 'before', ar: 'قبل' },
        { en: 'after', ar: 'بعد' }, { en: 'during', ar: 'خلال' },
      ]},
    ]},
    action: { title: 'Time', titleAr: 'الزمن', groups: [
      { chips: [
        { en: '5 pm', ar: 'الخامسة مساءً' }, { en: 'Monday', ar: 'الإثنين' },
        { en: 'January', ar: 'يناير' }, { en: '2026', ar: '٢٠٢٦' },
        { en: 'breakfast', ar: 'الفطور' }, { en: 'the night', ar: 'الليل' },
      ]},
    ]},
    rules: ['at + clock time (at 5pm)', 'on + days/dates (on Monday)', 'in + months/years/seasons (in 2026)'],
  },
  {
    id: 18, slug: 'lesson-18', emoji: '🧭',
    title: { en: 'Prepositions of Direction', ar: 'حروف جر الاتجاه' },
    themeColor: '#0284c7',
    pattern: 'subject + go / run + to / through + place',
    examples: ['I go to school every day', 'The car drives through the tunnel'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'Verb', titleAr: 'الفعل', groups: [
      { chips: [
        { en: 'go', ar: 'يذهب' }, { en: 'run', ar: 'يجري' },
        { en: 'walk', ar: 'يمشي' }, { en: 'drive', ar: 'يقود' },
        { en: 'travel', ar: 'يسافر' }, { en: 'fly', ar: 'يطير' },
      ]},
    ]},
    context: { label: 'Direction', labelAr: 'الاتجاه', chips: [
      { en: 'to', ar: 'إلى' }, { en: 'from', ar: 'من' },
      { en: 'into', ar: 'إلى داخل' }, { en: 'out of', ar: 'إلى خارج' },
      { en: 'through', ar: 'عبر' }, { en: 'across', ar: 'عبر (شيء عريض)' },
    ]},
    action: { title: 'Place', titleAr: 'المكان', groups: [
      { chips: [
        { en: 'school', ar: 'المدرسة' }, { en: 'work', ar: 'العمل' },
        { en: 'the park', ar: 'الحديقة' }, { en: 'the tunnel', ar: 'النفق' },
        { en: 'the bridge', ar: 'الجسر' }, { en: 'home', ar: 'البيت' },
      ]},
    ]},
    rules: ['to: destination', 'from: starting point', 'through: inside and out the other side'],
  },
  {
    id: 19, slug: 'lesson-19', emoji: '💪',
    title: { en: 'Can / Could — Abilities', ar: 'القدرة والطلب المؤدب' },
    themeColor: '#047857',
    pattern: 'subject + can / could + verb',
    examples: ['I can speak English', 'Could you help me, please?'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'Modal', titleAr: 'القدرة', groups: [
      { label: 'Present', labelAr: 'حاضر', chips: [
        { en: 'can', ar: 'أستطيع' }, { en: "can't", ar: 'لا أستطيع' },
      ]},
      { label: 'Past', labelAr: 'ماضي', chips: [
        { en: 'could', ar: 'كنت أستطيع' }, { en: "couldn't", ar: 'لم أستطع' },
      ]},
      { label: 'Polite', labelAr: 'مؤدب', chips: [
        { en: 'Can you', ar: 'هل يمكنك' }, { en: 'Could you', ar: 'هل بإمكانك' },
        { en: 'May I', ar: 'هل لي أن' },
      ]},
    ]},
    action: { title: 'Verb (base)', titleAr: 'الفعل', groups: [
      { chips: [
        { en: 'swim', ar: 'أسبح' }, { en: 'drive a car', ar: 'أقود السيارة' },
        { en: 'speak English', ar: 'أتحدث الإنجليزية' }, { en: 'cook', ar: 'أطبخ' },
        { en: 'help me', ar: 'تساعدني' }, { en: 'repeat that', ar: 'تكرر' },
      ]},
    ]},
    rules: ['can/could + base verb (no s, no ed)', 'could is more polite than can', 'May I = formal permission'],
  },
  {
    id: 20, slug: 'lesson-20', emoji: '🏠',
    title: { en: 'There is / There are', ar: 'يوجد · لا يوجد' },
    themeColor: '#c2410c',
    pattern: 'There is / are + quantity + noun + place',
    examples: ['There is a book on the table', 'There are two cats in the garden'],
    subjects: { chips: [
      { en: 'There is', ar: 'يوجد (مفرد)' }, { en: 'There are', ar: 'يوجد (جمع)' },
      { en: 'There was', ar: 'كان' }, { en: 'There were', ar: 'كانوا' },
      { en: 'Is there?', ar: 'هل يوجد؟' }, { en: "There isn't", ar: 'لا يوجد' },
    ]},
    middle: { title: 'Quantity', titleAr: 'العدد', groups: [
      { chips: [
        { en: 'a', ar: 'واحد' }, { en: 'an', ar: 'واحد (حرف علة)' },
        { en: 'two', ar: 'اثنان' }, { en: 'three', ar: 'ثلاثة' },
        { en: 'some', ar: 'بعض' }, { en: 'many', ar: 'كثير' }, { en: 'no', ar: 'لا يوجد' },
      ]},
    ]},
    action: { title: 'Noun', titleAr: 'الاسم', groups: [
      { chips: [
        { en: 'book', ar: 'كتاب' }, { en: 'chair', ar: 'كرسي' },
        { en: 'people', ar: 'أشخاص' }, { en: 'cars', ar: 'سيارات' },
        { en: 'apple', ar: 'تفاحة' }, { en: 'problem', ar: 'مشكلة' },
      ]},
    ]},
    context: { label: 'Place', labelAr: 'المكان', chips: [
      { en: 'in the kitchen', ar: 'في المطبخ' }, { en: 'on the table', ar: 'على الطاولة' },
      { en: 'at home', ar: 'في البيت' }, { en: 'under the bed', ar: 'تحت السرير' },
    ]},
    rules: ['There is + singular (a book)', 'There are + plural (two books)', '"a" before consonant, "an" before vowel'],
  },
  {
    id: 21, slug: 'lesson-21', emoji: '📣',
    title: { en: 'Imperatives & Commands', ar: 'الأوامر والنواهي' },
    themeColor: '#991b1b',
    pattern: '(Please / Don\'t) + verb + object',
    examples: ['Please open the door', "Don't be late", "Let's go home"],
    subjects: { chips: [
      { en: '(none)', ar: 'بدون · أمر مباشر' }, { en: 'Please', ar: 'من فضلك' },
      { en: "Don't", ar: 'لا تـ (نهي)' }, { en: 'Never', ar: 'أبداً لا' },
      { en: 'Always', ar: 'دائماً' }, { en: "Let's", ar: 'دعنا' },
    ]},
    middle: { title: 'Verb', titleAr: 'الفعل الأصلي', groups: [
      { chips: [
        { en: 'go', ar: 'اذهب' }, { en: 'stop', ar: 'توقف' },
        { en: 'look at', ar: 'انظر إلى' }, { en: 'listen to', ar: 'استمع إلى' },
        { en: 'open', ar: 'افتح' }, { en: 'close', ar: 'أغلق' },
        { en: 'be', ar: 'كن' }, { en: 'try', ar: 'حاول' },
      ]},
    ]},
    action: { title: 'Object', titleAr: 'المفعول', groups: [
      { chips: [
        { en: 'the door', ar: 'الباب' }, { en: 'the window', ar: 'النافذة' },
        { en: 'home', ar: 'البيت' }, { en: 'quiet', ar: 'هادئاً' },
        { en: 'careful', ar: 'حذراً' }, { en: 'kind', ar: 'لطيفاً' },
      ]},
    ]},
    context: { label: 'Manner', labelAr: 'كيف', chips: [
      { en: 'quickly', ar: 'بسرعة' }, { en: 'slowly', ar: 'ببطء' },
      { en: 'carefully', ar: 'بحذر' }, { en: 'now', ar: 'الآن' },
    ]},
    rules: ['verb first (base form)', 'no subject needed', "Don't + verb = نهي"],
  },
  {
    id: 22, slug: 'lesson-22', emoji: '🎬',
    title: { en: 'Present Continuous', ar: 'المضارع المستمر' },
    themeColor: '#e11d48',
    pattern: 'subject + am / is / are + verb-ing + now',
    examples: ['I am studying English now', 'She is cooking dinner'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'am / is / are', titleAr: 'فعل الكون', groups: [
      { chips: [
        { en: 'am', ar: 'أنا (I)' }, { en: 'is', ar: 'مفرد (He/She/It)' },
        { en: 'are', ar: 'جمع (You/We/They)' }, { en: 'am not', ar: 'لست' },
        { en: "isn't", ar: 'ليس' }, { en: "aren't", ar: 'ليسوا' },
      ]},
    ]},
    action: { title: 'Verb + ing', titleAr: 'الفعل', groups: [
      { chips: [
        { en: 'studying English', ar: 'أدرس الإنجليزية' }, { en: 'cooking dinner', ar: 'أطبخ العشاء' },
        { en: 'watching TV', ar: 'أشاهد التلفاز' }, { en: 'running', ar: 'أجري' },
        { en: 'listening to music', ar: 'أستمع للموسيقى' }, { en: 'sleeping', ar: 'أنام' },
      ]},
    ]},
    context: { label: 'When', labelAr: 'متى', chips: [
      { en: 'now', ar: 'الآن' }, { en: 'right now', ar: 'حالاً' },
      { en: 'at the moment', ar: 'في هذه اللحظة' }, { en: 'today', ar: 'اليوم' },
    ]},
    rules: ['am/is/are + verb-ing', 'use for actions happening NOW', 'add -ing to the verb'],
  },
  {
    id: 23, slug: 'lesson-23', emoji: '💎',
    title: { en: 'Have / Has — Possessions', ar: 'الملكية والعائلة' },
    themeColor: '#6d28d9',
    pattern: 'subject + have / has + noun',
    examples: ['I have two brothers', 'She has blue eyes'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'have / has', titleAr: 'يملك', groups: [
      { chips: [
        { en: 'have', ar: 'أملك' }, { en: 'has', ar: 'يملك (هو/هي)' },
        { en: 'have got', ar: 'لدي (بريطاني)' }, { en: 'has got', ar: 'لديه' },
        { en: "don't have", ar: 'لا أملك' }, { en: "doesn't have", ar: 'لا يملك' },
      ]},
    ]},
    context: { label: 'Detail', labelAr: 'تفصيل', chips: [
      { en: 'a big', ar: 'كبير' }, { en: 'a new', ar: 'جديد' },
      { en: 'two', ar: 'اثنان' }, { en: 'some', ar: 'بعض' },
    ]},
    action: { title: 'Noun', titleAr: 'الاسم', groups: [
      { label: 'Family', labelAr: 'عائلة', chips: [
        { en: 'brothers', ar: 'إخوة' }, { en: 'sisters', ar: 'أخوات' },
        { en: 'friends', ar: 'أصدقاء' },
      ]},
      { label: 'Things', labelAr: 'أشياء', chips: [
        { en: 'car', ar: 'سيارة' }, { en: 'phone', ar: 'هاتف' },
        { en: 'house', ar: 'بيت' },
      ]},
    ]},
    rules: ['I/You/We/They → have', 'He/She/It → has', 'have got = have'],
  },
  {
    id: 24, slug: 'lesson-24', emoji: '🛡️',
    title: { en: 'Should / Must / Have to', ar: 'النصيحة والواجب' },
    themeColor: '#92400e',
    pattern: 'subject + should / must + verb + object',
    examples: ['You should study hard', 'We must follow the rules'],
    subjects: SUBJECTS_STANDARD,
    middle: { title: 'Modal', titleAr: 'النصيحة · الوجوب', groups: [
      { label: 'Advice', labelAr: 'نصيحة', chips: [
        { en: 'should', ar: 'ينبغي' }, { en: "shouldn't", ar: 'لا ينبغي' },
      ]},
      { label: 'Obligation', labelAr: 'إلزام', chips: [
        { en: 'must', ar: 'يجب' }, { en: "mustn't", ar: 'يحرم' },
        { en: 'have to', ar: 'مضطر إلى' }, { en: 'has to', ar: 'مضطر' },
      ]},
      { label: 'No need', labelAr: 'لا حاجة', chips: [
        { en: "don't have to", ar: 'لست مضطراً' }, { en: 'need to', ar: 'يحتاج' },
      ]},
    ]},
    action: { title: 'Verb', titleAr: 'الفعل', groups: [
      { chips: [
        { en: 'study hard', ar: 'تدرس بجد' }, { en: 'eat vegetables', ar: 'تأكل الخضار' },
        { en: 'sleep early', ar: 'تنام مبكراً' }, { en: 'follow the rules', ar: 'تتبع القواعد' },
        { en: 'smoke', ar: 'تدخن' }, { en: 'be late', ar: 'تتأخر' },
      ]},
    ]},
    rules: ['should = soft advice', 'must = strong personal duty', 'have to = external rule'],
  },
]
