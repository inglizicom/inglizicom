import type { GrammarLesson } from './types'

export const g13: GrammarLesson = {
  id: 13,
  slug: 'prepositions-place',
  emoji: '📍',
  title: { en: 'In / On / At / Under / Next to', ar: 'حروف الجر: المكان' },
  description: { en: 'Describe where things are', ar: 'كيف تصف أين توجد الأشياء' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '📍',
      title: 'Prepositions of Place',
      titleAr: 'حروف الجر: المكان',
      level: 'A1',
      tagAr: 'درس ١٣ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'كيف تصف أين الأشياء؟ 🗺️',
      bodyAr:
        'حروف الجر تصف مكان الأشياء. في العربية نقول "في الغرفة" أو "على الطاولة" أو "تحت الكرسي". في الإنجليزية نستخدم: in / on / at / under / next to / between / behind / in front of.',
      arabicEx: 'الكتاب على الطاولة.',
      englishEx: 'The book is ON the table.',
      noteAr: '🔑 in = داخل · on = على سطح · at = في مكان محدد (نقطة)',
    },
    {
      kind: 'patternTable',
      titleAr: 'حروف الجر الأكثر استخداماً',
      rows: [
        { pronoun: 'in', pronounAr: 'في (داخل)', verb: 'inside a space', exampleEn: 'The cat is in the box.', exampleAr: 'القطة داخل الصندوق.', emoji: '📦' },
        { pronoun: 'on', pronounAr: 'على (سطح)', verb: 'touching a surface', exampleEn: 'The book is on the table.', exampleAr: 'الكتاب على الطاولة.', emoji: '📖' },
        { pronoun: 'at', pronounAr: 'في / عند (نقطة)', verb: 'a specific point', exampleEn: 'She is at school.', exampleAr: 'هي في المدرسة.', emoji: '🏫' },
        { pronoun: 'under', pronounAr: 'تحت', verb: 'below something', exampleEn: 'The dog is under the bed.', exampleAr: 'الكلب تحت السرير.', emoji: '🛏️' },
        { pronoun: 'next to / beside', pronounAr: 'بجانب', verb: 'at the side of', exampleEn: 'Sit next to me.', exampleAr: 'اجلس بجانبي.', emoji: '👬' },
        { pronoun: 'between', pronounAr: 'بين', verb: 'in the middle of two things', exampleEn: 'The bank is between two shops.', exampleAr: 'البنك بين محلين.', emoji: '🏦' },
        { pronoun: 'behind', pronounAr: 'خلف / وراء', verb: 'at the back of', exampleEn: "The car is behind the house.", exampleAr: 'السيارة خلف البيت.', emoji: '🏠' },
        { pronoun: 'in front of', pronounAr: 'أمام', verb: 'facing something', exampleEn: 'Wait in front of the door.', exampleAr: 'انتظر أمام الباب.', emoji: '🚪' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'حروف الجر في جمل حقيقية 🌍',
      items: [
        {
          tokens: [
            { text: 'My keys are', role: 'verb' }, { text: 'in', role: 'question' },
            { text: 'my bag', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'مفاتيحي في حقيبتي.',
          emoji: '🔑',
        },
        {
          tokens: [
            { text: 'The phone is', role: 'verb' }, { text: 'on', role: 'question' },
            { text: 'the table', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الهاتف على الطاولة.',
          emoji: '📱',
        },
        {
          tokens: [
            { text: 'She works', role: 'verb' }, { text: 'at', role: 'question' },
            { text: 'a hospital', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي تعمل في مستشفى.',
          emoji: '🏥',
        },
        {
          tokens: [
            { text: 'The cat is', role: 'verb' }, { text: 'under', role: 'question' },
            { text: 'the chair', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'القطة تحت الكرسي.',
          emoji: '🐱',
        },
        {
          tokens: [
            { text: 'The supermarket is', role: 'verb' }, { text: 'next to', role: 'question' },
            { text: 'the bank', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'السوبرماركت بجانب البنك.',
          emoji: '🛒',
        },
        {
          tokens: [
            { text: 'Morocco is', role: 'verb' }, { text: 'between', role: 'question' },
            { text: 'Europe and Africa', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'المغرب بين أوروبا وأفريقيا.',
          emoji: '🗺️',
        },
        {
          tokens: [
            { text: "I'm", role: 'subject' }, { text: 'at', role: 'question' },
            { text: 'home', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أنا في البيت.',
          emoji: '🏠',
        },
        {
          tokens: [
            { text: 'The bus stop is', role: 'verb' }, { text: 'in front of', role: 'question' },
            { text: 'the school', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'موقف الحافلة أمام المدرسة.',
          emoji: '🚌',
        },
        {
          tokens: [
            { text: 'We live', role: 'verb' }, { text: 'in', role: 'question' },
            { text: 'Morocco', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'نحن نسكن في المغرب.',
          emoji: '🇲🇦',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"The book is in the table" — الكتاب على الطاولة وليس داخلها', wrong: 'The book is in the table.', right: 'The book is on the table.' },
        { type: 'tip', ar: '"at home · at work · at school · at the airport" — تعابير ثابتة نستخدم فيها "at"' },
        { type: 'tip', ar: '"in" للأماكن الكبيرة والمساحات: in Morocco · in the room · in the car' },
        { type: 'rule', ar: '"on" للأسطح والطرق والشوارع: on the table · on the wall · on the street' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'The cat is ', after: ' the box.', answer: 'in', choices: ['in', 'on', 'at'], ar: 'القطة داخل الصندوق.' },
        { before: 'My phone is ', after: ' the table.', answer: 'on', choices: ['in', 'on', 'under'], ar: 'هاتفي على الطاولة.' },
        { before: 'She is ', after: ' work right now.', answer: 'at', choices: ['in', 'on', 'at'], ar: 'هي في العمل الآن.' },
        { before: 'The dog is sleeping ', after: ' the bed.', answer: 'under', choices: ['on', 'in', 'under'], ar: 'الكلب نائم تحت السرير.' },
        { before: 'The pharmacy is ', after: ' the supermarket.', answer: 'next to', choices: ['next to', 'behind of', 'in front'], ar: 'الصيدلية بجانب السوبرماركت.' },
        { before: 'I live ', after: ' Casablanca.', answer: 'in', choices: ['at', 'on', 'in'], ar: 'أنا أسكن في الدار البيضاء.' },
        { before: 'The picture is ', after: ' the wall.', answer: 'on', choices: ['in', 'on', 'at'], ar: 'الصورة على الجدار.' },
        { before: 'Wait for me ', after: ' the door.', answer: 'in front of', choices: ['behind', 'in front of', 'under'], ar: 'انتظرني أمام الباب.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'أكمل: "The book is ___ the table." (على سطح الطاولة)',
          choices: ['in', 'on', 'at'],
          correct: 1,
          explanationAr: '"on" للأسطح: "on the table".',
        },
        {
          promptAr: 'أكمل: "She is ___ school." (داخل المدرسة كمكان)',
          choices: ['in', 'on', 'at'],
          correct: 2,
          explanationAr: '"at school" — تعبير ثابت للأماكن العامة كالعمل والمدرسة.',
        },
        {
          promptAr: 'أكمل: "The cat is ___ the bed." (تحت)',
          choices: ['on', 'in', 'under'],
          correct: 2,
          explanationAr: '"under" = تحت.',
        },
        {
          promptAr: 'كيف تقول "في المغرب"؟',
          choices: ['at Morocco', 'on Morocco', 'in Morocco'],
          correct: 2,
          explanationAr: '"in" للبلدان والمدن: in Morocco / in Casablanca.',
        },
        {
          promptAr: 'أكمل: "The pharmacy is ___ the bank." (بجانب)',
          choices: ['between', 'next to', 'behind'],
          correct: 1,
          explanationAr: '"next to" = بجانب.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['The book is in the table.', 'The book is on the table.', 'The book is at the table.'],
          correct: 1,
          explanationAr: '"on the table" — الكتاب على سطح الطاولة وليس داخلها.',
        },
        {
          promptAr: 'أكمل: "I\'m ___ home right now."',
          choices: ['in', 'on', 'at'],
          correct: 2,
          explanationAr: '"at home" — تعبير ثابت.',
        },
        {
          promptAr: '"between" تعني:',
          choices: ['أمام', 'خلف', 'بين'],
          correct: 2,
          explanationAr: '"between" = بين شيئين.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: '"in" للمساحات والأماكن الكبيرة', en: 'in the box · in Morocco · in the room', example: 'The cat is in the box.' },
        { ar: '"on" للأسطح والجدران والطرق', en: 'on the table · on the wall', example: 'The book is on the table.' },
        { ar: '"at" لنقاط محددة وتعابير ثابتة', en: 'at school · at work · at home', example: 'She is at work.' },
      ],
    },
  ],
}
