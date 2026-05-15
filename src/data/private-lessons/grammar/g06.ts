import type { GrammarLesson } from './types'

export const g06: GrammarLesson = {
  id: 6,
  slug: 'simple-present',
  emoji: '🔄',
  title: { en: 'Simple Present', ar: 'المضارع البسيط' },
  description: { en: 'Talk about habits, routines and facts', ar: 'العادات والروتين والحقائق الثابتة' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '🔄',
      title: 'Simple Present',
      titleAr: 'المضارع البسيط',
      level: 'A1',
      tagAr: 'درس ٦ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'ليس فقط "الآن" — بل كل يوم!',
      bodyAr:
        'كثير من الطلاب يظنون أن المضارع البسيط يعني "الآن". لا! يُستخدم للعادات (كل يوم / كل أسبوع)، والحقائق الثابتة (الماء يغلي، الشمس تشرق)، والجداول الزمنية. مثال: "I work every day" = أعمل كل يوم (ليس الآن فقط).',
      arabicEx: 'أنا أذهب إلى العمل كل يوم.',
      englishEx: 'I GO to work every day.',
      noteAr: 'الفعل يتغير مع he/she/it — نضيف s أو es في النهاية!',
    },
    {
      kind: 'patternTable',
      titleAr: 'متى نضيف s أو es؟',
      rows: [
        { pronoun: 'I / You / We / They', pronounAr: 'أنا / أنت / نحن / هم', verb: 'work / eat / live', exampleEn: 'I work every day.', exampleAr: 'أعمل كل يوم.', emoji: '💼' },
        { pronoun: 'He / She / It', pronounAr: 'هو / هي (+ أسماء)', verb: 'works / eats / lives', exampleEn: 'She works in a hospital.', exampleAr: 'هي تعمل في مستشفى.', emoji: '🏥' },
        { pronoun: 'He/She + o/ch/sh/ss/x', pronounAr: 'أفعال خاصة', verb: 'goes / watches / washes', exampleEn: 'He goes to school.', exampleAr: 'هو يذهب للمدرسة.', emoji: '🏫' },
        { pronoun: 'He/She + consonant+y', pronounAr: 'ينتهي بـ y', verb: 'study → studies', exampleEn: 'She studies English.', exampleAr: 'هي تدرس الإنجليزية.', emoji: '📖' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل المضارع البسيط في الحياة اليومية',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'wake up', role: 'verb' },
            { text: 'at 7am', role: 'complement' }, { text: 'every day', role: 'filler' }, { text: '.', role: 'filler' },
          ],
          ar: 'أستيقظ الساعة ٧ كل يوم.',
          emoji: '⏰',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'drinks', role: 'verb' },
            { text: 'coffee', role: 'complement' }, { text: 'every morning', role: 'filler' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي تشرب القهوة كل صباح.',
          emoji: '☕',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'works', role: 'verb' },
            { text: 'in a bank', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو يعمل في بنك.',
          emoji: '🏦',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'study', role: 'verb' },
            { text: 'English', role: 'complement' }, { text: 'together', role: 'filler' }, { text: '.', role: 'filler' },
          ],
          ar: 'نحن ندرس الإنجليزية معاً.',
          emoji: '👥',
        },
        {
          tokens: [
            { text: 'The train', role: 'subject' }, { text: 'leaves', role: 'verb' },
            { text: 'at 8am', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'القطار يغادر الساعة ٨.',
          emoji: '🚂',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'teaches', role: 'verb' },
            { text: 'mathematics', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي تدرّس الرياضيات.',
          emoji: '📐',
        },
        {
          tokens: [
            { text: 'Water', role: 'subject' }, { text: 'boils', role: 'verb' },
            { text: 'at 100 degrees', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الماء يغلي عند ١٠٠ درجة.',
          emoji: '🌡️',
        },
        {
          tokens: [
            { text: 'My father', role: 'subject' }, { text: 'reads', role: 'verb' },
            { text: 'the newspaper', role: 'complement' }, { text: 'every morning', role: 'filler' }, { text: '.', role: 'filler' },
          ],
          ar: 'أبي يقرأ الجريدة كل صباح.',
          emoji: '📰',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: 'play', role: 'verb' },
            { text: 'football', role: 'complement' }, { text: 'on Fridays', role: 'filler' }, { text: '.', role: 'filler' },
          ],
          ar: 'يلعبون كرة القدم يوم الجمعة.',
          emoji: '⚽',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة',
      items: [
        { type: 'mistake', ar: '"She work every day" — نسيان الـ s مع she', wrong: 'She work every day', right: 'She works every day' },
        { type: 'mistake', ar: '"I am eat breakfast" — لا نستخدم am/is/are مع أفعال العادات!', wrong: 'I am eat breakfast', right: 'I eat breakfast' },
        { type: 'tip', ar: 'أفعال منتهية بـ o أو ch أو sh أو ss أو x تأخذ es: goes · watches · washes · passes · fixes' },
        { type: 'rule', ar: 'يُستخدم المضارع البسيط للعادات (every day) والحقائق (water boils) وليس للأفعال اللحظية' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة',
      exercises: [
        { before: 'She ', after: ' in a school.', answer: 'works', choices: ['work', 'works', 'working'], ar: 'هي تعمل في مدرسة.' },
        { before: 'They ', after: ' football every weekend.', answer: 'play', choices: ['play', 'plays', 'playing'], ar: 'يلعبون كرة القدم كل عطلة نهاية أسبوع.' },
        { before: 'He ', after: ' to school by bus.', answer: 'goes', choices: ['go', 'goes', 'going'], ar: 'هو يذهب للمدرسة بالحافلة.' },
        { before: 'My mother ', after: ' very well.', answer: 'cooks', choices: ['cook', 'cooks', 'cooking'], ar: 'أمي تطبخ بشكل ممتاز.' },
        { before: 'I ', after: ' up at 6am every day.', answer: 'wake', choices: ['wake', 'wakes', 'waking'], ar: 'أستيقظ الساعة ٦ كل يوم.' },
        { before: 'Water ', after: ' at 100°C.', answer: 'boils', choices: ['boil', 'boils', 'boiling'], ar: 'الماء يغلي عند ١٠٠ درجة.' },
        { before: 'She ', after: ' English every day.', answer: 'studies', choices: ['study', 'studies', 'studying'], ar: 'هي تدرس الإنجليزية كل يوم.' },
        { before: 'He ', after: ' TV every night.', answer: 'watches', choices: ['watch', 'watches', 'watching'], ar: 'هو يشاهد التلفزيون كل مساء.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع',
      questions: [
        {
          promptAr: 'أكمل: "She ___ in Paris."',
          choices: ['live', 'lives', 'living'],
          correct: 1,
          explanationAr: '"she" تحتاج فعلاً بـ s: "lives" وليس "live".',
        },
        {
          promptAr: 'أي جملة صحيحة؟',
          choices: ['I am eat every morning.', 'I eating every morning.', 'I eat every morning.'],
          correct: 2,
          explanationAr: 'المضارع البسيط للعادات: "I eat every morning" — لا نستخدم am/is/are مع أفعال العادات.',
        },
        {
          promptAr: '"He goes to school" — لماذا goes وليس go؟',
          choices: ['لأن go فعل خاص', 'لأن he/she/it تأخذ es بعد go', 'لأن school جمع'],
          correct: 1,
          explanationAr: '"go" ينتهي بـ o فيأخذ es مع he/she/it: go → goes.',
        },
        {
          promptAr: 'أكمل: "She ___ English at university."',
          choices: ['study', 'studies', 'studying'],
          correct: 1,
          explanationAr: '"study" ينتهي بـ consonant + y فيصبح studies مع she.',
        },
        {
          promptAr: 'متى نستخدم المضارع البسيط؟',
          choices: ['للأفعال اللحظية الآن فقط', 'للعادات والحقائق الثابتة', 'للماضي القريب'],
          correct: 1,
          explanationAr: 'المضارع البسيط = العادات (every day) والحقائق (water boils).',
        },
        {
          promptAr: 'أكمل: "The sun ___ in the east."',
          choices: ['rise', 'rises', 'rising'],
          correct: 1,
          explanationAr: 'حقيقة ثابتة + the sun (مفرد) = rises.',
        },
        {
          promptAr: 'أكمل: "They ___ football on Sundays."',
          choices: ['play', 'plays', 'playing'],
          correct: 0,
          explanationAr: '"they" لا تحتاج s — يبقى الفعل: "They play".',
        },
        {
          promptAr: 'أي جملة غلط؟',
          choices: ['He works in a hospital.', 'She teaches French.', 'They watches TV every night.'],
          correct: 2,
          explanationAr: '"They watches" غلط — they لا تأخذ s: "They watch TV every night."',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس',
      rules: [
        { ar: 'أضف s للفعل مع he/she/it', en: 'he/she/it → verb + s', example: 'She works. He plays. It runs.' },
        { ar: 'أفعال خاصة: go→goes · do→does · watch→watches · study→studies', en: 'Special endings: +es / y→ies', example: 'He goes · She studies · It passes' },
        { ar: 'يُستخدم للعادات والحقائق — ليس للأفعال اللحظية', en: 'Use for habits & facts', example: 'I wake up at 7am. Water boils at 100°C.' },
      ],
    },
  ],
}
