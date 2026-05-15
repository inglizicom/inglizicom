import type { GrammarLesson } from './types'

export const g17: GrammarLesson = {
  id: 17,
  slug: 'past-negative',
  emoji: '🚫',
  title: { en: "Didn't", ar: 'النفي في الماضي: لم أفعل' },
  description: { en: "Say what you didn't do", ar: 'كيف تنفي الأفعال في الماضي' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '🚫',
      title: "Didn't",
      titleAr: 'النفي في الماضي',
      level: 'A1',
      tagAr: 'درس ١٧ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'كيف تقول "لم أذهب" أو "لم تأكل"؟ 🤔',
      bodyAr:
        'للنفي في الماضي نستخدم "didn\'t" مع جميع الضمائر — لا فرق بين I/he/she/we/they. والجميل أن الفعل يرجع لأصله بعد didn\'t — بدون -ed!',
      arabicEx: 'أنا لم أذهب إلى المدرسة أمس.',
      englishEx: "I DIDN'T go to school yesterday.",
      noteAr: "⚠️ الفعل يرجع لأصله بعد didn't — بدون -ed: didn't go (وليس didn't went)",
    },
    {
      kind: 'patternTable',
      titleAr: "didn't مع جميع الضمائر",
      rows: [
        { pronoun: 'I', pronounAr: 'أنا', verb: "didn't", exampleEn: "I didn't eat breakfast.", exampleAr: 'لم آكل الفطور.', emoji: '🍳' },
        { pronoun: 'You', pronounAr: 'أنت', verb: "didn't", exampleEn: "You didn't call me.", exampleAr: 'لم تتصل بي.', emoji: '📞' },
        { pronoun: 'He', pronounAr: 'هو', verb: "didn't", exampleEn: "He didn't come.", exampleAr: 'هو لم يأتِ.', emoji: '🚶' },
        { pronoun: 'She', pronounAr: 'هي', verb: "didn't", exampleEn: "She didn't sleep well.", exampleAr: 'هي لم تنم جيداً.', emoji: '😴' },
        { pronoun: 'We', pronounAr: 'نحن', verb: "didn't", exampleEn: "We didn't finish the work.", exampleAr: 'لم ننهِ العمل.', emoji: '💼' },
        { pronoun: 'They', pronounAr: 'هم', verb: "didn't", exampleEn: "They didn't understand.", exampleAr: 'هم لم يفهموا.', emoji: '🤷' },
      ],
    },
    {
      kind: 'negation',
      titleAr: "didn't + فعل في أصله (بدون -ed) 🔄",
      bodyAr: "القاعدة الذهبية: didn't تأخذ -ed بدلاً من الفعل، فالفعل يبقى في أصله",
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: "didn't", role: 'negation' },
            { text: 'go', role: 'verb' }, { text: 'to work', role: 'complement' },
            { text: 'yesterday', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لم أذهب للعمل أمس. (go وليس went)',
          emoji: '🏢',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: "didn't", role: 'negation' },
            { text: 'eat', role: 'verb' }, { text: 'lunch', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي لم تأكل الغداء. (eat وليس ate)',
          emoji: '🍽️',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: "didn't", role: 'negation' },
            { text: 'study', role: 'verb' }, { text: 'for the exam', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هم لم يدرسوا للامتحان.',
          emoji: '📚',
        },
      ],
    },
    {
      kind: 'sentences',
      titleAr: "didn't في جمل حقيقية 💬",
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: "didn't", role: 'negation' },
            { text: 'sleep', role: 'verb' }, { text: 'well', role: 'complement' },
            { text: 'last night', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لم أنم جيداً الليلة الماضية.',
          emoji: '😴',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: "didn't", role: 'negation' },
            { text: 'pass', role: 'verb' }, { text: 'the exam', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو لم ينجح في الامتحان.',
          emoji: '😔',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: "didn't", role: 'negation' },
            { text: 'win', role: 'verb' }, { text: 'the game', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'نحن لم نفز باللعبة.',
          emoji: '⚽',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: "didn't", role: 'negation' },
            { text: 'like', role: 'verb' }, { text: 'the film', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي لم تحب الفيلم.',
          emoji: '🎬',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: "didn't", role: 'negation' },
            { text: 'know', role: 'verb' }, { text: 'the answer', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لم أعرف الجواب.',
          emoji: '🤷',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: "didn't", role: 'negation' },
            { text: 'come', role: 'verb' }, { text: 'to the party', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هم لم يأتوا إلى الحفلة.',
          emoji: '🎉',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: "didn't", role: 'negation' },
            { text: 'work', role: 'verb' }, { text: 'last Friday', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو لم يعمل الجمعة الماضية.',
          emoji: '🏖️',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: "didn't", role: 'negation' },
            { text: 'have', role: 'verb' }, { text: 'time', role: 'complement' },
            { text: 'yesterday', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لم يكن عندي وقت أمس.',
          emoji: '⏰',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: "didn't", role: 'negation' },
            { text: 'see', role: 'verb' }, { text: 'each other', role: 'complement' },
            { text: 'for a long time', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لم نرَ بعضنا لفترة طويلة.',
          emoji: '👋',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"I didn\'t worked" — الفعل يرجع لأصله بعد didn\'t', wrong: "I didn't worked.", right: "I didn't work." },
        { type: 'mistake', ar: '"She didn\'t went" — go يرجع لأصله go بعد didn\'t', wrong: "She didn't went.", right: "She didn't go." },
        { type: 'rule', ar: '"didn\'t" = did + not — نفس don\'t/doesn\'t لكن للماضي. جميع الضمائر تستخدم didn\'t' },
        { type: 'tip', ar: 'الفرق: "She doesn\'t work" (حاضر) · "She didn\'t work" (ماضي) — فقط didn\'t بدل doesn\'t!' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'I ', after: ' go to school yesterday.', answer: "didn't", choices: ["didn't", "doesn't", "wasn't"], ar: 'لم أذهب إلى المدرسة أمس.' },
        { before: "She didn't ", after: ' the exam. (pass)', answer: 'pass', choices: ['pass', 'passed', 'passing'], ar: 'هي لم تنجح في الامتحان.' },
        { before: 'They ', after: ' understand the lesson.', answer: "didn't", choices: ["didn't", "don't", "weren't"], ar: 'هم لم يفهموا الدرس.' },
        { before: "He didn't ", after: ' last night. (sleep)', answer: 'sleep', choices: ['sleep', 'slept', 'sleeping'], ar: 'هو لم ينم الليلة الماضية.' },
        { before: 'We ', after: ' win the game.', answer: "didn't", choices: ["didn't", "don't", "weren't"], ar: 'نحن لم نفز باللعبة.' },
        { before: "I didn't ", after: ' the answer. (know)', answer: 'know', choices: ['knew', 'know', 'knowing'], ar: 'لم أعرف الجواب.' },
        { before: 'She ', after: ' like the food there.', answer: "didn't", choices: ["didn't", "doesn't", "wasn't"], ar: 'هي لم تحب الطعام هناك.' },
        { before: "They didn't ", after: ' to the party. (come)', answer: 'come', choices: ['come', 'came', 'coming'], ar: 'هم لم يأتوا إلى الحفلة.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'أكمل: "She ___ go to work yesterday."',
          choices: ["doesn't", "didn't", "wasn't"],
          correct: 1,
          explanationAr: '"didn\'t" للنفي في الماضي.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["I didn't worked.", "I didn't work.", "I not worked."],
          correct: 1,
          explanationAr: '"didn\'t work" — الفعل يبقى في أصله بدون -ed.',
        },
        {
          promptAr: 'أكمل: "He didn\'t ___ to the party." (come)',
          choices: ['came', 'come', 'coming'],
          correct: 1,
          explanationAr: '"come" في أصله بعد didn\'t وليس "came".',
        },
        {
          promptAr: 'من يستخدم "didn\'t"؟',
          choices: ['I فقط', 'he/she/it فقط', 'جميع الضمائر'],
          correct: 2,
          explanationAr: '"didn\'t" مع جميع الضمائر: I/you/he/she/we/they — لا يتغير.',
        },
        {
          promptAr: '"didn\'t" =',
          choices: ['do not', 'does not', 'did not'],
          correct: 2,
          explanationAr: "didn't = did not — النفي في الماضي.",
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["She didn't went.", "She didn't goes.", "She didn't go."],
          correct: 2,
          explanationAr: '"go" في أصله بعد didn\'t — وليس went.',
        },
        {
          promptAr: 'أكمل: "I ___ eat breakfast this morning."',
          choices: ["don't", "didn't", "wasn't"],
          correct: 1,
          explanationAr: '"didn\'t eat" — نفي الماضي.',
        },
        {
          promptAr: 'ما الفرق؟ "She doesn\'t work" vs "She didn\'t work"',
          choices: ['نفس المعنى', 'doesn\'t = حاضر · didn\'t = ماضٍ', 'didn\'t = حاضر · doesn\'t = ماضٍ'],
          correct: 1,
          explanationAr: '"doesn\'t work" = حاضر (لا تعمل عادةً) · "didn\'t work" = ماضٍ (لم تعمل أمس).',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: '"didn\'t" مع جميع الضمائر — لا تغيير', en: "I/You/He/She/We/They + didn't", example: "He didn't come. They didn't work." },
        { ar: 'الفعل بعد didn\'t يبقى في أصله — بدون -ed', en: "didn't + base verb", example: "I didn't go (NOT went). She didn't eat (NOT ate)." },
        { ar: 'didn\'t = did + not — للماضي · don\'t/doesn\'t = للحاضر', en: "didn't (past) · don't/doesn't (present)", example: "She doesn't work → She didn't work yesterday." },
      ],
    },
  ],
}
