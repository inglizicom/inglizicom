import type { GrammarLesson } from './types'

export const g15: GrammarLesson = {
  id: 15,
  slug: 'was-were',
  emoji: '⏮️',
  title: { en: 'Was / Were', ar: 'كان / كانوا — To Be في الماضي' },
  description: { en: 'Talk about the past with To Be', ar: 'كيف تتكلم عن الماضي مع فعل To Be' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '⏮️',
      title: 'Was / Were',
      titleAr: 'كان / كانوا',
      level: 'A1',
      tagAr: 'درس ١٥ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'am/is/are في الماضي تصبح was/were 🕰️',
      bodyAr:
        'تعلمنا am/is/are للحاضر. للماضي نستخدم was/were. نفس القاعدة: was للمفرد (I/he/she/it) و were للجمع (you/we/they). كلمات المفيدة مع الماضي: yesterday · last week · ago · in 2020.',
      arabicEx: 'أنا كنت تعباً أمس.',
      englishEx: 'I WAS tired yesterday.',
      noteAr: '⏰ was = I/he/she/it في الماضي · were = you/we/they في الماضي',
    },
    {
      kind: 'patternTable',
      titleAr: 'was أم were؟',
      rows: [
        { pronoun: 'I', pronounAr: 'أنا', verb: 'was', exampleEn: 'I was happy yesterday.', exampleAr: 'كنت سعيداً أمس.', emoji: '😊' },
        { pronoun: 'You', pronounAr: 'أنت', verb: 'were', exampleEn: 'You were right!', exampleAr: 'كنت محقاً!', emoji: '✅' },
        { pronoun: 'He', pronounAr: 'هو', verb: 'was', exampleEn: 'He was a great teacher.', exampleAr: 'كان أستاذاً رائعاً.', emoji: '👨‍🏫' },
        { pronoun: 'She', pronounAr: 'هي', verb: 'was', exampleEn: 'She was at home all day.', exampleAr: 'كانت في البيت طوال اليوم.', emoji: '🏠' },
        { pronoun: 'It', pronounAr: 'هو (أشياء)', verb: 'was', exampleEn: 'It was a beautiful day.', exampleAr: 'كان يوماً جميلاً.', emoji: '☀️' },
        { pronoun: 'We', pronounAr: 'نحن', verb: 'were', exampleEn: 'We were very tired.', exampleAr: 'كنا متعبين جداً.', emoji: '😴' },
        { pronoun: 'They', pronounAr: 'هم', verb: 'were', exampleEn: 'They were at the party.', exampleAr: 'كانوا في الحفلة.', emoji: '🎉' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'was/were في جمل حقيقية من الماضي 📖',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'was', role: 'verb' },
            { text: 'tired', role: 'complement' }, { text: 'yesterday', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'كنت متعباً أمس.',
          emoji: '😴',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'was', role: 'verb' },
            { text: 'a student', role: 'complement' }, { text: 'in 2020', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'كانت طالبة في ٢٠٢٠.',
          emoji: '🎓',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'were', role: 'verb' },
            { text: 'in Marrakech', role: 'complement' }, { text: 'last week', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'كنا في مراكش الأسبوع الماضي.',
          emoji: '🕌',
        },
        {
          tokens: [
            { text: 'It', role: 'subject' }, { text: 'was', role: 'verb' },
            { text: 'very cold', role: 'complement' }, { text: 'last winter', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'كان البرد شديداً الشتاء الماضي.',
          emoji: '❄️',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: 'were', role: 'verb' },
            { text: 'very happy', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'كانوا سعيدين جداً.',
          emoji: '🎉',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'was', role: 'verb' },
            { text: "n't", role: 'negation' }, { text: 'at home', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لم يكن في البيت.',
          emoji: '🚪',
        },
        {
          tokens: [
            { text: 'Was', role: 'question' }, { text: 'the exam', role: 'subject' },
            { text: 'difficult', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل كان الامتحان صعباً؟',
          emoji: '📝',
        },
        {
          tokens: [
            { text: 'My parents', role: 'subject' }, { text: 'were', role: 'verb' },
            { text: 'teachers', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'كان والداي أساتذة.',
          emoji: '👨‍👩‍👧',
        },
        {
          tokens: [
            { text: 'Where', role: 'filler' }, { text: 'were', role: 'question' },
            { text: 'you', role: 'subject' }, { text: 'yesterday', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'أين كنت أمس؟',
          emoji: '🗺️',
        },
      ],
    },
    {
      kind: 'negation',
      titleAr: 'النفي: wasn\'t / weren\'t 🚫',
      bodyAr: 'wasn\'t = was not (مفرد) · weren\'t = were not (جمع)',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: "wasn't", role: 'negation' },
            { text: 'at home', role: 'complement' }, { text: 'yesterday', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لم أكن في البيت أمس.',
          emoji: '🏠',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: "weren't", role: 'negation' },
            { text: 'ready', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لم يكونوا مستعدين.',
          emoji: '⚠️',
        },
        {
          tokens: [
            { text: 'The weather', role: 'subject' }, { text: "wasn't", role: 'negation' },
            { text: 'good', role: 'complement' }, { text: 'last week', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لم يكن الطقس جيداً الأسبوع الماضي.',
          emoji: '⛈️',
        },
      ],
    },
    {
      kind: 'questions',
      titleAr: 'الأسئلة مع Was/Were ❓',
      bodyAr: 'نفس قاعدة am/is/are: Was/Were في البداية',
      items: [
        {
          q: [
            { text: 'Was', role: 'question' }, { text: 'she', role: 'subject' },
            { text: 'at school', role: 'complement' }, { text: 'today', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل كانت في المدرسة اليوم؟',
        },
        {
          q: [
            { text: 'Were', role: 'question' }, { text: 'you', role: 'subject' },
            { text: 'at the party', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل كنت في الحفلة؟',
        },
        {
          q: [
            { text: 'Was', role: 'question' }, { text: 'the film', role: 'subject' },
            { text: 'good', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل كان الفيلم جيداً؟',
        },
        {
          q: [
            { text: 'Where', role: 'filler' }, { text: 'were', role: 'question' },
            { text: 'they', role: 'subject' }, { text: 'last night', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'أين كانوا ليلة أمس؟',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"I were happy" — I تستخدم was وليس were', wrong: 'I were happy yesterday.', right: 'I was happy yesterday.' },
        { type: 'mistake', ar: '"They was ready" — they تستخدم were وليس was', wrong: 'They was ready.', right: 'They were ready.' },
        { type: 'tip', ar: 'كلمات تدل على الماضي: yesterday · last week · last year · ago · in 2020 · when I was young' },
        { type: 'rule', ar: 'نفس قاعدة am/is/are: was للمفرد (I/he/she/it) · were للجمع (you/we/they)' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'I ', after: ' very tired yesterday.', answer: 'was', choices: ['was', 'were', 'am'], ar: 'كنت متعباً جداً أمس.' },
        { before: 'They ', after: ' at the beach last weekend.', answer: 'were', choices: ['was', 'were', 'are'], ar: 'كانوا في الشاطئ عطلة الأسبوع الماضي.' },
        { before: 'She ', after: " at home yesterday.", answer: "wasn't", choices: ["wasn't", "weren't", "isn't"], ar: 'لم تكن في البيت أمس.' },
        { before: '', after: ' you at school today?', answer: 'Were', choices: ['Was', 'Were', 'Did'], ar: 'هل كنت في المدرسة اليوم؟' },
        { before: 'He ', after: ' a teacher before.', answer: 'was', choices: ['was', 'were', 'is'], ar: 'كان أستاذاً من قبل.' },
        { before: 'The weather ', after: " nice last week.", answer: "wasn't", choices: ["wasn't", "weren't", "didn't"], ar: 'لم يكن الطقس جيداً الأسبوع الماضي.' },
        { before: 'We ', after: ' very happy at the party.', answer: 'were', choices: ['was', 'were', 'are'], ar: 'كنا سعيدين جداً في الحفلة.' },
        { before: '', after: ' the exam difficult?', answer: 'Was', choices: ['Was', 'Were', 'Did'], ar: 'هل كان الامتحان صعباً؟' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'أكمل: "She ___ at home yesterday."',
          choices: ['were', 'was', 'is'],
          correct: 1,
          explanationAr: '"she" تستخدم "was" في الماضي.',
        },
        {
          promptAr: 'أكمل: "We ___ very tired last night."',
          choices: ['was', 'were', 'are'],
          correct: 1,
          explanationAr: '"we" تستخدم "were" في الماضي.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I were happy.', 'I was happy.', 'I am was happy.'],
          correct: 1,
          explanationAr: '"I was happy" — I + was (وليس were).',
        },
        {
          promptAr: 'أكمل: "They ___ at school today." (لم يكونوا)',
          choices: ["wasn't", "weren't", "didn't"],
          correct: 1,
          explanationAr: '"weren\'t" = were not — للجمع في الماضي.',
        },
        {
          promptAr: 'كيف تسأل "هل كان الفيلم جيداً؟"',
          choices: ['The film was good?', 'Was the film good?', 'Did the film was good?'],
          correct: 1,
          explanationAr: 'في السؤال نضع Was/Were في البداية.',
        },
        {
          promptAr: 'ما الجواب على "Were you at the party?"',
          choices: ['Yes, I was.', 'Yes, I were.', 'Yes, I did.'],
          correct: 0,
          explanationAr: '"Yes, I was." — الجواب القصير مع I هو was.',
        },
        {
          promptAr: '"wasn\'t" =',
          choices: ['were not', 'was not', 'is not'],
          correct: 1,
          explanationAr: "wasn't = was not.",
        },
        {
          promptAr: 'أي كلمة تدل على الماضي؟',
          choices: ['tomorrow', 'now', 'yesterday'],
          correct: 2,
          explanationAr: '"yesterday" = أمس — تدل على الماضي.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'I/He/She/It → was', en: 'I/He/She/It + was', example: 'I was tired. She was happy.' },
        { ar: 'You/We/They → were', en: 'You/We/They + were', example: 'They were at the party.' },
        { ar: 'النفي: wasn\'t / weren\'t · السؤال: Was/Were في البداية', en: "wasn't · weren't · Was...? Were...?", example: "Wasn't he at home? Were they ready?" },
      ],
    },
  ],
}
