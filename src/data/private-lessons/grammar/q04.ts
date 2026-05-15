import type { GrammarLesson } from './types'

export const q04: GrammarLesson = {
  id: 104,
  slug: 'review-4',
  emoji: '🏆',
  title: { en: 'Review Quiz 4', ar: 'مراجعة ٤ — can · الصفات · ظروف التكرار' },
  description: { en: 'Test your knowledge of lessons 10-12', ar: 'اختبر فهمك للدروس العاشر والحادي عشر والثاني عشر' },
  level: 'A1',
  isReview: true,
  sections: [
    {
      kind: 'cover',
      emoji: '🏆',
      title: 'Review Quiz 4',
      titleAr: 'مراجعة شاملة ٤',
      level: 'A1',
      tagAr: 'دروس ١٠ · ١١ · ١٢',
    },
    {
      kind: 'quiz',
      titleAr: '١٢ سؤالاً — can + الصفات + ظروف التكرار',
      questions: [
        // Can/Can't (4 questions)
        {
          promptAr: 'أكمل: "She ___ speak three languages."',
          choices: ['can', 'cans', 'is can'],
          correct: 0,
          explanationAr: '"can" لا يتغير أبداً — حتى مع she.',
        },
        {
          promptAr: 'ما عكس "I can swim"؟',
          choices: ["I can't swim.", "I don't can swim.", "I not swim."],
          correct: 0,
          explanationAr: '"can\'t" = cannot.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['She cans cook.', 'She can cooks.', 'She can cook.'],
          correct: 2,
          explanationAr: '"can cook" — can لا يأخذ s، والفعل بعده في أصله.',
        },
        {
          promptAr: 'الجواب على "Can you swim?"',
          choices: ["Yes, I do.", "Yes, I can.", "Yes, I am."],
          correct: 1,
          explanationAr: '"Yes, I can." أو "No, I can\'t."',
        },
        // Adjectives (4 questions)
        {
          promptAr: 'أين تأتي الصفة في الإنجليزية؟',
          choices: ['بعد الاسم', 'قبل الاسم', 'في نهاية الجملة'],
          correct: 1,
          explanationAr: '"a big house" — الصفة big قبل الاسم house.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I have a car red.', 'I have a red car.', 'I have red a car.'],
          correct: 1,
          explanationAr: '"a red car" — الصفة قبل الاسم.',
        },
        {
          promptAr: 'أكمل: "This coffee is very ___." (ساخن)',
          choices: ['hotly', 'hot', 'hots'],
          correct: 1,
          explanationAr: 'الصفة بعد To Be: "is very hot".',
        },
        {
          promptAr: 'ما مضاد "expensive"؟',
          choices: ['slow', 'cheap', 'small'],
          correct: 1,
          explanationAr: 'expensive = غالي · cheap = رخيص.',
        },
        // Frequency Adverbs (4 questions)
        {
          promptAr: 'أين يأتي ظرف التكرار؟',
          choices: ['بعد الفعل الرئيسي', 'قبل الفعل الرئيسي', 'في نهاية الجملة دائماً'],
          correct: 1,
          explanationAr: '"I always eat breakfast" — always قبل eat.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['She is late always.', 'She always is late.', 'She is always late.'],
          correct: 2,
          explanationAr: 'مع To Be: "She is always late" — always بعد is.',
        },
        {
          promptAr: '"never" تعني:',
          choices: ['دائماً (100%)', 'أحياناً (40%)', 'أبداً (0%)'],
          correct: 2,
          explanationAr: '"never" = 0% — لا يحدث أبداً.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["I don't never eat meat.", 'I never eat meat.', 'I eat never meat.'],
          correct: 1,
          explanationAr: '"never" نفي بنفسه — لا نحتاج don\'t معه.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'أحسنت! ذكّر نفسك بهذه القواعد 🎯',
      rules: [
        { ar: '"can" لا يتغير مع أي ضمير · النفي: can\'t', en: 'can / can\'t · Can you...?', example: "She can speak French. I can't fly." },
        { ar: 'الصفة قبل الاسم أو بعد To Be', en: 'a big house · The house is big', example: 'a beautiful city · She is young.' },
        { ar: 'ظروف التكرار: قبل الفعل / بعد To Be', en: 'I always eat · She is usually late', example: 'He never smokes.' },
      ],
    },
  ],
}
