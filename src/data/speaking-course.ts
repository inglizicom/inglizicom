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
 * THE ARC: COURAGE BEFORE CONTENT
 * The first four weeks are ordinary life — meeting people, small talk, the
 * weekend, a taxi, a restaurant, the phone. Not one word about satellites.
 * She will not present at a conference in English until she can chat over
 * coffee in English, and the fear is what is actually stopping her, not the
 * vocabulary. Week five is the first time the course touches her job, and it
 * touches it in the easy words first ("I work with satellites") before the
 * professional ones. Week seven is the first time she stands up.
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
  { no: 1, title: 'Everyday courage',      titleAr: 'شجاعة الكلام اليومي',  weeks: 'Weeks 1–2',
    aim: 'Open your mouth first and worry later. Meeting people, small talk, and never freezing.',
    aimAr: 'افتحي فمك أولاً ولا تقلقي بعدها. لقاء الناس، الحديث الخفيف، وألّا تتجمّدي أبداً.' },
  { no: 2, title: 'Real life you can handle', titleAr: 'حياة يومية تتقنينها', weeks: 'Weeks 3–4',
    aim: 'Your day, your stories, travel, restaurants, the phone — the English of a normal life.',
    aimAr: 'يومك، حكاياتك، السفر، المطاعم، الهاتف — إنجليزية الحياة العادية.' },
  { no: 3, title: 'Your work, simply',     titleAr: 'عملك ببساطة',          weeks: 'Weeks 5–6',
    aim: 'Say what you do, and take part in a meeting — still in easy English.',
    aimAr: 'قول ما تعملين، والمشاركة في اجتماع — بإنجليزية سهلة.' },
  { no: 4, title: 'Presenting & conferences', titleAr: 'العروض والمؤتمرات',  weeks: 'Weeks 7–8',
    aim: 'Present a project end to end and survive the questions afterwards.',
    aimAr: 'تقديم مشروع كاملاً والتعامل مع الأسئلة بعده.' },
]

/* ── The practice protocol — her own question, answered ────────────────────
   She asked: "what should I focus on first, and what should I do between
   lessons?" This is the answer, and it is a slide in the deck. */
export const PROTOCOL: { title: string; titleAr: string; items: { what: string; whatAr: string; how: string; howAr: string; mins: string }[] } = {
  title: 'What to do between lessons', titleAr: 'ماذا تفعلين بين الحصص',
  items: [
    { what: 'Talk to yourself about your day', whatAr: 'تحدّثي إلى نفسك عن يومك',
      how: 'Out loud, in the car or walking. No notes. If you stop, do not restart — keep going with easier words.',
      howAr: 'بصوت عالٍ، في السيارة أو أثناء المشي. بلا ورقة. إذا توقّفتِ لا تعيدي من البداية — أكملي بكلمات أسهل.',
      mins: '10 min · every day' },
    { what: 'Record 60 seconds and send it', whatAr: 'سجّلي 60 ثانية وأرسليها',
      how: 'Phone voice recorder. One take. Do not write it first — writing it first is what stops you speaking.',
      howAr: 'مسجّل الهاتف. تسجيل واحد. لا تكتبيه أولاً — الكتابة أولاً هي ما يمنعك من الكلام.',
      mins: '5 min · every day' },
    { what: 'Say one real sentence to a real person', whatAr: 'قولي جملة حقيقية لشخص حقيقي',
      how: 'A colleague, a waiter, anyone. One sentence in English, out loud, to a human. This is the whole course in one habit.',
      howAr: 'زميل، نادل، أي شخص. جملة واحدة بالإنجليزية بصوت عالٍ لإنسان. هذه الدورة كلها في عادة واحدة.',
      mins: '1 min · every day' },
    { what: 'Shadow a native speaker', whatAr: 'ردّدي خلف ناطق أصلي',
      how: 'Any video you enjoy. Play a sentence, pause, say it exactly as they did — same speed, same music.',
      howAr: 'أي فيديو يعجبك. شغّلي جملة، أوقفي، قوليها تماماً كما قالوها — نفس السرعة ونفس النغمة.',
      mins: '10 min · 4× a week' },
  ],
}

/* ── What to fix first, and what to ignore ──────────────────────────────── */
export const FOCUS: { first: Ex[]; later: Ex[] } = {
  first: [
    { en: 'Say something. A wrong sentence beats a perfect silence.', ar: 'قولي شيئاً. جملة خاطئة أفضل من صمت مثالي.' },
    { en: 'Speak in whole phrases, not word by word.', ar: 'تحدّثي بعبارات كاملة لا كلمة كلمة.' },
    { en: 'Keep going when you make a mistake. Never restart a sentence.', ar: 'أكملي عند الخطأ. لا تعيدي الجملة من البداية أبداً.' },
    { en: 'Learn the words of YOUR life first — home, day, travel, work.', ar: 'تعلّمي كلمات حياتك أولاً — البيت، اليوم، السفر، العمل.' },
  ],
  later: [
    { en: 'Perfect grammar. Nobody in a conversation is marking you.', ar: 'القواعد المثالية. لا أحد في الحديث يصحّح لكِ.' },
    { en: 'A British or American accent. Clear is the target, not native.', ar: 'اللهجة البريطانية أو الأمريكية. الهدف الوضوح لا شبه الناطق الأصلي.' },
    { en: 'Technical vocabulary. That comes in month two, once you are talking.', ar: 'المفردات التقنية. تأتي في الشهر الثاني بعد أن تتكلّمي.' },
  ],
}

/* ══════════════════════════════════════════════════════════════════════════
   LESSONS

   The arc is deliberate: courage before content. She will not present at a
   conference in English until she can chat over coffee in English, so the
   first four weeks are ordinary life — people, feelings, the weekend, a taxi,
   a restaurant. Only in week five does the course touch her job, and only in
   week seven does it reach a stage.
   ══════════════════════════════════════════════════════════════════════════ */
export const LESSONS: Lesson[] = [

  /* ── PHASE 1 · EVERYDAY COURAGE ──────────────────────────────────────── */
  {
    no: 1, phase: 1,
    tag: 'Hello', tagAr: 'التحية',
    title: 'Meeting people without freezing', titleAr: 'لقاء الناس دون تجمّد',
    goal: { en: 'Greet someone, say your name, and keep the conversation alive for thirty seconds.', ar: 'تحية شخص وقول اسمك وإبقاء الحديث حياً ثلاثين ثانية.' },
    canSay: "Hi, I'm Salma. Nice to meet you. How are you?",
    chunks: [
      { en: "Hi, I'm ______ . Nice to meet you.",   ar: 'مرحباً، أنا ______ . سُررت بلقائك.', use: 'the first ten words, always' },
      { en: 'How are you?',                          ar: 'كيف حالك؟' },
      { en: "I'm fine, thanks. And you?",            ar: 'بخير، شكراً. وأنت؟', use: 'always give it back' },
      { en: 'Sorry, what was your name again?',      ar: 'عذراً، ما اسمك مجدداً؟', use: 'everyone forgets — ask' },
      { en: 'Where are you from?',                   ar: 'من أين أنت؟' },
      { en: "I'm from Morocco. And you?",            ar: 'أنا من المغرب. وأنت؟' },
      { en: 'It was nice talking to you.',           ar: 'سُررت بالحديث معك.', use: 'the exit line' },
    ],
    vocab: [
      { en: 'Hi / Hello',      ar: 'مرحباً',        say: 'Hi is fine everywhere — do not worry about formal' },
      { en: 'Nice to meet you', ar: 'سُررت بلقائك', say: 'NICE to MEET you — one smooth phrase, not three words' },
      { en: 'How are you?',    ar: 'كيف حالك؟',     say: 'sounds like "how-ah-you" when said fast' },
      { en: 'Thanks',          ar: 'شكراً',          say: 'THANKS — the *th* is the tongue between the teeth' },
      { en: 'And you?',        ar: 'وأنت؟',          say: 'and-YOU — rising at the end' },
    ],
    model: {
      title: 'Thirty seconds with a stranger', titleAr: 'ثلاثون ثانية مع شخص جديد',
      lines: [
        "Hi, I'm Salma. Nice to meet you.",
        "How are you?",
        "I'm fine, thanks. And you?",
        "Where are you from?",
        "Oh, nice. I'm from Morocco.",
        "It was nice talking to you.",
      ],
      note: 'Six lines and the conversation is over — successfully. She does not need more than this in week one. Confidence comes from finishing, not from saying a lot.',
      noteAr: 'ستة أسطر وينتهي الحديث — بنجاح. لا تحتاج أكثر من هذا في الأسبوع الأول. الثقة تأتي من الإنهاء لا من كثرة الكلام.',
    },
    drill: {
      frame: "Hi, I'm ______ . Nice to meet you. How are you?",
      frameAr: 'مرحباً، أنا ______ . سُررت بلقائك. كيف حالك؟',
      slots: ['a new colleague', 'someone at a conference', 'a neighbour', 'a taxi driver'],
      note: 'Say it twenty times. Twenty. Until it is one sound, not four sentences.',
    },
    hotSeat: ['[Teacher walks in as a stranger] — greet me.', 'Now do it again, smiling.', 'Now end the conversation politely.'],
    homework: { en: 'Say "Hi, how are you?" to one real person in English. Anyone.', ar: 'قولي «Hi, how are you?» لشخص حقيقي بالإنجليزية. أي شخص.' },
  },

  {
    no: 2, phase: 1,
    tag: 'Small talk', tagAr: 'الحديث الخفيف',
    title: 'The weather, the weekend, the journey', titleAr: 'الطقس، عطلة الأسبوع، الرحلة',
    goal: { en: 'Fill a silence with easy, safe conversation.', ar: 'ملء الصمت بحديث سهل وآمن.' },
    canSay: 'It’s very hot today, isn’t it? How was your weekend?',
    chunks: [
      { en: "It's very hot today.",                ar: 'الجو حار جداً اليوم.', use: 'the safest sentence in English' },
      { en: 'How was your weekend?',               ar: 'كيف كانت عطلتك؟' },
      { en: 'It was good, thanks. I stayed at home.', ar: 'كانت جيدة، شكراً. بقيت في البيت.' },
      { en: 'How was your journey?',               ar: 'كيف كانت رحلتك؟', use: 'perfect at a conference' },
      { en: 'Is this your first time here?',       ar: 'هل هذه أول مرة لك هنا؟' },
      { en: 'Really? That’s interesting.',         ar: 'حقاً؟ هذا مثير للاهتمام.', use: 'keeps them talking' },
      { en: 'Me too. / Me neither.',               ar: 'وأنا أيضاً. / ولا أنا.' },
    ],
    vocab: [
      { en: 'weather',   ar: 'الطقس',        say: 'WEH-ther — same as "whether"' },
      { en: 'weekend',   ar: 'عطلة الأسبوع', say: 'WEEK-end' },
      { en: 'journey',   ar: 'رحلة',          say: 'JER-nee' },
      { en: 'tired',     ar: 'متعبة',         say: 'TIE-erd — two syllables' },
      { en: 'busy',      ar: 'مشغولة',        say: 'BIZ-ee — not "bu-sy"' },
    ],
    model: {
      title: 'Two minutes in a lift', titleAr: 'دقيقتان في المصعد',
      lines: [
        "It's very hot today, isn't it?",
        "How was your weekend?",
        "Really? That's nice.",
        "Mine was quiet. I stayed at home with my family.",
        "Is this your first time here?",
      ],
      note: 'Small talk is not about information. It is about not being silent. Any answer works.',
      noteAr: 'الحديث الخفيف ليس عن المعلومات. بل عن ألّا تكوني صامتة. أي إجابة تنفع.',
    },
    drill: {
      frame: 'How was your ______ ? — It was ______ , thanks.',
      frameAr: 'كيف كانت ______ ؟ — كانت ______ ، شكراً.',
      slots: ['weekend / good', 'journey / long', 'day / very busy', 'holiday / wonderful'],
    },
    hotSeat: ['[Silence in a lift] — say something.', 'Ask me about my weekend.', 'I said something boring — keep it going.'],
    homework: { en: 'Record 60 seconds: your weekend, in five sentences.', ar: 'سجّلي 60 ثانية: عطلتك في خمس جمل.' },
  },

  {
    no: 3, phase: 1,
    tag: 'About you', tagAr: 'عنكِ',
    title: 'Talking about yourself — not your job', titleAr: 'الحديث عن نفسك — لا عن عملك',
    goal: { en: 'Talk about your life, family and city in simple sentences.', ar: 'الحديث عن حياتك وعائلتك ومدينتك بجمل بسيطة.' },
    canSay: 'I live in Rabat. I have two children. I like walking and reading.',
    chunks: [
      { en: 'I live in ______ .',                  ar: 'أعيش في ______ .' },
      { en: 'I have ______ children.',             ar: 'لديّ ______ من الأولاد.' },
      { en: 'I am married. / I live with my family.', ar: 'أنا متزوجة. / أعيش مع عائلتي.' },
      { en: 'In my free time I like ______ .',     ar: 'في وقت فراغي أحب ______ .' },
      { en: 'I speak French, Arabic and a little English.', ar: 'أتحدث الفرنسية والعربية وقليلاً من الإنجليزية.', use: 'say this early — it relaxes everyone' },
      { en: 'My English is not perfect, but I am learning.', ar: 'إنجليزيتي ليست مثالية، لكنني أتعلّم.', use: 'the most useful sentence she owns' },
    ],
    vocab: [
      { en: 'to live in',   ar: 'يعيش في',      say: 'LIV — short i, not "leave"' },
      { en: 'children',     ar: 'أولاد',        say: 'CHIL-dren' },
      { en: 'free time',    ar: 'وقت الفراغ',   say: 'FREE time' },
      { en: 'to enjoy',     ar: 'يستمتع بـ',    say: 'en-JOY' },
      { en: 'a little',     ar: 'قليلاً',        say: 'uh LIT-ul' },
    ],
    model: {
      title: 'You, in five easy lines', titleAr: 'أنتِ في خمسة أسطر سهلة',
      lines: [
        "I'm Salma. I live in Rabat, in Morocco.",
        "I'm married and I have two children.",
        "In my free time I like walking and reading.",
        "I speak French and Arabic, and a little English.",
        "My English is not perfect, but I'm learning.",
      ],
      note: 'That last line is armour. Say it once and nobody judges anything after it.',
      noteAr: 'السطر الأخير درع. قوليه مرة ولن يحاسبك أحد على شيء بعده.',
    },
    drill: {
      frame: 'I live in ______ . I like ______ . I speak ______ .',
      frameAr: 'أعيش في ______ . أحب ______ . أتحدث ______ .',
      slots: ['Rabat / walking / French', 'Morocco / reading / Arabic', 'a big city / travelling / three languages'],
    },
    hotSeat: ['Tell me about yourself — but not your job.', 'What do you do at the weekend?', 'Tell me about your family.'],
    homework: { en: 'Record 60 seconds about your life. Not one word about work.', ar: 'سجّلي 60 ثانية عن حياتك. بلا كلمة واحدة عن العمل.' },
  },

  {
    no: 4, phase: 1,
    tag: 'Likes & opinions', tagAr: 'الإعجاب والرأي',
    title: 'Saying what you like, want and think', titleAr: 'قول ما تحبين وتريدين وترين',
    goal: { en: 'Give an opinion instead of only answering questions.', ar: 'إبداء رأي بدل الاكتفاء بالإجابة.' },
    canSay: 'I think it’s a good idea. I prefer the first one.',
    chunks: [
      { en: 'I like ______ . / I don’t like ______ .',  ar: 'أحب ______ . / لا أحب ______ .' },
      { en: 'I prefer ______ .',                        ar: 'أفضّل ______ .' },
      { en: 'I think ______ .',                          ar: 'أعتقد أن ______ .', use: 'start any opinion with this' },
      { en: 'I would like ______ , please.',             ar: 'أريد ______ ، من فضلك.', use: 'polite want — use everywhere' },
      { en: 'I agree. / I don’t agree.',                 ar: 'أوافق. / لا أوافق.' },
      { en: 'For me, ______ is better.',                 ar: 'بالنسبة لي، ______ أفضل.' },
      { en: 'Maybe. I’m not sure.',                      ar: 'ربما. لست متأكدة.', use: 'a real answer, not a failure' },
    ],
    vocab: [
      { en: 'to prefer',   ar: 'يفضّل',      say: 'pri-FUR — stress at the end' },
      { en: 'to agree',    ar: 'يوافق',      say: 'uh-GREE' },
      { en: 'better',      ar: 'أفضل',       say: 'BET-er' },
      { en: 'because',     ar: 'لأن',         say: 'bi-KUZ — the reason word, use it a lot' },
      { en: 'maybe',       ar: 'ربما',        say: 'MAY-bee' },
    ],
    model: {
      title: 'Having an opinion', titleAr: 'أن يكون لكِ رأي',
      lines: [
        "I think it's a good idea.",
        "I prefer the first one, because it's simpler.",
        "I don't really like the second one.",
        "But maybe I'm wrong — what do you think?",
      ],
      note: '"Because" is the single most valuable word this month. An opinion with a reason sounds fluent even in short sentences.',
      noteAr: '«Because» أثمن كلمة هذا الشهر. الرأي مع سبب يبدو طليقاً حتى بجمل قصيرة.',
    },
    drill: {
      frame: 'I think ______ , because ______ .',
      frameAr: 'أعتقد ______ ، لأن ______ .',
      slots: ['it is a good idea / it is simple', 'we need more time / the area is big',
              'this one is better / it is cheaper'],
    },
    hotSeat: ['Tea or coffee? Why?', 'Which is better, Rabat or Casablanca? Why?', 'Do you agree with me? Say why.'],
    homework: { en: 'Record: three opinions, each with "because".', ar: 'سجّلي: ثلاثة آراء، كل واحد مع «because».' },
  },

  {
    no: 5, phase: 1,
    tag: 'Survival', tagAr: 'النجاة',
    title: 'When you don’t understand', titleAr: 'حين لا تفهمين',
    goal: { en: 'Never freeze. Ask again, buy time, or go round the word.', ar: 'ألّا تتجمّدي. أعيدي السؤال أو اكسبي وقتاً أو التفّي حول الكلمة.' },
    canSay: 'Sorry, could you say that again a bit more slowly?',
    chunks: [
      { en: 'Sorry, could you say that again?',        ar: 'عذراً، هل تعيد ذلك؟' },
      { en: 'Could you speak a bit more slowly?',      ar: 'هل تتحدث ببطء أكثر قليلاً؟' },
      { en: 'What does ______ mean?',                   ar: 'ماذا تعني ______ ؟' },
      { en: 'How do you say ______ in English?',        ar: 'كيف تقول ______ بالإنجليزية؟' },
      { en: 'So you mean ______ ?',                     ar: 'إذن تقصد ______ ؟', use: 'buys five seconds' },
      { en: 'Just a moment, please.',                   ar: 'لحظة من فضلك.', use: 'thinking time is allowed' },
      { en: "I don't know this word. It is when ______ .", ar: 'لا أعرف هذه الكلمة. وهي حين ______ .', use: 'go round it, never stop' },
    ],
    vocab: [
      { en: 'again',      ar: 'مرة أخرى',   say: 'uh-GEN' },
      { en: 'slowly',     ar: 'ببطء',        say: 'SLOW-lee' },
      { en: 'to mean',    ar: 'يعني',        say: 'MEEN' },
      { en: 'to repeat',  ar: 'يعيد',        say: 'ri-PEET' },
    ],
    model: {
      title: 'Not knowing a word, and continuing anyway', titleAr: 'ألا تعرفي الكلمة وتكملي رغم ذلك',
      lines: [
        "Sorry, could you say that again a bit more slowly?",
        "What does that word mean?",
        "Ah, I see. So you mean the money, yes?",
        "I don't know the word in English — it's the paper you get after you pay.",
        "Yes — a receipt. Thank you.",
      ],
      note: 'This is the most important lesson of the whole two months. A person who talks their way around a missing word sounds fluent. A person who stops sounds like a beginner.',
      noteAr: 'هذه أهم حصة في الشهرين. من تلتفّ حول الكلمة الناقصة تبدو طليقة. ومن تتوقّف تبدو مبتدئة.',
    },
    drill: {
      frame: "I don't know the word — it's when ______ / it's a kind of ______ / you use it to ______ .",
      frameAr: 'لا أعرف الكلمة — وهي حين ______ / نوع من ______ / تُستخدم لـ ______ .',
      slots: ['a taxi', 'a receipt', 'an umbrella', 'a fridge', 'a satellite'],
      note: 'Teacher: name an easy object and forbid the word. She has ten seconds to make you guess it.',
    },
    hotSeat: ['[Speak fast and mumble] — stop me.', 'Explain "umbrella" without the word.', 'Explain "airport" without the word.'],
    homework: { en: 'Pick five objects at home. Record yourself describing each WITHOUT its name.', ar: 'اختاري خمسة أشياء في البيت. سجّلي وصف كل واحد دون ذكر اسمه.' },
  },

  /* ── PHASE 2 · REAL LIFE YOU CAN HANDLE ──────────────────────────────── */
  {
    no: 6, phase: 2,
    tag: 'Your day', tagAr: 'يومك',
    title: 'Your day, from morning to night', titleAr: 'يومك من الصباح إلى الليل',
    goal: { en: 'Describe a normal day in order, without stopping.', ar: 'وصف يوم عادي بالترتيب دون توقّف.' },
    canSay: 'I get up at six, I have breakfast, and then I go to work.',
    chunks: [
      { en: 'I get up at ______ .',                ar: 'أستيقظ الساعة ______ .' },
      { en: 'I have breakfast / lunch / dinner.',  ar: 'أتناول الفطور / الغداء / العشاء.' },
      { en: 'I go to work at ______ .',            ar: 'أذهب إلى العمل الساعة ______ .' },
      { en: 'In the morning I usually ______ .',   ar: 'في الصباح عادةً ______ .' },
      { en: 'After that, I ______ .',              ar: 'بعد ذلك ______ .' },
      { en: 'I go to bed around eleven.',          ar: 'أنام حوالي الحادية عشرة.' },
      { en: 'Today was a long day.',               ar: 'كان اليوم طويلاً.' },
    ],
    vocab: [
      { en: 'to get up',    ar: 'يستيقظ',     say: 'get UP — two words, one action' },
      { en: 'usually',      ar: 'عادةً',       say: 'YOO-zhoo-lee' },
      { en: 'in the morning', ar: 'في الصباح', say: 'in-thuh-MOR-ning — one chunk' },
      { en: 'around',       ar: 'حوالي',       say: 'uh-ROWND — use it for every time' },
      { en: 'busy day',     ar: 'يوم مزدحم',   say: 'BIZ-ee day' },
    ],
    model: {
      title: 'A normal day', titleAr: 'يوم عادي',
      lines: [
        'I usually get up at six and have breakfast with my family.',
        'Then I go to the office, around eight.',
        'In the morning I work on the computer. At one, I have lunch.',
        'In the afternoon I have meetings, and I go home around six.',
        'In the evening I read a little, and I go to bed around eleven.',
      ],
    },
    drill: {
      frame: 'In the morning I ______ . In the afternoon I ______ . In the evening I ______ .',
      frameAr: 'في الصباح ______ . بعد الظهر ______ . في المساء ______ .',
      slots: ['get up early / have meetings / read', 'work / go out / cook', 'travel / write / rest'],
    },
    hotSeat: ['Describe your day.', 'Now yesterday — same story, past tense.', 'Now in thirty seconds.'],
    homework: { en: 'Record 60 seconds: your whole day, in order.', ar: 'سجّلي 60 ثانية: يومك كله بالترتيب.' },
  },

  {
    no: 7, phase: 2,
    tag: 'Telling a story', tagAr: 'حكاية قصيرة',
    title: 'Telling a short story — what happened', titleAr: 'حكاية قصيرة — ماذا حدث',
    goal: { en: 'Tell something that happened to you, in the past.', ar: 'حكاية شيء حدث لك، بصيغة الماضي.' },
    canSay: 'Yesterday I went to the airport, but the flight was late.',
    chunks: [
      { en: 'Yesterday I went to ______ .',        ar: 'أمس ذهبت إلى ______ .' },
      { en: 'Last week I ______ .',                ar: 'الأسبوع الماضي ______ .' },
      { en: 'It was very ______ .',                ar: 'كان ______ جداً.' },
      { en: 'And then ______ .',                   ar: 'ثم ______ .', use: 'the story engine' },
      { en: 'But ______ .',                        ar: 'لكن ______ .', use: 'every story needs a "but"' },
      { en: 'In the end, ______ .',                ar: 'وفي النهاية ______ .' },
      { en: 'It was a good day. / It was a difficult day.', ar: 'كان يوماً جيداً. / كان يوماً صعباً.' },
    ],
    vocab: [
      { en: 'went (go)',    ar: 'ذهبَ',      say: 'WENT — the past of go, learn it as one word' },
      { en: 'was / were',   ar: 'كان / كانوا', say: 'WUZ / WER' },
      { en: 'saw (see)',    ar: 'رأى',        say: 'SAW' },
      { en: 'took (take)',  ar: 'أخذ',        say: 'TOOK' },
      { en: 'in the end',   ar: 'في النهاية', say: 'in-thee-END' },
    ],
    model: {
      title: 'A small story with a problem', titleAr: 'حكاية صغيرة فيها مشكلة',
      lines: [
        'Last month I went to Gabon for work.',
        'The journey was very long — about nine hours.',
        'And then, at the airport, they lost my bag.',
        'But the people were very kind, and they found it the next day.',
        'In the end, it was a good trip.',
      ],
      note: 'Every good story is: I went → and then → BUT → in the end. Teach the shape, not the tenses.',
      noteAr: 'كل حكاية جيدة هي: ذهبت ← ثم ← لكن ← وفي النهاية. علّم القالب لا الأزمنة.',
    },
    drill: {
      frame: 'Yesterday I ______ . And then ______ . But ______ . In the end ______ .',
      frameAr: 'أمس ______ . ثم ______ . لكن ______ . وفي النهاية ______ .',
      slots: ['went to the office', 'travelled to Tunis', 'had a long meeting'],
    },
    hotSeat: ['Tell me about yesterday.', 'Tell me about a difficult journey.', 'Tell me a story with a problem in it.'],
    homework: { en: 'Record 60 seconds: something that happened to you last month.', ar: 'سجّلي 60 ثانية: شيء حدث لك الشهر الماضي.' },
  },

  {
    no: 8, phase: 2,
    tag: 'Travel', tagAr: 'السفر',
    title: 'Airport, taxi, hotel', titleAr: 'المطار والتاكسي والفندق',
    goal: { en: 'Handle a trip alone in English.', ar: 'إدارة رحلة بمفردك بالإنجليزية.' },
    canSay: 'Excuse me, where is gate twelve? — I have a reservation under Salma.',
    chunks: [
      { en: 'Excuse me, where is ______ ?',            ar: 'عذراً، أين ______ ؟' },
      { en: 'I have a reservation under ______ .',      ar: 'لديّ حجز باسم ______ .' },
      { en: 'Could you take me to ______ , please?',    ar: 'هل تأخذني إلى ______ من فضلك؟' },
      { en: 'How much is it?',                          ar: 'كم السعر؟' },
      { en: 'Is breakfast included?',                   ar: 'هل الفطور مشمول؟' },
      { en: 'My flight is at ______ .',                 ar: 'رحلتي الساعة ______ .' },
      { en: 'Could I have the bill, please?',           ar: 'هل لي بالفاتورة من فضلك؟' },
    ],
    vocab: [
      { en: 'a gate',        ar: 'بوابة',       say: 'GATE' },
      { en: 'a reservation', ar: 'حجز',         say: 'rez-er-VAY-shun' },
      { en: 'luggage',       ar: 'أمتعة',       say: 'LUG-ij — no plural, never "luggages"' },
      { en: 'to check in',   ar: 'يسجّل الوصول', say: 'chek IN' },
      { en: 'a receipt',     ar: 'إيصال',        say: 'ri-SEET — the *p* is silent' },
      { en: 'delayed',       ar: 'متأخرة',       say: 'di-LAYD' },
    ],
    model: {
      title: 'Arriving alone in a new city', titleAr: 'الوصول وحدك إلى مدينة جديدة',
      lines: [
        'Excuse me, where is the taxi rank, please?',
        'Could you take me to the Hilton hotel?',
        'How much is it? … Could I have a receipt, please?',
        'Good evening. I have a reservation under Salma.',
        'What time is breakfast? Thank you very much.',
      ],
    },
    drill: {
      frame: 'Excuse me, where is ______ , please?',
      frameAr: 'عذراً، أين ______ من فضلك؟',
      slots: ['the gate', 'the taxi rank', 'the toilet', 'the exit', 'my hotel'],
    },
    hotSeat: ['[Teacher is a taxi driver] — get to your hotel.', '[Teacher is reception] — check in.', 'Your flight is delayed. Ask about it.'],
    homework: { en: 'Record: arriving at a hotel and checking in, both sides.', ar: 'سجّلي: الوصول إلى فندق وتسجيل الدخول، بالدورين.' },
  },

  {
    no: 9, phase: 2,
    tag: 'Eating out', tagAr: 'المطاعم والضيافة',
    title: 'Restaurants and being a guest', titleAr: 'المطاعم وأن تكوني ضيفة',
    goal: { en: 'Order food and hold a dinner conversation.', ar: 'طلب الطعام وإدارة حديث على العشاء.' },
    canSay: 'I would like the fish, please. It looks delicious.',
    chunks: [
      { en: 'I would like ______ , please.',        ar: 'أريد ______ من فضلك.' },
      { en: 'Could I have ______ ?',                ar: 'هل لي بـ ______ ؟' },
      { en: 'What do you recommend?',               ar: 'بماذا تنصح؟', use: 'saves you reading the menu' },
      { en: 'I don’t eat ______ .',                 ar: 'لا آكل ______ .' },
      { en: 'It’s delicious. Thank you.',           ar: 'إنه لذيذ. شكراً لك.' },
      { en: 'Thank you for inviting me.',           ar: 'شكراً على دعوتك.' },
      { en: 'Shall we get the bill?',               ar: 'هل نطلب الفاتورة؟' },
    ],
    vocab: [
      { en: 'the menu',     ar: 'قائمة الطعام', say: 'MEN-yoo' },
      { en: 'the bill',     ar: 'الفاتورة',     say: 'BIL — Americans say "check"' },
      { en: 'delicious',    ar: 'لذيذ',          say: 'di-LISH-us' },
      { en: 'to recommend', ar: 'ينصح بـ',       say: 'rek-uh-MEND' },
      { en: 'starter / main / dessert', ar: 'مقبلات / طبق رئيسي / حلوى', say: 'di-ZERT for dessert' },
    ],
    model: {
      title: 'Dinner with international colleagues', titleAr: 'عشاء مع زملاء دوليين',
      lines: [
        'This looks very nice. What do you recommend?',
        'I would like the fish, please. And some water.',
        "I don't eat pork, but everything else is fine.",
        "It's delicious. Thank you for inviting me.",
        'Shall we get the bill?',
      ],
      note: 'Dinner is where partnerships are made. She does not need perfect English here — she needs to be present and warm.',
      noteAr: 'العشاء حيث تُصنع الشراكات. لا تحتاج إنجليزية مثالية هنا — تحتاج أن تكون حاضرة ودافئة.',
    },
    hotSeat: ['[Teacher is a waiter] — order a meal.', 'I invited you — thank me.', 'Ask me what I recommend.'],
    homework: { en: 'Record: ordering a full meal, and one compliment about the food.', ar: 'سجّلي: طلب وجبة كاملة، ومجاملة واحدة عن الطعام.' },
  },

  {
    no: 10, phase: 2,
    tag: 'Phone & messages', tagAr: 'الهاتف والرسائل',
    title: 'On the phone and on WhatsApp', titleAr: 'على الهاتف وعلى واتساب',
    goal: { en: 'Make and take a call without panic.', ar: 'إجراء مكالمة وتلقّيها دون ارتباك.' },
    canSay: 'Hello, this is Salma speaking. Can you hear me?',
    chunks: [
      { en: 'Hello, this is ______ speaking.',      ar: 'مرحباً، معك ______ .', use: 'never "I am" on the phone' },
      { en: 'Can you hear me?',                     ar: 'هل تسمعني؟' },
      { en: 'Sorry, the line is bad.',              ar: 'عذراً، الخط سيئ.' },
      { en: 'Could you call me back later?',        ar: 'هل تتصل بي لاحقاً؟' },
      { en: 'I’ll send you a message.',             ar: 'سأرسل لك رسالة.' },
      { en: 'Sorry for the late reply.',            ar: 'عذراً على تأخّر الرد.' },
      { en: 'Talk to you soon. Bye.',               ar: 'أراك قريباً. مع السلامة.' },
    ],
    vocab: [
      { en: 'to call',       ar: 'يتصل',       say: 'KAWL' },
      { en: 'to call back',  ar: 'يعاود الاتصال', say: 'kawl BAK' },
      { en: 'the line',      ar: 'الخط',        say: 'LINE' },
      { en: 'a message',     ar: 'رسالة',       say: 'MESS-ij' },
      { en: 'soon',          ar: 'قريباً',       say: 'SOON' },
    ],
    model: {
      title: 'A short call', titleAr: 'مكالمة قصيرة',
      lines: [
        'Hello, this is Salma speaking. Can you hear me?',
        "Sorry, the line is a bit bad. Could you repeat that?",
        'Yes, of course. I will send you a message with the details.',
        'Thank you. Talk to you soon. Bye.',
      ],
    },
    hotSeat: ['[Teacher calls] — answer.', 'The line is bad — deal with it.', 'End the call politely.'],
    homework: { en: 'Record a 40-second phone call, both sides.', ar: 'سجّلي مكالمة 40 ثانية بالدورين.' },
  },

  /* ── PHASE 3 · YOUR WORK, SIMPLY ─────────────────────────────────────── */
  {
    no: 11, phase: 3,
    tag: 'What you do', tagAr: 'ماذا تعملين',
    title: 'What you do — the simple version', titleAr: 'ماذا تعملين — النسخة البسيطة',
    goal: { en: 'Say your job in a way anybody understands.', ar: 'قول مهنتك بطريقة يفهمها الجميع.' },
    canSay: 'I work with satellites. We look at the Earth from space to help people.',
    chunks: [
      { en: 'I work with satellites.',                    ar: 'أعمل مع الأقمار الاصطناعية.', use: 'the easy version first' },
      { en: 'I am an engineer.',                          ar: 'أنا مهندسة.' },
      { en: 'We look at the Earth from space.',           ar: 'ننظر إلى الأرض من الفضاء.' },
      { en: 'We help countries with water, forests and farming.', ar: 'نساعد الدول في المياه والغابات والزراعة.' },
      { en: 'I work in many African countries.',          ar: 'أعمل في دول أفريقية كثيرة.' },
      { en: "I'm a remote sensing engineer.",             ar: 'أنا مهندسة استشعار عن بُعد.', use: 'the professional version — week 5, not week 1' },
      { en: 'In short, I turn satellite pictures into decisions.', ar: 'باختصار، أحوّل صور الأقمار إلى قرارات.', use: 'the line people remember' },
    ],
    vocab: [
      { en: 'satellite',     ar: 'قمر اصطناعي',      say: 'SA-tuh-lite — stress FIRST, not "sa-te-LITE"' },
      { en: 'engineer',      ar: 'مهندسة',            say: 'en-juh-NEER — stress at the END' },
      { en: 'remote sensing', ar: 'الاستشعار عن بُعد', say: 'ri-MOTE SEN-sing' },
      { en: 'Earth',         ar: 'الأرض',             say: 'ERTH — the *th* again' },
      { en: 'to help',       ar: 'يساعد',             say: 'HELP — the *h* is pronounced in English' },
    ],
    model: {
      title: 'Your job, two ways', titleAr: 'مهنتك بطريقتين',
      lines: [
        'Simple version: “I work with satellites. We look at the Earth from space, and we help countries with water, forests and farming.”',
        'Professional version: “I’m a remote sensing engineer. I use satellite data to support water, forest and agriculture management across Africa.”',
        'Both are correct. Use the first one at dinner, the second one at a conference.',
      ],
      note: 'She has been trying to say the second version since week one. Give her the first one and the fear goes.',
      noteAr: 'كانت تحاول قول النسخة الثانية منذ الأسبوع الأول. أعطها الأولى فيذهب الخوف.',
    },
    drill: {
      frame: 'I work with ______ . We help ______ .',
      frameAr: 'أعمل مع ______ . نساعد ______ .',
      slots: ['satellites / countries in Africa', 'maps / farmers and governments', 'data / people who make decisions'],
    },
    hotSeat: ['What do you do? — the simple way.', 'Now the professional way.', 'Now explain it to a ten-year-old.'],
    homework: { en: 'Record both versions of your job — simple and professional.', ar: 'سجّلي نسختي مهنتك — البسيطة والمهنية.' },
  },

  {
    no: 12, phase: 3,
    tag: 'Company & team', tagAr: 'الشركة والفريق',
    title: 'Your company, your team, your years', titleAr: 'شركتك وفريقك وسنوات خبرتك',
    goal: { en: 'Talk about your company and your experience.', ar: 'الحديث عن شركتك وخبرتك.' },
    canSay: 'I have my own company. We are a small team, and we work in fifteen countries.',
    chunks: [
      { en: 'I have my own company.',                   ar: 'لديّ شركتي الخاصة.' },
      { en: 'It is called ______ .',                    ar: 'اسمها ______ .' },
      { en: 'We are a small team.',                     ar: 'نحن فريق صغير.' },
      { en: 'Our clients are governments and big organisations.', ar: 'عملاؤنا حكومات ومنظمات كبيرة.' },
      { en: 'I started the company in ______ .',        ar: 'أسّست الشركة عام ______ .' },
      { en: "I've worked in more than fifteen countries.", ar: 'عملت في أكثر من خمس عشرة دولة.', alt: 'I work in many countries. More than fifteen.' },
      { en: "I've been doing this for twenty-one years.", ar: 'أعمل في هذا منذ واحد وعشرين عاماً.', alt: 'I work in this job. Twenty-one years.' },
    ],
    vocab: [
      { en: 'a company',    ar: 'شركة',        say: 'KUM-puh-nee' },
      { en: 'a team',       ar: 'فريق',        say: 'TEEM' },
      { en: 'a client',     ar: 'عميل',        say: 'KLY-ent' },
      { en: 'a government', ar: 'حكومة',       say: 'GUV-ern-ment — the first *n* is often dropped' },
      { en: 'experience',   ar: 'خبرة',        say: 'ik-SPEER-ee-uns' },
    ],
    model: {
      title: 'Company and experience, in five lines', titleAr: 'الشركة والخبرة في خمسة أسطر',
      lines: [
        'I have my own company. It is called Africa EO Services, in Morocco.',
        'We are a small team, but we work in more than fifteen African countries.',
        'Our clients are governments, big organisations and researchers.',
        "I've been doing this for twenty-one years.",
        'The last thirteen have been in Africa.',
      ],
      note: 'Three facts, then stop. A long list makes her stumble and bores them.',
      noteAr: 'ثلاث حقائق ثم توقّفي. القائمة الطويلة تُوقعها في التلعثم وتُمل السامع.',
    },
    drill: {
      frame: 'We are ______ , and we work in ______ .',
      frameAr: 'نحن ______ ، ونعمل في ______ .',
      slots: ['a small team / fifteen countries', 'a Moroccan company / Africa', 'engineers / water and forests'],
    },
    hotSeat: ['Tell me about your company.', 'How long have you been doing this?', 'Which countries?'],
    homework: { en: 'Record 60 seconds: your company and your experience.', ar: 'سجّلي 60 ثانية: شركتك وخبرتك.' },
  },

  {
    no: 13, phase: 3,
    tag: 'Explaining', tagAr: 'الشرح',
    title: 'Explaining your work to a non-expert', titleAr: 'شرح عملك لغير المختص',
    goal: { en: 'Explain satellites, radar and data in easy English.', ar: 'شرح الأقمار والرادار والبيانات بإنجليزية سهلة.' },
    canSay: 'Basically, the satellite takes a picture of the same place every few days, so we can see what changed.',
    chunks: [
      { en: 'Basically, ______ .',                       ar: 'ببساطة، ______ .', use: 'the best word to start an explanation' },
      { en: 'Think of it as a camera in space.',         ar: 'تخيّليها كاميرا في الفضاء.', use: 'comparison beats definition' },
      { en: "It's a bit like ______ .",                   ar: 'الأمر أشبه بـ ______ .' },
      { en: 'The satellite comes back every five days.',  ar: 'يعود القمر كل خمسة أيام.' },
      { en: 'So we can see what has changed.',            ar: 'وبذلك نرى ما الذي تغيّر.' },
      { en: 'In other words, ______ .',                    ar: 'بعبارة أخرى، ______ .' },
      { en: 'Does that make sense?',                      ar: 'هل هذا واضح؟', use: 'check, never assume' },
    ],
    vocab: [
      { en: 'a picture / an image', ar: 'صورة',       say: 'PIK-cher / IM-ij' },
      { en: 'radar',                ar: 'رادار',      say: 'RAY-dar — English says RAY, French says RA' },
      { en: 'a cloud',              ar: 'سحابة',      say: 'KLOWD' },
      { en: 'to change',            ar: 'يتغيّر',      say: 'CHAYNJ' },
      { en: 'data',                 ar: 'بيانات',     say: 'DAY-tuh' },
    ],
    model: {
      title: 'Radar, explained to a friend', titleAr: 'الرادار مشروحاً لصديق',
      lines: [
        'Basically, a normal satellite takes a photo, like a camera.',
        'But if there are clouds, the camera sees nothing.',
        'Radar is different — it sends a signal down and listens to what comes back.',
        'So radar works through cloud, and at night.',
        'That is why we use radar for the sea and for floods. Does that make sense?',
      ],
      note: 'No numbers, no acronyms, one comparison. If a friend understands it, a minister will too.',
      noteAr: 'بلا أرقام، بلا اختصارات، تشبيه واحد. إذا فهمها صديق فسيفهمها الوزير.',
    },
    drill: {
      frame: 'Basically, ______ . Think of it as ______ .',
      frameAr: 'ببساطة، ______ . تخيّليها ______ .',
      slots: ['radar sees through clouds / a torch in the dark',
              'we compare two dates / two photos of the same room',
              'the model predicts the flood / a weather forecast'],
    },
    hotSeat: ['What is a satellite? I know nothing.', 'Why radar and not a photo?', 'Say it again — simpler.'],
    homework: { en: 'Explain your work to someone in your family who is not an engineer. Record it.', ar: 'اشرحي عملك لفرد من عائلتك ليس مهندساً. وسجّليه.' },
  },

  {
    no: 14, phase: 3,
    tag: 'Meetings', tagAr: 'الاجتماعات',
    title: 'Taking part in a meeting', titleAr: 'المشاركة في اجتماع',
    goal: { en: 'Interrupt, agree, disagree and ask again — in a live meeting.', ar: 'المقاطعة والموافقة والاعتراض وإعادة السؤال في اجتماع حي.' },
    canSay: 'Can I come in here? I see your point, but in practice that is difficult.',
    chunks: [
      { en: 'Can I come in here?',                  ar: 'هل لي أن أتدخّل؟', use: 'the polite interrupt' },
      { en: 'Can I add something?',                 ar: 'هل أضيف شيئاً؟' },
      { en: 'In my experience, ______ .',            ar: 'من واقع خبرتي، ______ .', use: 'her strongest card' },
      { en: 'That is a good point.',                ar: 'هذه ملاحظة جيدة.' },
      { en: 'I see your point, but ______ .',        ar: 'أفهم وجهة نظرك، لكن ______ .', use: 'the safest disagreement' },
      { en: 'In practice, that is difficult.',       ar: 'عملياً، هذا صعب.', use: 'disagree with facts, not people' },
      { en: 'What I would suggest is ______ .',      ar: 'ما أقترحه هو ______ .', alt: 'I think we can ______ .' },
    ],
    vocab: [
      { en: 'a meeting',    ar: 'اجتماع',        say: 'MEE-ting' },
      { en: 'an agenda',    ar: 'جدول الأعمال',  say: 'uh-JEN-duh' },
      { en: 'a deadline',   ar: 'موعد نهائي',    say: 'DED-line' },
      { en: 'to suggest',   ar: 'يقترح',         say: 'suh-JEST' },
      { en: 'to agree',     ar: 'يوافق',         say: 'uh-GREE' },
    ],
    model: {
      title: 'Disagreeing with a client', titleAr: 'الاعتراض على عميل',
      lines: [
        'Can I come in here?',
        'I see your point, and I understand the deadline.',
        'But in practice, one month is very difficult for that area.',
        'In my experience, the problem is always the clouds.',
        'What I would suggest is radar instead. Would that work for you?',
      ],
      note: 'Agree → but → reason → alternative. Never stop at "no". And never apologise before speaking.',
      noteAr: 'موافقة ← لكن ← السبب ← البديل. لا تتوقّفي عند «لا». ولا تعتذري قبل الكلام.',
    },
    drill: {
      frame: 'I see your point, but ______ . What I would suggest is ______ .',
      frameAr: 'أفهم وجهة نظرك، لكن ______ . ما أقترحه هو ______ .',
      slots: ['the data is not free / we start with one country',
              'that season is cloudy / we use radar',
              'the team is small / we do it in two phases'],
    },
    hotSeat: ['[Talk over her] — interrupt me.', 'I want the whole map in two weeks.', 'Your price is too high.'],
    homework: { en: 'In your next meeting, use "Can I come in here?" once. Report back.', ar: 'في اجتماعك القادم استخدمي «Can I come in here?» مرة واحدة. وأخبريني.' },
  },

  {
    no: 15, phase: 3,
    tag: 'Online calls', tagAr: 'المكالمات عن بُعد',
    title: 'Video calls and closing a meeting', titleAr: 'مكالمات الفيديو وإنهاء الاجتماع',
    goal: { en: 'Run a video call and close it like the person in charge.', ar: 'إدارة مكالمة فيديو وإنهاؤها كمن يقود.' },
    canSay: 'Let me recap the actions before we finish.',
    chunks: [
      { en: 'Can everyone hear me?',                ar: 'هل يسمعني الجميع؟' },
      { en: 'You are on mute.',                     ar: 'الميكروفون مكتوم لديك.' },
      { en: 'Let me share my screen.',              ar: 'دعوني أشارك شاشتي.' },
      { en: 'Sorry, you cut out. Could you repeat?', ar: 'عذراً، انقطع الصوت. هل تعيد؟', alt: 'Sorry — again, please?' },
      { en: 'Shall we start? / Shall we finish?',   ar: 'هل نبدأ؟ / هل ننهي؟' },
      { en: 'Let me recap the actions.',            ar: 'دعوني ألخّص المهام.', use: 'ends a meeting like a leader' },
      { en: "I'll send you the slides after.",       ar: 'سأرسل الشرائح بعد ذلك.' },
    ],
    vocab: [
      { en: 'to mute / unmute', ar: 'كتم / إلغاء الكتم', say: 'MYOOT' },
      { en: 'to share a screen', ar: 'مشاركة الشاشة',   say: 'SHAIR' },
      { en: 'an action point',   ar: 'مهمة متفق عليها', say: 'AK-shun point' },
      { en: 'to confirm',        ar: 'يؤكّد',            say: 'kun-FURM' },
    ],
    model: {
      title: 'Closing a call properly', titleAr: 'إنهاء المكالمة كما ينبغي',
      lines: [
        'Right — let me recap the actions before we finish.',
        'We will send the first maps by the fifteenth.',
        'You will confirm the data on your side.',
        'And we meet again in two weeks. Does everyone agree?',
      ],
    },
    hotSeat: ['Start the meeting.', 'I cannot hear you — deal with it.', 'Close the meeting with three actions.'],
    homework: { en: 'Record a 60-second meeting closing with three action points.', ar: 'سجّلي 60 ثانية لإنهاء اجتماع بثلاث مهام.' },
  },

  /* ── PHASE 4 · PRESENTING & CONFERENCES ──────────────────────────────── */
  {
    no: 16, phase: 4,
    tag: 'Numbers & words', tagAr: 'الأرقام والمفردات',
    title: 'Numbers, results and the words of your field', titleAr: 'الأرقام والنتائج ومفردات مجالك',
    goal: { en: 'Say figures and technical words at speed.', ar: 'نطق الأرقام والمصطلحات بسرعة.' },
    canSay: 'We covered about two hundred and fifty thousand square kilometres.',
    chunks: [
      { en: 'about / around / roughly ______ ',      ar: 'حوالي ______ ', use: 'you rarely need the exact figure' },
      { en: 'more than ______ / over ______ ',       ar: 'أكثر من ______ ' },
      { en: 'It went up by thirty per cent.',        ar: 'ارتفع بنسبة ثلاثين في المئة.' },
      { en: 'It went down after 2020.',              ar: 'انخفض بعد 2020.' },
      { en: 'between 2019 and 2023',                 ar: 'بين 2019 و2023' },
      { en: 'That is about the size of ______ .',    ar: 'هذا بحجم ______ تقريباً.', use: 'always compare a big number' },
    ],
    vocab: [
      { en: 'square kilometres', ar: 'كيلومتر مربع',    say: 'SKWAIR ki-LOM-i-ters' },
      { en: 'per cent',          ar: 'في المئة',        say: 'per SENT — two words in English' },
      { en: 'oil slick',         ar: 'بقعة نفطية',      say: 'OIL SLIK' },
      { en: 'deforestation',     ar: 'إزالة الغابات',   say: 'dee-for-es-TAY-shun' },
      { en: 'flood',             ar: 'فيضان',           say: 'FLUD — rhymes with blood' },
      { en: 'drought',           ar: 'جفاف',            say: 'DROWT — the *gh* is silent' },
      { en: 'early warning system', ar: 'نظام إنذار مبكر', say: 'ER-lee WOR-ning' },
      { en: 'accuracy',          ar: 'الدقة',           say: 'A-kyuh-ruh-see' },
    ],
    model: {
      title: 'Results, said out loud', titleAr: 'النتائج منطوقة',
      lines: [
        'We monitored around two hundred and fifty thousand square kilometres.',
        'That is about the size of the United Kingdom.',
        'Deforestation went down by about fifteen per cent between 2019 and 2023.',
        'Our accuracy is over ninety per cent.',
      ],
      note: 'Always give a comparison after a big number. "The size of the UK" is remembered; 250,000 km² is not.',
      noteAr: 'أعطِ تشبيهاً بعد كل رقم كبير. «بحجم بريطانيا» يُحفظ، أما 250,000 كم² فلا.',
    },
    drill: {
      frame: 'We covered about ______ , and it went up by ______ per cent.',
      frameAr: 'غطّينا حوالي ______ ، وارتفع بنسبة ______ في المئة.',
      slots: ['fifty thousand square kilometres / twenty', 'three countries / forty', 'six months / fifteen'],
      note: 'Read her own report figures out loud. Numbers are where fluent speakers still stumble.',
    },
    hotSeat: ['How big is the area?', 'What was the accuracy?', 'Say that number again, faster.'],
    homework: { en: 'Read the numbers from one of your reports out loud, three times.', ar: 'اقرئي أرقام أحد تقاريرك بصوت عالٍ ثلاث مرات.' },
  },

  {
    no: 17, phase: 4,
    tag: 'Structure', tagAr: 'الهيكل',
    title: 'The shape of a presentation', titleAr: 'شكل العرض التقديمي',
    goal: { en: 'Open, signpost and close a talk so people can follow.', ar: 'الافتتاح والتنقّل والختام بحيث يتابعك الجمهور.' },
    canSay: "Today I'll cover three things: the problem, our method, and the results.",
    chunks: [
      { en: 'Good morning. My name is ______ , from ______ .', ar: 'صباح الخير. اسمي ______ ، من ______ .' },
      { en: "Today I'll cover three things.",                  ar: 'سأتناول اليوم ثلاثة أمور.', use: 'three — never five' },
      { en: 'Let me start with the problem.',                  ar: 'أبدأ بالمشكلة.' },
      { en: 'Moving on to ______ .',                           ar: 'ننتقل إلى ______ .' },
      { en: 'This brings me to ______ .',                      ar: 'وهذا يقودني إلى ______ .', alt: 'Now, ______ .' },
      { en: 'To sum up, ______ .',                             ar: 'خلاصة القول، ______ .' },
      { en: 'Thank you. I am happy to take questions.',        ar: 'شكراً. يسعدني تلقّي الأسئلة.' },
    ],
    model: {
      title: 'The opening ninety seconds', titleAr: 'التسعون ثانية الأولى',
      lines: [
        'Good morning. My name is Salma, from Africa EO Services in Morocco.',
        'Every year, oil pollution damages the coast of the Gulf of Guinea — and most of it is never seen.',
        "Today I'll cover three things: the problem, how we use radar, and what we found.",
        'Let me start with the problem.',
      ],
      note: 'Name → the problem in one sentence → three things → start. Never open by reading an agenda slide.',
      noteAr: 'الاسم ← المشكلة في جملة ← ثلاثة محاور ← ابدئي. لا تفتتحي بقراءة شريحة المحاور.',
    },
    drill: {
      frame: "Today I'll cover three things: ______ , ______ , and ______ .",
      frameAr: 'سأتناول اليوم ثلاثة أمور: ______ ، ______ ، و______ .',
      slots: ['the problem / our method / the results',
              'the context / the data / the next steps',
              'why it matters / what we did / what we learned'],
    },
    hotSeat: ['Open a talk about your work.', 'Now close it.', 'Do the opening again in half the words.'],
    homework: { en: 'Record the first 90 seconds of a talk about one of your projects.', ar: 'سجّلي أول 90 ثانية من عرض عن أحد مشاريعك.' },
  },

  {
    no: 18, phase: 4,
    tag: 'Your project', tagAr: 'مشروعك',
    title: 'Presenting one of your projects', titleAr: 'تقديم أحد مشاريعك',
    goal: { en: 'Present a real project of yours end to end.', ar: 'تقديم مشروع حقيقي من مشاريعك كاملاً.' },
    canSay: 'The problem was X, we did Y, and the result was Z.',
    chunks: [
      { en: 'The client was ______ .',                      ar: 'كان العميل ______ .' },
      { en: 'The problem they had was ______ .',            ar: 'كانت مشكلتهم ______ .' },
      { en: 'What we did was ______ .',                     ar: 'ما فعلناه هو ______ .' },
      { en: 'The result was ______ .',                      ar: 'كانت النتيجة ______ .' },
      { en: 'The main challenge was ______ .',              ar: 'كان التحدي الأكبر ______ .' },
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
      note: 'Client → problem → what we did → result → challenge. This shape fits every project she has.',
      noteAr: 'العميل ← المشكلة ← ما فعلناه ← النتيجة ← التحدي. هذا القالب يناسب كل مشاريعها.',
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
    no: 19, phase: 4,
    tag: 'Questions', tagAr: 'الأسئلة',
    title: 'Surviving the questions', titleAr: 'النجاة من الأسئلة',
    goal: { en: 'Handle hard questions calmly, including ones you cannot answer.', ar: 'التعامل بهدوء مع الأسئلة الصعبة، حتى ما لا تعرفين إجابته.' },
    canSay: "That's a good question — I don't have the figure with me, but I'll send it after.",
    chunks: [
      { en: "That's a very good question.",                    ar: 'سؤال جيد جداً.', use: 'buys three seconds, always' },
      { en: 'So you are asking about ______ ?',                 ar: 'إذن أنت تسأل عن ______ ؟' },
      { en: 'The short answer is ______ .',                     ar: 'الجواب المختصر هو ______ .' },
      { en: "I don't have that figure with me.",                ar: 'ليس لديّ هذا الرقم الآن.', use: 'never invent a number' },
      { en: "I'll send you the details after.",                 ar: 'سأرسل لك التفاصيل لاحقاً.' },
      { en: "That's not my area, but my colleague works on it.", ar: 'هذا ليس مجالي، لكن زميلي يعمل عليه.' },
      { en: 'Does that answer your question?',                  ar: 'هل أجاب هذا على سؤالك؟', use: 'closes it, you keep control' },
    ],
    model: {
      title: 'A question you cannot answer', titleAr: 'سؤال لا تستطيعين إجابته',
      lines: [
        "That's a very good question.",
        'So you are asking about the cost per square kilometre?',
        "I don't have that figure with me today.",
        "But I'll send you the details after the session. Does that answer your question?",
      ],
      note: 'Saying "I don\'t know, I\'ll send it" is what senior people do. Inventing a number is what nervous people do.',
      noteAr: 'قول «لا أعرف، سأرسله» هو ما يفعله الكبار. اختلاق رقم هو ما يفعله المتوتّر.',
    },
    hotSeat: ['How much does it cost per square kilometre?', 'Why not use free data?',
              'Is your accuracy good enough for a court case?', 'Is AI not going to replace you?'],
    homework: { en: 'Ask a colleague to fire five hard questions at you in English. Record the answers.', ar: 'اطلبي من زميل توجيه خمسة أسئلة صعبة بالإنجليزية. وسجّلي إجاباتك.' },
  },

  {
    no: 20, phase: 4,
    tag: 'Networking', tagAr: 'التواصل المهني',
    title: 'The coffee break — where the work happens', titleAr: 'استراحة القهوة — حيث تُصنع الفرص',
    goal: { en: 'Start, hold and leave a conversation at a conference.', ar: 'بدء محادثة في مؤتمر والاستمرار فيها وإنهاؤها.' },
    canSay: "I really enjoyed your talk. I'm working on something similar in Morocco.",
    chunks: [
      { en: 'I really enjoyed your talk.',                    ar: 'أعجبتني محاضرتك كثيراً.', use: 'the easiest opening there is' },
      { en: "I'm working on something similar.",               ar: 'أعمل على شيء مشابه.' },
      { en: 'What brings you here?',                           ar: 'ما الذي أتى بك إلى هنا؟' },
      { en: 'We should stay in touch.',                        ar: 'ينبغي أن نبقى على تواصل.' },
      { en: 'Can I send you an email about it?',               ar: 'هل أرسل لك بريداً بهذا الشأن؟' },
      { en: 'It was very nice to meet you.',                   ar: 'سُررت بلقائك.', use: 'the exit line — same as lesson 1' },
    ],
    model: {
      title: 'Ninety seconds that become a contract', titleAr: 'تسعون ثانية تتحوّل إلى عقد',
      lines: [
        'I really enjoyed your talk — the part on radar was very close to our work.',
        "I'm Salma, I have an Earth Observation company in Morocco.",
        "We're doing something similar for oil detection in the Gulf of Guinea.",
        'We should stay in touch — can I send you an email about it?',
        'It was very nice to meet you.',
      ],
      note: 'Compliment → who you are → the link between you → a small, easy next step. Never ask for anything big at a coffee break. And notice the last line — it is lesson 1. Eight weeks later, the same sentence closes a business conversation.',
      noteAr: 'مجاملة ← من أنتِ ← الرابط بينكما ← خطوة صغيرة سهلة. لا تطلبي شيئاً كبيراً في استراحة قهوة. ولاحظي السطر الأخير — إنه الحصة الأولى. بعد ثمانية أسابيع، الجملة نفسها تُنهي حديثاً تجارياً.',
    },
    hotSeat: ['[Teacher is a stranger with a coffee] — start.', 'Now end it politely.', 'Do it again in thirty seconds.'],
    homework: { en: 'Record your 60-second pitch: who you are, what you do, what you want.', ar: 'سجّلي عرضك في 60 ثانية: من أنتِ، ماذا تعملين، وماذا تريدين.' },
  },
]

/** Sorted teaching order. */
export const ORDERED = [...LESSONS].sort((a, b) => a.no - b.no)
