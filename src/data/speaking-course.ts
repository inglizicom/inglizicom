/**
 * speaking-course.ts — content for the /admin/present/speaking teaching deck.
 *
 * Audience: ONE senior professional. An Earth Observation / remote-sensing
 * engineer, founder of an EO company, French-Moroccan, twenty-one years of
 * experience, works across fifteen African countries, and has to speak English
 * in meetings, conferences and project presentations with international partners.
 *
 * WHY THIS COURSE IS NOT A BEGINNER COURSE
 * Treat her as A1 in PRODUCTION — assume nothing from anything she has sent in
 * writing, which may have been written in French and translated. What is not
 * A1 is her subject knowledge, which is far beyond the teacher's, and her
 * professional standing. So the course never teaches her ideas; it gives her
 * ready-made CHUNKS she can say without assembling, drilled against HER OWN
 * projects, until the sentence arrives before the translation does.
 *
 * Say the phrase, do not explain it. Every chunk is a fixed sound-shape she
 * repeats until it is automatic. Opening the grammar inside it is how a lesson
 * turns into a lecture and she stops talking.
 *
 * The rule for the teacher: she should be speaking for most of the lesson.
 * If the teacher is explaining grammar, the lesson has gone wrong.
 *
 * Formatting: wrap part of an English string in *asterisks* to spotlight it.
 * Arabic never uses it.
 */

export type Ex = { en: string; ar: string }

/** A ready-to-say phrase. `use` tells her WHEN to reach for it.
 *
 *  `alt` is the SAFETY NET. Several phrases here are above A1 as grammar
 *  (present perfect, "would you mind if…"). That is fine — they are taught as
 *  fixed sound-shapes she repeats, never as structures to understand, and the
 *  teacher must not open the grammar. But if a phrase will not stick in the
 *  lesson, `alt` is a genuinely A1 sentence that does the same job. Drop to it
 *  and move on; she can trade up in month two. */
export type Chunk = { en: string; ar: string; use?: string; alt?: string }

/** A word from her own field. `say` is a pronunciation warning for a French L1
 *  speaker — the sounds French does not have, and the stress French moves. */
export type Word = { en: string; ar: string; say?: string }

/** A short model she can copy, then swap her own facts into. */
export type Model = { title: string; titleAr: string; lines: string[]; note?: string; noteAr?: string }

/** Rapid substitution: one frame, many facts. This is where fluency is made. */
export type Drill = { frame: string; frameAr: string; slots: string[]; note?: string }

export type Lesson = {
  no: number
  phase: 1 | 2 | 3 | 4
  tag: string; tagAr: string
  title: string; titleAr: string
  goal: Ex
  /** The single sentence she should leave the lesson able to say. */
  canSay: string
  chunks: Chunk[]
  vocab?: Word[]
  model?: Model
  drill?: Drill
  /** Questions the teacher fires at her — she answers out loud, no writing. */
  hotSeat?: string[]
  homework: Ex
}

export const PHASES: { no: 1 | 2 | 3 | 4; title: string; titleAr: string; weeks: string; aim: string; aimAr: string }[] = [
  { no: 1, title: 'You and your work',     titleAr: 'أنتِ وعملك',            weeks: 'Weeks 1–2',
    aim: 'Say who you are and what you do without stopping to think.',
    aimAr: 'أن تقولي من أنتِ وماذا تعملين دون توقّف للتفكير.' },
  { no: 2, title: 'Explaining what you do', titleAr: 'شرح ما تقومين به',      weeks: 'Weeks 3–4',
    aim: 'Explain satellites, data and results in simple English a non-expert understands.',
    aimAr: 'شرح الأقمار الاصطناعية والبيانات والنتائج بإنجليزية بسيطة يفهمها غير المختص.' },
  { no: 3, title: 'Meetings',               titleAr: 'الاجتماعات',            weeks: 'Weeks 5–6',
    aim: 'Take part in a live meeting: interrupt, agree, disagree, ask again.',
    aimAr: 'المشاركة في اجتماع مباشر: المقاطعة، الاتفاق، الاعتراض، إعادة السؤال.' },
  { no: 4, title: 'Presenting & conferences', titleAr: 'العروض والمؤتمرات',   weeks: 'Weeks 7–8',
    aim: 'Present a project end to end and survive the questions afterwards.',
    aimAr: 'تقديم مشروع كاملاً والتعامل مع الأسئلة بعده.' },
]

/* ── The practice protocol — her own question, answered ────────────────────
   She asked: "what should I focus on first, and what should I do between
   lessons?" This is the answer, and it is a slide in the deck. */
export const PROTOCOL: { title: string; titleAr: string; items: { what: string; whatAr: string; how: string; howAr: string; mins: string }[] } = {
  title: 'What to do between lessons', titleAr: 'ماذا تفعلين بين الحصص',
  items: [
    { what: 'Talk to yourself about your day at work', whatAr: 'تحدّثي إلى نفسك عن يوم عملك',
      how: 'Out loud, in the car or walking. No notes. If you stop, do not restart — keep going with easier words.',
      howAr: 'بصوت عالٍ، في السيارة أو أثناء المشي. بلا ورقة. إذا توقّفتِ لا تعيدي من البداية — أكملي بكلمات أسهل.',
      mins: '10 min · every day' },
    { what: 'Record 60 seconds on one project',      whatAr: 'سجّلي 60 ثانية عن مشروع واحد',
      how: 'Phone voice recorder. One take. Send it. Do not write it first — writing it first is what stops you speaking.',
      howAr: 'مسجّل الهاتف. تسجيل واحد. أرسليه. لا تكتبيه أولاً — الكتابة أولاً هي ما يمنعك من الكلام.',
      mins: '5 min · every day' },
    { what: 'Shadow a conference talk in your field', whatAr: 'ردّدي خلف محاضرة في مجالك',
      how: 'An ESA or Copernicus talk on YouTube. Play a sentence, pause, say it exactly as they did — same speed, same music.',
      howAr: 'محاضرة من ESA أو Copernicus على يوتيوب. شغّلي جملة، أوقفي، قوليها تماماً كما قالوها — نفس السرعة ونفس النغمة.',
      mins: '10 min · 4× a week' },
    { what: 'Re-say today’s chunks in your own facts', whatAr: 'أعيدي عبارات اليوم بمعلوماتك أنتِ',
      how: 'Take the five phrases from the lesson and say each one three times about a different project.',
      howAr: 'خذي العبارات الخمس من الحصة وقولي كل واحدة ثلاث مرات عن مشروع مختلف.',
      mins: '5 min · every day' },
  ],
}

/* ── What to fix first, and what to ignore ──────────────────────────────── */
export const FOCUS: { first: Ex[]; later: Ex[] } = {
  first: [
    { en: 'Speak in whole phrases, not word by word.', ar: 'تحدّثي بعبارات كاملة لا كلمة كلمة.' },
    { en: 'Keep going when you make a mistake. Never restart a sentence.', ar: 'أكملي عند الخطأ. لا تعيدي الجملة من البداية أبداً.' },
    { en: 'Learn the 60 words of YOUR job perfectly — not 600 general words.', ar: 'أتقني 60 كلمة من مجالك تماماً — لا 600 كلمة عامة.' },
    { en: 'Say numbers, dates and country names fast and clearly.', ar: 'انطقي الأرقام والتواريخ وأسماء الدول بسرعة ووضوح.' },
  ],
  later: [
    { en: 'Perfect grammar. Nobody in a meeting is marking you.', ar: 'القواعد المثالية. لا أحد في الاجتماع يصحّح لكِ.' },
    { en: 'A British or American accent. Clear is the target, not native.', ar: 'اللهجة البريطانية أو الأمريكية. الهدف الوضوح لا شبه الناطق الأصلي.' },
    { en: 'Rare vocabulary. You need your own field, said fast.', ar: 'الكلمات النادرة. تحتاجين كلمات مجالك تُقال بسرعة.' },
  ],
}

/* ══════════════════════════════════════════════════════════════════════════
   LESSONS
   ══════════════════════════════════════════════════════════════════════════ */
export const LESSONS: Lesson[] = [

  /* ── PHASE 1 · YOU AND YOUR WORK ─────────────────────────────────────── */
  {
    no: 1, phase: 1,
    tag: 'Introduce yourself', tagAr: 'التعريف بنفسك',
    title: 'Who you are, in twenty seconds', titleAr: 'من أنتِ، في عشرين ثانية',
    goal: { en: 'Introduce yourself professionally without hesitating.', ar: 'التعريف بنفسك مهنياً دون تردد.' },
    canSay: "I'm a remote sensing engineer. I use satellite data to help African countries manage water, forests and agriculture.",
    chunks: [
      { en: "I'm a remote sensing engineer.",                       ar: 'أنا مهندسة استشعار عن بُعد.', use: 'first line, always' },
      { en: "I work in Earth Observation.",                          ar: 'أعمل في مجال رصد الأرض.' },
      { en: "I'm based in Morocco.",                                 ar: 'مقرّي في المغرب.', use: 'instead of "I live in"' },
      { en: "I run my own company, Africa EO Services.",             ar: 'أدير شركتي الخاصة، Africa EO Services.' },
      { en: "I've been doing this for twenty-one years.",            ar: 'أعمل في هذا منذ واحد وعشرين عاماً.', use: 'experience in one line', alt: 'I work in this job. Twenty-one years.' },
      { en: "I work mainly across Africa.",                          ar: 'أعمل أساساً في أنحاء أفريقيا.' },
      { en: "In short, I turn satellite images into decisions.",     ar: 'باختصار، أحوّل صور الأقمار الاصطناعية إلى قرارات.', use: 'the line people remember' },
    ],
    vocab: [
      { en: 'remote sensing',      ar: 'الاستشعار عن بُعد',   say: 'ri-MOTE SEN-sing — stress on SEN' },
      { en: 'Earth Observation',   ar: 'رصد الأرض',            say: 'the *th* is a tongue-between-teeth sound, not /z/' },
      { en: 'engineer',            ar: 'مهندسة',               say: 'en-juh-NEER — stress at the END, not "in-JÉ-nieur"' },
      { en: 'based in',            ar: 'مقرّي في',             say: 'BAYSD in — one syllable, not "ba-sed"' },
      { en: 'satellite',           ar: 'قمر اصطناعي',          say: 'SA-tuh-lite — stress FIRST, not "sa-te-LITE"' },
    ],
    model: {
      title: 'Your twenty-second introduction', titleAr: 'تعريفك في عشرين ثانية',
      lines: [
        "Hello, I'm Salma. I'm a remote sensing engineer, based in Morocco.",
        "I run a company called Africa EO Services.",
        "We use satellite data to help African countries manage water, forests and agriculture.",
        "I've been working in Earth Observation for over twenty years.",
        "In short — I turn satellite images into decisions.",
      ],
      note: 'Five lines. Learn it until it comes out with no thinking. This is the single highest-value thing in the whole course.',
      noteAr: 'خمسة أسطر. احفظيها حتى تخرج بلا تفكير. هذه أعلى قيمة في الدورة كلها.',
    },
    drill: {
      frame: "I'm a ______ . I work in ______ . I'm based in ______ .",
      frameAr: 'أنا ______ . أعمل في ______ . مقرّي في ______ .',
      slots: ['remote sensing engineer / Earth Observation / Morocco',
              'GIS specialist / mapping / Rabat',
              'project manager / satellite data / Africa'],
      note: 'Say the whole frame ten times, changing only the blanks. Speed first, perfection never.',
    },
    hotSeat: ['What do you do?', 'Where are you based?', 'How long have you been doing this?', 'Say it again, but faster.'],
    homework: { en: 'Record your twenty-second introduction three times. Send the third one.', ar: 'سجّلي تعريفك في عشرين ثانية ثلاث مرات. أرسلي الثالث.' },
  },

  {
    no: 2, phase: 1,
    tag: 'Your company', tagAr: 'شركتك',
    title: 'What your company does', titleAr: 'ماذا تفعل شركتك',
    goal: { en: 'Explain your company and your role in it.', ar: 'شرح شركتك ودورك فيها.' },
    canSay: 'We provide satellite-based services to governments and international organisations.',
    chunks: [
      { en: 'I founded the company in ______ .',                      ar: 'أسّست الشركة عام ______ .' },
      { en: 'We provide satellite-based services.',                   ar: 'نقدّم خدمات قائمة على الأقمار الاصطناعية.' },
      { en: 'Our clients are governments, agencies and researchers.',  ar: 'عملاؤنا حكومات ووكالات وباحثون.' },
      { en: 'We work with public institutions and local communities.', ar: 'نعمل مع مؤسسات عامة ومجتمعات محلية.' },
      { en: 'My role is to design and manage the solutions.',          ar: 'دوري هو تصميم الحلول وإدارتها.' },
      { en: 'We are a small team, but we work across fifteen countries.', ar: 'فريقنا صغير، لكننا نعمل في خمس عشرة دولة.' },
    ],
    vocab: [
      { en: 'to provide',   ar: 'يقدّم / يوفّر',    say: 'pruh-VIDE' },
      { en: 'stakeholder',  ar: 'طرف معني',        say: 'STAKE-hold-er — the *h* is pronounced' },
      { en: 'institution',  ar: 'مؤسسة',            say: 'in-sti-TU-shun' },
      { en: 'solution',     ar: 'حل',               say: 'suh-LOO-shun — NOT "solu-SION"' },
      { en: 'to manage',    ar: 'يدير',             say: 'MA-nij — short, stress first' },
    ],
    model: {
      title: 'Your company in four lines', titleAr: 'شركتك في أربعة أسطر',
      lines: [
        'Africa EO Services is a Moroccan company. I founded it and I run it.',
        'We provide satellite-based services — water, forests, agriculture, and the sea.',
        'Our clients are public institutions, international organisations and researchers.',
        'We are small, but we work in more than fifteen African countries.',
      ],
    },
    drill: {
      frame: 'We provide ______ services to ______ .',
      frameAr: 'نقدّم خدمات ______ لـ ______ .',
      slots: ['satellite-based / governments', 'mapping / research institutes',
              'monitoring / international organisations', 'training / national agencies'],
    },
    hotSeat: ['Tell me about your company.', 'Who are your clients?', 'How big is your team?', 'What is your role exactly?'],
    homework: { en: 'Record 60 seconds: "What my company does." No notes.', ar: 'سجّلي 60 ثانية: «ماذا تفعل شركتي». بلا ورقة.' },
  },

  {
    no: 3, phase: 1,
    tag: 'Experience', tagAr: 'الخبرة',
    title: 'Talking about your experience', titleAr: 'الحديث عن خبرتك',
    goal: { en: 'Say how long, where, and with whom — fast and clearly.', ar: 'قول المدة والمكان والجهات — بسرعة ووضوح.' },
    canSay: "I've worked in more than fifteen African countries over the last thirteen years.",
    chunks: [
      { en: "I've worked in more than fifteen countries.",   ar: 'عملت في أكثر من خمس عشرة دولة.', use: 'present perfect = still true', alt: 'I work in many countries. More than fifteen.' },
      { en: 'I spent three years on that project.',           ar: 'قضيت ثلاث سنوات في ذلك المشروع.', use: 'past simple = finished' },
      { en: 'I started in this field in 2004.',               ar: 'بدأت في هذا المجال عام 2004.' },
      { en: 'Before that, I was working on ______ .',         ar: 'قبل ذلك، كنت أعمل على ______ .' },
      { en: 'For the last two years, I have been working on AI.', ar: 'خلال العامين الأخيرين أعمل على الذكاء الاصطناعي.', alt: 'Now I work on AI. Two years.' },
      { en: 'That was probably the hardest project I have done.', ar: 'ربما كان أصعب مشروع أنجزته.', alt: 'That project was very hard.' },
    ],
    vocab: [
      { en: 'experience',   ar: 'خبرة',        say: 'ik-SPEER-ee-uns' },
      { en: 'field',        ar: 'مجال',        say: 'FEELD — one syllable' },
      { en: 'to be in charge of', ar: 'مسؤولة عن', say: 'in CHARJ ov' },
      { en: 'background',   ar: 'خلفية',       say: 'BACK-ground' },
    ],
    model: {
      title: 'Thirteen years, in five lines', titleAr: 'ثلاثة عشر عاماً في خمسة أسطر',
      lines: [
        "I've been in Earth Observation for more than twenty years.",
        "The last thirteen have been focused on Africa.",
        "I've worked in more than fifteen countries — Gabon, Congo, Tunisia, and others.",
        "I've worked with the World Bank, national agencies and research institutes.",
        "For the last two years I've been adding artificial intelligence to our work.",
      ],
      note: 'Do not list everything. Three examples then "and others" — a list bores people and makes you stumble.',
      noteAr: 'لا تذكري كل شيء. ثلاثة أمثلة ثم «وغيرها» — القائمة الطويلة تُمل وتُوقعك في التلعثم.',
    },
    drill: {
      frame: "I've worked ______ for ______ years.",
      frameAr: 'عملت في ______ لمدة ______ سنة.',
      slots: ['in Earth Observation / twenty-one', 'in Africa / thirteen', 'with the World Bank / two', 'on this project / three'],
    },
    hotSeat: ['How long have you been doing this?', 'Which countries have you worked in?', 'Who have you worked with?', 'What was your hardest project?'],
    homework: { en: 'Record 60 seconds: your career in five sentences.', ar: 'سجّلي 60 ثانية: مسيرتك المهنية في خمس جمل.' },
  },

  {
    no: 4, phase: 1,
    tag: 'Your day', tagAr: 'يومك',
    title: 'What you actually do all day', titleAr: 'ماذا تفعلين فعلياً طوال اليوم',
    goal: { en: 'Describe your working day with the verbs of your job.', ar: 'وصف يوم عملك بأفعال مهنتك.' },
    canSay: 'I process satellite images, analyse the results, and present them to the client.',
    chunks: [
      { en: 'I process satellite images.',              ar: 'أعالج صور الأقمار الاصطناعية.' },
      { en: 'I analyse the data.',                      ar: 'أحلّل البيانات.' },
      { en: 'I produce maps for the client.',           ar: 'أنتج خرائط للعميل.' },
      { en: 'I run the models.',                        ar: 'أشغّل النماذج.' },
      { en: 'I train users on the platform.',           ar: 'أدرّب المستخدمين على المنصة.' },
      { en: 'I report to the client every month.',      ar: 'أقدّم تقريراً للعميل كل شهر.' },
      { en: 'Most of my time goes on ______ .',         ar: 'معظم وقتي يذهب في ______ .' },
    ],
    vocab: [
      { en: 'to process',   ar: 'يعالج',        say: 'PRO-sess — stress FIRST in the verb' },
      { en: 'to analyse',   ar: 'يحلّل',        say: 'A-nuh-lyze' },
      { en: 'accurate',     ar: 'دقيق',         say: 'A-kyoo-rit' },
      { en: 'workflow',     ar: 'سير العمل',    say: 'WORK-flow' },
      { en: 'deliverable',  ar: 'مُخرَج',       say: 'di-LIV-er-uh-bul' },
      { en: 'to detect',    ar: 'يكشف',         say: 'di-TEKT' },
    ],
    model: {
      title: 'A normal working day', titleAr: 'يوم عمل عادي',
      lines: [
        'A normal day? I download the new satellite images in the morning.',
        'Then I process them and check the quality.',
        'In the afternoon I analyse the results and produce the maps.',
        'And once a week I have a call with the client to report on progress.',
      ],
    },
    drill: {
      frame: 'First I ______ , then I ______ , and finally I ______ .',
      frameAr: 'أولاً ______ ، ثم ______ ، وأخيراً ______ .',
      slots: ['download the images / process them / send the maps',
              'collect the data / run the model / check the results',
              'prepare the training / deliver it / write the report'],
    },
    hotSeat: ['Describe a normal working day.', 'What takes most of your time?', 'What do you enjoy most?', 'What is the boring part?'],
    homework: { en: 'Record 60 seconds: "Yesterday at work I…". Past tense.', ar: 'سجّلي 60 ثانية: «أمس في العمل…». بصيغة الماضي.' },
  },

  /* ── PHASE 2 · EXPLAINING WHAT YOU DO ────────────────────────────────── */
  {
    no: 5, phase: 2,
    tag: 'Simple explanation', tagAr: 'الشرح المبسّط',
    title: 'Explaining satellites to a non-expert', titleAr: 'شرح الأقمار الاصطناعية لغير المختص',
    goal: { en: 'Explain your work to someone who knows nothing about it.', ar: 'شرح عملك لمن لا يعرف عنه شيئاً.' },
    canSay: 'A satellite takes a picture of the same place every few days, so we can see what changed.',
    chunks: [
      { en: 'Basically, ______ .',                              ar: 'ببساطة، ______ .', use: 'the best word to start a simple explanation' },
      { en: 'Think of it as a camera in space.',                ar: 'تخيّليها كاميرا في الفضاء.', use: 'comparison — always easier than definition' },
      { en: "It's a bit like ______ .",                          ar: 'الأمر أشبه بـ ______ .' },
      { en: 'The satellite passes over the same place every five days.', ar: 'يمرّ القمر فوق المكان نفسه كل خمسة أيام.', alt: 'The satellite comes back every five days.' },
      { en: 'So we can see what has changed.',                  ar: 'وبذلك نرى ما الذي تغيّر.' },
      { en: 'In other words, ______ .',                          ar: 'بعبارة أخرى، ______ .', use: 'when you see they did not follow' },
      { en: "Does that make sense?",                            ar: 'هل هذا واضح؟', use: 'check, do not assume' },
    ],
    vocab: [
      { en: 'optical image',   ar: 'صورة بصرية',      say: 'OP-ti-kul' },
      { en: 'radar image',     ar: 'صورة رادارية',    say: 'RAY-dar — English says RAY, French says RA' },
      { en: 'resolution',      ar: 'دقة التمييز',     say: 're-zuh-LOO-shun' },
      { en: 'cloud cover',     ar: 'غطاء سحابي',      say: 'KLOWD CUV-er' },
      { en: 'coverage',        ar: 'تغطية',           say: 'CUV-rij' },
      { en: 'time series',     ar: 'سلسلة زمنية',     say: 'TIME SEER-eez' },
    ],
    model: {
      title: 'Radar, explained to a minister', titleAr: 'الرادار مشروحاً لوزير',
      lines: [
        'Basically, a normal satellite takes a photo, like a camera.',
        'But if there are clouds, the camera sees nothing.',
        'Radar is different — it sends a signal down and listens to what comes back.',
        'So radar works through cloud, and at night.',
        'That is why we use radar for the ocean and for floods. Does that make sense?',
      ],
      note: 'No numbers, no acronyms, one comparison. If a minister understands it, a scientist will too.',
      noteAr: 'بلا أرقام، بلا اختصارات، تشبيه واحد. إذا فهمها وزير فسيفهمها العالِم.',
    },
    drill: {
      frame: 'Basically, ______ . Think of it as ______ .',
      frameAr: 'ببساطة، ______ . تخيّليها ______ .',
      slots: ['radar sees through clouds / a torch in the dark',
              'we compare two dates / two photos of the same room',
              'the model predicts the flood / a weather forecast'],
    },
    hotSeat: ['What is remote sensing? I know nothing about it.', 'Why radar and not a photo?', 'Say it again — simpler.'],
    homework: { en: 'Explain your work to a family member who is not an engineer. Record it.', ar: 'اشرحي عملك لفرد من العائلة ليس مهندساً. وسجّليه.' },
  },

  {
    no: 6, phase: 2,
    tag: 'Process', tagAr: 'الخطوات',
    title: 'Explaining a process, step by step', titleAr: 'شرح عملية خطوة بخطوة',
    goal: { en: 'Walk someone through how the work is done.', ar: 'اصطحاب المستمع خطوة بخطوة في طريقة العمل.' },
    canSay: 'First we collect the images, then we process them, and finally we deliver the maps.',
    chunks: [
      { en: 'First, we ______ .',                    ar: 'أولاً، ______ .' },
      { en: 'Then we ______ .',                      ar: 'ثم ______ .' },
      { en: 'After that, ______ .',                  ar: 'بعد ذلك، ______ .' },
      { en: 'Once that is done, we ______ .',        ar: 'حين ينتهي ذلك، ______ .', alt: 'Then we ______ .' },
      { en: 'Finally, we deliver ______ .',          ar: 'وأخيراً، نسلّم ______ .' },
      { en: 'The whole process takes about ______ .', ar: 'العملية كلها تستغرق نحو ______ .' },
      { en: 'The difficult part is ______ .',        ar: 'الجزء الصعب هو ______ .' },
    ],
    vocab: [
      { en: 'to collect',      ar: 'يجمع',           say: 'kuh-LEKT' },
      { en: 'pre-processing',  ar: 'المعالجة الأولية', say: 'pree-PRO-sess-ing' },
      { en: 'classification',  ar: 'تصنيف',          say: 'klas-i-fi-KAY-shun' },
      { en: 'validation',      ar: 'تحقّق',           say: 'val-i-DAY-shun' },
      { en: 'ground truth',    ar: 'الحقيقة الأرضية', say: 'GROWND TROOTH' },
      { en: 'output',          ar: 'المُخرَج',        say: 'OWT-put' },
    ],
    model: {
      title: 'From satellite to map', titleAr: 'من القمر إلى الخريطة',
      lines: [
        'First, we collect the radar images for the area and the dates we need.',
        'Then we pre-process them — that means correcting the geometry and the noise.',
        'After that, the model classifies what it sees.',
        'Once that is done, we check the results against ground data.',
        'Finally, we deliver the maps and the report. The whole process takes about two weeks.',
      ],
    },
    drill: {
      frame: 'First we ______ . Then we ______ . Finally we ______ .',
      frameAr: 'أولاً ______ . ثم ______ . وأخيراً ______ .',
      slots: ['collect the data / run the model / deliver the maps',
              'meet the client / define the need / propose a solution',
              'prepare the course / train the users / collect the feedback'],
    },
    hotSeat: ['How do you go from a satellite to a map?', 'How long does it take?', 'What is the hardest step?'],
    homework: { en: 'Record: the full process of one of your projects, in six steps.', ar: 'سجّلي: خطوات مشروع من مشاريعك كاملة في ست خطوات.' },
  },

  {
    no: 7, phase: 2,
    tag: 'Numbers', tagAr: 'الأرقام',
    title: 'Numbers, dates and countries', titleAr: 'الأرقام والتواريخ والدول',
    goal: { en: 'Say figures out loud without slowing down.', ar: 'نطق الأرقام بصوت عالٍ دون بطء.' },
    canSay: 'We covered two hundred and fifty thousand square kilometres between 2019 and 2023.',
    chunks: [
      { en: 'about / around / roughly ______ ',        ar: 'حوالي ______ ', use: 'you rarely need the exact figure' },
      { en: 'more than ______ / over ______ ',         ar: 'أكثر من ______ ' },
      { en: 'a quarter / a third / half of ______ ',   ar: 'ربع / ثلث / نصف ______ ' },
      { en: 'It went up by thirty per cent.',          ar: 'ارتفع بنسبة ثلاثين في المئة.' },
      { en: 'It dropped sharply after 2020.',          ar: 'انخفض بحدّة بعد 2020.' },
      { en: 'between 2019 and 2023',                   ar: 'بين 2019 و2023' },
    ],
    vocab: [
      { en: 'square kilometres', ar: 'كيلومتر مربع',  say: 'SKWAIR ki-LOM-i-ters' },
      { en: 'per cent',          ar: 'في المئة',      say: 'per SENT — two words in English' },
      { en: 'a hectare',         ar: 'هكتار',         say: 'HEK-tair' },
      { en: 'threshold',         ar: 'عتبة',          say: 'THRESH-hold — the *th* again' },
      { en: 'accuracy',          ar: 'الدقة',         say: 'A-kyuh-ruh-see' },
    ],
    model: {
      title: 'Results, said out loud', titleAr: 'النتائج منطوقة',
      lines: [
        'We monitored around two hundred and fifty thousand square kilometres.',
        'That is roughly the size of the United Kingdom.',
        'Deforestation went down by about fifteen per cent between 2019 and 2023.',
        'Our detection accuracy is over ninety per cent.',
      ],
      note: 'Always give a comparison after a big number. "The size of the UK" is remembered; 250,000 km² is not.',
      noteAr: 'أعطِ تشبيهاً بعد كل رقم كبير. «بحجم بريطانيا» يُحفظ، أما 250,000 كم² فلا.',
    },
    drill: {
      frame: 'We covered about ______ , and it went up by ______ per cent.',
      frameAr: 'غطّينا حوالي ______ ، وارتفع بنسبة ______ في المئة.',
      slots: ['fifty thousand square kilometres / twenty', 'three countries / forty', 'six months / fifteen'],
      note: 'Read your own project figures out loud. Numbers are where fluent speakers still stumble.',
    },
    hotSeat: ['How big is the area?', 'What was the accuracy?', 'When did the project run?', 'Say that number again.'],
    homework: { en: 'Read the numbers from one of your reports out loud, three times.', ar: 'اقرئي أرقام أحد تقاريرك بصوت عالٍ ثلاث مرات.' },
  },

  {
    no: 8, phase: 2,
    tag: 'Your field', tagAr: 'مجالك',
    title: 'The sixty words of your job', titleAr: 'ستون كلمة من مهنتك',
    goal: { en: 'Own the vocabulary of your own field, said at speed.', ar: 'إتقان مفردات مجالك ونطقها بسرعة.' },
    canSay: 'We detect oil slicks on radar images and estimate where they came from.',
    chunks: [
      { en: 'We monitor ______ .',                     ar: 'نراقب ______ .' },
      { en: 'We detect ______ .',                      ar: 'نكشف ______ .' },
      { en: 'We map ______ .',                         ar: 'نرسم خرائط ______ .' },
      { en: 'We estimate ______ .',                    ar: 'نقدّر ______ .' },
      { en: 'The system sends an early warning.',      ar: 'يرسل النظام إنذاراً مبكراً.' },
      { en: 'We distinguish between ______ and ______ .', ar: 'نميّز بين ______ و______ .' },
    ],
    vocab: [
      { en: 'oil slick',          ar: 'بقعة نفطية',       say: 'OIL SLIK' },
      { en: 'deforestation',      ar: 'إزالة الغابات',    say: 'dee-for-es-TAY-shun' },
      { en: 'water resources',    ar: 'الموارد المائية',  say: 'WAW-ter ri-ZOR-siz' },
      { en: 'flood',              ar: 'فيضان',            say: 'FLUD — rhymes with blood' },
      { en: 'drought',            ar: 'جفاف',             say: 'DROWT — the *gh* is silent' },
      { en: 'early warning system', ar: 'نظام إنذار مبكر', say: 'ER-lee WOR-ning' },
      { en: 'inland navigation',  ar: 'الملاحة الداخلية', say: 'IN-land nav-i-GAY-shun' },
      { en: 'crop monitoring',    ar: 'مراقبة المحاصيل',  say: 'KROP MON-i-ter-ing' },
      { en: 'a ship discharge',   ar: 'تفريغ من سفينة',   say: 'DIS-charj as a noun' },
      { en: 'offshore platform',  ar: 'منصة بحرية',       say: 'OF-shor PLAT-form' },
    ],
    model: {
      title: 'Your AI work, in four lines', titleAr: 'عملك في الذكاء الاصطناعي في أربعة أسطر',
      lines: [
        'Right now, my main work is on oil pollution in the Gulf of Guinea.',
        'We use radar images to detect oil slicks on the sea.',
        'The model learns to tell the difference between a ship discharge, a platform leak and a natural seep.',
        'And then we estimate where it came from and where it is going.',
      ],
    },
    drill: {
      frame: 'We use ______ to ______ .',
      frameAr: 'نستخدم ______ لكي ______ .',
      slots: ['radar images / detect oil on the sea', 'satellite data / monitor the forest',
              'AI models / classify what we see', 'time series / measure the change'],
    },
    hotSeat: ['What are you working on right now?', 'Why is that difficult?', 'Who uses the result?'],
    homework: { en: 'Write your own list of 20 job words. Record yourself saying each in a full sentence.', ar: 'اكتبي قائمة بعشرين كلمة من مجالك. سجّلي كل واحدة داخل جملة كاملة.' },
  },

  /* ── PHASE 3 · MEETINGS ──────────────────────────────────────────────── */
  {
    no: 9, phase: 3,
    tag: 'Joining in', tagAr: 'المشاركة',
    title: 'Getting into the conversation', titleAr: 'الدخول في النقاش',
    goal: { en: 'Take the floor in a meeting instead of waiting for a gap.', ar: 'أخذ الكلمة في الاجتماع بدل انتظار فرصة.' },
    canSay: 'Can I come in here? I think there is something important we are missing.',
    chunks: [
      { en: 'Can I come in here?',                      ar: 'هل لي أن أتدخّل هنا؟', use: 'the polite interrupt' },
      { en: 'Can I add something?',                     ar: 'هل أضيف شيئاً؟' },
      { en: 'Just to build on that — ',                  ar: 'إضافةً إلى ذلك — ', alt: 'And also — ' },
      { en: 'Sorry, can I finish my point?',            ar: 'عذراً، هل أكمل فكرتي؟', use: 'when you are cut off', alt: 'Sorry — one moment, please.' },
      { en: "From our side, ______ .",                   ar: 'من جانبنا، ______ .' },
      { en: 'In my experience, ______ .',                ar: 'من واقع خبرتي، ______ .', use: 'your strongest card — use it' },
    ],
    vocab: [
      { en: 'agenda',       ar: 'جدول الأعمال',   say: 'uh-JEN-duh' },
      { en: 'to follow up', ar: 'يتابع',          say: 'FOL-oh up' },
      { en: 'deadline',     ar: 'موعد نهائي',     say: 'DED-line' },
      { en: 'update',       ar: 'تحديث',          say: 'UP-date as a noun, up-DATE as a verb' },
    ],
    model: {
      title: 'Coming in with authority', titleAr: 'التدخّل بثقة',
      lines: [
        'Can I come in here?',
        'In my experience, this is where these projects usually fail.',
        'We had exactly the same problem in Gabon in 2021.',
        'So from our side, I would suggest we deal with the data access first.',
      ],
      note: 'Notice: interrupt, then give the reason people should listen — your experience. Never apologise first.',
      noteAr: 'لاحظي: تدخّلي ثم اذكري سبب وجوب الاستماع إليك — خبرتك. لا تعتذري في البداية أبداً.',
    },
    hotSeat: ['[Teacher talks over her] — interrupt me politely.', 'Add something to what I just said.', 'Disagree with me, but stay polite.'],
    homework: { en: 'In your next meeting, use "Can I come in here?" once. Report back.', ar: 'في اجتماعك القادم استخدمي «Can I come in here?» مرة واحدة. وأخبريني.' },
  },

  {
    no: 10, phase: 3,
    tag: 'Agreeing', tagAr: 'الاتفاق والاعتراض',
    title: 'Agreeing and disagreeing', titleAr: 'الموافقة والاعتراض',
    goal: { en: 'Disagree with a partner without damaging the relationship.', ar: 'الاعتراض على شريك دون الإضرار بالعلاقة.' },
    canSay: 'I see your point, but in practice that is very difficult.',
    chunks: [
      { en: 'Absolutely.',                              ar: 'تماماً.', use: 'strong yes' },
      { en: 'That is a good point.',                    ar: 'هذه ملاحظة جيدة.' },
      { en: 'I see your point, but ______ .',            ar: 'أفهم وجهة نظرك، لكن ______ .', use: 'the safest disagreement' },
      { en: "I'm not sure I agree.",                     ar: 'لست متأكدة أنني أوافق.', use: 'soft no', alt: 'I think it is different.' },
      { en: 'In practice, that is very difficult.',      ar: 'عملياً، هذا صعب جداً.', use: 'disagree with facts, not with the person' },
      { en: 'It depends on ______ .',                    ar: 'يعتمد على ______ .' },
      { en: 'Can we come back to that later?',           ar: 'هل نعود إلى ذلك لاحقاً؟', use: 'to park an argument', alt: 'Later, please?' },
    ],
    model: {
      title: 'Disagreeing with a client', titleAr: 'الاعتراض على عميل',
      lines: [
        'I see your point, and I understand the deadline.',
        'But in practice, one month is very difficult for that area.',
        'The problem is cloud cover — in that season we lose half the images.',
        'What I would suggest is radar instead. Would that work for you?',
      ],
      note: 'Agree → but → reason → alternative. Never stop at "no".',
      noteAr: 'موافقة ← لكن ← السبب ← البديل. لا تتوقّفي عند «لا» أبداً.',
    },
    drill: {
      frame: 'I see your point, but ______ . What I would suggest is ______ .',
      frameAr: 'أفهم وجهة نظرك، لكن ______ . ما أقترحه هو ______ .',
      slots: ['the data is not free / we start with one country',
              'that season is cloudy / we use radar',
              'the team is small / we do it in two phases'],
    },
    hotSeat: ['I want the whole map in two weeks.', 'Your price is too high.', 'Why can we not just use free data?'],
    homework: { en: 'Record: disagree politely with three imaginary requests.', ar: 'سجّلي: اعترضي بلباقة على ثلاثة طلبات متخيّلة.' },
  },

  {
    no: 11, phase: 3,
    tag: 'Not understanding', tagAr: 'عدم الفهم',
    title: 'When you do not understand', titleAr: 'حين لا تفهمين',
    goal: { en: 'Ask again without embarrassment, and buy thinking time.', ar: 'إعادة السؤال دون حرج، وكسب وقت للتفكير.' },
    canSay: 'Sorry, could you say that again a bit more slowly?',
    chunks: [
      { en: 'Sorry, could you say that again?',              ar: 'عذراً، هل تعيد ذلك؟' },
      { en: 'Could you slow down a little, please?',          ar: 'هل تتحدث ببطء قليلاً من فضلك؟' },
      { en: 'Do you mean ______ ?',                           ar: 'هل تقصد ______ ؟', use: 'check instead of guessing' },
      { en: 'What do you mean by ______ ?',                   ar: 'ماذا تقصد بـ ______ ؟' },
      { en: 'So if I understand correctly, ______ .',          ar: 'إذن إن فهمت صحيحاً، ______ .', use: 'buys you five seconds', alt: 'So you mean ______ ?' },
      { en: "That's a good question. Let me think.",           ar: 'سؤال جيد. دعني أفكّر.', use: 'legitimate thinking time' },
      { en: "I don't know the word in English — it's when ______ .", ar: 'لا أعرف الكلمة بالإنجليزية — وهو حين ______ .', use: 'describe it, never stop', alt: "I don't know this word. It is when ______ ." },
    ],
    model: {
      title: 'Not knowing a word, and continuing anyway', titleAr: 'ألا تعرفي الكلمة وتكملي رغم ذلك',
      lines: [
        "I don't know the exact word in English.",
        "It's when the river brings soil and it builds up at the mouth.",
        "You know — the material the river leaves behind.",
        "Yes — sediment. Exactly.",
      ],
      note: 'This is THE most important skill in the course. A professional who describes their way around a missing word sounds fluent. One who stops sounds beginner.',
      noteAr: 'هذه أهم مهارة في الدورة. المحترفة التي تلتفّ حول الكلمة الناقصة تبدو طليقة. والتي تتوقّف تبدو مبتدئة.',
    },
    drill: {
      frame: "I don't know the word — it's when ______ / it's a kind of ______ / you use it to ______ .",
      frameAr: 'لا أعرف الكلمة — وهو حين ______ / نوع من ______ / تستخدم لـ ______ .',
      slots: ['a satellite', 'a flood', 'a geoportal', 'a training workshop'],
      note: 'Teacher: give her a word she knows, and forbid her from saying it. She must describe it in ten seconds.',
    },
    hotSeat: ['[Speak very fast] — stop me.', 'Explain "sediment" without the word.', 'Explain "threshold" without the word.'],
    homework: { en: 'Pick five hard words. Record yourself explaining each WITHOUT saying it.', ar: 'اختاري خمس كلمات صعبة. سجّلي شرح كل واحدة دون نطقها.' },
  },

  {
    no: 12, phase: 3,
    tag: 'Online meetings', tagAr: 'الاجتماعات عن بُعد',
    title: 'Online meetings and calls', titleAr: 'الاجتماعات والمكالمات عبر الإنترنت',
    goal: { en: 'Run and survive a video call in English.', ar: 'إدارة مكالمة فيديو بالإنجليزية والنجاح فيها.' },
    canSay: 'Can everyone hear me? Let me share my screen.',
    chunks: [
      { en: 'Can everyone hear me?',                    ar: 'هل يسمعني الجميع؟' },
      { en: 'You are on mute.',                         ar: 'الميكروفون مكتوم لديك.' },
      { en: 'Let me share my screen.',                  ar: 'دعوني أشارك شاشتي.' },
      { en: 'Can you see my screen?',                   ar: 'هل ترون شاشتي؟' },
      { en: 'Sorry, you cut out. Could you repeat?',    ar: 'عذراً، انقطع الصوت. هل تعيد؟', alt: 'Sorry — again, please?' },
      { en: 'Shall we start? / Shall we wrap up?',      ar: 'هل نبدأ؟ / هل ننهي؟' },
      { en: "I'll send you the slides after the call.", ar: 'سأرسل لكم الشرائح بعد المكالمة.', alt: 'I will send the slides after.' },
      { en: 'Let me recap the actions.',                ar: 'دعوني ألخّص المهام.', use: 'ends a meeting like a leader' },
    ],
    vocab: [
      { en: 'to mute / unmute', ar: 'كتم / إلغاء الكتم', say: 'MYOOT' },
      { en: 'to share a screen', ar: 'مشاركة الشاشة',    say: 'SHAIR' },
      { en: 'the chat',          ar: 'الدردشة',          say: 'CHAT' },
      { en: 'minutes (of a meeting)', ar: 'محضر الاجتماع', say: 'MIN-its — same word as time' },
      { en: 'action point',      ar: 'مهمة متفق عليها',   say: 'AK-shun point' },
    ],
    model: {
      title: 'Closing a call properly', titleAr: 'إنهاء المكالمة كما ينبغي',
      lines: [
        'Right — let me recap the actions before we finish.',
        'We will send the first maps by the fifteenth.',
        'You will confirm the field data on your side.',
        'And we meet again in two weeks. Does everyone agree?',
      ],
    },
    hotSeat: ['Start the meeting.', 'I cannot hear you — deal with it.', 'Close the meeting with three action points.'],
    homework: { en: 'Record a 60-second meeting closing with three action points.', ar: 'سجّلي 60 ثانية لإنهاء اجتماع بثلاث مهام.' },
  },

  /* ── PHASE 4 · PRESENTING & CONFERENCES ──────────────────────────────── */
  {
    no: 13, phase: 4,
    tag: 'Structure', tagAr: 'الهيكل',
    title: 'The shape of a presentation', titleAr: 'شكل العرض التقديمي',
    goal: { en: 'Open, signpost and close a talk so people can follow.', ar: 'الافتتاح والتنقّل والختام بحيث يتابعك الجمهور.' },
    canSay: "Today I'll cover three things: the problem, our method, and the results.",
    chunks: [
      { en: "Good morning. My name is ______ , from ______ .",   ar: 'صباح الخير. اسمي ______ ، من ______ .' },
      { en: "Today I'll cover three things.",                     ar: 'سأتناول اليوم ثلاثة أمور.', use: 'three — never five' },
      { en: 'Let me start with the problem.',                     ar: 'أبدأ بالمشكلة.' },
      { en: 'Moving on to ______ .',                              ar: 'ننتقل إلى ______ .' },
      { en: 'This brings me to ______ .',                         ar: 'وهذا يقودني إلى ______ .', alt: 'Now, ______ .' },
      { en: 'To sum up, ______ .',                                ar: 'خلاصة القول، ______ .' },
      { en: 'Thank you. I am happy to take questions.',           ar: 'شكراً. يسعدني تلقّي الأسئلة.' },
    ],
    model: {
      title: 'The opening ninety seconds', titleAr: 'التسعون ثانية الأولى',
      lines: [
        'Good morning. My name is Salma, from Africa EO Services in Morocco.',
        'Every year, oil pollution damages the coast of the Gulf of Guinea — and most of it is never detected.',
        "Today I'll cover three things: the problem, how we use radar and AI, and what we found.",
        'Let me start with the problem.',
      ],
      note: 'Name → the problem in one sentence → three things → start. Never open with an agenda slide read aloud.',
      noteAr: 'الاسم ← المشكلة في جملة ← ثلاثة محاور ← ابدئي. لا تفتتحي أبداً بقراءة شريحة المحاور.',
    },
    drill: {
      frame: "Today I'll cover three things: ______ , ______ , and ______ .",
      frameAr: 'سأتناول اليوم ثلاثة أمور: ______ ، ______ ، و______ .',
      slots: ['the problem / our method / the results',
              'the context / the data / the next steps',
              'why it matters / what we did / what we learned'],
    },
    hotSeat: ['Open a talk about MISBAR.', 'Now close it.', 'Do the opening again in half the words.'],
    homework: { en: 'Record the first 90 seconds of a talk about one of your projects.', ar: 'سجّلي أول 90 ثانية من عرض عن أحد مشاريعك.' },
  },

  {
    no: 14, phase: 4,
    tag: 'Your project', tagAr: 'مشروعك',
    title: 'Presenting one of your projects', titleAr: 'تقديم أحد مشاريعك',
    goal: { en: 'Present a real project of yours end to end.', ar: 'تقديم مشروع حقيقي من مشاريعك من البداية إلى النهاية.' },
    canSay: 'The problem was X, we did Y, and the result was Z.',
    chunks: [
      { en: 'The client was ______ .',                    ar: 'كان العميل ______ .' },
      { en: 'The problem they had was ______ .',          ar: 'كانت مشكلتهم ______ .' },
      { en: 'What we did was ______ .',                   ar: 'ما فعلناه هو ______ .' },
      { en: 'The result was ______ .',                    ar: 'كانت النتيجة ______ .' },
      { en: 'The main challenge was ______ .',            ar: 'كان التحدي الأكبر ______ .' },
      { en: 'What I learned from that project is ______ .', ar: 'ما تعلّمته من ذلك المشروع هو ______ .', alt: 'In that project I learned ______ .' },
    ],
    model: {
      title: 'CAFWS in five sentences', titleAr: 'مشروع CAFWS في خمس جمل',
      lines: [
        'The client was the Gabonese space agency.',
        'Their problem was simple: they could not see what was happening in their forest.',
        'What we did was build a monitoring service using satellite images.',
        'Now they can see the change every month, and act on it.',
        'The main challenge was cloud — which is why we moved to radar.',
      ],
      note: 'Client → problem → what we did → result → challenge. This shape fits any project you have.',
      noteAr: 'العميل ← المشكلة ← ما فعلناه ← النتيجة ← التحدي. هذا القالب يناسب أي مشروع لديك.',
    },
    drill: {
      frame: 'The client was ______ . The problem was ______ . What we did was ______ .',
      frameAr: 'كان العميل ______ . كانت المشكلة ______ . ما فعلناه هو ______ .',
      slots: ['GERNAC / river navigation', 'CAFWS / forest monitoring', 'MISBAR / crop monitoring'],
      note: 'Do this for all three of her real projects until each comes out in one breath.',
    },
    hotSeat: ['Tell me about GERNAC.', 'Tell me about MISBAR.', 'Which project are you proudest of, and why?'],
    homework: { en: 'Record all three projects, five sentences each, one take.', ar: 'سجّلي مشاريعك الثلاثة، خمس جمل لكل مشروع، بتسجيل واحد.' },
  },

  {
    no: 15, phase: 4,
    tag: 'Questions', tagAr: 'الأسئلة',
    title: 'Surviving the questions', titleAr: 'النجاة من الأسئلة',
    goal: { en: 'Handle hard questions calmly, including ones you cannot answer.', ar: 'التعامل بهدوء مع الأسئلة الصعبة، حتى ما لا تعرفين إجابته.' },
    canSay: "That's a good question — I don't have the figure with me, but I'll send it after the session.",
    chunks: [
      { en: "That's a very good question.",                       ar: 'سؤال جيد جداً.', use: 'buys three seconds, always' },
      { en: 'If I understood you correctly, you are asking ______ .', ar: 'إن فهمتك صحيحاً، أنت تسأل ______ .', alt: 'You are asking about ______ ?' },
      { en: 'The short answer is ______ .',                        ar: 'الجواب المختصر هو ______ .' },
      { en: "I don't have that figure with me.",                   ar: 'ليس لديّ هذا الرقم الآن.', use: 'never invent a number' },
      { en: "I'll send you the details after the session.",         ar: 'سأرسل لك التفاصيل بعد الجلسة.', alt: 'I will send you the details after.' },
      { en: "That's outside my area, but my colleague works on it.", ar: 'هذا خارج مجالي، لكن زميلي يعمل عليه.', alt: 'This is not my work. My colleague knows it.' },
      { en: 'Does that answer your question?',                     ar: 'هل أجاب هذا على سؤالك؟', use: 'closes the exchange, you keep control' },
    ],
    model: {
      title: 'A question you cannot answer', titleAr: 'سؤال لا تستطيعين إجابته',
      lines: [
        "That's a very good question.",
        "If I understood correctly, you are asking about the cost per square kilometre.",
        "I don't have that figure with me today.",
        "But I'll send you the details after the session. Does that answer your question?",
      ],
      note: 'Saying "I don\'t know, I\'ll send it" is what senior people do. Inventing a number is what nervous people do.',
      noteAr: 'قول «لا أعرف، سأرسله» هو ما يفعله الكبار. اختلاق رقم هو ما يفعله المتوتّر.',
    },
    hotSeat: ['How much does it cost per square kilometre?', 'Why not use free data?',
              'Is your accuracy good enough for a court case?', 'Is AI not going to replace you?'],
    homework: { en: 'Ask a colleague to fire five hard questions at you in English. Record the answers.', ar: 'اطلبي من زميل أن يوجّه لك خمسة أسئلة صعبة بالإنجليزية. وسجّلي إجاباتك.' },
  },

  {
    no: 16, phase: 4,
    tag: 'Networking', tagAr: 'التواصل المهني',
    title: 'The coffee break — where the work happens', titleAr: 'استراحة القهوة — حيث تُصنع الفرص',
    goal: { en: 'Start, hold and leave a conversation at a conference.', ar: 'بدء محادثة في مؤتمر والاستمرار فيها وإنهاؤها.' },
    canSay: "I really enjoyed your talk. I'm working on something similar in Morocco.",
    chunks: [
      { en: 'I really enjoyed your talk.',                     ar: 'أعجبتني محاضرتك كثيراً.', use: 'the easiest opening there is' },
      { en: "I'm working on something similar.",                ar: 'أعمل على شيء مشابه.' },
      { en: 'What brings you here?',                            ar: 'ما الذي أتى بك إلى هنا؟' },
      { en: 'How do you know the organisers?',                  ar: 'كيف تعرف المنظّمين؟' },
      { en: 'We should stay in touch.',                         ar: 'ينبغي أن نبقى على تواصل.' },
      { en: 'Would you mind if I sent you an email about it?',  ar: 'هل تمانع لو أرسلت لك بريداً بهذا الشأن؟', alt: 'Can I send you an email?' },
      { en: 'It was very nice to meet you.',                    ar: 'سُررت بلقائك.', use: 'the exit line' },
    ],
    model: {
      title: 'Ninety seconds that become a contract', titleAr: 'تسعون ثانية تتحوّل إلى عقد',
      lines: [
        'I really enjoyed your talk — the part on radar was very close to our work.',
        "I'm Salma, I run an Earth Observation company in Morocco.",
        "We're doing something similar for oil detection in the Gulf of Guinea.",
        'We should stay in touch — would you mind if I sent you an email about it?',
      ],
      note: 'Compliment → who you are → the link between you → a small, easy next step. Never ask for anything big at a coffee break.',
      noteAr: 'مجاملة ← من أنتِ ← الرابط بينكما ← خطوة تالية صغيرة وسهلة. لا تطلبي شيئاً كبيراً في استراحة قهوة.',
    },
    hotSeat: ['[Teacher is a stranger with a coffee] — start.', 'Now end the conversation politely.', 'Do it again in thirty seconds.'],
    homework: { en: 'Record your 60-second pitch: who you are, what you do, what you want.', ar: 'سجّلي عرضك في 60 ثانية: من أنتِ، ماذا تعملين، وماذا تريدين.' },
  },
]

/** Sorted teaching order. */
export const ORDERED = [...LESSONS].sort((a, b) => a.no - b.no)
