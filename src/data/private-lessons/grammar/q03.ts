import type { GrammarLesson } from './types'

export const q03: GrammarLesson = {
  id: 103,
  slug: 'review-3',
  emoji: '🏆',
  title: { en: 'Review Quiz 3', ar: 'مراجعة ٣ — النفي · الأسئلة · there is/are' },
  description: { en: 'Test your knowledge of lessons 7-9', ar: 'اختبر فهمك للدروس السابع والثامن والتاسع' },
  level: 'A1',
  isReview: true,
  sections: [
    {
      kind: 'cover',
      emoji: '🏆',
      title: 'Review Quiz 3',
      titleAr: 'مراجعة شاملة ٣',
      level: 'A1',
      tagAr: 'دروس ٧ · ٨ · ٩',
    },
    {
      kind: 'quiz',
      titleAr: '١٢ سؤالاً — don\'t/doesn\'t + Do/Does + there is/are',
      questions: [
        // Don't/Doesn't (4 questions)
        {
          promptAr: 'أكمل: "She ___ like pizza."',
          choices: ["don't", "doesn't", "isn't"],
          correct: 1,
          explanationAr: '"she" تستخدم "doesn\'t".',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["He doesn't works here.", "He doesn't work here.", "He don't work here."],
          correct: 1,
          explanationAr: '"doesn\'t work" — الفعل بدون s بعد doesn\'t.',
        },
        {
          promptAr: 'أكمل: "They ___ speak Arabic."',
          choices: ["don't", "doesn't", "aren't"],
          correct: 0,
          explanationAr: '"they" تستخدم "don\'t".',
        },
        {
          promptAr: '"doesn\'t" =',
          choices: ['do not', 'does not', 'is not'],
          correct: 1,
          explanationAr: "doesn't = does not.",
        },
        // Do/Does Questions (4 questions)
        {
          promptAr: 'أكمل: "___ she work on weekends?"',
          choices: ['Do', 'Does', 'Is'],
          correct: 1,
          explanationAr: '"she" تستخدم "Does" في الأسئلة.',
        },
        {
          promptAr: 'ما الجواب الصحيح على "Do you like football?"',
          choices: ["Yes, I do.", "Yes, I does.", "Yes, I am."],
          correct: 0,
          explanationAr: '"Yes, I do." — الجواب القصير لـ Do you.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['Does he likes coffee?', 'Does he like coffee?', 'Do he likes coffee?'],
          correct: 1,
          explanationAr: '"Does he like" — الفعل بدون s بعد Does.',
        },
        {
          promptAr: 'أكمل: "___ they live near here?"',
          choices: ['Do', 'Does', 'Are'],
          correct: 0,
          explanationAr: '"they" تستخدم "Do" في الأسئلة.',
        },
        // There is/are (4 questions)
        {
          promptAr: 'أكمل: "___ a bank near here."',
          choices: ['There is', 'There are', 'There has'],
          correct: 0,
          explanationAr: '"bank" مفرد إذن "There is".',
        },
        {
          promptAr: 'أكمل: "___ many students in the class."',
          choices: ['There is', 'There are', 'There have'],
          correct: 1,
          explanationAr: '"students" جمع إذن "There are".',
        },
        {
          promptAr: 'كيف تسأل "هل يوجد مستشفى هنا؟"',
          choices: ['There is a hospital?', 'Is there a hospital here?', 'Are there a hospital here?'],
          correct: 1,
          explanationAr: '"Is there...?" للمفرد.',
        },
        {
          promptAr: 'أكمل: "___ any taxis here." (لا يوجد)',
          choices: ["There isn't", "There aren't", 'There not'],
          correct: 1,
          explanationAr: '"taxis" جمع إذن "There aren\'t any taxis".',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'أحسنت! ذكّر نفسك بهذه القواعد 🎯',
      rules: [
        { ar: 'النفي: don\'t (I/you/we/they) · doesn\'t (he/she/it)', en: "don't / doesn't + base verb", example: "She doesn't work. I don't like it." },
        { ar: 'السؤال: Do (I/you/we/they) · Does (he/she/it)', en: 'Do you...? / Does she...?', example: 'Does he speak English?' },
        { ar: 'There is (مفرد) · There are (جمع)', en: 'There is a... / There are...', example: 'There is a bank. There are many students.' },
      ],
    },
  ],
}
