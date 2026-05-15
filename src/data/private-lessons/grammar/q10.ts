import type { GrammarLesson } from './types'

export const q10: GrammarLesson = {
  id: 110,
  slug: 'review-10',
  emoji: '🏆',
  title: { en: 'Review Quiz 10', ar: 'مراجعة ١٠ — some/any · much/many · like+ing / want+to' },
  description: { en: 'Test your knowledge of lessons 28-30', ar: 'اختبر فهمك للدروس الثامن والعشرين والتاسع والعشرين والثلاثين' },
  level: 'A1',
  isReview: true,
  sections: [
    {
      kind: 'cover',
      emoji: '🏆',
      title: 'Review Quiz 10',
      titleAr: 'مراجعة شاملة ١٠',
      level: 'A1',
      tagAr: 'دروس ٢٨ · ٢٩ · ٣٠',
    },
    {
      kind: 'quiz',
      titleAr: '١٢ سؤالاً — some/any + much/many + like/want',
      questions: [
        // Some / Any (4 questions)
        {
          promptAr: 'أكمل: "I have ___ money." (جملة إيجابية)',
          choices: ['some', 'any', 'no'],
          correct: 0,
          explanationAr: '"some" في الجمل الإيجابية: "I have some money".',
        },
        {
          promptAr: 'أكمل: "Do you have ___ questions?"',
          choices: ['some', 'any', 'much'],
          correct: 1,
          explanationAr: '"any" في الأسئلة: "Do you have any questions?"',
        },
        {
          promptAr: 'أكمل: "I don\'t have ___ time."',
          choices: ['some', 'any', 'many'],
          correct: 1,
          explanationAr: '"any" في الجمل النفية: "I don\'t have any time".',
        },
        {
          promptAr: 'أكمل: "Would you like ___ coffee?" (عرض)',
          choices: ['some', 'any', 'much'],
          correct: 0,
          explanationAr: '"some" في العروض حتى في الأسئلة: "Would you like some coffee?"',
        },
        // Much / Many / A lot of (4 questions)
        {
          promptAr: 'أكمل: "There are ___ students in the class."',
          choices: ['much', 'many', 'a lot'],
          correct: 1,
          explanationAr: '"many" مع الأسماء المعدودة (students يمكن عدها).',
        },
        {
          promptAr: 'أكمل: "I don\'t have ___ time."',
          choices: ['many', 'much', 'a lot'],
          correct: 1,
          explanationAr: '"much" مع الأسماء غير المعدودة (time لا تُعد).',
        },
        {
          promptAr: 'أكمل: "She drinks ___ water every day."',
          choices: ['many', 'much', 'a lot of'],
          correct: 2,
          explanationAr: '"a lot of" يعمل مع الجميع في الجمل الإيجابية: "a lot of water".',
        },
        {
          promptAr: '"much" تُستخدم مع:',
          choices: ['الأسماء المعدودة (books, people)', 'الأسماء غير المعدودة (water, money)', 'كلاهما دائماً'],
          correct: 1,
          explanationAr: '"much" مع الأسماء غير المعدودة: much water / much money / much time.',
        },
        // Like + -ing / Want + to (4 questions)
        {
          promptAr: 'أكمل: "I enjoy ___ in the sea."  (swim)',
          choices: ['swim', 'to swim', 'swimming'],
          correct: 2,
          explanationAr: '"enjoy" + -ing دائماً: "I enjoy swimming".',
        },
        {
          promptAr: 'أكمل: "She wants ___ a doctor." (be)',
          choices: ['being', 'to be', 'be'],
          correct: 1,
          explanationAr: '"want" + to + فعل: "She wants to be a doctor".',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I want swimming.', 'I enjoy to swim.', 'I enjoy swimming.'],
          correct: 2,
          explanationAr: '"enjoy" + -ing: "I enjoy swimming". (وليس "enjoy to swim")',
        },
        {
          promptAr: 'أكمل: "He decided ___ abroad." (study)',
          choices: ['studying', 'to study', 'study'],
          correct: 1,
          explanationAr: '"decide" + to + فعل: "He decided to study abroad".',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'أحسنت! ذكّر نفسك بهذه القواعد 🎯',
      rules: [
        { ar: 'some (إيجابي) · any (نفي/سؤال) · some في العروض', en: 'some / any', example: 'I have some money. Do you have any?' },
        { ar: 'many (معدود) · much (غير معدود) · a lot of (كلاهما)', en: 'many books · much water · a lot of time', example: 'There are many students. I drink a lot of water.' },
        { ar: 'enjoy/like + -ing · want/need/decide + to + فعل', en: 'enjoy swimming · want to swim', example: 'She likes dancing. He wants to travel.' },
      ],
    },
  ],
}
